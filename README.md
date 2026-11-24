# BoraCampo — Sistema

Marketplace de arenas esportivas, reservas e gestão operacional.

## Arquitetura prevista

- Next.js (App Router), TypeScript e Tailwind CSS.
- Supabase: PostgreSQL, Auth, Storage e RLS para isolamento por arena.
- Deploy na Vercel, independente da landing page.
- Landing: https://github.com/mateusarcedev/bora-campo-landing

## Escopo inicial

Marketplace e busca de arenas; página pública e fluxo de reserva; painel da arena com agenda e dashboard. O protótipo inclui cenários de pagamento no local/Pix e conflito de reserva; são referências de UX, não integrações implementadas.

## Desenvolvimento

O repositório está na fase de inicialização. A aplicação, dependências, migrations e testes ainda serão implementados. O design exportado do Claude Design será mantido como referência, sem utilizar seu runtime em produção.

Nunca versionar credenciais ou chaves secretas. A prevenção de reservas sobrepostas deve ser garantida no banco, e não apenas na interface.
