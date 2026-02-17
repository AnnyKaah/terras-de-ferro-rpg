// game.js - Lógica principal do jogo

// Funções de Lobby
function hostGame() {
    document.getElementById('btn-host').style.display = 'none';
    document.getElementById('host-info').style.display = 'block';
    initMultiplayer();
}

function joinGameUI() {
    const input = document.getElementById('join-id-input');
    const id = input.value.trim();
    if (id) {
        document.getElementById('btn-join').textContent = "Conectando...";
        document.getElementById('btn-join').disabled = true;
        joinRoom(id);
    } else {
        alert("Por favor, insira o ID da sala.");
    }
}

function startGame() {
    if (localStorage.getItem('terrasDeFerroSave')) {
        if (!confirm("Existe um jogo salvo. Iniciar uma nova aventura apagará o progresso anterior. Deseja continuar?")) {
            return;
        }
        gameState.reset();
        playerSelections = { player1: null, player2: null };
    }

    hideScreen('start-screen');
    showScreen('character-screen');
}

function showRules() {
    hideScreen('start-screen');
    showScreen('rules-screen');
}

function hideRules() {
    hideScreen('rules-screen');
    showScreen('start-screen');
}

function hideScreen(screenId) {
    const screen = document.getElementById(screenId);
    if (screen) screen.classList.remove('active');
}

function showScreen(screenId) {
    const screen = document.getElementById(screenId);
    if (screen) screen.classList.add('active');
}

let playerSelections = { player1: null, player2: null };

// Função chamada quando EU clico em selecionar
function chooseCharacter(charId) {
    if (myPlayerId === 0) {
        alert("Erro: Conexão multiplayer não estabelecida.");
        return;
    }

    // Atualiza localmente
    handleRemoteSelection(myPlayerId, charId);
    
    // Envia para o outro jogador
    sendCharacterSelection(charId);
}

// Função chamada quando recebo a escolha (minha ou do outro)
function handleRemoteSelection(playerNum, charId) {
    selectCharacterLogic(playerNum, charId);
}

function updateSelectionStatus() {
    const statusEl = document.getElementById('selection-status');
    const confirmBtn = document.getElementById('confirm-chars');
    
    // Atualiza visual dos cartões (bordas pulsantes)
    const cards = document.querySelectorAll('.character-card');
    cards.forEach(card => {
        card.classList.remove('selected-by-me', 'taken');
        const charId = card.getAttribute('data-char');
        
        // Se EU escolhi este card
        if ((myPlayerId === 1 && playerSelections.player1 === charId) || 
            (myPlayerId === 2 && playerSelections.player2 === charId)) {
            card.classList.add('selected-by-me');
        }
        // Se o OUTRO escolheu este card
        else if ((myPlayerId === 1 && playerSelections.player2 === charId) || 
                 (myPlayerId === 2 && playerSelections.player1 === charId)) {
            card.classList.add('taken');
        }
    });

    let statusText = '';
    // Constrói o texto de status
    if (playerSelections.player1) {
        const char1 = CHARACTERS[playerSelections.player1];
        statusText += `👤 Jogador 1: ${char1.icon} ${char1.name}`;
    }
    
    if (playerSelections.player2) {
        const char2 = CHARACTERS[playerSelections.player2];
        if (statusText) statusText += '<br>';
        statusText += `👤 Jogador 2: ${char2.icon} ${char2.name}`;
    }
    
    statusEl.innerHTML = statusText;
    
    // Mostra botão de confirmar se ambos escolheram
    if (playerSelections.player1 && playerSelections.player2) {
        confirmBtn.textContent = "Começar Aventura!";
        confirmBtn.disabled = false;
        confirmBtn.style.display = 'block';
        confirmBtn.onclick = confirmCharacters; // Garante o evento
    } else {
        confirmBtn.style.display = 'block';
        confirmBtn.disabled = true;
        confirmBtn.textContent = "Aguardando ambos os jogadores...";
    }
}

