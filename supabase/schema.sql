-- ==========================================================================
-- VONN — Esquema de base de datos multi-cliente (multi-tenant)
-- Un solo proyecto Supabase compartido por TODOS los clientes de VONN.
-- Cada tabla que guarda datos de un cliente tiene una columna tenant_id,
-- y Row Level Security (RLS) se encarga de que un cliente jamás pueda
-- leer ni escribir datos de otro, aunque compartan la misma base.
--
-- Cómo aplicar este archivo: Supabase Dashboard → SQL Editor → pegar y
-- correr todo. También sirve como referencia versionada en el repo.
-- ==========================================================================

-- --------------------------------------------------------------------------
-- 1. TENANTS — un registro por cliente de VONN (una barbería, un kiosco, etc.)
-- --------------------------------------------------------------------------
create table if not exists tenants (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,                    -- ej: "barberia-lopez" -> barberia-lopez.vonn.com.ar
  business_name text not null,
  logo_url text,
  primary_color text default '#0066CC',         -- color de marca del cliente (no el de VONN)
  accent_color text default '#FF9500',
  business_mode text not null default 'ninguno' -- 'turnos' | 'pedidos' | 'ninguno'
    check (business_mode in ('turnos', 'pedidos', 'ninguno')),
  status text not null default 'activo'
    check (status in ('activo', 'pausado', 'cancelado')),
  -- Parámetros del negocio que el propio cliente edita libremente desde
  -- /panel/configuracion, sin aprobación de nadie (a diferencia de lo que
  -- requiere tocar código, que pasa por Fase 4 / Aprobaciones).
  horario_atencion jsonb not null default '{
    "lunes":{"abierto":true,"desde":"09:00","hasta":"18:00"},
    "martes":{"abierto":true,"desde":"09:00","hasta":"18:00"},
    "miercoles":{"abierto":true,"desde":"09:00","hasta":"18:00"},
    "jueves":{"abierto":true,"desde":"09:00","hasta":"18:00"},
    "viernes":{"abierto":true,"desde":"09:00","hasta":"18:00"},
    "sabado":{"abierto":false,"desde":"09:00","hasta":"13:00"},
    "domingo":{"abierto":false,"desde":"09:00","hasta":"13:00"}
  }'::jsonb,
  cupo_simultaneo integer not null default 1,
  created_at timestamptz not null default now()
);

comment on table tenants is 'Un registro por cliente de VONN. slug define su subdominio (slug.vonn.com.ar).';

-- --------------------------------------------------------------------------
-- 2. TENANT_MEMBERS — quién puede entrar al panel de cada cliente, y con qué rol
--    Vincula usuarios reales de Supabase Auth (auth.users) con un tenant.
-- --------------------------------------------------------------------------
create table if not exists tenant_members (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  user_id uuid references auth.users(id) on delete set null,
  invited_email text not null,                  -- se guarda aunque el usuario todavía no haya aceptado la invitación
  role text not null default 'empleado'
    check (role in ('owner', 'empleado')),
  status text not null default 'invitado'
    check (status in ('invitado', 'activo', 'revocado')),
  created_at timestamptz not null default now(),
  unique (tenant_id, invited_email)
);

comment on table tenant_members is 'Accesos al panel: quién pertenece a qué tenant, con qué rol (owner/empleado).';

-- --------------------------------------------------------------------------
-- Funciones auxiliares para las políticas de seguridad (RLS)
-- --------------------------------------------------------------------------
create or replace function is_tenant_member(check_tenant_id uuid)
returns boolean
language sql
security definer
stable
as $$
  select exists (
    select 1 from tenant_members
    where tenant_id = check_tenant_id
      and user_id = auth.uid()
      and status = 'activo'
  );
$$;

create or replace function is_tenant_owner(check_tenant_id uuid)
returns boolean
language sql
security definer
stable
as $$
  select exists (
    select 1 from tenant_members
    where tenant_id = check_tenant_id
      and user_id = auth.uid()
      and status = 'activo'
      and role = 'owner'
  );
