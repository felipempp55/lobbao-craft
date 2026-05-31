# Lobbão Craft — Design System & Visual Architecture

> Documento de referência do design atual. Para uso em conversas com agentes de design (ex: Claude Design) que precisem entender o estado visual da aplicação antes de propor mudanças.

---

## 1 · Contexto do produto

**Lobbão Craft** é uma webapp de ranking semanal de CS2 para um grupo fechado de amigos ("Lobbão"). Toda semana, no domingo após a "live" de jogos, o admin avalia cada jogador presente em 6 atributos via sliders. A app calcula um **overall ponderado de 0–99** e gera uma **cartinha estilo FIFA Ultimate Team** para cada um.

- **Stack**: React 18 + Vite 5, sem TypeScript, sem CSS externo. **Tudo é inline styles** num único `src/App.jsx`.
- **Persistência**: `localStorage` (sem backend).
- **Deploy**: Vercel (https://lobbao-craft.vercel.app).
- **Acesso**: protegido por login simples (flip / 9975).
- **Tom**: meme + clube de amigos. Não é produto sério. Linguagem em PT-BR informal.

---

## 2 · Direção estética

**Conceito macro**: FIFA Ultimate Team Team-of-the-Week (TOTW) misturado com aesthetic gamer/dark/neon.

| Elemento | Decisão |
|---|---|
| Tema | **Dark mode obrigatório** — base `#130e0e` (vermelho-preto quase-marrom) |
| Acento da marca | Vermelho `#cc1111` (cor do "FL1IP", o grupo) |
| Filosofia da carta | Cada tier tem identidade visual progressiva — tier mais alto = mais detalhes |
| Inspiração da carta | EA FC TOTW (referência específica: Sadio Mané TOTW) |
| Tipografia | Mistura de **display futurista** (Orbitron), **utility tech** (Rajdhani), **manuscrito de impacto** (Permanent Marker para o logo FL1IP) |
| Movimento | Sutil mas presente — pulsos, shines, sparkles cintilando. Nada saltita ou compete pela atenção |

**Anti-padrões que evitamos:**
- Tons pastel / corporate / SaaS genérico
- Cards retangulares lisos sem ornamentação
- Tipografia Inter/Roboto/system fonts
- Layouts tabulares "datagrid" para os jogadores

---

## 3 · Tokens de cor

### 3.1 Cores globais
```js
R  = '#cc1111'  // vermelho de marca FL1IP
RG = '#dd1100'  // vermelho hover/gradient
RD = 'rgba(200,17,17,0.15)'  // vermelho fundo sutil
```

Fundo da app: `#130e0e` (preto-avermelhado, quase-marrom escuro).

### 3.2 Paleta por tier (5 tiers)

Cada tier tem 5 valores derivados: `brd` (borda), `glow` (resplandor), `txt` (texto secundário), `score` (número grande), `pat` (textura).

| Tier | Faixa | Cor dominante | brd | glow | score | bg |
|---|---|---|---|---|---|---|
| **Melhor Freezar** | 0–59 | Vermelho-tijolo | `#882222` | `#cc2222` | `#ffaaaa` | gradient `#120000 → #3d0808 → #120000` |
| **Bagre** | 60–69 | Azul-cinza marítimo | `#5588aa` | `#6699bb` | `#c0dde8` | gradient `#060a10 → #162840 → #060a10` |
| **Bom de jogo** | 70–79 | Verde militar | `#33bb55` | `#44cc66` | `#ccffdd` | gradient `#021206 → #0d3016 → #021206` |
| **Dream Lobby** | 80–90 | Ouro intenso | `#ffd700` | `#ffaa00` | `#fff100` | gradient `#0e0800 → #5e3a00 → #0e0800` |
| **GOAT** | 91–99 | Azul-elétrico (especial) | `#00d4ff` | `#00eeff` | `#ffffff` | gradient `#000420 → #001575 → #000420` |

**Observação sobre GOAT**: trata-se de um tier "Destaque" que **sobrescreve** o azul nominal por uma camada dourada premium adicional (`dBrd:#c8a020`, `dGlow:#d4a030`, `dScore:#ffd700`). Resultado: fundo azul + ornamentos dourados + brilhos azuis cyan = clima de "carta TOTS/TOTW" da FIFA.

### 3.3 Cores semânticas (UI/forms)

| Uso | Cor |
|---|---|
| Texto primário | `#f0e8e8` |
| Texto secundário | `#c09090` (rosado-escuro) |
| Texto terciário/desabilitado | `#907070`, `#806060` |
| Sucesso | `#44dd88` |
| Erro | `#ff7755`, `#ff6655` |
| Aviso | `#ff8844` |
| Painel (vidro) | `rgba(255,255,255,0.07)` + `backdrop-filter:blur(14px)` |
| Borda sutil | `rgba(255,255,255,0.13)` com topo levemente rosado `rgba(255,120,120,0.18)` |
| Input fundo | `rgba(30,12,12,0.88)` ou `rgba(15,4,4,0.85)` |

---

## 4 · Tipografia

Importadas via Google Fonts (`@import` em `<style>` injetado no `<head>`):

```css
@import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@700;900&family=Rajdhani:wght@500;600;700&family=Permanent+Marker&display=swap');
```

| Stack | Onde aparece |
|---|---|
| **Orbitron** (700/900) — `FO` | Números (overall, stats), títulos display futuristas |
| **Rajdhani** (500/600/700) — `F` | Body, labels, botões, nicks |
| **Permanent Marker** — `FM` | Logo "FL1IP" (marcador manuscrito) |
| Fallbacks | `Segoe UI`, `Arial Black`, `Impact`, `cursive`, `sans-serif` |

### 4.1 Escala tipográfica da carta (por tier, com scale `S`)

| Elemento | Tamanho | Notas |
|---|---|---|
| Overall (número grande) | `[40, 44, 48, 52, 56] × S` px | Orbitron 900, `letter-spacing:-2*S` |
| Tier label (DREAM LOBBY etc) | `8 × S` px | Rajdhani 700, `letter-spacing:2.5*S`, uppercase |
| Nick do jogador (rodapé) | `21 × S` px | Rajdhani 900, uppercase, `letter-spacing:1.4*S` |
| Abreviação do stat (K/D, DAN...) | `9 × S` px | Rajdhani 700, opacity 0.85, `letter-spacing:0.4*S` |
| Valor do stat (0–99) | `19 × S` px | Orbitron 900 |

### 4.2 Escala da UI (fora da carta)

- Section labels: 10.5px, `letter-spacing:2.5`, uppercase
- Labels de form: 10.5px, `letter-spacing:1.8`, uppercase
- Inputs: 13–14px
- Botões: 11/12/13.5px (xs/sm/md)
- Stats da Home: 32px Orbitron 900

---

## 5 · Componente PlayerCard — o "produto"

A carta é o foco visual da app. **Toda a complexidade está aqui.**

### 5.1 Sistema de tiers progressivo

O nível `lvl` (0–4) é índice em arrays. Quanto maior `lvl`, mais detalhes a carta carrega. Cada layer só renderiza acima de um threshold:

| Camada visual | Lvl 0 (Freezar) | Lvl 1 (Bagre) | Lvl 2 (Bom) | Lvl 3 (Dream Lobby) | Lvl 4 (GOAT) |
|---|:-:|:-:|:-:|:-:|:-:|
| Borda externa | 1.5px 33% opc | 2px 53% opc | 2px sólido | 2.5px sólido | 3px sólido + dourado |
| Box-shadow externo | só inset | + glow externo fraco | + glow médio | + glow forte | + glow cyan + dourado (multi-layer) |
| Textura de fundo | nenhuma | linhas horizontais | grade 10×10 | losangos diagonais 45° | losangos finos + 45° dourados |
| Glow topo (radial) | — | sim 10% | sim 1A% | sim 24% | sim 30% |
| Shine sweep (animado) | — | — | sim, 5s | sim, 3.5s | sim, 2.8s |
| Losangos flutuantes BG | — | — | — | 6 dourados | 6 dourados |
| Linha de acento horizontal | — | — | — | sim | sim |
| Anel pulsante interno | — | — | — | dourado 1px | azul+dourado 2px (multi-anel) |
| Frame interno (rect 2°) | — | — | — | sim, com gems no meio das bordas | — (substituído por anéis) |
| Losango central de fundo | — | — | — | sim, sutil | — |
| Cantos curvos ornamentados | — | — | — | sim, 4 brackets `↗ ↘ ↖ ↙` curvos seguindo border-radius | losangos pequenos nos 4 cantos |
| Sparkles cintilando | — | — | — | 20 dourados distribuídos | 6 cyan (canto sup. dir.) + 6 cyan (lateral esq.) + raios + orbes |
| Losangos laterais (sticking out) | — | — | — | 2 nas laterais + 1 inferior | idem (maiores) |
| Aura externa (raios) | — | — | — | — | sim, 8 raios + orbe radial |

**Princípio de leitura**: você consegue contar o tier numa olhada só pela densidade visual.

### 5.2 Dimensões e layout

```js
CARD_W   = [248, 254, 260, 268, 278]  // largura por tier
CARD_H   = [382, 390, 400, 408, 418]  // altura por tier
PHOTO_H  = [200, 215, 232, 252, 280]  // altura da foto do jogador
PHOTO_BTM= [ 90,  92,  95,  97, 100]  // distância da foto ao fundo
```

A carta escala via prop `scale` (`S`). Valores típicos:
- `0.65` → grid do histórico
- `0.72` → grid da home
- `0.88` → preview ao vivo da SundayTab
- `1.05` → preview "revelação" da cartinha recém-gerada
- `1.00` → exportação (futura)

### 5.3 Empilhamento (z-index)

```
zIndex  1 → corpo do card (CAMADA 1, com overflow:hidden e border-radius:16*S)
zIndex  2 → aura GOAT (raios, orbes externos)
zIndex  3 → foto do jogador (wrapper que clipa nas laterais)
zIndex  4 → header (número overall + tier label)
zIndex  5 → sparkles externos (cintilando sobre tudo)
zIndex  6 → fade gradient (transição foto → footer)
zIndex  7 → stats footer (nick + 6 stats em 1×6)
zIndex  9 → ornamentos de canto (brackets, losangos)
```

### 5.4 Estrutura do rodapé (stats)

Layout **1 linha × 6 colunas** (atualizado para combinar com FIFA Mané TOTW):

```
┌─────────────────────────────┐
│         BRUNAO              │  ← Nick, Rajdhani 900, 21px, uppercase
├─────────────────────────────┤  ← divisor sutil (gradient horizontal)
│ K/D  DAN  UTI  WIN  CLU  CON│  ← labels Rajdhani 700, 9px
│  87   85   83   89   48   80│  ← valores Orbitron 900, 19px
└─────────────────────────────┘
```

Fundo: gradient vertical de `rgba(4,4,18,0.97)` para `transparent`, com `backdrop-filter:blur(20px)`.

### 5.5 Foto do jogador

- Wrapper com `overflow:hidden` que clipa a foto nas laterais antes da segunda borda interna (lvl≥3 tem anel decorativo em `inset:5*S`, então o wrapper clipa em 5*S; demais lvls clipam em 0).
- A foto está deslocada **levemente à direita** (`left:'56%'` em vez de `50%`) pra abrir espaço debaixo do overall pra um futuro logo da live.
- Suporte a 2 modos:
  - `photo` (original com fundo) — usa `object-fit:cover`, borda arredondada 8px
  - `photoClean` (sem fundo, via remove.bg) — usa `object-fit:contain`, sem borda
- Filtro especial **Melhor Freezar**: `grayscale(35%) brightness(0.85)` — visualmente "rebaixa" o jogador

### 5.6 Tag icons (Playstyles)

Estilo **losango FIFA** (rotacionado 45°), 28×28px, posicionados na **lateral esquerda** da carta, verticalmente centrados na área disponível.

Cada tag tem:
- **Ícone PNG** dedicado em `/public` (substitui emojis antigos)
- **Cor base** (vermelho/laranja/azul-cinza/verde/dourado)
- **Estilo de fundo do losango varia por tier da carta** (combina com a cor do tier)
- Em tiers altos (Dream Lobby, GOAT), o ícone é filtrado para ficar **dourado** (filter chain CSS)

| Tag | Tipo | Multiplier | Ícone |
|---|---|---|---|
| Baiter | Negativo | × 0.9 | `/isca.png` |
| Tiltado | Negativo | × 0.9 | `/bravo.png` |
| Mutadinho | Negativo | × 0.9 | `/opcao-mute.png` |
| Good Vibes | Positivo | × 1.1 | `/meditacao.png` |
| Esforçado | Positivo | × 1.1 | `/biceps.png` |
| Desert Eagle | Positivo | × 1.1 | `/revolver.png` |

**Regra do multiplier**: compara `posCount` vs `negCount`. Se mais positivas: ×1.1. Se mais negativas: ×0.9. Empate: ×1.0. Aplicado sobre o overall calculado.

---

## 6 · Animações

Definidas em `GCSS` (injetado globalmente) e algumas locais no PlayerCard:

| Keyframe | Duração | Onde usa |
|---|---|---|
| `lbcShine` | 5s/3.5s/2.8s | Shine sweep diagonal (lvl≥2) |
| `lbcGem` | 1.3–1.6s + stagger | Sparkles cintilando (opacity 0.3↔1, scale 1↔2.2) |
| `lbcPulseBlue` | 2.1s | Orbe azul do GOAT |
| `lbcBorderGlow` | 3s/4s/4.5s | Anéis internos pulsando |
| `lbcHdr` | 3s linear | Linha vermelha animada no topo do header da app |
| `lbcReveal` | .5s cubic-bezier | Pop-in da carta recém-gerada |
| `lbcShake` | .5s | Login com senha errada |
| `lbcLoginPulse` | 3s | Box-shadow vermelho pulsante no card de login |

**Princípio**: animações são contínuas mas baixa intensidade. Nada que cause distração ou enjôo. As fotos são **estáticas** (sem floating) por decisão deliberada do dono.

---

## 7 · Componentes base reutilizáveis

### `Btn(v, size)`
Variants: `primary` (vermelho), `success` (verde), `danger` (rosa-fraco), `ghost` (transparente).
Sizes: `xs`, `sm`, `md` (default).
Hover: `filter:brightness(1.18); translateY(-1px)`.

### `Field`
Input com label uppercase superior, foco realça borda vermelha + halo `box-shadow`.

### `Panel`
Card "glass" semitransparente: `rgba(255,255,255,0.07)` + blur 14px + borda dupla (geral + topo levemente rosada). Sombra: `0 8px 32px rgba(0,0,0,0.35)`.

### `SectionLabel`
Heading miúdo: 10.5px, letter-spacing 2.5, uppercase, cor parametrizável.

### `FL1IP`
Componente do logo do grupo. "FL" branco + "1" vermelho + "IP" branco, fonte Permanent Marker, com text-stroke preto para fazer "destacar". Aceita `size` (multiplicador) e `opacity`.

---

## 8 · Layout global da app

### 8.1 Header (top bar)

```
[ FL1IP logo ]  |  LOBBÃO CRAFT          [🚪 Sair]
                |  Ranking Semanal · CS2
```

- Background: gradient vermelho escuro `#0e0404 → #1a0606 → #0e0404`
- Linha vermelha animada no rodapé (lbcHdr keyframe)
- Título com gradient text `#cc1111 → #ff6644 → #ffffff`
- Drop-shadow vermelho de 8px no logo FL1IP
- Glow radial vermelho no canto superior direito

### 8.2 Navegação (tabs)

Background `rgba(18,8,8,0.97)` com blur. Tabs horizontais com scroll-x em mobile.

Tabs: 🏠 Home · 👥 Jogadores · ⚙️ Atributos · 🎮 Domingo · 📊 Histórico · 🔧 Config

Estado ativo: cor `#cc1111` + borda inferior vermelha de 2px.

### 8.3 Tela de Login

Centralizada, max-width 360px. Logo FL1IP + título "LOBBÃO CRAFT" com gradient. Card glass com inputs login/senha e botão "ENTRAR". Box-shadow pulsa em vermelho (`lbcLoginPulse`).
Background com 2 radial glows: vermelho no centro-topo, ciano discreto canto inferior esquerdo.

### 8.4 Telas:

- **Home** → grid de stats (jogadores/sessões/cartas/atributos) + último domingo com cartas em scale 0.72
- **Jogadores** → grid responsivo de panels com foto + nick + botões editar/deletar. Formulário expansível com upload de foto e integração remove.bg
- **Atributos** → lista vertical de panels com nome + peso% + barra de progresso. Soma deve dar 100% (badge verde/laranja)
- **Domingo** → 2 colunas: prévia ao vivo da carta (scale 0.88) | sliders + tags + botão gerar. Listas "Aguardando" e "Avaliados" abaixo
- **Histórico** → seletor horizontal de sessões + grid de cartas da sessão escolhida em scale 0.85
- **Config** → API key remove.bg + tabela explicativa das faixas de rating

---

## 9 · Storage / dados

`localStorage`, sem cloud:

| Chave | Conteúdo |
|---|---|
| `lbc2_p` | array de jogadores `{id, nick, gcNick, photo, photoClean}` |
| `lbc2_a` | array de atributos `{id, name, weight}` (padrão: 6 atrs somando 100%) |
| `lbc2_s` | array de sessões `{id, date, cards:[{playerId, scores:{attrId:0-100}, overall:0-99, tags:{tagId:bool}}]}` |
| `lbc2_k` | string API key do remove.bg |
| `lbc2_auth` | bool sessão de login ativa |

**Escala dos scores: 0–100** (recém-migrado de 0–10). O `calc()` faz média ponderada por peso e escala pra 0–99 (max 99, nunca 100):

```js
const calc = (sc, at) => {
  let t=0, w=0;
  at.forEach(a => { if(sc[a.id]!==undefined){ t += (sc[a.id]/100)*(a.weight/100); w += a.weight; }});
  return w ? Math.min(99, Math.round(t*100/w*99)) : 0;
};
```

---

## 10 · Bugs / decisões importantes da carta

**Conhecidos / contornados:**
1. `overflow:hidden` + `border-radius` no card body **corta diagonalmente** qualquer elemento posicionado nos cantos internos. Solução: ornamentos de canto ficam **fora** do overflow:hidden, no wrapper externo.
2. `box-shadow` aplica ao bounding box inteiro, criando "quadrados brilhantes" indesejados em divs com bordas parciais. Solução: usar `filter:drop-shadow` para glow somente nos pixels desenhados.
3. Borda dos cantos curvos do Dream Lobby: usa `borderTopLeftRadius:16*S` etc. para seguir exatamente a curvatura do card body que tem `border-radius:16*S`.

**Decisões deliberadas:**
- **Fotos estáticas**: foi removida a `lbcFloat` (animação flutuante). O dono prefere assim.
- **Sem logo nas cartas**: o `logo.png` foi removido do header das cartinhas (estava aparecendo no canto superior direito).
- **Foto deslocada 6% à direita**: pra abrir espaço debaixo do overall para um logo da "live" (a ser adicionado).
- **Stats em 1×6 horizontal**: tentamos 2×3, mas o dono preferiu 1×6 (mais próximo do TOTW que ele usa de referência).

---

## 11 · Coisas que podem evoluir (open questions para design)

Áreas onde uma segunda opinião de design ajudaria:

1. **Logo da live** debaixo do overall — tamanho, formato, sombra? Já tem espaço aberto (foto deslocada à direita).
2. **Carta no formato "exportável"** (PNG) — atualmente é puro DOM. Mantém o mesmo design ou ganha variante simplificada para WhatsApp?
3. **Hierarquia visual do GOAT vs Dream Lobby** — GOAT é "azul + dourado". É confuso que o tier mais alto não seja dourado puro? Ou é genial (TOTS-feel)?
4. **Background entre tiers** — Bagre tem azul-cinza, Bom de jogo é verde. Verde está OK ou compete com associações de UI (sucesso, KD ratio "verde = bom")?
5. **Mobile** — não foi testado em narrow viewport. Algumas medidas absolutas (ex: tag icons, sparkles) podem precisar de scale extra abaixo de 360px.
6. **Acessibilidade** — não tem contraste WCAG validado (especialmente texto rosado-claro em fundo escuro). Sem dúvida há issues.
7. **Padrão de revelação** — ao gerar uma carta nova, ela aparece com pop-in (`lbcReveal`). Vale uma reveal mais cinematográfica (tipo "pack opening" do FIFA)?
8. **Cartas em grid (home / histórico)** — atualmente ficam todas alinhadas. Vale um stagger / cascade quando carrega?
9. **Sparkles do Dream Lobby** — são 20 partículas distribuídas. Visualmente nice, mas é muito? Animação síncrona pode ficar repetitiva?
10. **Login** — está deliberadamente simples. Faz sentido um onboarding ou tutorial para novos usuários (caso a app vire pública)?

---

## 12 · Arquivos relevantes

```
lobbao-craft/
├── public/
│   ├── logo.png          ← logo do grupo FL1IP (ainda usado no login + header da app)
│   ├── biceps.png        ← tag "Esforçado" 💪
│   ├── bravo.png         ← tag "Tiltado" 😡
│   ├── isca.png          ← tag "Baiter" 🎣
│   ├── meditacao.png     ← tag "Good Vibes" 🧘
│   ├── opcao-mute.png    ← tag "Mutadinho" 🔇
│   └── revolver.png      ← tag "Desert Eagle" 🔫
├── src/
│   ├── main.jsx          ← entry React
│   └── App.jsx           ← TODA a app (1280 linhas, single-file por design)
├── index.html
├── package.json
└── vite.config.js
```

**Convenção no App.jsx**: seções separadas por comentários `// ═══ NOME ═══════` para navegação rápida (BRAND COLORS, TIERS, STORAGE, UTILS, GLOBAL CSS, FONTS, FL1IP LOGO, BASE COMPONENTS, PLAYER CARD, HOME, PLAYERS, ATTRS, DOMINGO, HISTÓRICO, CONFIG, LOGIN, APP).

---

## 13 · Resumo para agente de design

Se você está lendo isso para propor mudanças visuais:

- **Não introduza CSS externo**. Tudo é inline. Manter consistência.
- **Não introduza TypeScript**. Manter JS puro.
- **Não adicione bibliotecas de UI** (Tailwind, MUI, etc.). Foi escolha deliberada.
- O **PlayerCard** é o componente sagrado — qualquer mudança nele tem efeito cascata em 4 contextos (home, sunday, histórico, exportação).
- Cada tier tem identidade visual progressiva. **Não nivele os tiers** "por consistência" — a desigualdade É a feature.
- Mantenha o **clima FIFA TOTW + dark gamer**. Se ficar parecendo SaaS, está errado.
- O grupo é **íntimo e auto-deprecativo**. "Melhor Freezar" é uma piada interna (`Freezar = travar` em CS). Não tente sanitizar copy.
