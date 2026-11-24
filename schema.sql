create table products(sku text primary key,name text not null,category text,description text,price numeric(8,2) not null,cost numeric(8,2) default 0,stock int default 0,active bool default true,image_url text);
create table profiles(id uuid primary key references auth.users on delete cascade,email text,points int default 0,is_admin bool default false);
create table orders(id uuid primary key default gen_random_uuid(),created_at timestamptz default now(),email text,name text,address text,subtotal numeric(8,2),discount numeric(8,2) default 0,shipping numeric(8,2) default 0,total numeric(8,2),points_used int default 0,points_earned int default 0,user_id uuid,mollie_id text,status text default 'pending');
create table order_items(id bigserial primary key,order_id uuid references orders on delete cascade,sku text,qty int,price numeric(8,2));
create table visits(id bigserial primary key,created_at timestamptz default now(),session text,path text);
create function is_admin() returns bool language sql security definer as $$select coalesce((select is_admin from profiles where id=auth.uid()),false)$$;
create function new_user() returns trigger language plpgsql security definer as $$begin insert into profiles(id,email,points) values(new.id,new.email,50);return new;end$$;
create trigger on_signup after insert on auth.users for each row execute function new_user();
alter table products enable row level security;alter table profiles enable row level security;alter table orders enable row level security;alter table order_items enable row level security;alter table visits enable row level security;
create policy "shop leest producten" on products for select using(active or is_admin());
create policy "admin beheert producten" on products for all using(is_admin()) with check(is_admin());
create policy "eigen profiel" on profiles for select using(id=auth.uid() or is_admin());
create policy "admin profielen" on profiles for update using(is_admin());
create policy "eigen bestellingen" on orders for select using(user_id=auth.uid() or is_admin());
create policy "admin bestellingen" on orders for update using(is_admin());
create policy "eigen items" on order_items for select using(is_admin() or exists(select 1 from orders o where o.id=order_id and o.user_id=auth.uid()));
create policy "bezoek loggen" on visits for insert with check(true);
create policy "admin leest bezoeken" on visits for select using(is_admin());
insert into products(sku,name,category,description,price,cost,stock) values
('MS-01','Anti-schok MagSafe fiets- & fatbike-houder (aluminium)','Fiets / E-bike','Stevige magnetische houder voor stuur of frame.',29.95,7.50,15),
('MS-02','MagSafe auto-ventilatiehouder 360° (metaal)','Auto','Klikt vast in je ventilatierooster, 360° draaibaar.',24.95,5.50,15),
('MS-03','MagSafe kaarthouder (wallet) met kickstand','Dagelijks / Reizen','Pinpas of OV-chipkaart achterop, uitklappen als stand.',21.95,4.25,15),
('MS-04','Waterafstotende tech-pouch (kabel & reis organizer)','Reizen','Kabels, AirPods en paspoort bij elkaar.',24.95,6.25,10),
('MS-05','MagSafe auto-dashboardhouder (zuignap / plakstrip)','Auto','Stabiel op je dashboard, zuignap of plakstrip.',26.95,6.00,10),
('MS-06','MagSafe vliegtuig- & treinhouder (klem-systeem)','Reizen','Klem aan het tafeltje, film kijken onderweg.',19.95,3.80,10),
('MS-07','Universele MagSafe magnetische ring (2-pack)','Accessoire','Maakt elke telefoon geschikt voor MagSafe.',7.95,0.60,30),
('BDL-01','De Forens bundel (fietshouder + kaarthouder + ring)','Bundel','Alles voor dagelijks onderweg.',49.95,12.35,10),
('BDL-02','De Roadtrip bundel (autohouder + tech-pouch + ring)','Bundel','Alles voor de lange rit.',46.95,12.35,10);
-- Daarna jezelf admin maken (na eerste inlog): update profiles set is_admin=true where email='jouw@mail.nl';

