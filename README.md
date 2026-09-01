# Sistema Industrial OS

ERP SaaS corporativo multiempresa para varejo, e-commerce, distribuição e indústria, cobrindo Comercial/CRM, Vendas/PDV, Fiscal, Compras, Estoque/WMS, Produção/PCP/MRP, Qualidade, Manutenção, Financeiro/Controladoria, RH/eSocial, Expedição/Logística, Etiquetas e BI.

## Segurança do projeto

Este repositório é independente. Não reutilize banco, secrets, storage, filas, domínio ou infraestrutura de outros sistemas. Toda consulta operacional deve respeitar o `tenantId` da sessão e ações sensíveis devem gerar auditoria.

Projeto Supabase exclusivo:
- Project ref: `fwlnvyaljhehnqirtwzm`
- API URL: `https://fwlnvyaljhehnqirtwzm.supabase.co`

Nenhuma credencial, certificado digital, token fiscal ou CSC deve ser commitado.

## Arquitetura

- Next.js 15 + React 19
- PostgreSQL / Supabase
- Prisma ORM
- Supabase Auth
- sessão HTTP-only com usuário, tenant e função
- Row Level Security por `tenant_id`
- auditoria operacional
- Docker local
- GitHub Actions com PostgreSQL 17 e validação de todas as migrations

## Núcleo funcional já versionado

### Fundação
- tenants, memberships e organizações;
- clientes, fornecedores e produtos;
- pedidos de venda e compra;
- estoque básico, produção, financeiro, RH e expedição;
- autenticação, isolamento multiempresa e auditoria.

### ERP ampliado
A migration `supabase/migrations/20260901020000_full_erp_core.sql` adiciona:
- itens de pedidos de venda e compra;
- perfis fiscais e regras tributárias;
- documentos fiscais, itens e eventos;
- NF-e 55 e NFC-e 65 como modelos iniciais do motor fiscal;
- estrutura para NFS-e, CT-e e MDF-e;
- endereçamento WMS, lotes, séries e movimentações;
- centros de trabalho, BOM e roteiros;
- inspeções de qualidade e não conformidades;
- ativos e ordens de manutenção;
- modelos de etiquetas e filas de impressão;
- centros de custo, contas bancárias e movimentos de caixa;
- RLS para todas as novas entidades.

## Fiscal

Endpoints disponíveis:
- `GET /api/fiscal/documents`: lista documentos do tenant;
- `POST /api/fiscal/documents`: cria rascunho fiscal;
- `POST /api/fiscal/documents/:id/authorize`: envia para um adaptador fiscal configurado em ambiente seguro.

O ERP não simula autorização em produção. Para emissão real é necessário configurar um emissor/adapter homologado, certificados e credenciais oficiais. O retorno de autorização grava chave de acesso, protocolo e status; rejeições também ficam registradas.

O motor fiscal deve permanecer versionado para acompanhar NF-e/NFC-e, IBS/CBS, regras de validação e demais alterações oficiais de 2026 em diante.

## Etiquetas

`POST /api/labels/zpl` gera ZPL para:
- produto;
- expedição;
- palete/SSCC;
- endereço WMS;
- volume/packing.

A migration inclui templates e filas de impressão para evolução com impressoras térmicas e agentes locais.

## Supabase

As migrations devem ser aplicadas, em ordem, exclusivamente no projeto `fwlnvyaljhehnqirtwzm`:
1. `20260901010000_enterprise_foundation.sql`
2. `20260901020000_full_erp_core.sql`

## Primeiro acesso

1. Criar usuário no Supabase Auth.
2. Autenticar o usuário.
3. Executar a RPC `create_tenant_for_current_user(nome, slug)` para criar tenant e membership `owner`.
4. Cadastrar a empresa emissora e parâmetros fiscais.
5. Configurar o adaptador fiscal e seus secrets somente no ambiente de produção.

## Execução local

```bash
docker compose up --build
```

Ou:

```bash
cp .env.example .env
npm install
npx prisma generate
npx prisma db push
npm run dev
```

## Validação

O workflow `.github/workflows/ci.yml` executa todas as migrations em um PostgreSQL limpo, gera o Prisma Client, cria o schema de CI, roda TypeScript, lint e build Next.js a cada push na `main`.
