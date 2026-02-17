# ⚔️ Terras de Ferro - RPG para Dois Jogadores

Um RPG cooperativo online baseado no sistema Ironsworn, onde dois jogadores podem viver uma aventura épica juntos diretamente no navegador.

## 🎮 Como Jogar

1. Abra o jogo no navegador
2. Clique em "Começar Aventura"
3. Cada jogador escolhe um personagem (Lyra ou Daren)
4. Leiam as cenas juntos e decidam qual caminho seguir
5. Rolem os dados quando necessário clicando no botão "Rolar Dados"
6. Acompanhem a saúde, espírito e suprimentos na barra lateral

## 📁 Estrutura do Projeto

```
rpg-terras-de-ferro/
├── index.html          # Página principal
├── css/
│   └── style.css       # Estilos do jogo
├── js/
│   ├── game.js         # Lógica principal
│   ├── characters.js   # Sistema de personagens
│   ├── dice.js         # Sistema de rolagem de dados
│   └── scenes.js       # Dados das cenas e decisões
├── data/               # (reservado para futuros dados)
└── assets/             # (reservado para futuras imagens)
```

## 🚀 Deploy no GitHub Pages

### Passo 1: Criar Repositório no GitHub

1. Acesse [github.com](https://github.com) e faça login
2. Clique em "New repository"
3. Nome do repositório: `terras-de-ferro-rpg`
4. Deixe como **Public**
5. NÃO marque "Add a README file"
6. Clique em "Create repository"

### Passo 2: Subir os Arquivos

No terminal/VS Code, execute:

```bash
cd rpg-terras-de-ferro
git init
git add .
git commit -m "Initial commit - RPG Terras de Ferro"
git branch -M main
git remote add origin https://github.com/AnnyKaah/terras-de-ferro-rpg
git push -u origin main
```


### Passo 3: Ativar GitHub Pages

1. No repositório do GitHub, vá em **Settings**
2. No menu lateral, clique em **Pages**
3. Em "Source", selecione **main** branch
4. Clique em **Save**
5. Aguarde alguns minutos

Seu jogo estará disponível em:
```
https://github.com/AnnyKaah/terras-de-ferro-rpg
```

## 🚀 Deploy Alternativo - Vercel

### Opção mais rápida (sem linha de comando):

1. Acesse [vercel.com](https://vercel.com)
2. Faça login com GitHub
3. Clique em "Import Project"
4. Selecione o repositório `terras-de-ferro-rpg`
5. Clique em "Deploy"
6. Pronto! O link estará disponível imediatamente

### Opção com Vercel CLI:

```bash
# Instalar Vercel CLI
npm install -g vercel

# Fazer deploy
cd rpg-terras-de-ferro
vercel

# Seguir as instruções no terminal
# Escolher: "Setup and deploy?" → Yes
# Project name: terras-de-ferro-rpg
# Deploy: Yes
```

## 🎯 Funcionalidades

- ✅ Sistema de rolagem de dados intuitivo
- ✅ Dois personagens únicos com atributos diferentes
- ✅ Rastreamento automático de saúde, espírito e suprimentos
- ✅ Contador de progresso da missão
- ✅ Interface responsiva (funciona em celular e desktop)
- ✅ 4 cenas da primeira missão (demo)
- ✅ Sistema de log de ações
- ✅ Múltiplas decisões por cena
- ✅ Resultados baseados em rolagens de dados

## 🔧 Adicionar Mais Conteúdo

Para adicionar novas cenas, edite o arquivo `js/scenes.js`:

```javascript
{
    number: "Cena 5",
    title: "Título da Nova Cena",
    description: [
        "Parágrafo 1 da descrição...",
        "Parágrafo 2 da descrição..."
    ],
    decisions: [
        {
            icon: "🎯",
            title: "Opção A",
            description: "Descrição da opção...",
            roll: "Personagem → Atributo (1d6 + X)",
            requiresRoll: true,
            rollInfo: { playerNum: 1, attribute: 'ferro' },
            outcomes: {
                success: "Texto do sucesso...",
                partial: "Texto do parcial...",
                fail: "Texto da falha..."
            },
            effects: {
                success: { progress: 2 },
                partial: { progress: 1, health: { 1: -1 } },
                fail: { health: { 1: -2, 2: -1 } }
            }
        }
    ]
}
```

## 📱 Compatibilidade

- ✅ Chrome / Edge
- ✅ Firefox
- ✅ Safari
- ✅ Mobile (Android / iOS)

## 🎨 Personalização

Para mudar as cores do jogo, edite as variáveis CSS em `css/style.css`:

```css
:root {
    --accent: #e94560;        /* Cor principal */
    --accent-light: #ff6b81;  /* Cor principal clara */
    --bg-dark: #1a1a2e;       /* Fundo escuro */
    /* ... */
}
```

## 📄 Licença

Projeto criado para uso pessoal. Baseado no sistema Ironsworn (Creative Commons).

## 🤝 Contribuindo

Sinta-se livre para fazer fork e adicionar suas próprias cenas e personagens!

---

**Boa aventura nas Terras de Ferro! ⚔️**