// Lógica interna de seleção (reutilizada)
function selectCharacterLogic(playerNum, charId) {
    const playerKey = `player${playerNum}`;
    
    // Verifica conflito
    const otherPlayer = playerNum === 1 ? 'player2' : 'player1';
    if (playerSelections[otherPlayer] === charId) {
        // Se for seleção remota conflitante, ignoramos ou tratamos
        console.warn("Conflito de seleção de personagem!");
        return;
    }
    
    playerSelections[playerKey] = charId;
    gameState.selectCharacter(playerNum, charId);
    updateSelectionStatus();
}

// Chamado pelo multiplayer quando o outro clica numa decisão
function handleRemoteDecisionClick(decisionIndex) {
    handleDecision(decisionIndex, true); // true = isRemote
}

function confirmCharacters() {
    hideScreen('character-screen');
    showScreen('game-screen');
    
    // Atualiza nomes nos botões de rolagem
    const char1NameBtn = document.getElementById('char1-name');
    const char2NameBtn = document.getElementById('char2-name');
    
    if (char1NameBtn && gameState.player1) {
        char1NameBtn.textContent = `${gameState.player1.icon} ${gameState.player1.name}`;
    }
    if (char2NameBtn && gameState.player2) {
        char2NameBtn.textContent = `${gameState.player2.icon} ${gameState.player2.name}`;
    }
    
    // Inicializa a interface
    gameState.updateCharacterDisplay();
    gameState.updateProgressDisplay();
    
    // Carrega a primeira cena
    loadScene(0);
}

function loadScene(sceneIndex) {
    if (sceneIndex >= SCENES.length) {
        showEnding();
        return;
    }
    
    gameState.currentScene = sceneIndex;
    gameState.save(); // Salva ao mudar de cena
    const scene = SCENES[sceneIndex];
    
    const sceneContainer = document.getElementById('scene-container');
    const decisionContainer = document.getElementById('decision-container');
    
    // Renderiza a cena
    sceneContainer.innerHTML = `
        <div class="scene-header">
            <div class="scene-number">${scene.number}</div>
            <h2 class="scene-title">${scene.title}</h2>
        </div>
        ${scene.description.map(p => `<p class="scene-text">${p}</p>`).join('')}
    `;
    
    // Renderiza as decisões
    if (scene.decisions) {
        decisionContainer.innerHTML = `
            <h3 class="decision-title">${scene.decisionTitle || 'O que vocês fazem?'}</h3>
            <div class="decision-options">
                ${scene.decisions.map((decision, index) => renderDecision(decision, index)).join('')}
            </div>
        `;
    }
    
    gameState.log(`📖 ${scene.number}: ${scene.title}`);
}

function renderDecision(decision, index) {
    return `
        <div class="decision-card" onclick="handleDecision(${index})">
            <h4>${decision.icon || '📍'} ${decision.title}</h4>
            <p>${decision.description}</p>
            ${decision.roll ? `<div class="roll-info">Rolagem: ${decision.roll}</div>` : ''}
            ${decision.outcomes ? `<div class="outcomes">${renderOutcomes(decision.outcomes)}</div>` : ''}
        </div>
    `;
}

function renderOutcomes(outcomes) {
    return `
        <div class="outcome success">
            <strong>✅ Sucesso:</strong> ${outcomes.success}
        </div>
        ${outcomes.partial ? `
        <div class="outcome partial">
            <strong>🌓 Parcial:</strong> ${outcomes.partial}
        </div>` : ''}
        <div class="outcome fail">
            <strong>❌ Falha:</strong> ${outcomes.fail}
        </div>
    `;
}

// Função para reativar os cartões (chamada se o modal de dados for fechado sem rolar)
function enableDecisionCards() {
    const decisionCards = document.querySelectorAll('.decision-card');
    decisionCards.forEach(card => {
        card.style.pointerEvents = 'all';
        card.style.opacity = '1';
    });
}

