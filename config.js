// Verbonden met je Supabase-project Slimz. Hieronder demoproducten (alleen gebruikt zonder database).
window.CFG={url:"https://pcrhswqpcukimwjxgjsn.supabase.co",key:"sb_publishable_G81blC-4cFTjIcIeOQbMHw_ekyN7anF",shop:"SLIMZ"}; // publieke sleutel, veilig in de browser
window.DEMO=[
{sku:"MS-01",name:"Anti-schok MagSafe fiets- & fatbike-houder",category:"Fiets / E-bike",description:"Stevige magnetische houder voor stuur of frame.",price:29.95,stock:15},
{sku:"MS-02",name:"MagSafe auto-ventilatiehouder 360°",category:"Auto",description:"Klikt vast in je ventilatierooster.",price:24.95,stock:15},
{sku:"MS-03",name:"MagSafe kaarthouder met kickstand",category:"Dagelijks / Reizen",description:"Pinpas of OV-kaart achterop, ook als stand.",price:21.95,stock:15},
{sku:"MS-04",name:"Waterafstotende tech-pouch",category:"Reizen",description:"Kabels, AirPods en paspoort bij elkaar.",price:24.95,stock:10},
{sku:"MS-05",name:"MagSafe auto-dashboardhouder",category:"Auto",description:"Zuignap of plakstrip.",price:26.95,stock:10},
{sku:"MS-06",name:"MagSafe vliegtuig- & treinhouder",category:"Reizen",description:"Klem-systeem voor tafeltjes.",price:19.95,stock:10},
{sku:"MS-07",name:"Universele MagSafe ring (2-pack)",category:"Accessoire",description:"Maakt elke telefoon MagSafe-geschikt.",price:7.95,stock:30},
{sku:"BDL-01",name:"De Forens bundel",category:"Bundel",description:"Fietshouder + kaarthouder + ring.",price:49.95,stock:10},
{sku:"BDL-02",name:"De Roadtrip bundel",category:"Bundel",description:"Autohouder + tech-pouch + ring.",price:46.95,stock:10}];

// Productillustraties (vector). Echte foto? Zet een Foto-URL bij het product in het admin-paneel.
(()=>{const N="#c8922a",ph=(x,y,r=0)=>`<g transform="translate(${x} ${y}) rotate(${r})"><rect width="56" height="108" rx="11" fill="#161616" stroke="#4a4a4a" stroke-width="2"/><rect x="4" y="4" width="48" height="100" rx="8" fill="#0b0b0b"/><circle cx="14" cy="15" r="6" fill="#222" stroke="#555"/><circle cx="28" cy="58" r="15" fill="none" stroke="#2f2f2f" stroke-width="2"/></g>`;
const A={"MS-01":`<rect x="0" y="122" width="200" height="12" rx="6" fill="#3d3d3d"/>${ph(72,8)}<rect x="84" y="112" width="32" height="26" rx="6" fill="${N}"/><rect x="92" y="104" width="16" height="12" rx="3" fill="#222" stroke="${N}"/>`,
"MS-02":`${[96,108,120,132].map(y=>`<rect x="30" y="${y}" width="140" height="6" rx="3" fill="#2c2c2c"/>`).join("")}${ph(72,6)}<rect x="90" y="100" width="20" height="30" rx="4" fill="${N}"/>`,
"MS-03":`${ph(72,18,-6)}<rect x="82" y="72" width="38" height="28" rx="5" fill="${N}"/><rect x="86" y="68" width="30" height="6" rx="2" fill="#0b0b0b"/><path d="M118 120 L150 138" stroke="#777" stroke-width="5" stroke-linecap="round"/>`,
"MS-04":`<rect x="34" y="42" width="132" height="88" rx="18" fill="#1b1b1b" stroke="${N}" stroke-width="3"/><path d="M48 62 H152" stroke="${N}" stroke-width="3" stroke-dasharray="6 5"/><rect x="92" y="58" width="16" height="9" rx="3" fill="${N}"/><path d="M60 100 q20 -28 40 0 t40 0" fill="none" stroke="#777" stroke-width="3"/>`,
"MS-05":`<path d="M0 135 Q100 105 200 135 V160 H0Z" fill="#232323"/>${ph(72,6)}<circle cx="100" cy="118" r="14" fill="none" stroke="${N}" stroke-width="5"/><rect x="96" y="112" width="8" height="10" fill="${N}"/>`,
"MS-06":`<rect x="0" y="124" width="200" height="14" rx="3" fill="#2f2f2f"/>${ph(74,22,8)}<path d="M128 124 v-18 h14 v36 h-14" fill="none" stroke="${N}" stroke-width="6"/>`,
"MS-07":`<circle cx="68" cy="80" r="34" fill="none" stroke="${N}" stroke-width="9"/><circle cx="132" cy="80" r="34" fill="none" stroke="#9a9a9a" stroke-width="9"/>`};
A["BDL-01"]=`<g transform="translate(-12 28) scale(.55)">${A["MS-01"]}</g><g transform="translate(88 6) scale(.58)">${A["MS-03"]}</g><g transform="translate(62 96) scale(.36)">${A["MS-07"]}</g>`;
A["BDL-02"]=`<g transform="translate(-12 20) scale(.55)">${A["MS-02"]}</g><g transform="translate(86 36) scale(.52)">${A["MS-04"]}</g><g transform="translate(70 100) scale(.34)">${A["MS-07"]}</g>`;
window.ART=sku=>`<svg viewBox="0 0 200 160" role="img" aria-label="${sku}" style="width:100%;height:100%"><defs><radialGradient id="g${sku}" cx="50%" cy="45%"><stop offset="0" stop-color="#f0c85a" stop-opacity=".2"/><stop offset="1" stop-color="#f0c85a" stop-opacity="0"/></radialGradient></defs><rect width="200" height="160" fill="url(#g${sku})"/>${A[sku]||""}</svg>`})();
// Bedrijfsgegevens voor facturen en contact. Vul in.
window.CFG.co={name:"SLIMZ",addr:"[straat en nummer, postcode plaats]",kvk:"[KvK-nummer]",btw:"[btw-nummer]",mail:"info@jouwdomein.nl"};