-- Heb je het schema al eerder uitgevoerd? Voer dan alleen dit uit:
-- alter table products add column if not exists image_url text;
create table customer_details(user_id uuid primary key references auth.users on delete cascade,full_name text,phone text,street text,nr text,zip text,city text,updated_at timestamptz default now());
alter table customer_details enable row level security;
create policy "eigen gegevens" on customer_details for all using(user_id=(select auth.uid())) with check(user_id=(select auth.uid()));
create policy "admin leest gegevens" on customer_details for select using(is_admin());
alter table orders add column if not exists phone text, add column if not exists note text, add column if not exists code text, add column if not exists code_discount numeric(8,2) default 0;
create table discount_codes(code text primary key,percent int,amount numeric(8,2),min_order numeric(8,2) default 0,max_uses int,uses int default 0,expires_at timestamptz,active bool default true);
alter table discount_codes enable row level security;
create policy "admin beheert codes" on discount_codes for all using(is_admin()) with check(is_admin());
insert into discount_codes(code,percent,min_order) values('WELKOM10',10,20);
-- Extra's: reviews, verlanglijst, voorraadmeldingen, retouren, tracking (zie migratie in Supabase)
alter table orders add column if not exists tracking text;
create table reviews(id bigserial primary key,sku text references products(sku) on delete cascade,user_id uuid references auth.users on delete cascade,name text,rating int check(rating between 1 and 5),body text,created_at timestamptz default now(),unique(sku,user_id));
create table wishlist(user_id uuid references auth.users on delete cascade,sku text references products(sku) on delete cascade,primary key(user_id,sku));
create table stock_alerts(id bigserial primary key,sku text references products(sku) on delete cascade,email text,created_at timestamptz default now());
create table returns(id bigserial primary key,order_id uuid references orders on delete cascade,user_id uuid,reason text,status text default 'aangevraagd',created_at timestamptz default now());
alter table reviews enable row level security;alter table wishlist enable row level security;alter table stock_alerts enable row level security;alter table returns enable row level security;
create policy "reviews lezen" on reviews for select using(true);
create policy "kopers schrijven review" on reviews for insert with check(user_id=(select auth.uid()) and exists(select 1 from orders o join order_items i on i.order_id=o.id where o.user_id=(select auth.uid()) and i.sku=reviews.sku and o.status in ('paid','shipped')));
create policy "admin verwijdert review" on reviews for delete using(is_admin());
create policy "eigen verlanglijst" on wishlist for all using(user_id=(select auth.uid())) with check(user_id=(select auth.uid()));
create policy "melding aanmaken" on stock_alerts for insert with check(email like '%@%');
create policy "admin leest meldingen" on stock_alerts for select using(is_admin());
create policy "admin verwijdert melding" on stock_alerts for delete using(is_admin());
create policy "retour aanvragen" on returns for insert with check(user_id=(select auth.uid()) and exists(select 1 from orders o where o.id=order_id and o.user_id=(select auth.uid()) and o.status in ('paid','shipped')));
create policy "retour lezen" on returns for select using(user_id=(select auth.uid()) or is_admin());
create policy "admin retour bijwerken" on returns for update using(is_admin());
-- Voorraadreservering, verwijzingen, bronnen, 50 punten pas bij eerste bestelling
create or replace function new_user() returns trigger language plpgsql security definer set search_path = public as $$begin insert into profiles(id,email,points) values(new.id,new.email,0);return new;end$$;
create function reserve_stock(p_sku text,p_qty int) returns boolean language plpgsql security definer set search_path = public as $$begin update products set stock=stock-p_qty where sku=p_sku and stock>=p_qty and active;return found;end$$;
create function release_stock(p_sku text,p_qty int) returns void language plpgsql security definer set search_path = public as $$begin update products set stock=stock+p_qty where sku=p_sku;end$$;
revoke execute on function reserve_stock(text,int), release_stock(text,int), new_user() from public, anon, authenticated;
alter table profiles add column if not exists ref_code text unique default substr(md5(random()::text||clock_timestamp()::text),1,8);
alter table orders add column if not exists ref text, add column if not exists country text default 'NL';
alter table visits add column if not exists source text;
create unique index if not exists stock_alerts_uniq on stock_alerts(sku,email);
-- Varianten
create table variants(id bigserial primary key,sku text references products(sku) on delete cascade,label text not null,stock int default 0 check(stock>=0),price_delta numeric(8,2) default 0,active bool default true,sort int default 0);
alter table variants enable row level security;
create policy "varianten lezen" on variants for select using(active or is_admin());
create policy "admin varianten" on variants for all using(is_admin()) with check(is_admin());
alter table order_items add column if not exists variant_id bigint, add column if not exists variant_label text;
create function reserve_variant(p_id bigint,p_qty int) returns boolean language plpgsql security definer set search_path = public as $$begin update variants set stock=stock-p_qty where id=p_id and stock>=p_qty and active;return found;end$$;
create function release_variant(p_id bigint,p_qty int) returns void language plpgsql security definer set search_path = public as $$begin update variants set stock=stock+p_qty where id=p_id;end$$;
revoke execute on function reserve_variant(bigint,int), release_variant(bigint,int) from public, anon, authenticated;
