create extension if not exists pgcrypto;
create schema if not exists private;

create table if not exists public.tenants (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  plan text not null default 'enterprise',
  status text not null default 'active',
  created_at timestamptz not null default now()
);

create table if not exists public.tenant_memberships (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null,
  created_at timestamptz not null default now(),
  unique (tenant_id, user_id)
);

create table if not exists public.organizations (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  legal_name text not null,
  trade_name text not null,
  cnpj text not null,
  city text not null,
  state char(2) not null,
  created_at timestamptz not null default now(),
  unique (tenant_id, cnpj)
);

create table if not exists public.customers (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  name text not null,
  document text not null,
  email text,
  phone text,
  status text not null default 'active',
  created_at timestamptz not null default now(),
  unique (tenant_id, document)
);

create table if not exists public.suppliers (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  name text not null,
  document text not null,
  email text,
  lead_time_days integer not null default 7,
  status text not null default 'active',
  created_at timestamptz not null default now(),
  unique (tenant_id, document)
);

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  sku text not null,
  name text not null,
  category text not null,
  price_cents integer not null default 0,
  cost_cents integer not null default 0,
  status text not null default 'active',
  created_at timestamptz not null default now(),
  unique (tenant_id, sku)
);

create table if not exists public.warehouses (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  organization_id uuid not null references public.organizations(id) on delete cascade,
  code text not null,
  name text not null,
  created_at timestamptz not null default now(),
  unique (tenant_id, code)
);

