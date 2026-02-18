// js/game.js - Lógica Principal do Jogo

const game = {
    mode: 'offline', // 'offline' ou 'online'
    isHost: false,
    currentPlayer: 1,
    selectedChars: { p1: null, p2: null },
    selectedAssets: { p1: null, p2: null },
    // Novo estado de setup compartilhado
    setupState: {
        phase: 'CHAR_SELECT', // CHAR_SELECT, ASSET_SELECT, GAME
        ready: { p1: false, p2: false }
    },

    init() {
        // Injeta helpers de UI se o objeto ui existir (para efeitos visuais e boss)
        if (typeof ui !== 'undefined') {
            ui.triggerDamageEffect = () => {
                const app = document.getElementById('game-screen') || document.body;
                app.classList.add('shake-effect');
                setTimeout(() => app.classList.remove('shake-effect'), 500);
            };
            
            ui.updateBossDisplay = () => {
                this.updateBossUI();
            };
        }

        // Garante que a tela inicial seja mostrada ao carregar
        ui.showScreen('start-screen');
    },

    // ============================================
    // MENU INICIAL
    // ============================================

    hostGame() {
        this.mode = 'online';
        this.isHost = true;
        multiplayer.init();
        ui.showScreen('character-screen');
        this.renderCharacterCards();
    },

    joinGameUI() {
        const id = document.getElementById('join-id-input').value.trim();
        if (!id) {
            this.notify('Digite um ID válido!', 'error');
            return;
        }
        this.mode = 'online';
        this.isHost = false;
        multiplayer.join(id);
        ui.showScreen('character-screen');
        this.renderCharacterCards();
    },

    startOfflineGame() {
        this.mode = 'offline';
        ui.showScreen('character-screen');
        this.renderCharacterCards();
    },

    // ============================================
    // SELEÇÃO DE PERSONAGENS
    // ============================================

    renderCharacterCards() {
        const container = document.querySelector('.characters-grid');
        container.innerHTML = Object.keys(CHARACTERS).map(id => {
            const char = CHARACTERS[id];
            
            // Lógica de Estado Compartilhado
            const myPlayerKey = `p${this.currentPlayer}`;
            const otherPlayerKey = this.currentPlayer === 1 ? 'p2' : 'p1';
            
            let isLocked = false;
            let lockedBy = "";
            let btnText = "Selecionar";
            let btnClass = "btn-select";
            let isSelectedByMe = false;

            if (this.mode === 'offline') {
                // Modo Offline: Mostra status de P1 e P2
                if (this.selectedChars.p1 === id) {
                    btnClass += " active";
                    btnText = "✅ Jogador 1";
                } else if (this.selectedChars.p2 === id) {
                    btnClass += " active";
                    btnText = "✅ Jogador 2";
                }
            } else {
                // Modo Online: Lógica de Estado Compartilhado
                isSelectedByMe = this.selectedChars[myPlayerKey] === id;
                const isSelectedByOther = this.selectedChars[otherPlayerKey] === id;

                if (isSelectedByOther) {
                    isLocked = true;
                    lockedBy = `Bloqueado (${this.currentPlayer === 1 ? 'Jogador 2' : 'Jogador 1'})`;
                    btnText = "⛔ Ocupado";
                } else if (isSelectedByMe) {
                    btnClass += " active";
                    btnText = "✅ Selecionado";
                }
            }
            
            return `
                <div class="char-card ${isSelectedByMe ? 'selected' : ''} ${isLocked ? 'locked' : ''}" data-char="${id}">
                    <div class="char-avatar">
                        <div class="char-avatar-circle">
                            <img src="${char.avatar}" alt="${char.name}" onerror="this.style.display='none';this.parentNode.innerHTML='<span class=\\'char-icon\\'>${char.icon}</span>'">
                        </div>
                    </div>
                    <div class="char-header">
                        <h3>${char.name}</h3>
                        <p class="char-role">${char.role}</p>
                    </div>
                    <div class="char-stats-row">
                        ${Object.entries(char.stats).map(([stat, val]) => `
                            <div class="stat-badge ${val === 3 ? 'highlight' : ''}" data-tooltip="${this.getStatDescription(stat)}">
                                <span class="stat-icon">${this.getStatIcon(stat)}</span>
                                <span class="stat-value">${val}</span>
                            </div>
                        `).join('')}
                    </div>
                    <div class="char-special">${char.special}</div>
                    <div class="char-actions">
                        <button class="${btnClass}" 
                                onclick="game.selectChar('${id}')" ${isLocked ? 'disabled' : ''}>
                            ${btnText}
                        </button>
                    </div>
                </div>
            `;
        }).join('');
    },

    getStatIcon(stat) {
        const icons = {
            fogo: '🔥',
            sombra: '🌑',
            ferro: '⚔️',
            coracao: '❤️',
            engenho: '🔧'
        };
        return icons[stat] || '⭐';
    },

    getStatDescription(stat) {
        const descriptions = {
            fogo: 'Rapidez, agilidade e combate à distância.',
            sombra: 'Furtividade, mentiras e astúcia.',
            ferro: 'Força, agressividade e resistência.',
            coracao: 'Coragem, lealdade e empatia.',
            engenho: 'Percepção, sobrevivência e conhecimento.'
        };
        return descriptions[stat] || '';
    },

    selectChar(charId) {
        if (this.mode === 'online' && !this.isHost) {
            // Cliente envia intenção para o Host
            multiplayer.send({
                type: 'CLIENT_SELECT_CHAR',
                charId: charId,
                playerId: this.currentPlayer
            });
        } else {
            // Host (ou Offline) processa a lógica
            let targetPlayer = this.currentPlayer;
            
            if (this.mode === 'offline') {
                // Lógica inteligente para Offline: Preencher slots ou trocar
                if (this.selectedChars.p1 === charId) targetPlayer = 1;
                else if (this.selectedChars.p2 === charId) targetPlayer = 2;
                else if (!this.selectedChars.p1) targetPlayer = 1;
                else if (!this.selectedChars.p2) targetPlayer = 2;
                else {
                    this.notify("Ambos os heróis já foram escolhidos! Desmarque um para trocar.", "warning");
                    return;
                }
            }
            
            this.processCharSelection(targetPlayer, charId);
        }
    },

    // Host processa a seleção (Autoridade)
    processCharSelection(playerNum, charId) {
        const key = `p${playerNum}`;
        const otherKey = playerNum === 1 ? 'p2' : 'p1';

        // Validação: Personagem já tomado pelo outro?
        if (this.selectedChars[otherKey] === charId) {
            if (this.isHost) this.notify(`Conflito: ${charId} já selecionado!`, 'error');
            return; // Rejeita
        }

        // Toggle ou Seleção
        if (this.selectedChars[key] === charId) {
            this.selectedChars[key] = null; // Deselecionar
            gameState[`player${playerNum}`] = null;
            // Remove do gameState para limpar lixo
        } else {
            this.selectedChars[key] = charId;
            gameState.initPlayer(playerNum, charId);
        }

        this.updateCharSelection();

        // Se online, Host sincroniza o estado com Cliente
        if (this.mode === 'online' && this.isHost) {
            this.syncSetupState();
        }
    },

    updateCharSelection() {
        // Atualiza visual dos cards
        this.renderCharacterCards();
        
        // Atualiza status
        const status = document.getElementById('selection-status');
        let html = '';
        
        if (this.selectedChars.p1) {
            const char = CHARACTERS[this.selectedChars.p1];
            html += `<div class="selection-tag p1">👤 Jogador 1: ${char.icon} ${char.name}</div>`;
        }
        
        if (this.selectedChars.p2) {
            const char = CHARACTERS[this.selectedChars.p2];
            html += `<div class="selection-tag p2">👤 Jogador 2: ${char.icon} ${char.name}</div>`;
        }
        
        status.innerHTML = html;
        
        // Habilita botão de confirmação
        const confirmBtn = document.getElementById('confirm-chars');
        let canConfirm = false;

        // Regra: Só avança se AMBOS escolherem
        if (this.selectedChars.p1 && this.selectedChars.p2) {
            canConfirm = true;
        }

        if (canConfirm) {
            // Apenas Host vê o botão habilitado para avançar fase
            if (this.isHost || this.mode === 'offline') {
                confirmBtn.style.display = 'block';
                confirmBtn.textContent = "✅ Iniciar Juramento";
                confirmBtn.disabled = false;
                confirmBtn.onclick = () => this.confirmCharacters();
            } else {
                // Cliente vê status
                confirmBtn.style.display = 'block';
                confirmBtn.textContent = "Aguardando Host avançar...";
                confirmBtn.disabled = true;
            }
        } else {
            confirmBtn.style.display = 'none';
        }
        
        // Mostra botão de desfazer
        document.getElementById('undo-selection').style.display = 
            (this.selectedChars.p1 || this.selectedChars.p2) ? 'block' : 'none';
    },

    undoCharacterSelection() {
        this.selectedChars = { p1: null, p2: null };
        gameState.player1 = null;
        gameState.player2 = null;
        this.updateCharSelection();
    },

    confirmCharacters() {
        // Host avança a fase
        if (this.mode === 'online' && this.isHost) {
            this.setupState.phase = 'ASSET_SELECT';
            this.syncSetupState();
            multiplayer.send({ type: 'PHASE_CHANGE', screen: 'asset-screen' });
        }

        console.log('TODO: Avançando para Seleção de Ativos');
        ui.showScreen('asset-screen');
        ui.renderAssets(ASSETS_DATA);
    },

    // ============================================
    // SELEÇÃO DE ATIVOS
    // ============================================

    selectAsset(assetId) {
        if (this.mode === 'online' && !this.isHost) {
            multiplayer.send({
                type: 'CLIENT_SELECT_ASSET',
                assetId: assetId,
                playerId: this.currentPlayer
            });
        } else {
            this.processAssetSelection(this.currentPlayer, assetId);
        }
    },

    processAssetSelection(playerNum, assetId) {
        const key = `p${playerNum}`;
        
        // Atualiza seleção
        this.selectedAssets[key] = assetId;
        gameState.addAsset(playerNum, assetId);
        
        ui.updateAssetStatus();
        
        // Sincroniza se for Host
        if (this.mode === 'online' && this.isHost) {
            this.syncSetupState();
        }

        // Verifica se ambos escolheram para habilitar botão
        if (this.selectedAssets.p1 && this.selectedAssets.p2) {
            const btn = document.getElementById('confirm-assets');
            if (this.isHost || this.mode === 'offline') {
                btn.style.display = 'block';
                btn.textContent = "🎭 Começar Aventura";
                btn.disabled = false;
            } else {
                btn.style.display = 'block';
                btn.textContent = "Aguardando Host...";
                btn.disabled = true;
            }
        }
    },

    finishSetup() {
        if (this.mode === 'online') {
            if (this.isHost) {
                this.setupState.phase = 'GAME';
                multiplayer.send({ type: 'START_GAME' }); // Mantendo compatibilidade
                this.startGame();
            } else {
                // Cliente não clica aqui, ele espera o evento START_GAME
            }
        } else {
            this.startGame();
        }
    },

    startGame() {
        // Verificação de segurança antes de iniciar
        if (!gameState.player1 || (!gameState.player2 && this.mode === 'online')) {
            console.error("❌ Erro Crítico: Jogadores não inicializados no startGame", gameState);
            
            if (this.mode === 'online' && !this.isHost) {
                this.notify("Erro de sincronização. Tentando recuperar...", "error");
                multiplayer.send({ type: 'PLAYER_JOINED' }); // Força resync
            } else {
                this.notify("Erro de estado. Reiniciando setup...", "error");
                setTimeout(() => location.reload(), 2000);
            }
            return;
        }
        ui.showScreen('game-screen');
        ui.updateCharacterDisplay();
        ui.updateProgress();
        this.loadScene(0);
        this.notify('🎭 A saga começa...', 'info');
    },

    // ============================================
    // GAMEPLAY - CENAS
    // ============================================

    loadScene(index, withTransition = true) {
        if (index >= SCENES.length) {
            this.showEnding();
            return;
        }
        
        const performLoad = () => {
            // Só reseta o boss se estivermos entrando em uma NOVA cena
            const scene = SCENES[index];
            if (scene.boss && index !== gameState.currentScene) {
                gameState.maxBossProgress = scene.boss.maxHP || scene.boss.health;
                gameState.bossProgress = 0;
            }

            gameState.currentScene = index;
            gameState.maxSceneReached = Math.max(gameState.maxSceneReached, index);
            
            ui.renderScene(scene);
            
            gameState.addLog(`📍 ${scene.title}`, 'scene');
        };

        if (withTransition) {
            const overlay = document.getElementById('transition-overlay');
            if (overlay) {
                overlay.classList.add('active');
                setTimeout(() => {
                    performLoad();
                    setTimeout(() => overlay.classList.remove('active'), 500);
                }, 500);
            } else {
                performLoad();
            }
        } else {
            performLoad();
        }
    },

    handleDecision(decisionIndex) {
        if (gameState.isResolving) return;
        
        const scene = SCENES[gameState.currentScene];
        const decision = scene.decisions[decisionIndex];
        
        if (!decision) return;
        
        gameState.isResolving = true;
        gameState.addLog(`🎯 Escolha: ${decision.title}`, 'decision');

        // MULTIPLAYER: Envia decisão para o outro jogador
        if (this.mode === 'online' && typeof multiplayer !== 'undefined') {
            multiplayer.send({
                type: 'DECISION_MADE',
                decisionIndex: decisionIndex,
                origin: multiplayer.myId
            });
        }
        
        if (decision.requiresRoll) {
            const { playerNum, attribute, bonus } = decision.rollInfo;
            dice.showDiceRoller(playerNum, attribute, bonus || 0, (result) => {
                this.applyDecisionResult(decision, result);
            });
        } else {
            // Decisão narrativa sem rolagem
            setTimeout(() => {
                this.applyDecisionResult(decision, 'success');
            }, 500);
        }
    },

    applyDecisionResult(decision, result) {
        const outcome = decision.outcomes[result];
        
        if (outcome) {
            gameState.addLog(`📜 ${outcome}`, 'outcome');
        }
        
        // Aplica efeitos
        if (decision.effects && decision.effects[result]) {
            this.applyEffects(decision.effects[result]);
        }
        
        // Adiciona entrada no diário
        const scene = SCENES[gameState.currentScene];
        gameState.addJournalEntry(scene.title, decision.title, outcome, result);
        
        // Avança
        setTimeout(() => {
            gameState.isResolving = false;
            
            const scene = SCENES[gameState.currentScene];
            let shouldAdvance = true;

            // Verifica se deve ficar na cena (ex: combate ou loja)
            if (decision.stayInScene) {
                shouldAdvance = false;
                // Se for Boss, só avança se derrotado
                if (scene.boss && gameState.bossProgress >= gameState.maxBossProgress) {
                    shouldAdvance = true;
                    this.notify(`☠️ ${scene.boss.name} derrotado!`, 'success');
                }
            }

            if (shouldAdvance) {
                const nextIndex = decision.nextScene !== undefined ? decision.nextScene : gameState.currentScene + 1;
                this.loadScene(nextIndex, true); // Com transição
            } else {
                this.loadScene(gameState.currentScene, false); // Sem transição (apenas update UI)
            }

            // Troca de turno automática no modo offline
            if (this.mode === 'offline') {
                this.currentPlayer = this.currentPlayer === 1 ? 2 : 1;
                const p = gameState.getPlayer(this.currentPlayer);
                if (p) {
                    this.notify(`Vez de ${p.name}`, 'info');
                    ui.updateCharacterDisplay();
                }
            }
        }, 2000);
    },

    applyEffects(effects) {
        // Progresso
        if (effects.progress) {
            gameState.addProgress(effects.progress);
        }
        
        // Status dos jogadores
        ['health', 'spirit', 'supplies', 'momentum'].forEach(stat => {
            if (effects[stat] !== undefined) {
                if (effects[`${stat}Both`]) {
                    gameState.updateStatus(1, stat, effects[stat]);
                    gameState.updateStatus(2, stat, effects[stat]);
                } else if (effects.player) {
                    gameState.updateStatus(effects.player, stat, effects[stat]);
                }
            }
        });
        
        // Laços
        if (effects.bond) {
            gameState.updateBond(effects.bond);
        }
        
        // Itens
        if (effects.addItem) {
            gameState.addItem(effects.addItem, effects.itemOwner || 1);
        }
        
        if (effects.removeItem) {
            gameState.removeItem(effects.removeItem);
        }
        
        // Conquistas
        if (effects.achievement) {
            gameState.unlockAchievement(effects.achievement);
        }
        
        // Boss
        if (effects.bossProgress) {
            gameState.updateBossProgress(effects.bossProgress);
            // Sincroniza progresso do chefe se estiver online
            if (this.mode === 'online' && typeof multiplayer !== 'undefined') {
                multiplayer.send({ 
                    type: 'SYNC_BOSS', 
                    value: gameState.bossProgress 
                });
            }
        }

        // Sincroniza inventário e status após efeitos
        if (this.mode === 'online' && typeof multiplayer !== 'undefined') {
            multiplayer.send({
                type: 'SYNC_FULL_STATE',
                state: gameState
            });
        }
    },

    // ============================================
    // GERENCIAMENTO DE ITENS (Novo)
    // ============================================

    useItem(uniqueId) {
        const item = gameState.inventory.find(i => i.id === uniqueId);
        if (!item) return;

        if (item.consumable && item.use) {
            // Aplica efeito
            const effect = {};
            effect[item.use.effect] = item.use.amount;
            
            // Determina alvo (simplificado para self por enquanto)
            gameState.updateStatus(item.owner, item.use.effect, item.use.amount);
            
            // Log e Remoção
            gameState.addLog(item.use.log || `Item usado: ${item.name}`, 'success');
            gameState.removeItem(item); // Remove o objeto específico
            
            ui.showInventory(); // Atualiza modal
            ui.updateCharacterDisplay();
        }
    },

    toggleEquipItem(uniqueId) {
        const item = gameState.inventory.find(i => i.id === uniqueId);
        if (!item) return;

        // Se for equipar, verifica conflitos de slot (ex: impedir duas armaduras)
        if (!item.equipped && item.slot) {
            let conflictingSlots = [item.slot];

            // Regra de Duas Mãos vs Mão Direita
            if (item.slot === 'duas_maos') {
                conflictingSlots.push('mao_direita');
            } else if (item.slot === 'mao_direita') {
                conflictingSlots.push('duas_maos');
            }

            const conflicts = gameState.inventory.filter(i => 
                i.owner === item.owner && 
                i.equipped && 
                conflictingSlots.includes(i.slot) &&
                i.id !== item.id
            );

            conflicts.forEach(conflict => {
                conflict.equipped = false;
                gameState.addLog(`🎒 ${conflict.name} foi desequipado.`, 'info');
            });
        }

        // Alterna estado
        item.equipped = !item.equipped;
        
        const status = item.equipped ? 'equipado' : 'desequipado';
        const icon = item.equipped ? '⚔️' : '🎒';
        
        gameState.addLog(`${icon} ${item.name} foi ${status}.`, 'info');
        
        ui.showInventory(); // Atualiza lista
        ui.updateCharacterDisplay(); // Atualiza stats na sidebar
    },

    // ============================================
    // NAVEGAÇÃO E UTILIDADES
    // ============================================

    travelToScene(index) {
        if (index > gameState.maxSceneReached) {
            this.notify('Esta cena ainda está bloqueada!', 'warning');
            return;
        }
        
        ui.closeModal('map-modal');
        this.loadScene(index);
    },

    restartCurrentScene() {
        // Restaura status parcialmente
        [1, 2].forEach(num => {
            // Usa o método centralizado para garantir limites e feedback visual
            gameState.updateStatus(num, 'health', 2);
            gameState.updateStatus(num, 'spirit', 2);
        });
        
        this.notify('Você recuperou o fôlego.', 'info');
        ui.updateCharacterDisplay();
        ui.showScreen('game-screen');
        this.loadScene(gameState.currentScene);
    },

    requestLeaveGame() {
        ui.openModal('leave-confirm-modal');
    },

    confirmLeaveGame() {
        if (this.mode === 'online' && typeof multiplayer !== 'undefined') {
            multiplayer.disconnect();
        }
        
        // Reseta estado local
        gameState.reset();
        this.selectedChars = { p1: null, p2: null };
        this.selectedAssets = { p1: null, p2: null };
        this.setupState = { phase: 'CHAR_SELECT', ready: { p1: false, p2: false } };
        
        location.reload(); // Recarrega para garantir estado limpo
    },

    returnToMenu() {
        // Removemos o save manual para evitar salvar estados corrompidos no meio da cena.
        this.confirmLeaveGame();
    },

    showEnding() {
        const progress = gameState.progress;
        const maxProgress = gameState.maxProgress;
        
        let endingType = 'defeat';
        if (progress >= maxProgress) endingType = 'victory';
        else if (progress >= maxProgress * 0.6) endingType = 'partial';
        
        const container = document.getElementById('scene-container');
        const decisionsContainer = document.getElementById('decision-container');
        
        if (endingType === 'victory') {
            container.innerHTML = `
                <div class="ending-container victory">
                    <div class="ending-icon">👑</div>
                    <h2>Juramento Cumprido</h2>
                    <p>Vocês prevaleceram onde muitos falharam. As Terras de Ferro se lembrarão de sua coragem.</p>
                    <div class="stats-final">
                        <div>📊 Progresso: ${progress}/${maxProgress}</div>
                        <div>🏆 Conquistas: ${gameState.unlockedAchievements.length}</div>
                        <div>❤️ Laços: ${gameState.bond}</div>
                    </div>
                </div>
            `;
            
            gameState.unlockAchievement('lenda');
        } else if (endingType === 'partial') {
            container.innerHTML = `
                <div class="ending-container partial">
                    <div class="ending-icon">⚔️</div>
                    <h2>Jornada Interrompida</h2>
                    <p>Vocês lutaram bravamente, mas a jornada termina aqui. Talvez outro dia...</p>
                </div>
            `;
        } else {
            ui.showScreen('game-over-screen');
            return;
        }
        
        decisionsContainer.innerHTML = `
            <button class="btn-primary" onclick="game.returnToMenu()">Voltar ao Menu</button>
        `;
    },

    triggerGameOver(playerNum) {
        const p = gameState.getPlayer(playerNum);
        this.notify(`☠️ ${p.name} caiu em combate!`, 'error');
        ui.showScreen('game-over-screen');
        // Opcional: Enviar evento de Game Over para o multiplayer
    },

    // ============================================
    // SISTEMA DE CHAT E ORÁCULO
    // ============================================

    useSpecialAbility() {
        // Implementar habilidades especiais dos personagens
        this.notify('Habilidade especial em desenvolvimento!', 'info');
    },

    // ============================================
    // NOTIFICAÇÕES
    // ============================================

    notify(message, type = 'info') {
        const container = document.getElementById('toast-container');
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        
        const icons = {
            success: '✅',
            error: '❌',
            warning: '⚠️',
            info: 'ℹ️'
        };
        
        toast.innerHTML = `${icons[type] || 'ℹ️'} ${message}`;
        container.appendChild(toast);
        
        setTimeout(() => toast.classList.add('show'), 10);
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    },

    // ============================================
    // REDE E UI AUXILIAR
    // ============================================

    handleNetworkMessage(data) {
        // Chamado pelo multiplayer.js quando recebe dados
        switch (data.type) {
            case 'SETUP_UPDATE':
                // Cliente recebe estado completo do setup
                this.selectedChars = data.setupData.selectedChars;
                this.selectedAssets = data.setupData.selectedAssets;
                this.setupState = data.setupData.setupState;
                
                // CRÍTICO: Sincroniza o gameState (players) para evitar crash no start
                if (data.setupData.gameState) {
                    // Mesclagem profunda segura para garantir que player1 e player2 sejam objetos válidos
                    if (data.setupData.gameState.player1) {
                        gameState.player1 = data.setupData.gameState.player1;
                        console.log('✅ Player 1 sincronizado:', gameState.player1.name);
                    }
                    if (data.setupData.gameState.player2) {
                        gameState.player2 = data.setupData.gameState.player2;
                        console.log('✅ Player 2 sincronizado:', gameState.player2.name);
                    }
                    
                    // Copia outras propriedades essenciais
                    gameState.inventory = data.setupData.gameState.inventory || [];
                    gameState.progress = data.setupData.gameState.progress || 0;
                    gameState.currentScene = data.setupData.gameState.currentScene || 0;
                    // Object.assign(gameState, data.setupData.gameState); // Pode ser perigoso se sobrescrever métodos
                }
                
                // Atualiza UI baseada no novo estado
                if (this.setupState.phase === 'CHAR_SELECT') {
                    ui.showScreen('character-screen'); // Garante tela certa (Late Join)
                    this.updateCharSelection();
                } else if (this.setupState.phase === 'ASSET_SELECT') {
                    ui.showScreen('asset-screen'); // Garante tela certa (Late Join)
                    ui.renderAssets(ASSETS_DATA);
                    ui.updateAssetStatus();
                    // Verifica botão do cliente
                    if (this.selectedAssets.p1 && this.selectedAssets.p2) {
                        const btn = document.getElementById('confirm-assets');
                        btn.style.display = 'block';
                        btn.textContent = "Aguardando Host...";
                        btn.disabled = true;
                    }
                }
                break;

            case 'PHASE_CHANGE':
                // Avanço forçado de tela
                console.log('TODO: Mudança de fase para', data.screen);
                ui.showScreen(data.screen);
                if (data.screen === 'asset-screen') {
                    ui.renderAssets(ASSETS_DATA);
                }
                break;

            case 'START_GAME':
                // Fecha modais que possam estar abertos
                document.querySelectorAll('.modal').forEach(m => m.classList.remove('active'));
                this.startGame();
                break;
            case 'SYNC_BOSS':
                if (gameState) {
                    gameState.bossProgress = data.value;
                    if (ui && ui.updateBossDisplay) ui.updateBossDisplay();
                }
                break;
            case 'DECISION_MADE':
                // Evita loop infinito verificando se já estamos resolvendo
                if (!gameState.isResolving) this.handleDecision(data.decisionIndex);
                break;
            
            case 'ERROR_NOTIFY':
                this.notify(data.message, 'error');
                break;
        }
    },

    // Host envia estado atual para Cliente
    syncSetupState() {
        multiplayer.send({
            type: 'SETUP_UPDATE',
            setupData: {
                selectedChars: this.selectedChars,
                selectedAssets: this.selectedAssets,
                setupState: this.setupState,
                gameState: gameState // Envia os objetos de jogador inicializados
            }
        });
    },

    updateBossUI() {
        // Procura ou cria container do boss se a cena atual tiver um
        const scene = SCENES[gameState.currentScene];
        if (!scene || !scene.boss) return;

        let container = document.getElementById('boss-ui-container');
        if (!container) {
            // Se não existe, o renderScene deveria ter criado, ou injetamos aqui
            // Assumindo que renderScene cria a estrutura básica com id 'boss-health-bar'
        }

        const bar = document.getElementById('boss-health-bar');
        if (bar) {
            // Calcula vida restante (Max - Progresso)
            const currentHP = Math.max(0, gameState.maxBossProgress - gameState.bossProgress);
            const pct = (currentHP / gameState.maxBossProgress) * 100;
            bar.style.width = `${pct}%`;
            
            if (currentHP === 0) bar.classList.add('depleted');
            else bar.classList.remove('depleted');
        }
    }
};

// Inicializa ao carregar
document.addEventListener('DOMContentLoaded', () => {
    game.init();
});