function handleDecision(decisionIndex, isRemote = false) {
    const scene = SCENES[gameState.currentScene];
    const decision = scene.decisions[decisionIndex];
    
    if (!decision) return;
    
    // Desativa todos os botões de decisão para evitar cliques duplos
    const decisionCards = document.querySelectorAll('.decision-card');
    decisionCards.forEach(card => {
        card.style.pointerEvents = 'none';
        card.style.opacity = '0.6';
    });

    // Se fui eu que cliquei, avisa o outro jogador imediatamente
    if (!isRemote && typeof sendDecisionClick === 'function') {
        sendDecisionClick(decisionIndex);
    }
    
    // gameState.log(`🎯 Escolheram: ${decision.title}`); // Log duplicado se não cuidar, melhor deixar o resultado falar
    
    // Se a decisão requer rolagem, mostra o modal
    if (decision.requiresRoll) {
        const { playerNum, attribute, bonus } = decision.rollInfo;
        
        showDiceRoller(playerNum, attribute, bonus || 0, (result) => {
            applyDecisionResult(decision, result);
        });
    } else {
        // Decisão narrativa, apenas avança
        if (decision.onSelect) {
            decision.onSelect();
        }
        advanceToNextScene();
    }
}

function applyDecisionResult(decision, result) {
    const outcome = decision.outcomes[result];
    
    if (!outcome) {
        console.error('Outcome não encontrado para:', result);
        return;
    }
    
    gameState.log(`📜 RESULTADO: ${outcome}`);
    
    // Adicionar ao diário
    const scene = SCENES[gameState.currentScene];
    gameState.addJournalEntry(scene.title, decision.title, outcome, result);
    
    // Aplica efeitos
    if (decision.effects && decision.effects[result]) {
        const effects = decision.effects[result];
        
        if (effects.progress) {
            gameState.addProgress(effects.progress);
        }
        
        if (effects.health) {
            Object.keys(effects.health).forEach(player => {
                const playerNum = parseInt(player);
                gameState.updateHealth(playerNum, effects.health[player]);
                showFloatingDamage(playerNum, effects.health[player], 'health');
            });
        }
        
        if (effects.spirit) {
            Object.keys(effects.spirit).forEach(player => {
                const playerNum = parseInt(player);
                gameState.updateSpirit(playerNum, effects.spirit[player]);
                showFloatingDamage(playerNum, effects.spirit[player], 'spirit');
            });
        }
        
        if (effects.supplies) {
            Object.keys(effects.supplies).forEach(player => {
                const playerNum = parseInt(player);
                gameState.updateSupplies(playerNum, effects.supplies[player]);
                showFloatingDamage(playerNum, effects.supplies[player], 'supplies');
            });
        }

        if (effects.addItem) {
            gameState.addItem(effects.addItem);
        }

        if (effects.removeItem) {
            gameState.removeItem(effects.removeItem);
        }

        if (effects.achievement) {
            gameState.unlockAchievement(effects.achievement);
        }

        if (effects.bond) {
            gameState.updateBond(effects.bond);
        }
    }

    // Verifica Game Over (Ambos com Saúde 0)
    if (gameState.player1 && gameState.player2 && 
        gameState.player1.status.health <= 0 && 
        gameState.player2.status.health <= 0) {
        setTimeout(showGameOver, 1500);
        return;
    }
    
    // Avança para próxima cena após 3 segundos (tempo para ler o log)
    setTimeout(() => {
        advanceToNextScene();
    }, 3000);
}

// Sistema de Feedback Visual (Floating Text)
function showFloatingDamage(playerNum, amount, type) {
    const elementId = playerNum === 1 ? 'char1-status' : 'char2-status';
    const element = document.getElementById(elementId);
    if (!element) return;

    const rect = element.getBoundingClientRect();
    // Posição central do card do personagem
    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 2;

    let text = amount > 0 ? `+${amount}` : `${amount}`;
    let color = amount > 0 ? 'var(--success)' : 'var(--danger)';
    
    if (type === 'spirit') color = '#9b59b6'; // Roxo para espírito
    if (type === 'supplies') color = '#f1c40f'; // Amarelo para suprimentos

    showFloatingText(text, x, y, color);
    
    // Envia para o outro jogador ver também
    if (typeof sendFloatingText === 'function') {
        sendFloatingText(text, x, y, color);
    }
}

