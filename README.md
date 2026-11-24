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

## Autenticação (M03)

Supabase Auth SSR com cookies, chave publicável, verificação de identidade no servidor e RLS. Rotas: /entrar, /cadastro, /recuperar-senha, /redefinir-senha, /painel. O painel verifica o usuário em cada página e ação e consulta arenas pelo owner_id; o perfil é salvo com o ID verificado. Jogadores continuam sem login no marketplace.

Configuração necessária em Supabase Auth URL Configuration: Site URL https://bora-campo.vercel.app; Redirect URLs https://bora-campo.vercel.app/auth/callback e https://bora-campo.vercel.app/auth/callback?flow=recovery. Confirmação e recuperação via PKCE exigem abrir e-mail no mesmo navegador. Nenhuma chave privilegiada é necessária. SMTP e entrega real de mensagens precisam de validação antes do lançamento. Não autorize usuários por metadados editáveis.

M03: cadastro de perfil e listagem de arenas próprias. Cadastro de arenas e campos será M04. Testes E2E autenticados e lockfile pendentes.
