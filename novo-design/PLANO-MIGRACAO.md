# Plano de Migração — Cartas FIFA TOTY/TOTW

> Análise comparativa entre o handoff de design e o estado atual do `App.jsx`. Mapeamento do que muda, o que mantém, conflitos com decisões anteriores, e ordem proposta de execução.

---

## 1 · TL;DR do que o handoff propõe

**Escopo limitado**: o handoff redesigna **APENAS os 2 tiers superiores**:
- **GOAT** (overall 91–99) → carta em formato **escudo FIFA TOTY** azul-marinho com borda dourada ornamentada + leque de cristais saindo pela lateral direita
- **Dream Lobby** (overall 80–90) → carta em formato **escudo FIFA TOTW** preta com borda dourada fina + framework geométrico central (diamante + quadrado + gema)

**Os outros 3 tiers ficam como estão**:
- Melhor Freezar (0–59) → carta retangular atual
- Bagre (60–69) → carta retangular atual
- Bom Player (70–79) → carta retangular atual *(renome de "Bom de jogo")*

A grande mudança é trocar o **formato retângulo arredondado** pelo **silhueta de escudo FIFA** (clip-path com entalhe no topo + ombros + ponta inferior) para as duas cartas premium.

---

## 2 · Mudanças estruturais por carta

### 2.1 GoatCard (novo)

| Item | Especificação |
|---|---|
| Dimensões | 290×432 (atual: 278×418) — **maior** |
| Silhueta | Escudo via `clip-path` (não é mais retângulo arredondado) |
| Borda | 4 camadas empilhadas: ouro brilhante → preto entalhado → ouro fino → conteúdo (azul-marinho) |
| Fundo | Gradient navy `#00041e → #0c1d68 → #040933` |
| Halos | Radial dourado no topo + radial dourado central |
| Confetti rain | 30 losangos dourados caindo (`lbcRain` 3.6s) |
| Sparkles | 32 pontos dourados pulsando (`lbcSpark2` 2.4s) |
| Corners | 4 brackets em L 24×24 nos cantos |
| Top chevron | 2 setas douradas para baixo no topo central |
| **Crystal fan** | 18 lâminas-cristal partindo de `(86%, 20%)`, ângulos 50°–270°, **transbordando para fora do escudo** |
| Foto | `top:9%, height:58%` — mais alta e maior |
| Header | Overall 50px `Saira Condensed`, dourado claro `#ffeeb0` |
| Footer | Nick 23px `Saira Condensed` branco + grid 1×6 stats |

### 2.2 TotwCard variant="v2" (novo, para Dream Lobby)

| Item | Especificação |
|---|---|
| Dimensões | 270×408 (atual: 268×408) — praticamente igual |
| Silhueta | Mesmo escudo FIFA via `clip-path` |
| Borda | 4 camadas: gradient dourado → preto → ouro fino → conteúdo (preto) |
| Fundo | Gradient quase-preto `#0a0a0e → #14141a → #0a0a0e` |
| Lighting | 2 radiais sutis (sem diagonais — explicitamente proibidas) |
| Shards | 4 polígonos dourados pequenos nos cantos (não atravessam diagonalmente) |
| **Gold Framework** | Centro: gema escura + diamante dourado (rotacionado 45°) deslocado à esquerda + quadrado dourado (rotacionado 15°) deslocado à direita |
| Sparkles | 18 pontos dourados **hand-picked** (não algoritmo modular — designer testou e o algoritmo cria diagonais) |
| Streaks | 18 triângulos coloridos com a cor do tier (`#ffd700`) hand-picked |
| Foto | `top:9%, height:58%` — atrás do framework dourado |
| Header | Overall 50px branco com sombra dourada |
| Footer | Mesmo padrão da Goat |

---

## 3 · Conflitos com decisões anteriores

### 3.1 ⚠️ Tag icons (playstyles) — não cobertas no handoff

O handoff **não mostra os tag icons** (Baiter/Tiltado/Mutadinho/Good Vibes/Esforçado/Desert Eagle) que adicionamos recentemente nas cartas. As cartas-escudo no handoff têm apenas: borda, fundo, efeitos, foto, overall, nick, stats.

**Decisão necessária:**
- (A) **Manter os tag icons na lateral esquerda** das cartas-escudo (precisa eu adaptar — vai dar pra fazer dentro do conteúdo do escudo)
- (B) **Abandonar tag icons nas cartas-escudo** (somente nas 3 retangulares)
- (C) **Mover tag icons para outro lugar** (ex: borda inferior, abaixo do nick)

