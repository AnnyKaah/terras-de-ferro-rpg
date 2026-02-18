// js/multiplayer.js - Sistema de Multiplayer com PeerJS

const multiplayer = {
    peer: null,
    conn: null,
    myId: null,
    isHost: false,
    hostPeerId: null,
    retryCount: 0,
    maxRetries: 5,

    init() {
        this.disconnect(); // Limpa conexões anteriores para evitar conflitos
        console.log('🌐 Inicializando multiplayer como HOST...');
        this.isHost = true;
        this.peer = new Peer();
        
        this.peer.on('open', (id) => {
            this.myId = id;
            console.log('✅ Peer ID gerado:', id);
            
            // Exibe ID na tela
            const displayEl = document.getElementById('room-id-display');
            if (displayEl) {
                displayEl.value = id;
            }
            
            // Mostra painel de host
            const hostInfo = document.getElementById('host-info');
            if (hostInfo) {
                hostInfo.style.display = 'block';
            }
            
            game.notify('🎮 Sala criada! Compartilhe o ID com seu parceiro.', 'success');
        });
        
        this.peer.on('connection', (conn) => {
            console.log('🤝 Jogador 2 conectando...');
            this.conn = conn;
            this.setupConnection();
        });
        
        this.peer.on('error', (err) => {
            console.error('❌ Erro no PeerJS:', err);
            game.notify('Erro na conexão: ' + err.type, 'error');
        });
    },

    join(peerId, isRetry = false) {
        if (!isRetry) {
            this.retryCount = 0; // Reseta contagem se for uma nova tentativa manual
        }
        
        this.disconnect(); // Limpa conexões anteriores
        
        peerId = peerId.trim(); // Garante que não há espaços extras
        console.log(`🌐 Tentando conectar ao host: ${peerId} (Tamanho: ${peerId.length})`);
        this.isHost = false;
        this.hostPeerId = peerId; // Armazena ID do host para reconexão
        // Nota: myId será definido quando o peer abrir, mas para clientes, o ID é gerado automaticamente
        this.peer = new Peer();
        
        this.peer.on('open', () => {
            console.log('✅ Peer inicializado, conectando...');
            this.conn = this.peer.connect(peerId);
            this.setupConnection();
        });
        this.peer.on('open', (id) => { this.myId = id; }); // Garante que myId seja setado no cliente
        
        this.peer.on('error', (err) => {
            console.error('❌ Erro ao conectar:', err);
            
            // Se o ID não existe, falha imediatamente sem retry
            if (err.type === 'peer-unavailable') {
                game.notify('❌ ID da sala não encontrado ou Host offline.', 'error');
                return;
            }

            if (this.retryCount < this.maxRetries) {
                this.attemptReconnect();
            } else {
                game.notify('Erro: Não foi possível conectar. Verifique o ID.', 'error');
                setTimeout(() => location.reload(), 3000);
            }
        });
    },

    setupConnection() {
        if (!this.conn) {
            console.error('❌ Conexão não definida');
            return;
        }

        const conn = this.conn; // Captura referência local para evitar conflitos
        
        conn.on('open', () => {
            console.log('🟢 Conexão estabelecida!');
            this.retryCount = 0; // Reseta contagem de retries
            game.notify('✅ Conexão estabelecida!', 'success');
            
            // Atualiza status na UI
            const statusEl = document.getElementById('connection-status');
            if (statusEl) {
                statusEl.textContent = '🟢 Jogador 2 Conectado!';
                statusEl.style.color = '#10b981';
                statusEl.style.fontWeight = 'bold';
            }
            
            // Se for jogador 2, notifica que conectou
            if (!this.isHost) {
                this.send({ type: 'PLAYER_JOINED' });
            }
        });
        
        conn.on('data', (data) => {
            console.log('📥 Dados recebidos:', data);
            this.handleData(data);
        });
        
        conn.on('close', () => {
            if (this.conn !== conn) return; // Ignora eventos de conexões antigas

            console.log('🔴 Conexão fechada');
            
            if (!this.isHost && this.hostPeerId) {
                game.notify('⚠️ Conexão perdida com o Host.', 'warning');
                this.attemptReconnect();
            } else {
                game.notify('⚠️ Jogador desconectou', 'warning');
            }
        });
        
        conn.on('error', (err) => {
            console.error('❌ Erro na conexão:', err);
        });
    },

    attemptReconnect() {
        this.retryCount++;
        if (this.retryCount > this.maxRetries) {
            game.notify('❌ Falha definitiva na reconexão.', 'error');
            return;
        }

        game.notify(`🔄 Tentando reconectar... (${this.retryCount}/${this.maxRetries})`, 'warning');
        
        setTimeout(() => {
            this.join(this.hostPeerId, true); // Passa true para indicar que é um retry
        }, 2000);
    },

    handleData(data) {
        switch(data.type) {
            case 'PLAYER_JOINED':
                console.log('👤 Jogador 2 entrou na sala');
                if (this.isHost) {
                    game.notify('Jogador 2 conectado!', 'success');
                    // Envia estado atual para sincronizar o cliente reconectado
                    if (game.setupState && game.setupState.phase !== 'GAME') {
                        game.syncSetupState();
                    } else {
                        this.send({
                            type: 'SYNC_FULL_STATE',
                            state: gameState
                        });
                        // Sincroniza Boss se houver
                        if (gameState.bossProgress > 0) this.send({ type: 'SYNC_BOSS', value: gameState.bossProgress });
                    }
                }
                break;
                
            // Mensagens de Setup (Cliente -> Host)
            case 'CLIENT_SELECT_CHAR':
                if (game.isHost) {
                    console.log('📥 Cliente quer selecionar char:', data.charId);
                    game.processCharSelection(2, data.charId);
                }
                break;

            case 'CLIENT_SELECT_ASSET':
                if (game.isHost) {
                    console.log('📥 Cliente quer selecionar ativo:', data.assetId);
                    game.processAssetSelection(2, data.assetId);
                }
                break;

            // Mensagens de Estado (Host -> Cliente)
            case 'SETUP_UPDATE':
            case 'PHASE_CHANGE':
                
            case 'DECISION_MADE':
                // Encaminha para o game.js
                if (typeof game !== 'undefined') game.handleNetworkMessage(data);
                break;
                
            case 'DICE_ROLLED':
                console.log('🎲 Dados rolados remotamente:', data);
                if (typeof dice !== 'undefined') dice.roll(data.rollData.playerNum, data.rollData);
                break;
                
            case 'SYNC_STATE':
                console.log('🔄 Sincronizando estado:', data);
                // Sincroniza estado do jogo
                if (data.state) {
                    Object.assign(gameState, data.state);
                    ui.updateCharacterDisplay();
                    ui.updateProgress();
                }
                break;
                
            case 'SYNC_FULL_STATE':
                if (data.state) {
                    // Mescla o estado com cuidado para não sobrescrever identidade local
                    const localP1 = gameState.player1; // Preserva referências se necessário
                    // Object.assign(gameState, data.state);
                    if (data.state.player1) {
                        gameState.player1 = data.state.player1;
                        console.log('🔄 Player 1 atualizado via SYNC_FULL_STATE');
                    }
                    if (data.state.player2) {
                        gameState.player2 = data.state.player2;
                        console.log('🔄 Player 2 atualizado via SYNC_FULL_STATE');
                    }
                    if (data.state.inventory) gameState.inventory = data.state.inventory;
                    ui.updateCharacterDisplay();
                    ui.updateProgress();
                }
                break;

            default:
                // Encaminha tipos não tratados para o game.js (START_GAME, GOTO_ASSETS, etc)
                if (typeof game !== 'undefined' && game.handleNetworkMessage) {
                    game.handleNetworkMessage(data);
                } else {
                    console.log('❓ Tipo de dado desconhecido:', data.type);
                }
        }
    },

    send(data) {
        if (this.conn && this.conn.open) {
            console.log('📤 Enviando dados:', data);
            this.conn.send(data);
        } else {
            console.warn('⚠️ Conexão não disponível para envio');
        }
    },

    copyRoomId() {
        const copyText = document.getElementById('room-id-display');
        if (!copyText) {
            console.error('❌ Elemento room-id-display não encontrado');
            return;
        }
        
        copyText.select();
        copyText.setSelectionRange(0, 99999); // Para mobile
        
        try {
            // Método moderno
            navigator.clipboard.writeText(copyText.value).then(() => {
                game.notify('📋 ID copiado!', 'success');
            }).catch(() => {
                // Fallback para navegadores antigos
                document.execCommand('copy');
                game.notify('📋 ID copiado!', 'success');
            });
        } catch (err) {
            console.error('❌ Erro ao copiar:', err);
            game.notify('❌ Erro ao copiar. Copie manualmente: ' + copyText.value, 'error');
        }
    },

    disconnect() {
        // Tenta avisar o outro lado antes de fechar
        if (this.conn && this.conn.open) {
            try { this.conn.close(); } catch(e) {}
        }

        if (this.conn) {
            this.conn.close();
            this.conn = null;
        }
        if (this.peer) {
            this.peer.destroy();
            this.peer = null;
        }
        
        this.isHost = false;
        this.hostPeerId = null;
        this.retryCount = 0;
        
        console.log('🔴 Multiplayer desconectado');
    }
};

// Sincronização automática de estado (se em multiplayer)
setInterval(() => {
    if (multiplayer.isHost && multiplayer.conn && multiplayer.conn.open) {
        multiplayer.send({
            type: 'SYNC_STATE',
            state: {
                progress: gameState.progress,
                currentScene: gameState.currentScene
            }
        });
    }
}, 5000); // Sincroniza a cada 5 segundos