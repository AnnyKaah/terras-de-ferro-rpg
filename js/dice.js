// dice.js - Sistema de rolagem de dados

let currentRollContext = {
    playerNum: null,
    attribute: 'ferro',
    bonus: 0,
    callback: null
};
let lastRollResult = null; // Armazena o resultado para não perder ao fechar tutorial

function showDiceRoller(playerNum = null, attribute = 'ferro', bonus = 0, callback = null) {
    currentRollContext = { playerNum, attribute, bonus, callback };
    
    const modal = document.getElementById('dice-modal');
    const diceResult = document.getElementById('dice-result');
    
    modal.classList.add('active');
    diceResult.style.display = 'none';
    
    // Atualiza nomes dos personagens nos botões
    const char1Name = document.getElementById('char1-name');
    const char2Name = document.getElementById('char2-name');
    
    if (gameState.player1) {
        char1Name.textContent = `${gameState.player1.icon} ${gameState.player1.name}`;
    }
    if (gameState.player2) {
        char2Name.textContent = `${gameState.player2.icon} ${gameState.player2.name}`;
    }

    // Adiciona dica para iniciantes
    const diceContext = document.getElementById('dice-context');
    if (diceContext) {
        const attrName = attribute.charAt(0).toUpperCase() + attribute.slice(1);
        const bonusText = bonus > 0 ? ` (+${bonus} bônus)` : '';
        diceContext.innerHTML = `Teste de <strong>${attrName}</strong>${bonusText}.<br><span style="font-size: 0.85rem; color: #aaa;">Role o dado e tente superar os dois Desafios.</span>`;
    }

    // Configura botão de Laço
    const btnBond = document.getElementById('btn-use-bond');
    if (btnBond) {
        btnBond.disabled = gameState.bond <= 0;
        btnBond.textContent = "❤️ Usar Laço (+1)";
    }
    gameState.updateBondDisplay();

    // Inicia tutorial se for a primeira vez
    if (!gameState.tutorialSeen) {
        startTutorialStep1();
    }
}

function closeDiceModal() {
    const modal = document.getElementById('dice-modal');
    modal.classList.remove('active');
    
    // IMPORTANTE: Reativa os cartões de decisão caso tenham sido bloqueados
    if (typeof enableDecisionCards === 'function') {
        enableDecisionCards();
    }
    
    // Reseta o contexto
    currentRollContext = {
        playerNum: null,
        attribute: 'ferro',
        bonus: 0,
        callback: null
    };
}

function useBondForRoll() {
    if (gameState.bond > 0) {
        gameState.updateBond(-1);
        currentRollContext.bonus += 1;
        
        const btn = document.getElementById('btn-use-bond');
        btn.textContent = "❤️ Laço Aplicado (+1)";
        btn.disabled = true;
    }
}