function showFloatingText(text, x, y, color) {
    const floatEl = document.createElement('div');
    floatEl.className = 'floating-text';
    floatEl.textContent = text;
    floatEl.style.left = `${x}px`;
    floatEl.style.top = `${y}px`;
    floatEl.style.color = color;
    document.body.appendChild(floatEl);

    setTimeout(() => floatEl.remove(), 1500);
}

function startMission2() {
    gameState.progress = 0;
    gameState.currentMission = 2;
    gameState.resetSpecialAbilities();
    gameState.updateProgressDisplay();
    gameState.log("🌊 INÍCIO DA MISSÃO 2: O Chamado do Lago Profundo");
    alert("Missão 1 Concluída! O progresso foi resetado para a nova jornada.");
}

function showGameOver() {
    hideScreen('game-screen');
    showScreen('game-over-screen');
}

function restartCurrentScene() {
    // Recupera vida e espírito para tentar novamente
    gameState.updateHealth(1, 5);
    gameState.updateHealth(2, 5);
    gameState.updateSpirit(1, 5);
    gameState.updateSpirit(2, 5);
    
    gameState.log("🔄 O destino oferece uma segunda chance...");
    
    hideScreen('game-over-screen');
    showScreen('game-screen');
    
    // Recarrega a cena atual
    loadScene(gameState.currentScene);
}

function advanceToNextScene() {
    const overlay = document.getElementById('transition-overlay');
    
    // 1. Escurece a tela
    if (overlay) overlay.classList.add('active');
    
    // 2. Aguarda a animação (1 segundo)
    setTimeout(() => {
        loadScene(gameState.currentScene + 1);
        window.scrollTo(0, 0); // Rola para o topo enquanto está escuro
        
        // 3. Clareia a tela novamente
        setTimeout(() => {
            if (overlay) overlay.classList.remove('active');
        }, 500);
    }, 1000);
}

function showEnding() {
    const sceneContainer = document.getElementById('scene-container');
    const decisionContainer = document.getElementById('decision-container');
    
    sceneContainer.innerHTML = `
        <div class="scene-header">
            <div class="scene-number">🎉 FIM DA AVENTURA</div>
            <h2 class="scene-title">Parabéns, Aventureiros!</h2>
        </div>
        <p class="scene-text">Vocês completaram a jornada pelas Terras de Ferro!</p>
        <p class="scene-text">Progresso final: ${gameState.progress}/${gameState.maxProgress}</p>
    `;
    
    decisionContainer.innerHTML = `
        <button class="btn-primary" onclick="location.reload()">Jogar Novamente</button>
    `;
}

function closeInventory() {
    const modal = document.getElementById('inventory-modal');
    if (modal) modal.classList.remove('active');
}

function showInventory() {
    const modal = document.getElementById('inventory-modal');
    const list1 = document.getElementById('inv-list-1');
    const list2 = document.getElementById('inv-list-2');
    const supplies1 = document.getElementById('inv-supplies-1');
    const supplies2 = document.getElementById('inv-supplies-2');
    
    if (!modal) return;
    
    // Atualiza visualização de suprimentos
    if (gameState.player1) supplies1.textContent = `${gameState.player1.status.supplies}/${gameState.player1.status.maxSupplies}`;
    if (gameState.player2) supplies2.textContent = `${gameState.player2.status.supplies}/${gameState.player2.status.maxSupplies}`;
    
    // Atualiza lista de itens
    const items1 = gameState.inventory.filter(i => i.owner === 1);
    const items2 = gameState.inventory.filter(i => i.owner === 2);

    const renderItem = (item, owner) => {
        // Verifica se posso trocar (sou o dono OU sou o host jogando localmente)
        // myPlayerId vem do multiplayer.js (1=Host, 2=Client, 0=Local/Offline)
        const canTrade = myPlayerId === 0 || myPlayerId === owner;
        const targetOwner = owner === 1 ? 2 : 1;
        
        return `
            <li>
                <span>✨ ${item.name}</span>
                ${canTrade ? `<button class="btn-trade" onclick="tradeItemAction('${item.id}', ${targetOwner})">⇄ Dar</button>` : ''}
            </li>
        `;
    };

    list1.innerHTML = items1.length ? items1.map(i => renderItem(i, 1)).join('') : '<li class="empty-inv">Vazio</li>';
    list2.innerHTML = items2.length ? items2.map(i => renderItem(i, 2)).join('') : '<li class="empty-inv">Vazio</li>';
    
    modal.classList.add('active');
}