$$;

-- --------------------------------------------------------------------------
-- 3. SITE_CONTENT — el contenido editable del sitio público (1 fila por tenant)
--    Esto es lo que el dueño edita desde "Editor de contenido" en el panel.
-- --------------------------------------------------------------------------
create table if not exists site_content (
  tenant_id uuid primary key references tenants(id) on delete cascade,
  hero_title text,
  hero_subtitle text,
  hero_image_url text,
  about_text text,
  address text,
  whatsapp_number text,
  instagram_url text,
  facebook_url text,
  schedule jsonb default '{}'::jsonb,           -- ej: {"lunes": "9 a 13 y 17 a 20", "domingo": "cerrado"}
  updated_at timestamptz not null default now()
);

-- --------------------------------------------------------------------------
-- 4. CATALOG_ITEMS — lo que el cliente vende u ofrece (productos o servicios)
-- --------------------------------------------------------------------------
create table if not exists catalog_items (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  name text not null,
  description text,
  price numeric(12, 2),
  image_url text,
  category text,
  duration_minutes int,                          -- solo tiene sentido en modo "turnos" (ej: corte = 30 min)
  active boolean not null default true,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

-- --------------------------------------------------------------------------
-- 5a. BOOKINGS (turnos) — para tenants con business_mode = 'turnos'
-- --------------------------------------------------------------------------
create table if not exists bookings (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  catalog_item_id uuid references catalog_items(id) on delete set null,
  customer_name text not null,
  customer_phone text not null,
  scheduled_at timestamptz not null,
  status text not null default 'pendiente'
    check (status in ('pendiente', 'confirmado', 'cancelado', 'completado')),
  notes text,
  created_at timestamptz not null default now()
);

-- --------------------------------------------------------------------------
-- 5b. ORDERS + ORDER_ITEMS (pedidos) — para tenants con business_mode = 'pedidos'
-- --------------------------------------------------------------------------
create table if not exists orders (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  customer_name text not null,
  customer_phone text not null,
  status text not null default 'pendiente'
    check (status in ('pendiente', 'preparando', 'listo', 'entregado', 'cancelado')),
  total numeric(12, 2) not null default 0,
  notes text,
  created_at timestamptz not null default now()
);

create table if not exists order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders(id) on delete cascade,
  catalog_item_id uuid references catalog_items(id) on delete set null,
  item_name text not null,                        -- copia del nombre al momento del pedido (por si el producto cambia después)
  quantity int not null default 1,
  unit_price numeric(12, 2) not null,
  subtotal numeric(12, 2) not null
);

-- --------------------------------------------------------------------------
-- 6. CONTACT_MESSAGES — bandeja de mensajes del formulario de contacto público
-- --------------------------------------------------------------------------
create table if not exists contact_messages (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  name text not null,
  email text,
  phone text,
  message text not null,
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);

-- --------------------------------------------------------------------------
-- 7. SUPPORT_TICKETS — botón de "reportar un error" dentro del panel privado
--    (Fase 3/4 del documento maestro: hoy queda como registro; la
--    auto-reparación con IA se conecta más adelante sobre esta tabla)
-- --------------------------------------------------------------------------
create table if not exists support_tickets (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  created_by uuid references auth.users(id) on delete set null,
  category text,                                  -- respuesta rápida del bot filtro (ej: "no carga una imagen")
  description text not null,
  status text not null default 'abierto'
    check (status in ('abierto', 'en_progreso', 'resuelto')),
  created_at timestamptz not null default now()
);

-- ==========================================================================
-- ROW LEVEL SECURITY — activar en todas las tablas con datos de clientes
-- ==========================================================================
alter table tenants enable row level security;
alter table tenant_members enable row level security;
alter table site_content enable row level security;
alter table catalog_items enable row level security;
alter table bookings enable row level security;
alter table orders enable row level security;
alter table order_items enable row level security;
alter table contact_messages enable row level security;
alter table support_tickets enable row level security;