### 3.2 ⚠️ Foto da live (espaço debaixo do overall)

Recentemente movemos a foto do jogador para `left:'56%'` pra abrir espaço debaixo do overall para um logo da live. **As cartas-escudo do handoff voltam com foto centralizada** (`left:'56%'` no protótipo mas centralizado no slot).

**Decisão**: manter o espaço aberto ou voltar a centralizar nas cartas premium?

### 3.3 ⚠️ Renomear tier "Bom de jogo" → "BOM PLAYER"

O handoff renomeia. Isso aparece em todas as cartinhas, no histórico, na ConfigTab, e nas sessões antigas já salvas no `localStorage`. Se mudar, o nome novo aparece também em sessões antigas.

**Decisão**: aceitar o rename?

### 3.4 ⚠️ Atributos diferentes

O handoff (`data.jsx`) usa:
- `kd` → nome **"Mira"** (atual: "K/D Ratio")
- `dan` → nome **"Dano"** (atual: "dmg / Dano Médio")
- `uti` → "Utility" (atual: "util / Utilitárias")
- `win` → "Vitórias" (atual: "wr / Win Rate")
- `clu` → "Clutch" (igual)
- `con` → "Consistência" (igual)
- Pesos: `22/18/16/18/14/12` (atual: `20/20/15/25/10/10`)

**Decisão**: aceitar os pesos novos? aceitar os IDs novos? Lembrando que IDs novos quebram sessões antigas (os scores ficam órfãos).

### 3.5 ⚠️ Fontes novas

Handoff usa:
- **Saira Condensed** (números — overall, stats, nick)
- **Chakra Petch** (labels — tier label, abreviação de stat)

Atual usa Orbitron + Rajdhani.

**Mudança**: precisa adicionar essas duas no `@import` do Google Fonts. Rajdhani continua para body. Orbitron pode sair, ou pode coexistir para as 3 cartas retangulares.

### 3.6 ⚠️ Formato escudo vs retângulo nos contextos de uso

As cartas-escudo têm formato muito diferente das retangulares. Quando aparecem juntas (home, histórico, sessão do domingo), o visual fica heterogêneo.

**Decisão**: aceitar a heterogeneidade (é o ponto — premium vs comum)?

### 3.7 ✅ Stats em 1×6

Handoff usa grid 1×6 horizontal — **coincide com nossa decisão atual** (depois do revert do 2×3). ✓

### 3.8 ✅ Escala 0–100

Handoff usa scores 0–100 — **coincide com nossa migração recente**. ✓

### 3.9 ✅ Tags com multiplier 0.9 / 1.1

Handoff usa exatamente os mesmos multiplicadores. ✓

### 3.10 ✅ Logo FL1IP

Handoff inclui logo no header das cartas-escudo (`width:42px, dropshadow dourado`). Atualmente removemos das cartas retangulares por preferência. **Decisão**: aceita re-adicionar nas cartas-escudo? Vai aparecer pequenininho no canto superior esquerdo abaixo do "GOAT" / "DREAM LOBBY".

---

## 4 · O que **fica igual** (não muda)

- Stack: React 18 + Vite + inline styles, sem TypeScript ✓
- `localStorage` persistence ✓
- Single-file `App.jsx` ✓
- Login screen ✓
- Header / tabs / navegação da app ✓
- Aba Jogadores (CRUD + remove.bg) ✓
- Aba Atributos (CRUD com pesos) ✓
- Aba Histórico ✓
- Aba Config ✓
- Sliders 0–100 ✓
- Sistema de behavioral tags ✓
- Cartas retangulares das 3 faixas inferiores ✓

---

## 5 · Ordem proposta de execução

Recomendo fazer em **5 commits separados** para conseguir reverter qualquer um se algo quebrar visualmente:

### Commit 1 — Setup (fontes + helpers + clip-path)
- Adicionar Chakra Petch + Saira Condensed no `@import`
- Adicionar constante `SHIELD` (clip-path polygon)
- Adicionar paletas `G` (gold) e `NAVY` no topo do arquivo
- Sem mudança visual ainda — só preparação

### Commit 2 — Primitives FX (componentes auxiliares)
Adicionar funções helper dentro do `App.jsx`:
- `ShieldFrameRich(S, bg, children)` — 4 camadas de borda dourada premium (GOAT)
- `ShieldFrameThin(S, bg, children)` — 4 camadas de borda dourada fina (Dream Lobby)
- `CrystalFan({cx,cy,count,a0,a1,...})` — leque de cristais
- `ConfettiRain({count,side,slow})` — losangos caindo
- `Sparkles({count,positions,color})` — pontos pulsando
- `Corners({col})` — 4 brackets em L
- `TopChevron()` — 2 setas no topo central
- `GoldFramework({sz})` — diamante + quadrado + gema do centro
- Animações novas em `GCSS`: `lbcRain`, `lbcSpark2`, `lbcBolt`
- Sem renderizar ainda — só código disponível

