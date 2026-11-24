// Geen dependencies nodig. Env vars: SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_KEY, MOLLIE_KEY (optioneel: RESEND_KEY, MAIL_FROM)
const S=process.env.SUPABASE_URL,K=process.env.SUPABASE_SERVICE_KEY,M=process.env.MOLLIE_KEY,R=process.env.RESEND_KEY;
const H={apikey:K,Authorization:"Bearer "+K,"Content-Type":"application/json",Prefer:"return=representation"};
const q=async(m,p,b)=>{const r=await fetch(S+"/rest/v1/"+p,{method:m,headers:H,body:b?JSON.stringify(b):undefined});const t=await r.text();return t?JSON.parse(t):null};
const res=(d,s=200)=>({statusCode:s,headers:{"Content-Type":"application/json"},body:JSON.stringify(d)});
const r2=n=>Math.round(n*100)/100;
const chk=async(c,sub)=>{c=String(c||"").trim().toUpperCase();if(!c)return{ok:false,msg:"Vul een code in."};const r=await q("GET","discount_codes?code=eq."+encodeURIComponent(c)+"&active=eq.true");const d=Array.isArray(r)&&r[0];
 if(!d)return{ok:false,msg:"Deze code bestaat niet."};if(d.expires_at&&new Date(d.expires_at)<new Date())return{ok:false,msg:"Deze code is verlopen."};if(d.max_uses&&d.uses>=d.max_uses)return{ok:false,msg:"Deze code is niet meer geldig."};if(sub<d.min_order)return{ok:false,msg:"Geldig vanaf een bestelling van €"+d.min_order+"."};
 return{ok:true,code:d.code,discount:Math.min(sub,r2(d.percent?sub*d.percent/100:Number(d.amount||0)))}};