function rollDice(playerNum, remoteData = null) {
    const player = gameState.getPlayer(playerNum);
    if (!player) return;

    // Se não for dados remotos e não for meu personagem (e estivermos online), bloqueia
    if (!remoteData && !isSoloMode && myPlayerId !== 0 && player.playerId !== myPlayerId) {
        alert("Apenas o dono do personagem pode rolar os dados!");
        return;
    }
    
    // Pega o atributo e bônus do contexto
    const { attribute, bonus } = currentRollContext;
    
    // Determina o valor do atributo
    let attrValue = gameState.getStat(playerNum, attribute) || 1;
    attrValue += bonus;
    
    let d6, d10_1, d10_2;

    if (remoteData) {
        // Usar dados vindos do outro jogador
        d6 = remoteData.d6;
        d10_1 = remoteData.d10_1;
        d10_2 = remoteData.d10_2;
        // Usa o total calculado pelo outro jogador para garantir sincronia perfeita
        // e evitar bugs se os atributos locais estiverem desatualizados
    } else {
        // Gerar novos dados
        d6 = Math.ceil(Math.random() * 6);
        d10_1 = Math.ceil(Math.random() * 10);
        d10_2 = Math.ceil(Math.random() * 10);
    }
    
    const total = remoteData ? remoteData.total : (d6 + attrValue);
    
    // Determina o resultado
    let result = 'fail';
    let resultText = '';
    
    const beat1 = total > d10_1;
    const beat2 = total > d10_2;
    
    if (beat1 && beat2) {
        result = 'success';
        resultText = '✅ Sucesso Total!';
    } else if (beat1 || beat2) {
        result = 'partial';
        resultText = '🌓 Sucesso Parcial (Com Custo)';
    } else {
        result = 'fail';
        resultText = '❌ Falha';
    }
    
    // Salva o resultado atual
    lastRollResult = { result, total, d10_1, d10_2 };

    // Exibe o resultado
    displayDiceResult(d6, attrValue, total, d10_1, d10_2, result, resultText);
    
    audioManager.playSound('sfx_dice_roll');
    // Se fui eu que rolei, envia para o outro jogador ver a mesma coisa
    if (!remoteData && typeof sendDiceRoll === 'function') {
        const rollData = { d6, d10_1, d10_2, result, total, attrValue };
        sendDiceRoll(playerNum, rollData);
    }

    // Log do resultado
    gameState.log(`🎲 ${player.name} rolou: ${resultText} (${total} vs ${d10_1}/${d10_2})`, 'result');
    
    // Callback se existir
    if (currentRollContext.callback) {
        if (!gameState.tutorialSeen) {
            // Se estiver no tutorial, mostra a explicação do resultado
            showTutorialStep2(result, total, d10_1, d10_2);
            // NÃO executa o callback aqui, espera o usuário clicar em "Entendi"
        } else {
            setTimeout(() => {
                currentRollContext.callback(result, total, d10_1, d10_2);
                closeDiceModal();
            }, 2000);
        }
    }
    
    return { result, total, d10_1, d10_2 };
}

// Função chamada pelo multiplayer.js quando recebe dados
function replayRemoteDiceRoll(playerNum, rollData) {
    // Preserva o contexto atual (callback) que foi configurado pelo handleDecision
    // Isso garante que o jogo saiba avançar a cena após a rolagem
    const { attribute, bonus, callback } = currentRollContext;

    showDiceRoller(playerNum, attribute || 'ferro', bonus || 0, callback);

    // Desativa os botões de rolagem para o espectador
    const diceOptions = document.querySelectorAll('.btn-dice');
    diceOptions.forEach(btn => {
        btn.disabled = true;
        btn.style.cursor = 'not-allowed';
    });
    rollDice(playerNum, rollData);
}

function displayDiceResult(d6, attr, total, d10_1, d10_2, result, resultText) {
    // Exibe a área de resultado
    const diceResult = document.getElementById('dice-result');
    diceResult.style.display = 'block';
    
    // Atualiza os valores
    document.getElementById('d6-result').textContent = d6;
    document.getElementById('attr-result').textContent = `+${attr}`;
    document.getElementById('total-result').textContent = total;
    document.getElementById('d10-1-result').textContent = d10_1;
    document.getElementById('d10-2-result').textContent = d10_2;
    
    // Atualiza o veredito
    const verdict = document.getElementById('dice-verdict');
    verdict.textContent = resultText;
    verdict.className = `dice-verdict ${result}`;
    
    // Animação dos dados
    animateDice();
}

function animateDice() {
    const diceElements = document.querySelectorAll('.die-value');
    diceElements.forEach((el, index) => {
        el.style.animation = 'none';
        setTimeout(() => {
            el.style.animation = 'scaleIn 0.3s ease';
        }, index * 100);
    });
}

// Função helper para rolar dados em decisões
function rollForDecision(playerNum, attribute, decisionId, callback) {
    showDiceRoller(playerNum, attribute, 0, (result) => {
        if (callback) callback(result);
    });
}

