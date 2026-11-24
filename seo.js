// Echte productadressen (/product/MS-03) en sitemap voor zoekmachines. Geen extra sleutels nodig.
const S=process.env.SUPABASE_URL,K=process.env.SUPABASE_ANON_KEY,U=process.env.URL||"";
const esc=s=>String(s??"").replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const get=async p=>{const r=await fetch(S+"/rest/v1/"+p,{headers:{apikey:K,Authorization:"Bearer "+K}});const d=await r.json();return Array.isArray(d)?d:[]};
exports.handler=async e=>{const qs=e.queryStringParameters||{};
 if(qs.sitemap){const ps=await get("products?active=eq.true&select=sku");return{statusCode:200,headers:{"Content-Type":"application/xml"},body:`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><url><loc>${U}/</loc></url>${ps.map(p=>`<url><loc>${U}/product/${esc(p.sku)}</loc></url>`).join("")}</urlset>`}}
 const sku=(qs.sku||"").replace(/[^A-Za-z0-9-]/g,"");const p=(await get("products?sku=eq."+sku+"&active=eq.true"))[0];
 if(!p)return{statusCode:302,headers:{Location:"/"},body:""};
 const rv=await get("reviews?sku=eq."+sku+"&select=rating");
 const ld={"@context":"https://schema.org","@type":"Product",name:p.name,description:p.description||p.name,sku:p.sku,offers:{"@type":"Offer",priceCurrency:"EUR",price:Number(p.price).toFixed(2),availability:p.stock>0?"https://schema.org/InStock":"https://schema.org/OutOfStock",url:U+"/product/"+p.sku}};
 if(rv.length)ld.aggregateRating={"@type":"AggregateRating",ratingValue:(rv.reduce((a,x)=>a+x.rating,0)/rv.length).toFixed(1),reviewCount:rv.length};
 if(p.image_url)ld.image=p.image_url;
 const d=esc((p.description||p.name)+" Gratis verzending vanaf €35.");
 return{statusCode:200,headers:{"Content-Type":"text/html; charset=utf-8","Cache-Control":"public,max-age=300"},body:`<!doctype html><html lang="nl"><head><meta charset="utf-8"><title>${esc(p.name)} | SLIMZ</title><meta name="description" content="${d}"><link rel="canonical" href="${U}/product/${esc(p.sku)}"><meta property="og:title" content="${esc(p.name)}"><meta property="og:description" content="${d}">${p.image_url?`<meta property="og:image" content="${esc(p.image_url)}">`:""}<script type="application/ld+json">${JSON.stringify(ld).replace(/</g,"\\u003c")}</script><meta http-equiv="refresh" content="0;url=/#/p/${esc(p.sku)}"></head><body><h1>${esc(p.name)}</h1><p>${esc(p.description||"")}</p><p>€${Number(p.price).toFixed(2)}</p><a href="/#/p/${esc(p.sku)}">Bekijk in de shop</a><script>location.replace("/#/p/${esc(p.sku)}")</script></body></html>`}};
