import { BarChart3, Barcode, Boxes, Building2, CircleDollarSign, ClipboardCheck, Factory, FileText, Gauge, PackageSearch, ReceiptText, Settings, ShoppingCart, Store, Truck, UserRound, UsersRound, Warehouse, Wrench } from "lucide-react";

export type ErpStage={slug:string;label:string;description:string};
export type ErpSector={slug:string;label:string;icon:typeof Gauge;stages:ErpStage[]};

export const ERP_SECTORS:ErpSector[]=[
 {slug:"comercial",label:"Comercial & CRM",icon:UsersRound,stages:[
  {slug:"leads",label:"Leads",description:"Entrada, origem, qualificação e distribuição de leads."},
  {slug:"oportunidades",label:"Oportunidades",description:"Pipeline, etapas, probabilidade, forecast e responsáveis."},
  {slug:"clientes",label:"Clientes 360º",description:"Cadastro, contatos, histórico, crédito e relacionamento."},
  {slug:"propostas",label:"Propostas",description:"Orçamentos, versões, aprovações, validade e conversão."},
  {slug:"pedidos",label:"Pedidos de venda",description:"Pedidos, itens, preços, descontos, aprovação e faturamento."},
  {slug:"metas-comissoes",label:"Metas & Comissões",description:"Metas por equipe, vendedor, canal e regras de comissão."},
 ]},
 {slug:"vendas-pdv",label:"Vendas & PDV",icon:Store,stages:[
  {slug:"orcamentos",label:"Orçamentos",description:"Criação, negociação e conversão de orçamentos."},
  {slug:"pdv",label:"Frente de caixa",description:"Operação de balcão, caixa, pagamentos e sangrias."},
  {slug:"precos",label:"Tabelas de preço",description:"Tabelas, campanhas, descontos e políticas comerciais."},
  {slug:"devolucoes",label:"Trocas & Devoluções",description:"Devoluções, estornos, motivo, crédito e retorno ao estoque."},
  {slug:"canais",label:"Canais de venda",description:"B2B, loja, e-commerce, marketplace e omnichannel."},
 ]},
 {slug:"fiscal",label:"Fiscal & Documentos",icon:ReceiptText,stages:[
  {slug:"nfe",label:"NF-e",description:"Emissão, autorização, DANFE, XML, eventos e cancelamento."},
  {slug:"nfce",label:"NFC-e",description:"Consumidor final, CSC, contingência e fechamento fiscal."},
  {slug:"nfse",label:"NFS-e",description:"Notas de serviço, retenções e integração municipal."},
  {slug:"cte",label:"CT-e",description:"Conhecimento de transporte, eventos e documentos vinculados."},
  {slug:"mdfe",label:"MDF-e",description:"Manifestos, veículos, motoristas, cargas e encerramento."},
  {slug:"tributacao",label:"Tributação",description:"NCM, CEST, CFOP, CST/CSOSN, IBS/CBS e regras por UF."},
  {slug:"monitor-sefaz",label:"Monitor SEFAZ",description:"Fila, rejeições, contingência, disponibilidade e reprocessamento."},
 ]},
 {slug:"compras",label:"Compras & Suprimentos",icon:ShoppingCart,stages:[
  {slug:"requisicoes",label:"Requisições",description:"Solicitações internas, prioridades e aprovação."},
  {slug:"cotacoes",label:"Cotações",description:"Rodadas de cotação e mapa comparativo de fornecedores."},
  {slug:"pedidos",label:"Pedidos de compra",description:"Pedidos, aprovações, prazos, condições e acompanhamento."},
  {slug:"fornecedores",label:"Fornecedores",description:"Cadastro, homologação, desempenho, contratos e documentos."},
  {slug:"contratos",label:"Contratos",description:"Contratos de fornecimento, vigência, reajustes e SLA."},
  {slug:"recebimento",label:"Recebimento",description:"Conferência de pedido, XML, divergências e entrada física."},
 ]},
 {slug:"estoque",label:"Estoque & WMS",icon:Warehouse,stages:[
  {slug:"saldos",label:"Saldos",description:"Saldo físico, disponível, reservado e em trânsito por depósito."},
  {slug:"movimentacoes",label:"Movimentações",description:"Entradas, saídas, transferências, ajustes e rastreabilidade."},
  {slug:"enderecos",label:"Endereçamento",description:"Depósitos, zonas, ruas, níveis, posições e capacidade."},
  {slug:"lotes-series",label:"Lotes & Séries",description:"Lotes, números de série, validade e rastreabilidade."},
  {slug:"inventario",label:"Inventário",description:"Inventário geral, rotativo, contagens e divergências."},
  {slug:"picking",label:"Picking",description:"Ondas de separação, rotas, prioridade e conferência."},
 ]},
 {slug:"producao",label:"Produção, PCP & MRP",icon:Factory,stages:[
  {slug:"plano-mestre",label:"Plano Mestre",description:"Planejamento mestre de produção por período e demanda."},
  {slug:"mrp",label:"MRP",description:"Necessidades líquidas, compras, transferências e fabricação."},
  {slug:"bom",label:"Estrutura de Produto (BOM)",description:"Componentes, versões, perdas e substitutos."},
  {slug:"roteiros",label:"Roteiros",description:"Operações, centros de trabalho, tempos e sequenciamento."},
  {slug:"ordens",label:"Ordens de Produção",description:"Criação, liberação, execução, consumo e encerramento."},
  {slug:"apontamentos",label:"Apontamentos",description:"Produção, refugo, parada, mão de obra e tempos reais."},
  {slug:"capacidade",label:"Capacidade & OEE",description:"Carga máquina, gargalos, disponibilidade e OEE."},
 ]},
 {slug:"qualidade",label:"Qualidade",icon:ClipboardCheck,stages:[
  {slug:"inspecoes",label:"Inspeções",description:"Recebimento, processo, produto acabado e planos de inspeção."},
  {slug:"nao-conformidades",label:"Não Conformidades",description:"Registro, classificação, contenção e tratativa."},
  {slug:"capa",label:"CAPA / Planos de Ação",description:"Ações corretivas, preventivas, responsáveis e prazos."},
  {slug:"rastreabilidade",label:"Rastreabilidade",description:"Produto, matéria-prima, lote, ordem e fornecedor."},
 ]},
 {slug:"manutencao",label:"Manutenção",icon:Wrench,stages:[
  {slug:"ativos",label:"Ativos",description:"Máquinas, equipamentos, criticidade e documentação."},
  {slug:"ordens",label:"Ordens de Serviço",description:"Corretiva, preventiva, preditiva e emergencial."},
  {slug:"preventiva",label:"Planos Preventivos",description:"Planos por tempo, horímetro, ciclos e calendário."},
  {slug:"medidores",label:"Medidores",description:"Horímetros, ciclos, leituras e gatilhos de manutenção."},
  {slug:"mro",label:"Peças MRO",description:"Peças, estoque técnico, consumo e custo de manutenção."},
 ]},
 {slug:"logistica",label:"Expedição & Logística",icon:Truck,stages:[
  {slug:"separacao",label:"Separação",description:"Ondas, picking, prioridade e status de separação."},
  {slug:"conferencia",label:"Conferência",description:"Conferência física, divergências e liberação."},
  {slug:"packing",label:"Packing / Volumes",description:"Embalagem, volumes, peso, cubagem e identificação."},
  {slug:"cargas",label:"Cargas",description:"Montagem de carga, rota, doca, veículo e motorista."},
  {slug:"transportadoras",label:"Transportadoras",description:"Tabela de frete, SLA, cobertura e desempenho."},
  {slug:"tracking",label:"Tracking",description:"Rastreamento, ETA, status e atualização de entrega."},
  {slug:"ocorrencias",label:"Ocorrências",description:"Avaria, atraso, devolução, reentrega e tratativa."},
 ]},
 {slug:"etiquetas",label:"Centro de Etiquetas",icon:Barcode,stages:[
  {slug:"modelos",label:"Modelos",description:"Layouts ZPL/PDF por operação e impressora."},
  {slug:"geracao",label:"Gerar Etiquetas",description:"Produto, endereço, volume, expedição e palete/SSCC."},
  {slug:"fila",label:"Fila de Impressão",description:"Fila, prioridade, reimpressão, falhas e histórico."},
  {slug:"impressoras",label:"Impressoras",description:"Cadastro, status, estação e configuração térmica."},
 ]},
 {slug:"financeiro",label:"Financeiro & Controladoria",icon:CircleDollarSign,stages:[
  {slug:"receber",label:"Contas a Receber",description:"Títulos, cobrança, baixa, juros e inadimplência."},
  {slug:"pagar",label:"Contas a Pagar",description:"Títulos, aprovação, programação e baixa de pagamentos."},
  {slug:"tesouraria",label:"Tesouraria",description:"Contas bancárias, caixa, transferências e aplicações."},
  {slug:"conciliacao",label:"Conciliação Bancária",description:"Extratos, regras automáticas e divergências."},
  {slug:"fluxo-caixa",label:"Fluxo de Caixa",description:"Realizado, previsto, cenários e posição diária."},
  {slug:"dre",label:"DRE Gerencial",description:"Receita, custos, despesas, margem e EBITDA."},
  {slug:"orcamento",label:"Orçamento",description:"Budget, forecast, realizado versus planejado."},
  {slug:"centros-custo",label:"Centros de Custo",description:"Estrutura gerencial, rateios e acompanhamento por área."},
 ]},
 {slug:"rh",label:"RH, DP & eSocial",icon:UserRound,stages:[
  {slug:"colaboradores",label:"Colaboradores",description:"Cadastro, contratos, cargos, documentos e histórico."},
  {slug:"ponto",label:"Ponto & Jornada",description:"Marcações, escalas, banco de horas e ajustes."},
  {slug:"ferias",label:"Férias",description:"Períodos aquisitivos, programação, aviso e pagamento."},
  {slug:"beneficios",label:"Benefícios",description:"Planos, elegibilidade, descontos e movimentações."},
  {slug:"folha",label:"Folha & DP",description:"Eventos, proventos, descontos, encargos e fechamento."},
  {slug:"sst",label:"SST",description:"Riscos, exames, EPIs, treinamentos e eventos ocupacionais."},
  {slug:"esocial",label:"eSocial",description:"Eventos, lotes, retornos, rejeições e monitoramento."},
 ]},
 {slug:"bi",label:"BI & Performance",icon:BarChart3,stages:[
  {slug:"executivo",label:"Cockpit Executivo",description:"Indicadores consolidados da empresa e unidades."},
  {slug:"vendas",label:"BI de Vendas",description:"Receita, margem, canal, produto, cliente e vendedor."},
  {slug:"operacoes",label:"BI Operacional",description:"Estoque, compras, produção, qualidade e logística."},
  {slug:"financeiro",label:"BI Financeiro",description:"Caixa, DRE, inadimplência, capital de giro e rentabilidade."},
  {slug:"pessoas",label:"BI de Pessoas",description:"Headcount, absenteísmo, turnover, jornada e custos."},
 ]},
 {slug:"administracao",label:"Administração",icon:Settings,stages:[
  {slug:"empresas",label:"Empresas & Filiais",description:"Tenant, empresas, filiais, estabelecimentos e parâmetros."},
  {slug:"usuarios",label:"Usuários",description:"Usuários, convites, status e vínculo com empresas."},
  {slug:"perfis",label:"Perfis & Permissões",description:"RBAC, escopos, segregação de função e acesso por etapa."},
  {slug:"auditoria",label:"Auditoria",description:"Logs, ações sensíveis, alterações e trilha de conformidade."},
  {slug:"integracoes",label:"Integrações",description:"APIs, webhooks, ERPs externos, marketplaces e serviços."},
  {slug:"parametros",label:"Parâmetros",description:"Configurações gerais, numerações, políticas e preferências."},
 ]},
];

export const findSector=(slug:string)=>ERP_SECTORS.find(s=>s.slug===slug);
export const findStage=(sector:string,stage:string)=>findSector(sector)?.stages.find(s=>s.slug===stage);
