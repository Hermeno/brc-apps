# Redesenho das páginas públicas — acompanhamento

Referência: imagem "Empire" (1200 × 2096; o briefing mede 1172 × 2048, mesma proporção).
Paleta permitida: #185FC6 · #134A9A · #0E3468 · #18314E · #455B70 · #F8F8F4 · #EDF3F5 · #DDE5E9 · #FFFFFF.

Inventário feito a partir de `app/**/page.tsx`, `not-found.tsx`, `error.tsx`, navegação, rodapé e
`app/sitemap.ts`. O sitemap não lista /how-it-works, /service-areas, /contact nem
/services/recurring-cleaning; o inventário inclui essas rotas porque existem e têm links públicos.

Estado: **pendente** → **feito** → **conferido** (com a verificação real anotada).

## Sistema compartilhado (base de todas as rotas abaixo)

| Peça | Arquivo | Alteração | Estado |
| --- | --- | --- | --- |
| Layout público | components/site/public-page.tsx (novo) | link de pular, faixa superior, cabeçalho, `<main>`, contatos e rodapé; importa `app/site.css` | feito |
| Estilos públicos | app/site.css (reescrito) | tokens só da paleta; container 74% (867 px em 1172); tipos t-display/t-sub/t-col/t-item/t-label; botões retangulares; listas com triângulo e separador; colunas 3 e 4; faixa fotográfica; contatos; rodapé; tudo sob `.vsite` | feito |
| Faixa superior + cabeçalho | components/site/site-header.tsx (reescrito) | faixa azul-escura com dados reais (Connecticut, support@verliks.com); cabeçalho branco; item atual em retângulo azul; submenu Services por mouse, toque e teclado; menu móvel | feito |
| Contatos + rodapé | components/site/site-footer.tsx (reescrito) | faixa branca com 3 colunas reais (sem telefone, endereço ou redes que não existem); rodapé #0E3468 com marca, links e legais | feito |
| Abertura fotográfica | components/site/photo-hero.tsx (reescrito) | foto em cinza com camada azul-escura; mensagem à esquerda; `PageHero` para as páginas internas | feito |
| Busca por ZIP | components/site/zip-search.tsx | formulário GET para /request, `pattern="[0-9]{5}"`, texto numérico (mantém o zero inicial) | feito |
| Documentos legais | components/site/legal-document.tsx (novo) | um componente para /terms e /privacy: EN/PT, índice, seções, avisos em maiúsculas | feito |
| Campo de endereço | components/address-input.tsx | opção `tone="public"` usada só em /request; o painel do cliente continua com o padrão | feito |
| Removidos (sem uso) | components/site/a.tsx, icons.tsx, motion.tsx; components/site-header.tsx; components/public-chrome.tsx (+ .module.css); app/platform-home.module.css; app/informational.module.css; app/services/services.module.css; app/about/about.module.css | nenhum import restante (conferido com grep e com o build) | feito |

## Rotas públicas

| Rota | Arquivo / template | Alteração | Verificação | Estado |
| --- | --- | --- | --- | --- |
| / | app/page.tsx | hero com 3 níveis à esquerda + ZIP; faixa de apresentação; 3 serviços; 4 colunas; faixa "What Verliks checks"; contatos; rodapé | ver "Verificações" | conferido |
| /services | app/services/page.tsx | hero; categorias; 13 serviços em colunas abertas com foto e link, por grupo; faixa final | ver "Verificações" | conferido |
| /services/standard-cleaning | app/services/[slug]/page.tsx + lib/services.ts | template novo: hero, "On this page", visão geral, escopo e quando serve, como funciona, perguntas, relacionados, faixa final; JSON-LD e metadados mantidos | ver "Verificações" | conferido |
| /services/deep-cleaning | idem | idem | ver "Verificações" (capturas desktop e celular) | conferido |
| /services/recurring-cleaning | idem (serviço montado no template) | idem | ver "Verificações" | conferido |
| /services/tile-and-grout-cleaning | idem | idem | ver "Verificações" | conferido |
| /services/home-organizing | idem | idem | ver "Verificações" | conferido |
| /services/move-in-move-out-cleaning | idem | idem | ver "Verificações" | conferido |
| /services/post-construction-cleaning | idem | idem | ver "Verificações" | conferido |
| /services/garage-basement-attic-cleaning | idem | idem | ver "Verificações" | conferido |
| /services/deck-cleaning | idem | idem | ver "Verificações" | conferido |
| /services/pressure-washing | idem | idem | ver "Verificações" | conferido |
| /services/gutter-cleaning | idem | idem | ver "Verificações" | conferido |
| /services/flashing-cleaning | idem | idem | ver "Verificações" | conferido |
| /services/commercial-cleaning | idem | idem | ver "Verificações" | conferido |
| /how-it-works | app/how-it-works/page.tsx | hero; 5 etapas em linhas; o que verificamos / não fazemos; dinheiro; faixa final | ver "Verificações" | conferido |
| /service-areas | app/service-areas/page.tsx (não existem páginas locais) | hero; cobertura em 3 colunas; nota; perguntas; faixa final com busca por ZIP | ver "Verificações" | conferido |
| /for-cleaners | app/for-cleaners/page.tsx + for-cleaners.module.css | hero e fatos no sistema novo; corpo (etapas, exemplo, custos, planos, controles, faz/não faz, perguntas) com tipos, cores e ritmo novos; sem dourado | ver "Verificações" | conferido |
| /about | app/about/page.tsx | hero; por que existimos; princípios; confiança; cobertura; faixa final | ver "Verificações" | conferido |
| /contact | app/contact/page.tsx (não há formulário; só e-mail) | hero com e-mail; 3 caminhos; quando escrever; sem a faixa de contatos (seria repetida) | ver "Verificações" | conferido |
| /request | app/request/page.tsx (etapas 01–04; a 04 cria conta ou entra sem sair da página) | cabeçalho e rodapé públicos; só cores da paleta; cantos de 2 px; bordas de campo #455B70; lógica, validações e parâmetros sem alteração | ver "Verificações" | conferido |
| /terms | app/terms/page.tsx + messages/terms.ts | legal-document; texto jurídico intacto (EN e PT) | ver "Verificações" | conferido |
| /privacy | app/privacy/page.tsx + messages/privacy.ts | legal-document; texto jurídico intacto (EN e PT) | ver "Verificações" | conferido |
| 404 (qualquer URL inexistente) | app/not-found.tsx | **exceção registrada**: continua sem cabeçalho e rodapé públicos, porque a página foi feita para não depender de nada (já quebrou em produção quando dependia); recebeu só a paleta, os tipos e os botões novos | HTTP 404 em URL inexistente; cores conferidas | conferido |

