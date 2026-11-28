# Roadmap de lançamento V2

## M01 — Gestão real de serviços
- M01.1 catálogo privado por arena: persistência, CRUD criação/edição/ativação, RLS, validação servidor, UI responsiva. Sem publicação pública nesta etapa.
- M01.2 professores, turmas, ocorrências e agenda única; conflito de espaço no banco e professor, recorrência limitada e transacional.
- M01.3 alunos, responsáveis, matrícula, capacidade, presença, mensalidades por competência; preço histórico e status; proteção LGPD.
- M01.4 convênios manualmente, elegibilidade configurada por serviço, sem simular integração externa real.

## M02 — Página pública e reservas
Publicação por serviço, horários reais, solicitação de matrícula/experimental, lista de espera, validação transacional de reservas, antispam, políticas de cancelamento.
## M03 — Planos e assinaturas
Free/Essencial 59,90/Pro 99,90/Premium 149,90 planejado; 30 dias de trial server-side, quotas e entitlements. Selecionar gateway em sandbox depois de verificar CNPJ e tarifas. Webhooks autenticados e idempotentes; nenhum gateway ativo nem cobrança real até homologação.
## M04 — Super Admin
RBAC não baseado em metadata editável, gestão clientes/assinaturas, auditoria, métricas e suporte.
## M05 — Onboarding e comunicação
E-mails, SMTP, recuperação, onboarding assistido e avisos.
## M06 — Segurança e QA
RLS, testes autenticados entre tenants, backups, monitoramento, LGPD, QA visual e acessibilidade. Validar planos de infraestrutura comerciais.
## M07 — Comercial
Domínio, termos, privacidade, faturamento fiscal, piloto, programa fundadores.
Design transversal: docs/UI-MOTION.md e Doop. Não anunciar como concluído o que estiver apenas na demo.
