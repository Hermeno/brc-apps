# Plano de Rollback — Verliks / BrazilianClean

Runbook para reverter um deploy problemático. Cobre a aplicação (DigitalOcean App
Platform) e o banco de dados (Neon Postgres). Ler o [Contexto](#contexto-da-infraestrutura)
uma vez; usar o [Checklist rápido](#checklist-rápido-execução) durante um incidente real.

## Contexto da infraestrutura

- **App**: DigitalOcean App Platform, região `nyc`, 1 instância (`apps-s-1vcpu-0.5gb`),
  imagem construída via [Dockerfile](Dockerfile). Deploy automático (`deploy_on_push: true`)
  a cada push na branch `main` do repo `Hermeno/brc-apps` ([.do/app.yaml](.do/app.yaml)).
- **Banco**: Postgres gerenciado pela Neon (`DATABASE_URL` via pooler, `DIRECT_URL` direto).
- **Health check**: DO faz probe em `/api/health`. **Atenção**: hoje essa rota retorna
  `{status:'ok'}` fixo ([app/api/health/route.ts](app/api/health/route.ts)) sem checar
  conexão com o banco — uma queda do Neon não é detectada pelo health check, então o DO
  não reinicia/rotaciona a instância automaticamente nesse cenário. Recomendação (não
  implementada): fazer o health check rodar um `SELECT 1` antes de responder `ok`.
- **Boot da aplicação**: a cada subida, [instrumentation.ts](instrumentation.ts#L41-L76)
  roda, após 12s, um conjunto de comandos SQL brutos idempotentes (`ALTER TABLE ...
  ADD COLUMN IF NOT EXISTS`, um `UPDATE` de migração de plano legado, e upserts de
  configuração). Isso é aditivo e seguro de rodar de novo — mas **qualquer migração
  futura que não seja aditiva precisa ser revisada antes do deploy**, porque reverter
  o app sozinho não desfaz mudanças de schema já aplicadas ao banco.
- **Cron interno**: a mesma `instrumentation.ts` roda um `setInterval` de 60s que
  espelha o cron `/api/cron/waves` (usado quando não há Vercel Cron disponível, caso do
  deploy em DO/Docker). O `vercel.json` na raiz configura esse mesmo cron para Vercel —
  hoje parece não ser o alvo de deploy real (o app roda em DO), então esse arquivo é
  provavelmente vestigial; confirme antes de assumir que o cron do Vercel está ativo.

## Rollback da aplicação (DO App Platform)

**Opção A — redeploy do deployment anterior (mais rápido, recomendado):**
1. DO Dashboard → App → aba **Activity** (ou **Deployments**).
2. Localize o deployment anterior ao problemático (status "Active" antes do último push).
3. Clique em **Rollback to this deployment** (ou, se a UI não tiver o botão, use "Redeploy"
   nesse deployment específico). Isso reaplica a imagem antiga sem precisar reverter o git.
4. Acompanhe o boot: logs devem mostrar a sequência de `instrumentation.ts` (12s de espera,
   depois os upserts de config).

**Opção B — via `doctl` (CLI), se instalado:**
```bash
doctl apps list-deployments <app-id>
doctl apps create-deployment <app-id> --wait   # redeploy do commit atual do branch
# Para voltar a um commit específico, faça o revert no git primeiro (Opção C) e deixe o
# deploy_on_push disparar, ou force um deployment apontando pro commit antigo via API.
```

**Opção C — reverter no git (quando o rollback precisa ficar permanente no histórico):**
```bash
git revert <sha-do-commit-problematico>   # cria um novo commit desfazendo as mudanças
git push origin main                      # deploy_on_push:true dispara o redeploy
```
Prefira Opção C quando o problema precisa ser corrigido "para sempre" (não só revertido
temporariamente) — `git revert` não reescreve histórico, então é seguro mesmo com o repo
sendo público.

## Rollback de dados (Neon point-in-time restore / branching)

A Neon mantém histórico contínuo do banco (retenção depende do plano — confirme em
**Neon Console → Project → Settings → Billing** antes de precisar). Duas formas de usar
isso num incidente:

**A. Restaurar um branch para um ponto no tempo (reverte dados no lugar):**
1. Neon Console → seu projeto → aba **Branches** → selecione o branch usado em produção.
2. **Restore** → escolha o timestamp (ou LSN) de antes do incidente → confirme.
   Isso é reversível dentro da janela de retenção (a Neon guarda um ponto de restauração
   antes de aplicar o restore, então dá pra "desfazer o restore" se precisar).

**B. Criar um branch novo a partir de um ponto no tempo (não mexe no branch principal —
mais seguro para validar antes de decidir):**
```bash
neonctl branches create --project-id <project-id> --parent <branch-principal> \
  --timestamp "2026-07-05T12:00:00Z" --name incident-check
neonctl connection-string incident-check   # pega a connection string do branch novo
```
Aponte um script local (ou `psql`) pra essa connection string e confirme que os dados
batem com o esperado antes do incidente. Depois:
- Se for só para investigar: `neonctl branches delete incident-check` ao terminar.
- Se for para promover a produção: troque a `DATABASE_URL`/`DIRECT_URL` do app (DO →
  Settings → App-Level Environment Variables) para apontar pro branch novo, ou use
  **Opção A** para restaurar o branch principal diretamente.

> Isso não foi executado nesta sessão — não há credencial da Neon (API key/`neonctl`)
> disponível no ambiente local. Os comandos acima estão prontos para rodar quando a
> credencial estiver disponível (rotação de credencial pendente, ver abaixo).

## ⚠️ Pendência que afeta este runbook

A senha atual do `DATABASE_URL`/`DIRECT_URL` (Neon) e o `NEXTAUTH_SECRET` estão expostos
publicamente — `.env.local` está commitado no repositório `Hermeno/brc-apps`, que é
**público** no GitHub. Rotação foi adiada por decisão do usuário durante esta sessão de
testes, mas **antes de um rollback real de dados, confirme se a credencial já foi
rotacionada** — se sim, qualquer comando `neonctl`/connection string acima precisa usar a
credencial nova, não a que está no `.env.local` atual.

## Checklist rápido (execução)

1. [ ] Identificar se o problema é de **app** (bug de código, crash) ou de **dados**
   (corrupção, migração ruim) ou os dois.
2. [ ] Se for de app: Opção A (redeploy do deployment anterior) primeiro — é reversível
   e não toca no banco.
3. [ ] Se for de dados: criar um branch de teste na Neon (item B acima) e validar antes
   de restaurar o branch principal.
4. [ ] Depois do rollback, checar `/api/health` manualmente com uma query real (o
   endpoint atual não valida o banco sozinho) e testar um fluxo real (login + 1 ação).
5. [ ] Documentar o incidente: o que quebrou, o que foi revertido, se alguma migração
   ficou pendente de reaplicar depois do fix.
