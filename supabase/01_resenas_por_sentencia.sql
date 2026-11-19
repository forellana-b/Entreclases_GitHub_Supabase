-- Ejecuta cada sentencia por separado y en orden.
create table if not exists public.resenas (
  id uuid primary key default gen_random_uuid(),
  lugar_id text not null check (lugar_id ~ '^[a-z0-9-]{1,80}$'),
  estrellas smallint not null check (estrellas between 1 and 5),
  alias text not null default '' check (char_length(alias) <= 40),
  comentario text not null default '' check (char_length(comentario) <= 360),
  creado_en timestamptz not null default now(),
  autor_id uuid not null default auth.uid(),
  unique (autor_id, lugar_id)
);
alter table public.resenas enable row level security;
revoke all privileges on table public.resenas from PUBLIC;
revoke all privileges on table public.resenas from anon;
revoke all privileges on table public.resenas from authenticated;
grant select (id,lugar_id,estrellas,alias,comentario,creado_en)
  on table public.resenas to anon;
grant select (id,lugar_id,estrellas,alias,comentario,creado_en)
  on table public.resenas to authenticated;
grant insert (lugar_id,estrellas,alias,comentario)
  on table public.resenas to authenticated;
drop policy if exists lectura_resenas on public.resenas;
create policy lectura_resenas on public.resenas for select
  to anon using (true);
drop policy if exists lectura_resenas_con_sesion on public.resenas;
create policy lectura_resenas_con_sesion on public.resenas for select
  to authenticated using (true);
drop policy if exists escribir_resena_propia on public.resenas;
create policy escribir_resena_propia on public.resenas for insert
  to authenticated with check (autor_id = (select auth.uid()));
