// multiplayer.js
let peer = null;
let conn = null;
let isHost = false;
let myPlayerId = 0; // 1 para Host, 2 para Cliente

function initMultiplayer() {
    // Evita recriar o Peer se já existir e estiver ativo
    if (peer && !peer.destroyed) {
        console.log("Peer já inicializado.");
        return;
    }

    peer = new Peer({ debug: 2 }); // Ativa logs para depuração de conexão
    myPlayerId = 1;
    
    peer.on('open', (id) => {
        console.log('Seu ID da sala é: ' + id);
        // Exiba isso na tela inicial para o jogador 1 copiar e enviar para o jogador 2
        document.getElementById('room-id-display').value = id; // Correção: <input> usa .value
    });

    // Tratamento de erros de conexão (Firewall, Rede, etc)
    peer.on('error', (err) => {
        console.error("Erro PeerJS:", err);
        const display = document.getElementById('room-id-display');
        if (display) {
            display.value = "Erro: " + err.type;
            display.style.borderColor = "var(--danger)";
        }
        alert("Erro de conexão: " + err.type + "\nVerifique o console (F12) ou sua rede.");
    });

    // Quando o Jogador 2 se conecta ao Jogador 1
    peer.on('connection', (connection) => {
        conn = connection;
        isHost = true;
        setupConnection();
        document.getElementById('connection-status').textContent = "✅ Jogador 2 Conectado!";
        document.getElementById('connection-status').style.color = "var(--success)";
        
        // Se o jogo já estiver rolando (Reconexão), apenas sincroniza e avisa
        if (gameState.currentScene > 0 || gameState.player1) {
            hideConnectionLostModal();
            syncGameState();
            gameState.log("♻️ Jogador 2 reconectado!");
        } else {
            setTimeout(() => startGame(), 1000); // Inicia jogo novo
        }
    });
}

function joinRoom(hostId) {
    myPlayerId = 2;
    peer = new Peer({ debug: 2 });

    peer.on('error', (err) => {
        console.error("Erro PeerJS (Join):", err);
        alert("Erro ao conectar: " + err.type);
        const btn = document.getElementById('btn-join');
        if (btn) {
            btn.textContent = "Entrar";
            btn.disabled = false;
        }
    });

    peer.on('open', () => {
        conn = peer.connect(hostId);
        isHost = false;
        setupConnection();
    });
}

function setupConnection() {
    conn.on('open', () => {
        console.log("Conectado!");
        hideConnectionLostModal(); // Remove o aviso se estiver na tela
        if (!isHost) startGame(); // Cliente inicia ao conectar
    });

    conn.on('close', () => {
        console.warn("Conexão perdida!");
        showConnectionLostModal();
    });

    conn.on('error', (err) => {
        console.error("Erro na conexão:", err);
        showConnectionLostModal();
    });

    conn.on('data', (data) => {
        // Quando recebe dados do outro jogador
        if (data.type === 'SYNC_STATE') {
            // Atualiza o estado local com o estado recebido
            Object.assign(gameState, data.state);
            gameState.updateCharacterDisplay();
            gameState.updateLogDisplay();
            loadScene(gameState.currentScene);
        }
        
        if (data.type === 'CHAR_SELECT') {
            // O outro jogador escolheu um personagem
            handleRemoteSelection(data.playerNum, data.charId);
        }

        if (data.type === 'DICE_ROLL') {
            // O outro jogador rolou os dados. Vamos replicar a animação e resultado exatos.
            // data.rollData contém { result, total, d10_1, d10_2, d6, attrValue }
            replayRemoteDiceRoll(data.playerNum, data.rollData);
        }

        if (data.type === 'DECISION_CLICK') {
            // O outro jogador clicou em uma decisão
            handleRemoteDecisionClick(data.decisionIndex);
        }

        if (data.type === 'SHOW_FLOAT') {
            showFloatingText(data.text, data.x, data.y, data.color);
        }
    });
}

function syncGameState() {
    if (conn && conn.open) {
        conn.send({
            type: 'SYNC_STATE',
            state: gameState
        });
    }
}

function sendCharacterSelection(charId) {
    if (conn && conn.open) {
        conn.send({
            type: 'CHAR_SELECT',
            playerNum: myPlayerId,
            charId: charId
        });
    }
}

function sendDiceRoll(playerNum, rollData) {
    if (conn && conn.open) {
        conn.send({
            type: 'DICE_ROLL',
            playerNum: playerNum,
            rollData: rollData
        });
    }
}

function sendDecisionClick(decisionIndex) {
    if (conn && conn.open) {
        conn.send({
            type: 'DECISION_CLICK',
            decisionIndex: decisionIndex
        });
    }
}

function sendFloatingText(text, x, y, color) {
    if (conn && conn.open) {
        conn.send({ type: 'SHOW_FLOAT', text, x, y, color });
    }
}

function copyRoomId() {
    const input = document.getElementById('room-id-display');
    if (!input || !input.value || input.value.includes("...")) return;

    navigator.clipboard.writeText(input.value).then(() => {
        const btn = document.getElementById('btn-copy');
        if (btn) {
            const originalText = btn.textContent;
            btn.textContent = "✅ Copiado!";
            setTimeout(() => btn.textContent = originalText, 2000);
        }
    }).catch(err => {
        console.error("Erro ao copiar:", err);
        alert("Selecione o ID e pressione Ctrl+C para copiar.");
    });
}
