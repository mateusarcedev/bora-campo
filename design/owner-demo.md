# Demonstração pública do proprietário

Rota /demo, noindex, sem autenticação, Supabase, ações de servidor, cookies ou persistência. Dados integralmente fictícios em memória do navegador. Dashboard com indicadores calculados, agenda diária/semanal, reservas manuais, bloqueios, conflito de horários, confirmação/cancelamento de pagamento simulado, campos e informações da arena. Não simula pagamento real, reservas públicas, fotos, cobrança ou publicação. Recarregar ou restaurar descarta alterações. CTA para cadastro real. Teste unitário: node --experimental-strip-types tests/demo.test.mjs.