## Fora do escopo (preservado)

| Rota / peça | Motivo |
| --- | --- |
| /auth/login, /auth/register, /auth/forgot-password, /auth/reset-password, /auth/verify-email, /auth/setup-admin | autenticação |
| /dashboard/** | áreas autenticadas (cliente, profissional, administrador) |
| /api/** | backend |
| /app | só redireciona (middleware) |
| app/error.tsx | erro global, compartilhado com as áreas autenticadas |
| app/layout.tsx, app/template.tsx, app/globals.css | envolvem todas as rotas, inclusive as excluídas |
| components/ui/toaster.tsx | avisos do Chakra em /request; compartilhado com os painéis |

## Verificações

Ambiente: `next dev` e depois `next build` + `next start`, locais, com `DATABASE_URL` apontando para
um endereço inexistente (nenhum banco remoto foi tocado; nenhum pedido foi criado). Navegador:
Chrome headless via DevTools Protocol. Feito em 2026-11-09.

| Verificação | Resultado |
| --- | --- |
| HTTP das 23 rotas públicas (dev e build de produção) | 23 × 200; URL inexistente → 404 |
| Homepage × referência na mesma largura (1172 px) | mesma ordem de faixas; faixa superior, cabeçalho e hero nos mesmos limites (0–44, 44–134, 134–504); página com 2243 px contra 2047 da referência, por usar texto legível (14–16 px contra 11–12 px) |
| Capturas desktop 1172 px (página inteira) | /, /services, /services/deep-cleaning, /how-it-works, /service-areas, /for-cleaners, /about, /contact, /request, /terms |
| Capturas das 13 páginas de serviço | primeira tela de todas, em 1172 px, conferidas lado a lado |
| Capturas celular 390 px | primeira tela de /, /services, /services/deep-cleaning, /how-it-works, /request, /terms; homepage inteira |
| Rolagem horizontal | nenhuma: 23 páginas em 390 px; /, /services, deep-cleaning, /how-it-works, /for-cleaners, /request em 768 e 1920 px |
| Console do navegador (movimento normal) | sem erros nas 23 páginas; só avisos de desenvolvimento do next/image sobre LCP, gerados pela rolagem automática do teste |
| Links | 38 URLs internas distintas (coletadas das 23 páginas) → 200; mailto:support@verliks.com; todas as âncoras internas existem (inclusive 46 do índice de /terms e 20 de /privacy) |
| Busca por ZIP (digitação e clique reais) | 06103 → /request?zip=06103 e o campo de endereço do pedido mostra 06103; 123, vazio, abcde e 6511 bloqueados pelo navegador; 7 dígitos digitados ficam em 5; formulário de /service-areas: 06511 → /request?zip=06511 |
| Menu | teclado (Tab, Enter, Espaço, Esc com retorno do foco, fecha quando o foco sai), mouse (abre e continua aberto ao descer até o painel), toque em 1180 px (um toque abre e mantém; o segundo fecha), celular 390 px (botão 44×44, 20 links, Esc fecha) |
| Contraste do texto branco sobre as fotos | pior pixel medido ≥ 4,78:1 nas aberturas de /, /services, deep-cleaning, /how-it-works, /service-areas, /for-cleaners, /about, /contact (1172 e/ou 390 px); faixa da homepage calculada em 5,2:1 |
| Paleta | varredura de todos os arquivos públicos: só os 9 valores, `white` e a sobreposição rgba do #0E3468; address-input recebeu a opção pública |
| Áreas excluídas | nenhum arquivo de app/auth, app/dashboard, layout, template, globals ou error alterado (data de modificação); /auth/login idêntico pixel a pixel carregado direto e após navegar a partir da nova homepage (PSNR infinito), com o CSS público carregado |
| Build e verificações | `npm run build` ok; `tsc --noEmit` ok; ESLint 0 erros (184 avisos, todos de código anterior; nenhum nas linhas novas) |

Não verificado: Safari, Firefox e aparelhos reais; leitor de tela; envio completo de um pedido
(criaria registros); formulário de contato (não existe).