const rsv=i=>i.variant_id?q("POST","rpc/reserve_variant",{p_id:i.variant_id,p_qty:i.qty}):q("POST","rpc/reserve_stock",{p_sku:i.sku,p_qty:i.qty});
const rel=i=>i.variant_id?q("POST","rpc/release_variant",{p_id:i.variant_id,p_qty:i.qty}):q("POST","rpc/release_stock",{p_sku:i.sku,p_qty:i.qty});
const mail=(o,items)=>R&&fetch("https://api.resend.com/emails",{method:"POST",headers:{Authorization:"Bearer "+R,"Content-Type":"application/json"},body:JSON.stringify({from:process.env.MAIL_FROM||"onboarding@resend.dev",to:[o.email],subject:"Bestelbevestiging SLIMZ",html:`<h2>Bedankt ${o.name}!</h2><p>We hebben je betaling van €${o.total} ontvangen en versturen je bestelling snel.</p><p>${items.map(i=>i.qty+"× "+i.sku).join("<br>")}</p><p>Je hebt ${o.points_earned} punten gespaard.</p>`})}).catch(()=>{});
exports.handler=async e=>{
 const site=process.env.URL;
 if(e.httpMethod==="GET"){const qs=e.queryStringParameters||{};
  if(qs.order){const o=(await q("GET","orders?id=eq."+encodeURIComponent(qs.order)+"&select=*,order_items(*)"))[0];if(!o||!o.id)return res({error:"niet gevonden"},404);return res({id:o.id,status:o.status,name:o.name,address:o.address,created_at:o.created_at,items:o.order_items,subtotal:o.subtotal,shipping:o.shipping,discount:o.discount,code:o.code,code_discount:o.code_discount,total:o.total,points_earned:o.points_earned})}
  if(qs.code)return res(await chk(qs.code,Number(qs.sub)||0));
  return res({url:S,key:process.env.SUPABASE_ANON_KEY})}
 if(e.queryStringParameters&&e.queryStringParameters.webhook){
  const id=new URLSearchParams(e.body).get("id");
  const p=await(await fetch("https://api.mollie.com/v2/payments/"+id,{headers:{Authorization:"Bearer "+M}})).json();
  const o=(await q("GET","orders?mollie_id=eq."+id+"&select=*,order_items(*)"))[0];
  if(o&&o.status==="pending"){
   if(p.status==="paid"){
    await q("PATCH","orders?id=eq."+o.id,{status:"paid"});
    if(o.code){const dc=(await q("GET","discount_codes?code=eq."+encodeURIComponent(o.code)))[0];if(dc)await q("PATCH","discount_codes?code=eq."+encodeURIComponent(o.code),{uses:dc.uses+1})}
    if(o.user_id){const prev=await q("GET","orders?user_id=eq."+o.user_id+"&status=in.(paid,shipped)&id=neq."+o.id+"&select=id&limit=1");let bonus=0;
     if(!(Array.isArray(prev)&&prev.length)){bonus=50;if(o.ref){const rp=(await q("GET","profiles?ref_code=eq."+encodeURIComponent(o.ref)+"&select=id,points"))[0];if(rp&&rp.id&&rp.id!==o.user_id){await q("PATCH","profiles?id=eq."+rp.id,{points:rp.points+50});bonus+=50}}}
     const pf=(await q("GET","profiles?id=eq."+o.user_id+"&select=points"))[0];await q("PATCH","profiles?id=eq."+o.user_id,{points:(pf?pf.points:0)-o.points_used+o.points_earned+bonus})}
    await mail(o,o.order_items);
   } else if(["failed","canceled","expired"].includes(p.status)){await q("PATCH","orders?id=eq."+o.id,{status:"failed"});for(const i of o.order_items)await rel(i)}
  }
  return{statusCode:200,body:"ok"};
 }
 const b=JSON.parse(e.body||"{}");
 let user=null;const t=(e.headers.authorization||"").replace("Bearer ","");
 if(t){const u=await(await fetch(S+"/auth/v1/user",{headers:{apikey:K,Authorization:"Bearer "+t}})).json();if(u&&u.id)user=u}
 if(b.action==="shipped"){const pf=user&&(await q("GET","profiles?id=eq."+user.id+"&select=is_admin"))[0];if(!pf||!pf.is_admin)return res({error:"Geen toegang"},403);
  const o=(await q("GET","orders?id=eq."+encodeURIComponent(b.id)))[0];if(!o||!o.id)return res({error:"Niet gevonden"},404);
  await q("PATCH","orders?id=eq."+o.id,{status:"shipped",tracking:b.tracking||null});
  if(R)await fetch("https://api.resend.com/emails",{method:"POST",headers:{Authorization:"Bearer "+R,"Content-Type":"application/json"},body:JSON.stringify({from:process.env.MAIL_FROM||"onboarding@resend.dev",to:[o.email],subject:"Je bestelling is onderweg",html:`<p>Hoi ${String(o.name||"").split(" ")[0]},</p><p>Je bestelling is verzonden.${b.tracking?" Track &amp; trace-code: <b>"+b.tracking+"</b>.":""}</p><p>Bezorgd op: ${o.address}</p>`})}).catch(()=>{});
  return res({ok:true})}
 const keys=Object.keys(b.cart||{});if(!keys.length)return res({error:"Lege mand"},400);
 const base=[...new Set(keys.map(k=>k.split("|")[0].replace(/[^A-Za-z0-9-]/g,"")))];
 const prods=await q("GET","products?sku=in.("+base.join(",")+")&active=eq.true"),vars=await q("GET","variants?sku=in.("+base.join(",")+")&active=eq.true");
 let sub=0;const items=[];
 for(const k of keys){const [s,vid]=k.split("|"),p=Array.isArray(prods)&&prods.find(x=>x.sku===s),n=Math.floor(b.cart[k]),vl=(Array.isArray(vars)?vars:[]).filter(v=>v.sku===s);
  if(!p||!(n>=1&&n<=20))return res({error:s+" niet beschikbaar"},400);
  let v=null;if(vl.length){v=vl.find(x=>String(x.id)===vid);if(!v)return res({error:"Kies een variant voor "+s},400);if(n>v.stock)return res({error:s+" "+v.label+" is niet op voorraad"},400)}else if(n>p.stock)return res({error:s+" is niet op voorraad"},400);
  const price=Number(p.price)+(v?Number(v.price_delta||0):0);sub+=price*n;items.push({sku:s,qty:n,price,variant_id:v?v.id:null,variant_label:v?v.label:null})}
 sub=r2(sub);const be=b.country==="BE",ship=be?(sub>=50?0:6.95):(sub>=35?0:4.95);let used=0;let cd=0,cc=null;if(b.code){const c=await chk(b.code,sub);if(!c.ok)return res({error:c.msg},400);cd=c.discount;cc=c.code}
 if(user&&b.usePoints){const pf=(await q("GET","profiles?id=eq."+user.id+"&select=points"))[0];used=Math.min(pf?pf.points:0,Math.floor((sub-cd)*20))}
 const disc=r2(used*0.05),total=r2(sub-cd-disc+ship);
 const got=[];for(const i of items){const ok=await rsv(i);if(ok!==true){for(const g of got)await rel(g);return res({error:i.sku+" is net uitverkocht"},400)}got.push(i)}
 let life=0;if(user){const lo=await q("GET","orders?user_id=eq."+user.id+"&status=in.(paid,shipped)&select=points_earned");life=(lo||[]).reduce((a,y)=>a+y.points_earned,0)}
 const mult=life>=500?1.5:life>=250?1.25:1;
 const o=(await q("POST","orders",{email:b.email,name:b.name,address:b.address,phone:b.phone,ref:(b.ref||"").slice(0,20)||null,country:be?"BE":"NL",note:(b.note||"").slice(0,500),code:cc,code_discount:cd,subtotal:sub,discount:disc,shipping:ship,total,points_used:used,points_earned:Math.floor(total*mult),user_id:user?user.id:null}))[0];
 await q("POST","order_items",items.map(i=>({...i,order_id:o.id})));
 const pay=await(await fetch("https://api.mollie.com/v2/payments",{method:"POST",headers:{Authorization:"Bearer "+M,"Content-Type":"application/json"},body:JSON.stringify({amount:{currency:"EUR",value:total.toFixed(2)},description:"Bestelling "+o.id.slice(0,8),redirectUrl:site+"/?paid="+o.id,webhookUrl:site+"/.netlify/functions/shop?webhook=1"})})).json();
 if(!pay._links){for(const i of items)await rel(i);await q("PATCH","orders?id=eq."+o.id,{status:"failed"});return res({error:"Mollie-fout: "+(pay.detail||"controleer MOLLIE_KEY")},500)}
 await q("PATCH","orders?id=eq."+o.id,{mollie_id:pay.id});
 return res({url:pay._links.checkout.href});
};
