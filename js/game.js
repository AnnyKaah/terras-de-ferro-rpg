// game.js - Lógica principal do jogo

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

function selectCharacter(playerNum, charId) {
    const playerKey = `player${playerNum}`;
    
    // Verifica se o outro jogador já escolheu este personagem
    const otherPlayer = playerNum === 1 ? 'player2' : 'player1';
    if (playerSelections[otherPlayer] === charId) {
        alert('Este personagem já foi escolhido pelo outro jogador!');
        return;
    }
    
    playerSelections[playerKey] = charId;
    gameState.selectCharacter(playerNum, charId);
    
    updateSelectionStatus();
}

function updateSelectionStatus() {
    const statusEl = document.getElementById('selection-status');
    const confirmBtn = document.getElementById('confirm-chars');
    
    // Atualiza visual dos cartões (bordas pulsantes)
    document.querySelectorAll('.character-card').forEach(card => {
        card.classList.remove('selected-p1', 'selected-p2');
        const charId = card.getAttribute('data-char');
        
        if (playerSelections.player1 === charId) {
            card.classList.add('selected-p1');
        }
        if (playerSelections.player2 === charId) {
            card.classList.add('selected-p2');
        }
    });

    let statusText = '';
    
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
        confirmBtn.style.display = 'block';
    } else {
        confirmBtn.style.display = 'none';
    }
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
            <div class="outcomes">
                ${renderOutcomes(decision.outcomes)}
            </div>
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

function handleDecision(decisionIndex) {
    const scene = SCENES[gameState.currentScene];
    const decision = scene.decisions[decisionIndex];
    
    if (!decision) return;
    
    gameState.log(`🎯 Escolheram: ${decision.title}`);
    
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
    
    gameState.log(`📜 ${outcome}`);
    
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
            });
        }
        
        if (effects.spirit) {
            Object.keys(effects.spirit).forEach(player => {
                const playerNum = parseInt(player);
                gameState.updateSpirit(playerNum, effects.spirit[player]);
            });
        }
        
        if (effects.supplies) {
            Object.keys(effects.supplies).forEach(player => {
                const playerNum = parseInt(player);
                gameState.updateSupplies(playerNum, effects.supplies[player]);
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
    
    // Avança para próxima cena após 2 segundos
    setTimeout(() => {
        advanceToNextScene();
    }, 2000);
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
    loadScene(gameState.currentScene + 1);
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
    const list = document.getElementById('inventory-items');
    const supplies1 = document.getElementById('inv-supplies-1');
    const supplies2 = document.getElementById('inv-supplies-2');
    
    if (!modal) return;
    
    // Atualiza visualização de suprimentos
    if (gameState.player1) supplies1.textContent = `${gameState.player1.status.supplies}/${gameState.player1.status.maxSupplies}`;
    if (gameState.player2) supplies2.textContent = `${gameState.player2.status.supplies}/${gameState.player2.status.maxSupplies}`;
    
    // Atualiza lista de itens
    if (gameState.inventory.length === 0) {
        list.innerHTML = '<li class="empty-inv">Nenhum item importante ainda.</li>';
    } else {
        list.innerHTML = gameState.inventory.map(item => `<li>✨ ${item}</li>`).join('');
    }
    
    modal.classList.add('active');
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

// Inicialização quando a página carregar
document.addEventListener('DOMContentLoaded', () => {
    console.log('🎮 Terras de Ferro carregado!');
    checkSaveGame();
});
function closeTutorial() {
    // Pega os elementos do tutorial na tela
    const overlay = document.getElementById('tutorial-overlay');
    const tooltip = document.getElementById('tutorial-tooltip');
    
    // Remove as classes e esconde eles
    if (overlay) {
        overlay.classList.remove('active');
        overlay.style.display = 'none'; // Garantia extra
    }
    if (tooltip) {
        tooltip.classList.remove('active');
        tooltip.style.display = 'none'; // Garantia extra
    }
    
    // NOVO: Avisa ao jogo que o jogador já viu o tutorial e salva
    if (typeof gameState !== 'undefined') {
        gameState.tutorialSeen = true;
        gameState.save();
    }
}
function handleChatKey(event) {
    if (event.key === 'Enter') sendChatMessage();
}

function sendChatMessage() {
    const input = document.getElementById('chat-input');
    const msg = input.value.trim();
    if (!msg) return;

    // Detecta se é um comando de rolagem livre (ex: /rolar ferro)
    if (msg.startsWith('/rolar')) {
        const parts = msg.split(' ');
        const attribute = parts[1] ? parts[1].toLowerCase() : 'ferro';
        
        // Pergunta de quem é a rolagem (1 = Lyra, 2 = Daren)
        const playerNum = confirm("Foi a Lyra (OK) ou o Daren (Cancelar)?") ? 1 : 2;
        
        gameState.log(`🎲 <span class="log-command">${msg}</span>`);
        showDiceRoller(playerNum, attribute, 0, (result) => {
            gameState.log(`Rolagem livre finalizada: ${result}`);
        });
    } else {
        // Mensagem normal
        gameState.log(`💬 <span class="log-message">${msg}</span>`);
    }
    input.value = '';
}
// Adicione em js/game.js
function exportSave() {
    const dataStr = localStorage.getItem('terrasDeFerroSave');
    if(!dataStr) return alert("Nenhum save encontrado!");
    
    const blob = new Blob([dataStr], {type: "application/json"});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = "terras_de_ferro_save.json";
    a.click();
}

function importSave(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(e) {
        localStorage.setItem('terrasDeFerroSave', e.target.result);
        alert("Save carregado com sucesso! Clique em Continuar Aventura.");
        checkSaveGame();
    };
    reader.readAsText(file);
}
