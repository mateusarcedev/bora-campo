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

## Gestão de arenas (M04)

Proprietário: /painel/arenas. Cadastro e edição, campos ativos/inativos, faixas semanais em R$/hora, endereço e telefone comercial públicos, publicação e despublicação, galeria com bucket privado arena-photos. Fotos JPEG/PNG/WebP até 2 MiB (máximo 8 via UI); links assinados de 5 minutos. O acesso ao banco e Storage usa o JWT do usuário e RLS. Publicação exige contato válido e, na aplicação, campos ativos com preço. Faixas semanais representam funcionamento, não disponibilidade real. Reserva online e agenda ainda não habilitadas. Alteração de faixa: remover e cadastrar nova. Controle de planos, validação E2E, quotas no banco e publicação transacional serão refinados antes do MVP.

## M05 Agenda

/painel/agenda: dia, semana por campo, filtros, horários configurados, reservas manuais, bloqueios, cancelamento e pagamento. Manaus UTC-4; atualização periódica a cada 30 segundos sem interromper formulários. Reservas públicas e Realtime nativo pendentes. Ações verificam o proprietário e usam RLS; exclusão PostgreSQL protege conflitos. A referência visual é design/doop/ZscOBpX2nd.html e LKoQ9ia95S.html.
