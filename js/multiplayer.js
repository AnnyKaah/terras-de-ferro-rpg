// multiplayer.js
let peer = null;
let conn = null;
let isHost = false;

function initMultiplayer() {
    peer = new Peer(); // Cria um ID único aleatório
    
    peer.on('open', (id) => {
        console.log('Seu ID da sala é: ' + id);
        // Exiba isso na tela inicial para o jogador 1 copiar e enviar para o jogador 2
        document.getElementById('room-id-display').textContent = id;
    });

    // Quando o Jogador 2 se conecta ao Jogador 1
    peer.on('connection', (connection) => {
        conn = connection;
        isHost = true;
        setupConnection();
        alert("O outro jogador entrou na sala!");
        syncGameState(); // O Host manda o save atual pro cliente
    });
}

function joinRoom(hostId) {
    peer = new Peer();
    peer.on('open', () => {
        conn = peer.connect(hostId);
        isHost = false;
        setupConnection();
    });
}

function setupConnection() {
    conn.on('open', () => {
        console.log("Conectado!");
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