-- ---- tenants: lectura pública (el sitio necesita mostrar nombre/logo/colores),
--      escritura solo si sos miembro activo de ese tenant.
create policy "tenants: lectura pública" on tenants
  for select using (true);

create policy "tenants: solo miembros editan" on tenants
  for update using (is_tenant_member(id));

-- ---- tenant_members: solo lo ve/gestiona gente del propio tenant, y
--      solo el owner puede agregar o dar de baja empleados.
create policy "tenant_members: los propios miembros ven la lista" on tenant_members
  for select using (is_tenant_member(tenant_id));

create policy "tenant_members: el owner invita" on tenant_members
  for insert with check (is_tenant_owner(tenant_id));

create policy "tenant_members: el owner edita roles/estado" on tenant_members
  for update using (is_tenant_owner(tenant_id));

create policy "tenant_members: el owner revoca accesos" on tenant_members
  for delete using (is_tenant_owner(tenant_id));

-- ---- site_content: lectura pública (es el contenido del sitio), edición
--      solo para miembros del tenant.
create policy "site_content: lectura pública" on site_content
  for select using (true);

create policy "site_content: miembros editan" on site_content
  for all using (is_tenant_member(tenant_id))
  with check (is_tenant_member(tenant_id));

-- ---- catalog_items: lectura pública, escritura solo miembros.
create policy "catalog_items: lectura pública" on catalog_items
  for select using (active = true or is_tenant_member(tenant_id));

create policy "catalog_items: miembros administran" on catalog_items
  for all using (is_tenant_member(tenant_id))
  with check (is_tenant_member(tenant_id));

-- ---- bookings: cualquiera puede CREAR un turno desde el sitio público,
--      pero solo los miembros del tenant pueden verlos/administrarlos.
create policy "bookings: cualquiera puede reservar" on bookings
  for insert with check (true);

create policy "bookings: miembros ven y administran" on bookings
  for select using (is_tenant_member(tenant_id));

create policy "bookings: miembros actualizan" on bookings
  for update using (is_tenant_member(tenant_id));

-- ---- orders / order_items: mismo criterio que bookings.
create policy "orders: cualquiera puede pedir" on orders
  for insert with check (true);

create policy "orders: miembros ven y administran" on orders
  for select using (is_tenant_member(tenant_id));

create policy "orders: miembros actualizan" on orders
  for update using (is_tenant_member(tenant_id));

create policy "order_items: se crean junto al pedido" on order_items
  for insert with check (true);

create policy "order_items: miembros ven" on order_items
  for select using (
    exists (
      select 1 from orders
      where orders.id = order_items.order_id
        and is_tenant_member(orders.tenant_id)
    )
  );

-- ---- contact_messages: cualquiera puede escribir desde el formulario público,
--      solo los miembros del tenant leen la bandeja.
create policy "contact_messages: cualquiera puede escribir" on contact_messages
  for insert with check (true);

create policy "contact_messages: miembros leen" on contact_messages
  for select using (is_tenant_member(tenant_id));

create policy "contact_messages: miembros marcan como leído" on contact_messages
  for update using (is_tenant_member(tenant_id));

-- ---- support_tickets: solo miembros del tenant (esto vive dentro del panel
--      privado, nunca en la vista pública).
create policy "support_tickets: miembros crean" on support_tickets
  for insert with check (is_tenant_member(tenant_id));

create policy "support_tickets: miembros ven" on support_tickets
  for select using (is_tenant_member(tenant_id));

-- ==========================================================================
-- Trigger: cuando alguien confirma su cuenta (Supabase Auth), si su email
-- coincide con una invitación pendiente en tenant_members, la activa y la
-- vincula a su user_id automáticamente.
-- ==========================================================================
create or replace function link_invited_member()
returns trigger
language plpgsql
security definer
as $$
begin
  update tenant_members
  set user_id = new.id, status = 'activo'
  where invited_email = new.email
    and status = 'invitado';
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function link_invited_member();
