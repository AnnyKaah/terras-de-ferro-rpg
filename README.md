# ⚔️ Terras de Ferro

> **Um RPG cooperativo Dark Fantasy para dois jogadores, rodando diretamente no navegador via P2P.**

![Status](https://img.shields.io/badge/Status-Beta-blue)
![Tech](https://img.shields.io/badge/Tech-VanillaJS%20%7C%20PeerJS-yellow)
![License](https://img.shields.io/badge/License-MIT-green)

**Terras de Ferro** é uma experiência narrativa imersiva baseada no sistema *Ironsworn*. Diferente de RPGs de mesa tradicionais que exigem configuração complexa, este projeto permite que dois jogadores se conectem instantaneamente e vivam uma aventura épica com sincronização em tempo real.

---

## ✨ Funcionalidades Principais

### 🔗 Multiplayer P2P em Tempo Real
- **Conexão Direta:** Utiliza WebRTC (via PeerJS) para conectar dois navegadores sem necessidade de servidor backend complexo.
- **Sincronização Total:** Rolagens de dados, escolhas narrativas, inventário e status são transmitidos instantaneamente entre o Host e o Cliente.
- **Reconexão Inteligente:** Sistema robusto que lida com quedas de conexão e permite retomar a sessão.

### 🎨 UI/UX Imersiva (Premium)
- **Hero Page Cinematográfica:** Efeito Parallax com múltiplas camadas (estrelas, montanhas, névoa) e animações CSS avançadas.
- **Design Glassmorphism:** Interface moderna com painéis translúcidos e efeitos de desfoque (backdrop-filter).
- **Feedback Visual ("Juice"):**
  - Partículas de faísca no título.
  - Números de dano/cura flutuantes (Floating Text).
  - Tremores de tela e animações de pulso.
  - Efeitos visuais específicos para habilidades (ex: partículas de cura).

### 🎲 Mecânicas de Jogo
- **Sistema de Dados Ironsworn:** Rolagem automática de 1d6 (Ação) vs 2d10 (Desafio) com cálculo automático de Sucesso Total, Parcial ou Falha.
- **Inventário Colaborativo:** Sistema de troca de itens em tempo real entre os jogadores ("Dar item").
- **Narrativa Ramificada:** Árvore de decisões complexa onde cada escolha afeta os atributos e o final da história.
- **Persistência de Dados:** Salvamento automático no LocalStorage.
- **PWA (Progressive Web App):** Instale como aplicativo nativo e jogue offline.

---

## 🛠️ Tecnologias Utilizadas

- **HTML5 & CSS3:** Animações keyframes, Flexbox, Grid, Variáveis CSS.
- **JavaScript (ES6+):** Lógica modular dividida em gerenciadores de estado, cenas e rede.
- **PeerJS:** Abstração para WebRTC Data Channels.

---

## 🎮 Como Jogar

1. **Acesse o Jogo:** Abra o link do deploy (ou abra o `index.html` localmente).
2. **Crie uma Sala:** O Jogador 1 clica em "Criar Sala" e copia o ID gerado.
3. **Conecte-se:** O Jogador 2 cola o ID e clica em "Entrar".
4. **Escolha seu Herói:**
   - **Lyra (A Caçadora):** Especialista em Fogo e combate à distância.
   - **Daren (O Curandeiro):** Especialista em Coração e suporte.
5. **Aventurem-se:** Leiam a história, discutam as decisões e rolem os dados para definir o destino das Terras de Ferro.

---

## 📱 Instalação como App (PWA)

Este jogo é um **Progressive Web App (PWA)**, o que significa que pode ser instalado no seu dispositivo (Android, iOS, Windows, Mac) e jogado offline como um aplicativo nativo.

**Como instalar:**
- **Chrome/Edge (Desktop):** Clique no ícone de instalação (🖥️ ou ⊕) na barra de endereço.
- **Android (Chrome):** Toque em "Opções" (⋮) > "Instalar aplicativo" ou "Adicionar à tela inicial".
- **iOS (Safari):** Toque em "Compartilhar" (⎋) > "Adicionar à Tela de Início".

Uma vez instalado, o jogo funciona em tela cheia e carrega instantaneamente, mesmo sem internet!

---

##  Estrutura do Projeto

```bash
rpg-terras-de-ferro/
├── index.html          # Entry point e estrutura DOM
├── manifest.json       # Configuração PWA
├── sw.js               # Service Worker (Offline)
├── css/
│   └── style.css       # Estilização, animações e responsividade
├── js/
│   ├── game.js         # Core loop e orquestração
│   ├── multiplayer.js  # Lógica de rede (PeerJS)
│   ├── core/
│   │   ├── state.js    # Estado global, personagens e save system
│   │   └── dice.js     # Lógica de dados
│   ├── data/
│   │   ├── scenes.js   # Cenas e narrativa
│   │   └── items.js    # Banco de dados de itens
│   └── ui/
│       └── ui.js       # Gerenciamento de Interface
└── assets/             # Imagens e avatares
```

---

## 🚀 Instalação e Desenvolvimento

Este projeto não requer build tools complexos (como Webpack ou Vite) para rodar, mantendo a simplicidade.

1. Clone o repositório:
   ```bash
   git clone https://github.com/AnnyKaah/terras-de-ferro-rpg.git
   ```
2. Abra o arquivo `index.html` no seu navegador.
   *Recomendação: Use a extensão "Live Server" do VS Code para evitar problemas de CORS com módulos ES6, se houver.*
