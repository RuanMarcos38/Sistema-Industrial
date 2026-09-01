# Sistema Industrial OS

SaaS corporativo multiempresa para Comercial/CRM, Compras, Estoque/WMS, Produção/PCP, Financeiro, RH e Expedição/Logística.

## Segurança do projeto

Este repositório é independente. Não reutilize banco, secrets, storage, filas, domínio ou infraestrutura de outros sistemas. Toda consulta de domínio do backend usa o `tenantId` obtido da sessão e toda criação operacional gera auditoria.

## Estado da entrega

A base executável inclui autenticação, tenant, dashboard executivo e CRUD real para módulos essenciais. `prisma/seed.ts` contém somente dados de desenvolvimento claramente identificados. Integrações fiscais, pagamentos, marketplaces, bureaus, mensageria e demais conectores externos não são simulados como produção e exigem credenciais/homologação oficiais.

## Executar localmente

```bash
cp .env.example .env
npm install
npx prisma generate
npx prisma db push
npm run db:seed
npm run dev
```

Acesso de desenvolvimento: `admin@demo.com` / `Demo@1234`.

Antes de produção, remova o seed, altere `AUTH_SECRET` e conecte o projeto Supabase dedicado do Sistema Industrial.

## Validação

O workflow `.github/workflows/ci.yml` executa geração Prisma, banco de CI, typecheck, lint e build a cada push na `main`.

## Supabase

A migration `supabase/migrations/20260901010000_enterprise_foundation.sql` prepara o schema multi-tenant com RLS para o projeto Supabase exclusivo do sistema. Ela não deve ser aplicada em nenhum banco de outro projeto.