### Commit 3 — GoatCard
- Criar componente `GoatCard` que renderiza o escudo navy + ouro + leque de cristais
- Adicionar roteamento no `PlayerCard`: se `lvl === 4`, retornar `GoatCard`; caso contrário, render atual
- Adaptar para usar nossa estrutura de `player` e `card` (não é exatamente igual ao mock do handoff)
- Validar visualmente em todos os contextos: home, sunday preview, histórico

### Commit 4 — TotwCard (Dream Lobby)
- Criar componente `TotwCard` que renderiza o escudo preto + GoldFramework
- Adicionar roteamento: se `lvl === 3`, retornar `TotwCard`
- Mesma validação visual

### Commit 5 — Limpeza + decisões adicionais
- Decidir/aplicar conflitos da seção 3 (tag icons, rename, atributos, foto)
- Atualizar `DESIGN.md` com a nova realidade
- Atualizar `CLAUDE.md`

---

## 6 · Pendências que preciso que você decida ANTES

Antes de eu começar o Commit 1, me responda:

| # | Pergunta | Opções |
|---|---|---|
| 1 | **Tag icons nas cartas-escudo?** | (A) Manter na lateral esquerda · (B) Remover só nas premium · (C) Mover pra outro lugar |
| 2 | **Foto centralizada nas cartas-escudo?** | (A) Sim, voltar a centralizar (sem espaço pra logo da live) · (B) Não, manter `left:56%` |
| 3 | **Renomear "Bom de jogo" → "BOM PLAYER"?** | (A) Aceitar · (B) Manter "Bom de jogo" |
| 4 | **Atributos: aceitar os IDs e nomes do handoff?** | (A) Sim, migrar tudo (com risco de quebrar sessões antigas) · (B) Não, manter atual (`kd/dmg/util/wr/clutch/consist` com pesos 20/20/15/25/10/10) |
| 5 | **Logo FL1IP volta nas cartas-escudo?** | (A) Sim, no header pequeno · (B) Não, manter sem logo |
| 6 | **Faço tudo de uma vez ou commit por commit pra você revisar?** | (A) Tudo de uma vez · (B) Pausa entre commits |

---

## 7 · Riscos e ressalvas

- **Performance**: GOAT vai ter ~70 elementos animados simultâneos (32 sparkles + 30 confetti + 18 crystals). Pode pesar em mobile fraco. Vou monitorar.
- **`overflow: visible` no wrapper**: o crystal fan da GOAT precisa transbordar para fora. Isso conflita com nossa estrutura atual onde tudo é clipado. Vou precisar revisar o layout pai (parent do PlayerCard) para garantir que não corte.
- **Render em scale baixo (0.65 / 0.72)**: dimensões absolutas tipo `width:6*S` ficam < 4px e somem. As cartas-escudo são desenhadas mais para escala 1.0. Vou precisar testar bem nos contextos da home (0.72) e histórico (0.85).
- **Foto sem fundo (`photoClean`)**: o handoff assume slot retangular para foto, mas nossa foto pode ser PNG com transparência. Vai funcionar — apenas o filtro de glow precisa adaptar.

---

## 8 · Resumo executivo

| Aspecto | Atual | Proposto | Impacto |
|---|---|---|---|
| Formato GOAT | Retângulo arredondado | Escudo FIFA | **Alto visual** |
| Formato Dream Lobby | Retângulo arredondado | Escudo FIFA | **Alto visual** |
| Formato 3 outras | Retângulo arredondado | Retângulo arredondado | Nenhum |
| Fontes | Orbitron + Rajdhani | + Saira Condensed + Chakra Petch | Baixo (Google Fonts) |
| Stats layout | 1×6 horizontal | 1×6 horizontal | Nenhum |
| Tags | Sim, com ícones PNG | Não definido | **Decisão** |
| Logo nas cartas | Não | Sim (nas premium) | **Decisão** |
| Atributos / nomes | `K/D Ratio, Dano Médio...` | `Mira, Dano...` | **Decisão** |
| Rename "Bom" | "Bom de jogo" | "BOM PLAYER" | **Decisão** |

---

**Aguardando suas respostas na seção 6 para começar.**
