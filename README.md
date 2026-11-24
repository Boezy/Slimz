# SLIMZ webshop: live in ±10 minuten

Alles zit in deze map (of de zip). Geen code, geen terminal.

## 1. Database (Supabase, gratis)
1. supabase.com > New project. Open **SQL Editor**, plak de inhoud van `supabase/schema.sql`, klik Run.
2. **Authentication > Users > Add user**: je e-mail + wachtwoord (vink "Auto confirm" aan).
3. SQL Editor: `update profiles set is_admin=true where email='jouw@mail.nl';`
4. **Settings > API**: kopieer *Project URL*, *anon key* en *service_role key*.

## 2. Betalingen (Mollie)
mollie.com > account > Developers > API-keys. Begin met de **test_**-key. Zet later de **live_**-key erin.

## 3. Hosting (Netlify, gratis)
1. app.netlify.com/drop: sleep de zip (of de map `webshop`) erop. De site staat meteen online.
2. Site configuration > Environment variables, voeg toe:
   - `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_KEY`
   - `MOLLIE_KEY`
   - optioneel: `RESEND_KEY` en `MAIL_FROM` (bevestigingsmails via resend.com)
3. Deploys > Trigger deploy (zodat de variabelen actief worden).
4. Eigen domein: Domain management > Add domain.

Shop: `/`, beheer: `/admin.html`. Test met een Mollie-testbetaling.
Voorraad, prijzen, punten en bestellingen beheer je in het admin-paneel.
Vul je bedrijfsgegevens in `legal.html` in.

## Foto's en hero-video
- Productafbeeldingen zijn standaard vector-illustraties. Echte foto's: upload ze (bv. via Supabase Storage > bucket public) en plak de URL bij het product in admin > Producten > Foto-URL.
- Hero-video: zet een bestand `hero.mp4` (korte loop, <5 MB, zonder geluid) naast `index.html`. Zonder dat bestand zie je de geanimeerde achtergrond.

## Klantaccounts
- Supabase > Authentication > Providers > Email aan. Zet bij URL Configuration je domein als Site URL en Redirect URL, anders werken bevestigings- en inloglinks niet.
- Klanten maken een account (e-mail + wachtwoord of inloglink) en zien onder /#/account hun punten en recente bestellingen. Bestel je ingelogd, dan wordt de order aan je account gekoppeld.
- Contactmailadres: zoek `info@jouwdomein.nl` in `index.html` en vervang dat door het jouwe.

## Status
Supabase-project `Slimz` is al gekoppeld (tabellen, beveiliging en 9 producten staan erin; URL en publieke sleutel staan in `config.js`). Op Netlify hoef je alleen `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_KEY` en `MOLLIE_KEY` te zetten voor betalingen.

## Admin
Log in op de shop met ronanboeser18@gmail.com: je ziet dan 'Beheer' in het menu en 'Admin-paneel' in je account. Je blijft ingelogd in /admin.html.

## Extra's
- Echte productadressen: /product/MS-03 en /sitemap.xml (Netlify function seo). Dien de sitemap in bij Google Search Console.
- 50 punten cadeau krijgt een klant bij de eerste betaalde bestelling. Vriend-uitnodigen: beide +50.
- Cadeaubon: maak in admin > Kortingscodes een code met een vast bedrag.
