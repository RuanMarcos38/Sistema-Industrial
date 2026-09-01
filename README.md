# Sistema Industrial OS

SaaS corporativo multiempresa para Comercial/CRM, Compras, Estoque/WMS, Produção/PCP, Financeiro, RH e Expedição/Logística.

## Segurança do projeto

Este repositório é independente. Não reutilize banco, secrets, storage, filas, domínio ou infraestrutura de outros sistemas. Toda consulta operacional no backend usa o `tenantId` obtido da sessão e toda criação operacional gera auditoria.

O projeto Supabase destinado exclusivamente a este sistema é:

- Project ref: `fwlnvyaljhehnqirtwzm`
- API URL: `https://fwlnvyaljhehnqirtwzm.supabase.co`

Nenhuma credencial secreta deve ser commitada.

## Arquitetura atual

- Next.js 15 + React 19
- PostgreSQL / Supabase
- Prisma ORM com mapeamento explícito para tabelas `snake_case`
- Supabase Auth para login
- Sessão HTTP-only da aplicação contendo usuário, tenant e função
- Row Level Security no Supabase por `tenant_id`
- Auditoria por ação operacional
- Docker para ambiente local
- GitHub Actions com PostgreSQL real no CI

## Estado da entrega

A base executável inclui autenticação, tenant, dashboard executivo e CRUD real para módulos essenciais. `prisma/seed.ts` contém somente dados de desenvolvimento e fica bloqueado por padrão. Integrações fiscais, pagamentos, marketplaces, bureaus, mensageria e demais conectores externos não são simulados como produção e exigem credenciais/homologação oficiais.

## Executar localmente com Docker

```bash
docker compose up --build
```

Ou manualmente:

```bash
cp .env.example .env
npm install
npx prisma generate
npx prisma db push
npm run dev
```

Para usar dados de demonstração em desenvolvimento:

```bash
ALLOW_DEMO_SEED=true npm run db:seed
```

O seed não cria usuários de autenticação. Usuários devem existir no Supabase Auth e possuir vínculo em `tenant_memberships`.

## Supabase

A migration `supabase/migrations/20260901010000_enterprise_foundation.sql` cria:

- tenants e memberships;
- organizações;
- clientes e fornecedores;
- produtos, depósitos e saldos de estoque;
- pedidos de venda e compra;
- ordens de produção;
- contas a receber e pagar;
- colaboradores;
- expedições;
- auditoria;
- índices por tenant;
- RLS;
- funções seguras de verificação de tenant e papel;
- RPC `create_tenant_for_current_user` para bootstrap da primeira empresa.

A migration deve ser aplicada exclusivamente no projeto `fwlnvyaljhehnqirtwzm`.

## Variáveis de produção

Configure no ambiente de deploy, sem commit:

- `DATABASE_URL`: conexão pelo pooler do Supabase;
- `DIRECT_URL`: conexão direta para migrations;
- `SUPABASE_URL`;
- `SUPABASE_PUBLISHABLE_KEY`;
- `AUTH_SECRET` com pelo menos 32 caracteres aleatórios.

## Primeiro acesso

1. Criar o usuário em Supabase Auth ou por fluxo de cadastro autorizado.
2. Autenticar esse usuário.
3. Executar a RPC `create_tenant_for_current_user(nome, slug)` para criar tenant + membership `owner`.
4. A partir daí, o login da aplicação encontra o tenant automaticamente e cria a sessão corporativa.

## Validação

O workflow `.github/workflows/ci.yml` executa geração Prisma, criação do schema em PostgreSQL, typecheck, lint e build a cada push na `main`.