create table if not exists public.inventory_balances (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  warehouse_id uuid not null references public.warehouses(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  quantity integer not null default 0,
  reserved integer not null default 0,
  reorder_point integer not null default 0,
  unique (tenant_id, warehouse_id, product_id)
);

create table if not exists public.sales_orders (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  number text not null,
  customer_name text not null,
  total_cents integer not null,
  status text not null default 'open',
  created_at timestamptz not null default now(),
  unique (tenant_id, number)
);

create table if not exists public.purchase_orders (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  number text not null,
  supplier_name text not null,
  total_cents integer not null,
  status text not null default 'open',
  expected_at timestamptz,
  created_at timestamptz not null default now(),
  unique (tenant_id, number)
);

create table if not exists public.production_orders (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  number text not null,
  product_name text not null,
  planned_qty integer not null,
  produced_qty integer not null default 0,
  status text not null default 'planned',
  due_at timestamptz,
  created_at timestamptz not null default now(),
  unique (tenant_id, number)
);

create table if not exists public.receivables (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  description text not null,
  amount_cents integer not null,
  due_at timestamptz not null,
  status text not null default 'open',
  created_at timestamptz not null default now()
);

create table if not exists public.payables (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  description text not null,
  amount_cents integer not null,
  due_at timestamptz not null,
  status text not null default 'open',
  created_at timestamptz not null default now()
);

create table if not exists public.employees (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  organization_id uuid not null references public.organizations(id) on delete cascade,
  registration text not null,
  name text not null,
  department text not null,
  position text not null,
  status text not null default 'active',
  hired_at date not null,
  created_at timestamptz not null default now(),
  unique (tenant_id, registration)
);

create table if not exists public.shipments (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  code text not null,
  carrier text not null,
  destination text not null,
  status text not null default 'preparing',
  freight_cents integer not null default 0,
  eta timestamptz,
  created_at timestamptz not null default now(),
  unique (tenant_id, code)
);

create table if not exists public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete restrict,
  actor_id uuid not null references auth.users(id),
  action text not null,
  entity text not null,
  entity_id uuid not null,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create or replace function private.is_tenant_member(requested_tenant uuid)
returns boolean
language sql
security definer
set search_path = ''
stable
as $$
  select exists (
    select 1
    from public.tenant_memberships tm
    where tm.tenant_id = requested_tenant
      and tm.user_id = (select auth.uid())
  );
$$;

create or replace function private.has_tenant_role(requested_tenant uuid, allowed_roles text[])
returns boolean
language sql
security definer
set search_path = ''
stable
as $$
  select exists (
    select 1
    from public.tenant_memberships tm
    where tm.tenant_id = requested_tenant
      and tm.user_id = (select auth.uid())
      and tm.role = any(allowed_roles)
  );
$$;

create or replace function public.create_tenant_for_current_user(tenant_name text, tenant_slug text)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_user_id uuid := auth.uid();
  new_tenant_id uuid;
begin
  if current_user_id is null then
    raise exception 'authentication required';
  end if;

  if length(trim(tenant_name)) < 2 or length(trim(tenant_slug)) < 2 then
    raise exception 'invalid tenant data';
  end if;

  insert into public.tenants(name, slug)
  values (trim(tenant_name), lower(trim(tenant_slug)))
  returning id into new_tenant_id;

  insert into public.tenant_memberships(tenant_id, user_id, role)
  values (new_tenant_id, current_user_id, 'owner');

  return new_tenant_id;
end;
$$;

revoke all on schema private from public, anon;
grant usage on schema private to authenticated;
revoke all on function private.is_tenant_member(uuid) from public, anon;
revoke all on function private.has_tenant_role(uuid, text[]) from public, anon;
grant execute on function private.is_tenant_member(uuid) to authenticated;
grant execute on function private.has_tenant_role(uuid, text[]) to authenticated;
revoke all on function public.create_tenant_for_current_user(text, text) from public, anon;
grant execute on function public.create_tenant_for_current_user(text, text) to authenticated;

alter table public.tenants enable row level security;
alter table public.tenant_memberships enable row level security;
alter table public.organizations enable row level security;
alter table public.customers enable row level security;
alter table public.suppliers enable row level security;
alter table public.products enable row level security;
alter table public.warehouses enable row level security;
alter table public.inventory_balances enable row level security;
alter table public.sales_orders enable row level security;
alter table public.purchase_orders enable row level security;
alter table public.production_orders enable row level security;
alter table public.receivables enable row level security;
alter table public.payables enable row level security;
alter table public.employees enable row level security;
alter table public.shipments enable row level security;
alter table public.audit_logs enable row level security;

revoke all on all tables in schema public from anon;

grant select on public.tenants to authenticated;
grant select, insert, update, delete on public.tenant_memberships to authenticated;
grant select, insert, update on public.organizations to authenticated;
grant select, insert, update on public.customers to authenticated;
grant select, insert, update on public.suppliers to authenticated;
grant select, insert, update on public.products to authenticated;
grant select, insert, update on public.warehouses to authenticated;
grant select, insert, update on public.inventory_balances to authenticated;
grant select, insert, update on public.sales_orders to authenticated;
grant select, insert, update on public.purchase_orders to authenticated;
grant select, insert, update on public.production_orders to authenticated;
grant select, insert, update on public.receivables to authenticated;
grant select, insert, update on public.payables to authenticated;
grant select, insert, update on public.employees to authenticated;
grant select, insert, update on public.shipments to authenticated;
grant select, insert on public.audit_logs to authenticated;

create policy tenants_select
on public.tenants for select to authenticated
using (private.is_tenant_member(id));

create policy memberships_select
on public.tenant_memberships for select to authenticated
using (private.is_tenant_member(tenant_id));

create policy memberships_insert_admin
on public.tenant_memberships for insert to authenticated
with check (private.has_tenant_role(tenant_id, array['owner','admin']::text[]));

create policy memberships_update_admin
on public.tenant_memberships for update to authenticated
using (private.has_tenant_role(tenant_id, array['owner','admin']::text[]))
with check (private.has_tenant_role(tenant_id, array['owner','admin']::text[]));

create policy memberships_delete_owner
on public.tenant_memberships for delete to authenticated
using (private.has_tenant_role(tenant_id, array['owner']::text[]));

create policy organizations_select on public.organizations for select to authenticated using (private.is_tenant_member(tenant_id));
create policy organizations_insert on public.organizations for insert to authenticated with check (private.is_tenant_member(tenant_id));
create policy organizations_update on public.organizations for update to authenticated using (private.is_tenant_member(tenant_id)) with check (private.is_tenant_member(tenant_id));

create policy customers_select on public.customers for select to authenticated using (private.is_tenant_member(tenant_id));
create policy customers_insert on public.customers for insert to authenticated with check (private.is_tenant_member(tenant_id));
create policy customers_update on public.customers for update to authenticated using (private.is_tenant_member(tenant_id)) with check (private.is_tenant_member(tenant_id));

create policy suppliers_select on public.suppliers for select to authenticated using (private.is_tenant_member(tenant_id));
create policy suppliers_insert on public.suppliers for insert to authenticated with check (private.is_tenant_member(tenant_id));
create policy suppliers_update on public.suppliers for update to authenticated using (private.is_tenant_member(tenant_id)) with check (private.is_tenant_member(tenant_id));

create policy products_select on public.products for select to authenticated using (private.is_tenant_member(tenant_id));
create policy products_insert on public.products for insert to authenticated with check (private.is_tenant_member(tenant_id));
create policy products_update on public.products for update to authenticated using (private.is_tenant_member(tenant_id)) with check (private.is_tenant_member(tenant_id));

create policy warehouses_select on public.warehouses for select to authenticated using (private.is_tenant_member(tenant_id));
create policy warehouses_insert on public.warehouses for insert to authenticated with check (private.is_tenant_member(tenant_id));
create policy warehouses_update on public.warehouses for update to authenticated using (private.is_tenant_member(tenant_id)) with check (private.is_tenant_member(tenant_id));

create policy inventory_balances_select on public.inventory_balances for select to authenticated using (private.is_tenant_member(tenant_id));
create policy inventory_balances_insert on public.inventory_balances for insert to authenticated with check (private.is_tenant_member(tenant_id));
create policy inventory_balances_update on public.inventory_balances for update to authenticated using (private.is_tenant_member(tenant_id)) with check (private.is_tenant_member(tenant_id));

create policy sales_orders_select on public.sales_orders for select to authenticated using (private.is_tenant_member(tenant_id));
create policy sales_orders_insert on public.sales_orders for insert to authenticated with check (private.is_tenant_member(tenant_id));
create policy sales_orders_update on public.sales_orders for update to authenticated using (private.is_tenant_member(tenant_id)) with check (private.is_tenant_member(tenant_id));

create policy purchase_orders_select on public.purchase_orders for select to authenticated using (private.is_tenant_member(tenant_id));
create policy purchase_orders_insert on public.purchase_orders for insert to authenticated with check (private.is_tenant_member(tenant_id));
create policy purchase_orders_update on public.purchase_orders for update to authenticated using (private.is_tenant_member(tenant_id)) with check (private.is_tenant_member(tenant_id));

create policy production_orders_select on public.production_orders for select to authenticated using (private.is_tenant_member(tenant_id));
create policy production_orders_insert on public.production_orders for insert to authenticated with check (private.is_tenant_member(tenant_id));
create policy production_orders_update on public.production_orders for update to authenticated using (private.is_tenant_member(tenant_id)) with check (private.is_tenant_member(tenant_id));

create policy receivables_select on public.receivables for select to authenticated using (private.is_tenant_member(tenant_id));
create policy receivables_insert on public.receivables for insert to authenticated with check (private.is_tenant_member(tenant_id));
create policy receivables_update on public.receivables for update to authenticated using (private.is_tenant_member(tenant_id)) with check (private.is_tenant_member(tenant_id));

create policy payables_select on public.payables for select to authenticated using (private.is_tenant_member(tenant_id));
create policy payables_insert on public.payables for insert to authenticated with check (private.is_tenant_member(tenant_id));
create policy payables_update on public.payables for update to authenticated using (private.is_tenant_member(tenant_id)) with check (private.is_tenant_member(tenant_id));

create policy employees_select on public.employees for select to authenticated using (private.is_tenant_member(tenant_id));
create policy employees_insert on public.employees for insert to authenticated with check (private.is_tenant_member(tenant_id));
create policy employees_update on public.employees for update to authenticated using (private.is_tenant_member(tenant_id)) with check (private.is_tenant_member(tenant_id));

create policy shipments_select on public.shipments for select to authenticated using (private.is_tenant_member(tenant_id));
create policy shipments_insert on public.shipments for insert to authenticated with check (private.is_tenant_member(tenant_id));
create policy shipments_update on public.shipments for update to authenticated using (private.is_tenant_member(tenant_id)) with check (private.is_tenant_member(tenant_id));

create policy audit_logs_select on public.audit_logs for select to authenticated using (private.is_tenant_member(tenant_id));
create policy audit_logs_insert on public.audit_logs for insert to authenticated with check (private.is_tenant_member(tenant_id) and actor_id = (select auth.uid()));

create index if not exists tenant_memberships_tenant_idx on public.tenant_memberships(tenant_id);
create index if not exists tenant_memberships_user_idx on public.tenant_memberships(user_id);
create index if not exists organizations_tenant_idx on public.organizations(tenant_id);
create index if not exists customers_tenant_status_idx on public.customers(tenant_id, status);
create index if not exists suppliers_tenant_status_idx on public.suppliers(tenant_id, status);
create index if not exists products_tenant_status_idx on public.products(tenant_id, status);
create index if not exists warehouses_tenant_idx on public.warehouses(tenant_id);
create index if not exists inventory_balances_tenant_product_idx on public.inventory_balances(tenant_id, product_id);
create index if not exists sales_orders_tenant_status_idx on public.sales_orders(tenant_id, status);
create index if not exists purchase_orders_tenant_status_idx on public.purchase_orders(tenant_id, status);
create index if not exists production_orders_tenant_status_idx on public.production_orders(tenant_id, status);
create index if not exists receivables_tenant_due_idx on public.receivables(tenant_id, status, due_at);
create index if not exists payables_tenant_due_idx on public.payables(tenant_id, status, due_at);
create index if not exists employees_tenant_status_idx on public.employees(tenant_id, status);
create index if not exists shipments_tenant_status_idx on public.shipments(tenant_id, status);
create index if not exists audit_logs_tenant_created_idx on public.audit_logs(tenant_id, created_at desc);
