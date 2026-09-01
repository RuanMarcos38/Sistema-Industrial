-- Fase 2: núcleo ERP ampliado. Deve ser aplicada após enterprise_foundation.

create table if not exists public.sales_order_items (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  sales_order_id uuid not null references public.sales_orders(id) on delete cascade,
  product_id uuid references public.products(id),
  sku text not null,
  description text not null,
  quantity numeric(18,4) not null check (quantity > 0),
  unit_price_cents bigint not null default 0,
  discount_cents bigint not null default 0,
  total_cents bigint not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.purchase_order_items (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  purchase_order_id uuid not null references public.purchase_orders(id) on delete cascade,
  product_id uuid references public.products(id),
  sku text not null,
  description text not null,
  quantity numeric(18,4) not null check (quantity > 0),
  unit_cost_cents bigint not null default 0,
  total_cents bigint not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.fiscal_profiles (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  organization_id uuid not null references public.organizations(id) on delete cascade,
  tax_regime text not null,
  state_registration text,
  municipal_registration text,
  nfe_series integer not null default 1,
  nfce_series integer not null default 1,
  environment text not null default 'homologation',
  certificate_secret_ref text,
  nfce_csc_secret_ref text,
  nfce_csc_id text,
  status text not null default 'active',
  created_at timestamptz not null default now(),
  unique(tenant_id, organization_id)
);

create table if not exists public.tax_rules (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  name text not null,
  operation_type text not null,
  origin_state char(2),
  destination_state char(2),
  customer_type text,
  ncm text,
  cest text,
  cfop text,
  cst_csosn text,
  ibs_cbs_classification text,
  tax_payload jsonb not null default '{}',
  priority integer not null default 100,
  valid_from date,
  valid_to date,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.fiscal_documents (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  organization_id uuid not null references public.organizations(id),
  sales_order_id uuid references public.sales_orders(id),
  model text not null check (model in ('55','65','NFS-e','CT-e','MDF-e')),
  series integer not null default 1,
  number bigint,
  access_key text,
  recipient_name text not null,
  recipient_document text,
  operation_nature text not null,
  total_cents bigint not null default 0,
  status text not null default 'draft',
  environment text not null default 'homologation',
  protocol text,
  rejection_code text,
  rejection_message text,
  xml_storage_path text,
  pdf_storage_path text,
  fiscal_payload jsonb not null default '{}',
  authorized_at timestamptz,
  cancelled_at timestamptz,
  created_at timestamptz not null default now(),
  unique(tenant_id, model, series, number)
);

create table if not exists public.fiscal_document_items (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  fiscal_document_id uuid not null references public.fiscal_documents(id) on delete cascade,
  product_id uuid references public.products(id),
  item_number integer not null,
  sku text not null,
  description text not null,
  ncm text,
  cest text,
  cfop text,
  cst_csosn text,
  ibs_cbs_classification text,
  quantity numeric(18,4) not null,
  unit_price_cents bigint not null default 0,
  total_cents bigint not null default 0,
  tax_payload jsonb not null default '{}',
  unique(fiscal_document_id, item_number)
);

create table if not exists public.fiscal_events (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  fiscal_document_id uuid not null references public.fiscal_documents(id) on delete cascade,
  event_type text not null,
  sequence integer not null default 1,
  status text not null default 'pending',
  protocol text,
  response_payload jsonb not null default '{}',
  created_at timestamptz not null default now()
);

create table if not exists public.warehouse_locations (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  warehouse_id uuid not null references public.warehouses(id) on delete cascade,
  code text not null,
  zone text,
  aisle text,
  rack text,
  level text,
  capacity numeric(18,4),
  status text not null default 'active',
  unique(tenant_id, warehouse_id, code)
);

create table if not exists public.inventory_lots (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  warehouse_id uuid not null references public.warehouses(id) on delete cascade,
  location_id uuid references public.warehouse_locations(id),
  lot_code text not null,
  serial_number text,
  manufacture_date date,
  expiry_date date,
  quantity numeric(18,4) not null default 0,
  reserved numeric(18,4) not null default 0,
  unique(tenant_id, product_id, warehouse_id, lot_code, serial_number)
);

create table if not exists public.inventory_movements (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  product_id uuid not null references public.products(id),
  warehouse_id uuid not null references public.warehouses(id),
  location_id uuid references public.warehouse_locations(id),
  lot_id uuid references public.inventory_lots(id),
  movement_type text not null,
  quantity numeric(18,4) not null,
  source_type text,
  source_id uuid,
  unit_cost_cents bigint,
  occurred_at timestamptz not null default now(),
  actor_id uuid references auth.users(id),
  metadata jsonb not null default '{}'
);

create table if not exists public.work_centers (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  organization_id uuid not null references public.organizations(id),
  code text not null,
  name text not null,
  capacity_minutes_day integer not null default 480,
  cost_cents_hour bigint not null default 0,
  status text not null default 'active',
  unique(tenant_id, code)
);

create table if not exists public.boms (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  version text not null,
  yield_quantity numeric(18,4) not null default 1,
  status text not null default 'active',
  created_at timestamptz not null default now(),
  unique(tenant_id, product_id, version)
);

create table if not exists public.bom_items (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  bom_id uuid not null references public.boms(id) on delete cascade,
  component_product_id uuid not null references public.products(id),
  quantity numeric(18,6) not null check (quantity > 0),
  scrap_percent numeric(8,4) not null default 0,
  sequence integer not null default 10
);

create table if not exists public.routing_operations (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  work_center_id uuid not null references public.work_centers(id),
  operation_code text not null,
  operation_name text not null,
  sequence integer not null,
  setup_minutes numeric(10,2) not null default 0,
  run_minutes_unit numeric(10,4) not null default 0,
  unique(tenant_id, product_id, sequence)
);

create table if not exists public.quality_inspections (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  inspection_type text not null,
  source_type text,
  source_id uuid,
  product_id uuid references public.products(id),
  lot_id uuid references public.inventory_lots(id),
  status text not null default 'pending',
  result text,
  measurements jsonb not null default '{}',
  inspected_by uuid references auth.users(id),
  inspected_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.non_conformities (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  code text not null,
  severity text not null default 'medium',
  title text not null,
  description text not null,
  source_type text,
  source_id uuid,
  status text not null default 'open',
  root_cause text,
  corrective_action text,
  owner_user_id uuid references auth.users(id),
  due_at timestamptz,
  closed_at timestamptz,
  created_at timestamptz not null default now(),
  unique(tenant_id, code)
);

create table if not exists public.assets (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  organization_id uuid not null references public.organizations(id),
  code text not null,
  name text not null,
  category text,
  manufacturer text,
  serial_number text,
  location text,
  meter_value numeric(18,2) not null default 0,
  status text not null default 'active',
  unique(tenant_id, code)
);

create table if not exists public.maintenance_orders (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  asset_id uuid not null references public.assets(id) on delete cascade,
  code text not null,
  maintenance_type text not null,
  priority text not null default 'normal',
  description text not null,
  status text not null default 'open',
  scheduled_at timestamptz,
  started_at timestamptz,
  completed_at timestamptz,
  labor_minutes integer not null default 0,
  total_cost_cents bigint not null default 0,
  unique(tenant_id, code)
);

create table if not exists public.label_templates (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  name text not null,
  label_type text not null,
  printer_language text not null default 'ZPL',
  width_mm numeric(8,2) not null,
  height_mm numeric(8,2) not null,
  template_body text not null,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  unique(tenant_id, name)
);

create table if not exists public.print_jobs (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  label_template_id uuid not null references public.label_templates(id),
  reference_type text,
  reference_id uuid,
  quantity integer not null default 1 check (quantity between 1 and 10000),
  printer_name text,
  status text not null default 'queued',
  payload jsonb not null default '{}',
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  printed_at timestamptz
);

create table if not exists public.cost_centers (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  code text not null,
  name text not null,
  parent_id uuid references public.cost_centers(id),
  status text not null default 'active',
  unique(tenant_id, code)
);

create table if not exists public.bank_accounts (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  organization_id uuid not null references public.organizations(id),
  bank_code text not null,
  branch text,
  account_number text not null,
  account_type text,
  current_balance_cents bigint not null default 0,
  status text not null default 'active'
);

create table if not exists public.cash_transactions (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  bank_account_id uuid references public.bank_accounts(id),
  cost_center_id uuid references public.cost_centers(id),
  transaction_type text not null,
  description text not null,
  amount_cents bigint not null,
  occurred_at timestamptz not null,
  source_type text,
  source_id uuid,
  reconciled boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists fiscal_documents_tenant_status_idx on public.fiscal_documents(tenant_id,status,created_at desc);
create index if not exists fiscal_documents_access_key_idx on public.fiscal_documents(access_key);
create index if not exists inventory_movements_tenant_product_idx on public.inventory_movements(tenant_id,product_id,occurred_at desc);
create index if not exists inventory_lots_tenant_product_idx on public.inventory_lots(tenant_id,product_id,warehouse_id);
create index if not exists maintenance_orders_tenant_status_idx on public.maintenance_orders(tenant_id,status,scheduled_at);
create index if not exists quality_inspections_tenant_status_idx on public.quality_inspections(tenant_id,status,created_at desc);
create index if not exists print_jobs_tenant_status_idx on public.print_jobs(tenant_id,status,created_at desc);
create index if not exists cash_transactions_tenant_date_idx on public.cash_transactions(tenant_id,occurred_at desc);

-- RLS obrigatório para todas as entidades de negócio.
do $$
declare t text;
begin
  foreach t in array array[
    'sales_order_items','purchase_order_items','fiscal_profiles','tax_rules','fiscal_documents','fiscal_document_items','fiscal_events',
    'warehouse_locations','inventory_lots','inventory_movements','work_centers','boms','bom_items','routing_operations',
    'quality_inspections','non_conformities','assets','maintenance_orders','label_templates','print_jobs','cost_centers','bank_accounts','cash_transactions'
  ] loop
    execute format('alter table public.%I enable row level security', t);
    execute format('create policy %I on public.%I for select to authenticated using (private.is_tenant_member(tenant_id))', t || '_select', t);
    execute format('create policy %I on public.%I for insert to authenticated with check (private.is_tenant_member(tenant_id))', t || '_insert', t);
    execute format('create policy %I on public.%I for update to authenticated using (private.is_tenant_member(tenant_id)) with check (private.is_tenant_member(tenant_id))', t || '_update', t);
    execute format('create policy %I on public.%I for delete to authenticated using (private.is_tenant_member(tenant_id))', t || '_delete', t);
  end loop;
end $$;
