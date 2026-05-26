# Lobbão Craft — Contexto do Projeto

## O que é
App web de ranking semanal de CS2 para um grupo de amigos que joga toda semana (o "Lobbão"). Gera **cartinhas no estilo FIFA Ultimate Team** para cada jogador com base em atributos avaliados manualmente no domingo.

## Stack
- **React 18** + **Vite 5** (sem TypeScript, sem CSS externo — tudo inline styles)
- Deploy no **Vercel**: https://lobbao-craft.vercel.app
- Repositório: https://github.com/felipempp55/lobbao-craft
- Sem backend — tudo salvo no `localStorage` do navegador

## Estrutura de arquivos
```
lobbao-craft/
├── public/
│   └── logo.png          ← logo do grupo (FL1IP), aparece nas cartinhas
├── src/
│   ├── main.jsx          ← entry point React
│   └── App.jsx           ← TODO o app (componentes, lógica, estilos)
├── index.html
├── package.json
└── vite.config.js
```

## Como rodar
```bash
npm install
npm run dev       # desenvolvimento local
npm run build     # build de produção
npx vercel --prod --yes  # deploy no Vercel
```

## Arquitetura do App.jsx
O arquivo é dividido em seções marcadas com comentários `// ═══ NOME ═══`:

| Seção | O que faz |
|---|---|
| `BRAND COLORS` | Cores globais (vermelho `#cc1111`) |
| `TIERS` | Definição das faixas Bronze / Prata / Ouro / Diamante |
| `STORAGE` | Helpers `sv()` e `ld()` para localStorage |
| `UTILS` | `calc()` — calcula overall ponderado pelos pesos dos atributos |
| `GLOBAL CSS` | Animações e estilos globais injetados via `<style>` |
| `PLAYER CARD` | Componente principal — cartinha visual do jogador |
| `HomeTab` | Visão geral + últimas cartinhas |
| `PlayersTab` | CRUD de jogadores + upload de foto + integração remove.bg |
| `AttrsTab` | CRUD de atributos com peso percentual |
| `SundayTab` | Sessão do domingo — avalia jogadores com sliders em tempo real |
| `HistoryTab` | Histórico de sessões passadas |
| `ConfigTab` | API key do remove.bg + tabela de faixas |
| `App` | Root — gerencia estado global + persistência localStorage |

## Chaves do localStorage
- `lbc2_p` — array de jogadores
- `lbc2_a` — array de atributos
- `lbc2_s` — array de sessões
- `lbc2_k` — API key do remove.bg

## Design das cartinhas (PlayerCard)
- Inspirado no **FIFA Ultimate Team**
- 4 tiers com visual distinto: Bronze, Prata, Ouro, Diamante
- **Carta Destaque** para rating **90+**: ribbon "★ DESTAQUE ★", card maior (278×418 vs 260×400), glow mais intenso, bordas mais ornamentadas
- Stats em **2 colunas** (3 atributos cada) no rodapé
- Nick centralizado na barra inferior
- Logo do grupo (`/logo.png`) no canto superior direito — fallback para texto FL1IP se o arquivo não existir
- Foto do jogador flutua com animação; suporta remoção de fundo via remove.bg

## Atributos padrão (podem ser customizados na aba Atributos)
| ID | Nome | Peso |
|---|---|---|
| kd | K/D Ratio | 20% |
| dmg | Dano Médio | 20% |
| util | Utilitárias | 15% |
| wr | Win Rate | 25% |
| clutch | Clutch | 10% |
| consist | Consistência | 10% |

## Integrações externas
- **remove.bg**: remoção de fundo das fotos dos jogadores. API key configurada pelo usuário na aba Config. 50 usos/mês no plano grátis.
- **Google Fonts**: Orbitron, Rajdhani, Permanent Marker (carregadas via `@import` no CSS global)

## Próximos passos sugeridos
- [ ] **Exportar cartinha como PNG** — usar `html2canvas` para salvar cada carta como imagem
- [ ] **Exportar todas as cartas do domingo** — PNG com todas as cartinhas lado a lado para postar no grupo
- [ ] **Proteção por senha** — tela de login simples para não qualquer um acessar
- [ ] **Logo real** — já implementado (`public/logo.png`), trocar a imagem quando necessário
- [ ] **Backend/persistência compartilhada** — se quiser que todos do grupo vejam os dados em tempo real, integrar Supabase ou Firebase