function tradeItemAction(itemId, targetOwner) {
    gameState.transferItem(itemId, targetOwner);
    
    // Sincroniza se estiver online
    if (typeof syncGameState === 'function') {
        syncGameState();
    }
    
    // Atualiza a UI
    showInventory();
}

function showRestModal() {
    const modal = document.getElementById('rest-modal');
    const container = modal.querySelector('.rest-options');
    
    if (!modal || !container) return;

    let html = '';
    
    [1, 2].forEach(num => {
        const player = gameState.getPlayer(num);
        if (!player) return;
        
        const canAfford = player.status.supplies > 0;
        const needsHealth = player.status.health < player.status.maxHealth;
        const needsSpirit = player.status.spirit < player.status.maxSpirit;
        
        html += `
            <div class="rest-player-card">
                <h4>${player.icon} ${player.name}</h4>
                <div class="rest-stats">
                    <span>❤️ ${player.status.health}/${player.status.maxHealth}</span>
                    <span>🧠 ${player.status.spirit}/${player.status.maxSpirit}</span>
                    <span>🎒 ${player.status.supplies}/${player.status.maxSupplies}</span>
                </div>
                <div class="rest-actions">
                    <button class="btn-rest" onclick="performRest(${num}, 'health')" ${!canAfford || !needsHealth ? 'disabled' : ''}>
                        Curar (+2 ❤️ / -1 🎒)
                    </button>
                    <button class="btn-rest" onclick="performRest(${num}, 'spirit')" ${!canAfford || !needsSpirit ? 'disabled' : ''}>
                        Relaxar (+2 🧠 / -1 🎒)
                    </button>
                </div>
            </div>
        `;
    });
    
    container.innerHTML = html;
    modal.classList.add('active');
}

function closeRestModal() {
    const modal = document.getElementById('rest-modal');
    if (modal) modal.classList.remove('active');
}

function performRest(playerNum, type) {
    const player = gameState.getPlayer(playerNum);
    
    if (player.status.supplies <= 0) return;
    
    gameState.updateSupplies(playerNum, -1);
    
    if (type === 'health') {
        gameState.updateHealth(playerNum, 2);
        gameState.log(`⛺ ${player.name} descansou e tratou os ferimentos.`);
    } else {
        gameState.updateSpirit(playerNum, 2);
        gameState.log(`⛺ ${player.name} descansou e recuperou o ânimo.`);
    }
    
    showRestModal(); // Atualiza a UI
}

function showAchievements() {
    const modal = document.getElementById('achievements-modal');
    const grid = document.getElementById('achievements-grid');
    
    if (!modal || !grid) return;

    let html = '';
    
    Object.values(ACHIEVEMENTS_DATA).forEach(ach => {
        const isUnlocked = gameState.unlockedAchievements.includes(ach.id);
        const statusClass = isUnlocked ? 'unlocked' : 'locked';
        const icon = isUnlocked ? ach.icon : '🔒';
        
        html += `
            <div class="achievement-card ${statusClass}">
                <div class="ach-icon">${icon}</div>
                <div class="ach-info">
                    <h4>${ach.title}</h4>
                    <p>${ach.description}</p>
                </div>
            </div>
        `;
    });
    
    grid.innerHTML = html;
    modal.classList.add('active');
}

