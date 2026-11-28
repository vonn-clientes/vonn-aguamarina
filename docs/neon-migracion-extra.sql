-- Ejecutar DESPUÉS de db/schema.neon.sql. Este archivo no se aplicó a Neon.
begin;

create table if not exists app_invites (
  token_hash text primary key,
  member_id uuid not null references tenant_members(id) on delete cascade,
  expires_at timestamptz not null
);
create index if not exists app_invites_member_idx on app_invites(member_id);
create index if not exists app_sessions_expires_idx on app_sessions(expires_at);
create index if not exists tenant_members_user_idx on tenant_members(user_id) where status = 'activo';
create index if not exists catalog_items_tenant_sort_idx on catalog_items(tenant_id, sort_order);
create index if not exists bookings_tenant_scheduled_idx on bookings(tenant_id, scheduled_at);
create index if not exists orders_tenant_created_idx on orders(tenant_id, created_at);
create index if not exists contact_messages_tenant_created_idx on contact_messages(tenant_id, created_at);
create index if not exists support_tickets_tenant_created_idx on support_tickets(tenant_id, created_at);

-- Función invoker: no eleva permisos. Bloquea la invitación y el miembro,
-- valida de nuevo y consume el token en la misma transacción que el alta.
-- p_verified_hash SOLO lo entrega el servidor después de verificar scrypt
-- para una cuenta existente. Nunca se recibe desde el navegador.
create or replace function activate_app_invite(
  p_token_hash text, p_password_hash text, p_verified_hash text
) returns uuid language plpgsql security invoker set search_path = public as $$
declare
  invitation record;
  existing_user app_users%rowtype;
  activated_user_id uuid;
begin
  select i.member_id, m.tenant_id, m.invited_email into invitation
  from app_invites i join tenant_members m on m.id = i.member_id
  join tenants t on t.id = m.tenant_id
  where i.token_hash = p_token_hash and i.expires_at > now()
    and m.status = 'invitado' and t.status = 'activo'
  for update of i, m;
  if not found then
    raise exception 'Invitación inválida' using errcode = 'P0001';
  end if;

  select * into existing_user from app_users
  where email = invitation.invited_email::citext for update;
  if found then
    if p_verified_hash is null or p_verified_hash <> existing_user.password_hash then
      raise exception 'Credenciales inválidas' using errcode = 'P0001';
    end if;
    activated_user_id := existing_user.id;
  else
    if p_verified_hash is not null or p_password_hash is null then
      raise exception 'Credenciales inválidas' using errcode = 'P0001';
    end if;
    -- on_app_user_created enlaza las invitaciones pendientes por email.
    insert into app_users (email, password_hash)
    values (invitation.invited_email, p_password_hash) returning id into activated_user_id;
  end if;

  -- Necesario también para usuarios que ya tenían cuenta. Nunca cambia su contraseña.
  update tenant_members set user_id = activated_user_id, status = 'activo'
  where id = invitation.member_id and tenant_id = invitation.tenant_id;
  delete from app_invites where token_hash = p_token_hash;
  return activated_user_id;
end;
$$;

commit;