// Função para calcular resultado automaticamente com atributos conhecidos
function autoRoll(playerNum, attribute, bonus = 0) {
    const player = gameState.getPlayer(playerNum);
    if (!player) return null;
    
    let attrValue = gameState.getStat(playerNum, attribute) || 1;
    
    // Aplica bônus especial se aplicável
    if (attribute === 'fogo' && player.name === 'Lyra' && bonus === 0) {
        bonus = 1; // Bônus de arqueira
    }
    
    attrValue += bonus;
    
    const d6 = Math.ceil(Math.random() * 6);
    const d10_1 = Math.ceil(Math.random() * 10);
    const d10_2 = Math.ceil(Math.random() * 10);
    
    const total = d6 + attrValue;
    
    const beat1 = total > d10_1;
    const beat2 = total > d10_2;
    
    let result = 'fail';
    if (beat1 && beat2) result = 'success';
    else if (beat1 || beat2) result = 'partial';
    
    return { result, total, d10_1, d10_2, d6, attrValue };
}

// --- Sistema de Tutorial ---

function startTutorialStep1() {
    const overlay = document.getElementById('tutorial-overlay');
    const tooltip = document.getElementById('tutorial-tooltip');
    const text = document.getElementById('tutorial-text');
    const btn = document.getElementById('tutorial-btn');
    const diceOptions = document.querySelector('.dice-options');

    overlay.classList.add('active');
    tooltip.classList.add('active');
    diceOptions.classList.add('tutorial-highlight');

    // Posiciona o tooltip
    const rect = diceOptions.getBoundingClientRect();
    tooltip.style.top = `${rect.bottom + 20}px`;
    tooltip.style.left = `${rect.left}px`;

    text.innerHTML = "<strong>1º Passo: A Ação</strong><br>Para superar desafios, role os dados. Escolha qual personagem fará a ação baseada no atributo exigido.";
    btn.style.display = 'none'; // Esconde botão, usuário deve clicar na opção de dado
}

function showTutorialStep2(result, total, d10_1, d10_2) {
    const tooltip = document.getElementById('tutorial-tooltip');
    const text = document.getElementById('tutorial-text');
    const btn = document.getElementById('tutorial-btn');
    const diceOptions = document.querySelector('.dice-options');
    const diceResult = document.getElementById('dice-result');

    // Remove destaque anterior
    diceOptions.classList.remove('tutorial-highlight');
    
    // Destaca o resultado
    diceResult.classList.add('tutorial-highlight');

    // Reposiciona tooltip
    const rect = diceResult.getBoundingClientRect();
    tooltip.style.top = `${rect.top - 150}px`; // Acima do resultado
    tooltip.style.left = `${window.innerWidth / 2 - 150}px`; // Centralizado

    text.innerHTML = `<strong>2º Passo: O Resultado</strong><br>
    Sua soma foi <strong>${total}</strong> (1d6 + Atributo).<br>
    Os desafios foram <strong>${d10_1}</strong> e <strong>${d10_2}</strong>.<br><br>
    Compare seu total com os desafios:<br>
    • Vencer 0 = Falha<br>
    • Vencer 1 = Sucesso Parcial<br>
    • Vencer 2 = Sucesso Total`;

    btn.style.display = 'block';
    btn.onclick = finishTutorial;
}

function finishTutorial() {
    gameState.tutorialSeen = true;
    gameState.save();
    
    document.getElementById('tutorial-overlay').classList.remove('active');
    document.getElementById('tutorial-tooltip').classList.remove('active');
    document.getElementById('dice-result').classList.remove('tutorial-highlight');
    
    // Executa o callback usando o resultado que JÁ foi calculado (sem rolar de novo)
    if (currentRollContext.callback && lastRollResult) {
        currentRollContext.callback(
            lastRollResult.result, 
            lastRollResult.total, 
            lastRollResult.d10_1, 
            lastRollResult.d10_2
        );
        closeDiceModal();
    }
}