function closeAchievements() {
    const modal = document.getElementById('achievements-modal');
    if (modal) modal.classList.remove('active');
}

function showJournal() {
    const modal = document.getElementById('journal-modal');
    const list = document.getElementById('journal-entries');
    
    if (!modal || !list) return;

    if (gameState.journal.length === 0) {
        list.innerHTML = '<div class="empty-journal">O diário ainda está em branco. A aventura aguarda.</div>';
    } else {
        list.innerHTML = gameState.journal.map(entry => `
            <div class="journal-entry ${entry.resultType}">
                <div class="journal-header">
                    <span>${entry.scene}</span>
                    <span>${entry.timestamp.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                </div>
                <div class="journal-decision">${entry.decision}</div>
                <div class="journal-outcome">"${entry.outcome}"</div>
            </div>
        `).join('');
    }
    
    modal.classList.add('active');
}

function closeJournal() {
    const modal = document.getElementById('journal-modal');
    if (modal) modal.classList.remove('active');
}

function showConnectionLostModal() {
    const modal = document.getElementById('connection-lost-modal');
    if (modal) modal.classList.add('active');
}

function hideConnectionLostModal() {
    const modal = document.getElementById('connection-lost-modal');
    if (modal) modal.classList.remove('active');
}

function checkSaveGame() {
    if (localStorage.getItem('terrasDeFerroSave')) {
        const btnContinue = document.getElementById('btn-continue');
        if (btnContinue) btnContinue.style.display = 'inline-block';
    }
}

function continueGame() {
    if (gameState.load()) {
        hideScreen('start-screen');
        showScreen('game-screen');
        
        // Restaura a interface
        gameState.updateCharacterDisplay();
        gameState.updateProgressDisplay();
        
        // Carrega a cena atual
        loadScene(gameState.currentScene);
        
        gameState.log("🔄 Jogo carregado com sucesso.");
    } else {
        alert("Erro ao carregar o jogo salvo.");
    }
}

function useSpecialAbility() {
    gameState.performSpecialAbility();
}

function initTitleSparks() {
    const container = document.querySelector('.start-container');
    const title = document.querySelector('.main-title');
    
    if (!container || !title) return;

    setInterval(() => {
        // Verifica se a tela inicial está visível para não gastar processamento à toa
        const startScreen = document.getElementById('start-screen');
        if (!startScreen || !startScreen.classList.contains('active')) return;

        const spark = document.createElement('div');
        spark.classList.add('ember');
        
        // Posicionamento relativo ao título
        const titleRect = title.getBoundingClientRect();
        const containerRect = container.getBoundingClientRect();
        
        // Posição X aleatória dentro da largura do título
        const xPos = (titleRect.left - containerRect.left) + (Math.random() * titleRect.width);
        // Posição Y na base do título (levemente para cima)
        const yPos = (titleRect.top - containerRect.top) + (titleRect.height * 0.6);
        
        spark.style.left = `${xPos}px`;
        spark.style.top = `${yPos}px`;
        
        // Variação aleatória de movimento (drift)
        const drift = (Math.random() - 0.5) * 60; // Desvio lateral
        spark.style.setProperty('--drift', `${drift}px`);
        
        // Tamanho aleatório
        const size = Math.random() * 3 + 1;
        spark.style.width = `${size}px`;
        spark.style.height = `${size}px`;
        
        // Duração aleatória
        const duration = 0.5 + Math.random() * 1.5;
        spark.style.animation = `riseSparks ${duration}s ease-out forwards`;
        
        container.appendChild(spark);
        
        // Remove do DOM após a animação terminar
        setTimeout(() => {
            spark.remove();
        }, duration * 1000);
    }, 80); // Cria uma faísca a cada 80ms
}

// Inicialização quando a página carregar
document.addEventListener('DOMContentLoaded', () => {
    console.log('🎮 Terras de Ferro carregado!');
    checkSaveGame();
    initTitleSparks();
});
