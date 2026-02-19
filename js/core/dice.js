// dice.js - Sistema de rolagem de dados

const dice = {
    context: null,
    lastRoll: null,
    timeout: null,
    isRemoteRoll: false, // Flag para evitar loops de rede

    showDiceRoller(playerNum, attribute, bonus = 0, callback, isAuto = false) {
        this.context = { playerNum, attribute, bonus, callback };
        ui.openModal('dice-modal');
        
        // Reseta visual
        document.getElementById('dice-result').style.display = 'none';
        const btnClose = document.querySelector('#dice-modal .btn-close');
        if (btnClose) btnClose.style.display = 'block'; // Garante que o botão fechar esteja visível inicialmente

        // Identifica se é rolagem remota (Online e não sou eu)
        const isRemote = (typeof game !== 'undefined' && game.mode === 'online' && playerNum !== game.currentPlayer);
        const modalContent = document.querySelector('#dice-modal .modal-content');

        // Reseta classes visuais
        if (modalContent) {
            modalContent.classList.remove('bot-roll', 'remote-roll');
            if (isAuto) modalContent.classList.add('bot-roll');
            if (isRemote) modalContent.classList.add('remote-roll');
        }

        // Atualiza UI do modal
        const p = gameState.getPlayer(playerNum);
        const contextEl = document.getElementById('dice-context');
        if (contextEl && p) {
            contextEl.innerHTML = `<strong>${p.name}</strong> testando <strong>${attribute.toUpperCase()}</strong>`;
            if (isAuto) contextEl.innerHTML = `🤖 <strong>${p.name}</strong> (Bot) testando <strong>${attribute.toUpperCase()}</strong>`;
            if (isRemote) contextEl.innerHTML = `📡 <strong>${p.name}</strong> (Remoto) testando...`;
        }
        
        // Verifica se pode queimar impulso
        const btnBurn = document.getElementById('btn-burn-momentum');
        if (btnBurn) {
            btnBurn.disabled = true; // Só habilita DEPOIS de rolar se for falha
            btnBurn.onclick = () => this.burnMomentum();
        }

        // Lógica de Auto-Roll para Bot
        if (isAuto) {
            if (modalContent) modalContent.style.pointerEvents = 'none'; // Bloqueia cliques manuais
            
            setTimeout(() => {
                this.roll(playerNum);
                // Reabilita após rolar (para permitir fechar ou ver resultado)
                setTimeout(() => {
                    if (modalContent) modalContent.style.pointerEvents = 'auto';
                }, 500);
            }, 1500); // Delay dramático para ler o contexto
        } else if (isRemote) {
            // Se for remoto, bloqueia interação e apenas espera o evento de rede DICE_ROLLED
            if (modalContent) modalContent.style.pointerEvents = 'none';
        } else {
            if (modalContent) modalContent.style.pointerEvents = 'auto';
        }
    },

    roll(playerNum, remoteData = null) {
        if (!this.context || this.context.playerNum !== playerNum) return;
        
        const p = gameState.getPlayer(playerNum);
        if (!p) {
            console.error(`❌ Erro: Jogador ${playerNum} não encontrado no estado. GameState:`, gameState);
            return;
        }

        let attrVal = gameState.getStat(playerNum, this.context.attribute) || 0;
        
        // Bônus passivos (Ex: Lyra +1 em Fogo)
        if (p.charId === 'lyra' && this.context.attribute === 'fogo') attrVal += 1;
        
        // Bônus de Ativos (Assets)
        if (p.assets) {
            // Veterano: +1 em Ferro
            if (this.context.attribute === 'ferro' && p.assets.some(a => a.id === 'veterano')) attrVal += 1;
            // Vidente: +1 em Sombra
            if (this.context.attribute === 'sombra' && p.assets.some(a => a.id === 'vidente')) attrVal += 1;
            // Corvo: +1 em Engenho
            if (this.context.attribute === 'engenho' && p.assets.some(a => a.id === 'corvo')) attrVal += 1;
        }

        let d6, d10_1, d10_2, total;

        if (remoteData) {
            // Usa dados recebidos da rede
            ({ d6, d10_1, d10_2, total } = remoteData);
            this.isRemoteRoll = true;
        } else {
            // Gera dados localmente
            d6 = Math.ceil(Math.random() * 6);
            d10_1 = Math.ceil(Math.random() * 10);
            d10_2 = Math.ceil(Math.random() * 10);
            total = d6 + attrVal + this.context.bonus;

            // Envia para o outro jogador
            if (typeof multiplayer !== 'undefined' && game.mode === 'online') {
                multiplayer.send({ type: 'DICE_ROLLED', rollData: { d6, d10_1, d10_2, total, playerNum } });
            }
        }

        // Guarda resultado para possível uso de Impulso
        this.lastRoll = { d6, attrVal, total, d10_1, d10_2, playerNum };

        this.resolveResult(total, d10_1, d10_2);
    },

    resolveResult(total, d10_1, d10_2) {
        let result = 'fail';
        if (total > d10_1 && total > d10_2) result = 'success';
        else if (total > d10_1 || total > d10_2) result = 'partial';

        // Esconde botão de fechar para forçar a espera da animação/callback
        const btnClose = document.querySelector('#dice-modal .btn-close');
        if (btnClose) btnClose.style.display = 'none';

        // Verifica se Impulso pode ser usado (Ironsworn: Momentum > D10s para cancelar)
        const p = gameState.getPlayer(this.lastRoll.playerNum);
        const btnBurn = document.getElementById('btn-burn-momentum');
        
        // Lógica simplificada de Impulso: Queimar transforma Falha -> Parcial ou Parcial -> Sucesso
        if (btnBurn) {
            if (p.status.momentum >= 6 && result !== 'success') {
                btnBurn.disabled = false;
                btnBurn.classList.add('pulse');
            } else {
                btnBurn.disabled = true;
                btnBurn.classList.remove('pulse');
            }
        }

        ui.displayDiceResult(this.lastRoll.d6, this.lastRoll.attrVal, total, d10_1, d10_2, result);
        
        // Delay para fechar e aplicar
        if (this.timeout) clearTimeout(this.timeout);
        this.timeout = setTimeout(() => {
            if (this.context.callback) this.context.callback(result);
            ui.closeModal('dice-modal');
        }, 2500);
    },

    burnMomentum() {
        if (!this.lastRoll) return;
        const p = gameState.getPlayer(this.lastRoll.playerNum);
        
        // Reseta Impulso (Custo de queimar)
        gameState.updateStatus(this.lastRoll.playerNum, 'momentum', -p.status.momentum + 2);
        gameState.addLog(`🔥 ${p.name} queimou Impulso para mudar o destino!`, 'warning');

        // Melhora o resultado em um nível
        let currentResult = 'fail';
        const { total, d10_1, d10_2 } = this.lastRoll;
        if (total > d10_1 && total > d10_2) currentResult = 'success';
        else if (total > d10_1 || total > d10_2) currentResult = 'partial';

        let newResult = currentResult === 'fail' ? 'partial' : 'success';
        
        // Atualiza visual
        ui.displayDiceResult(this.lastRoll.d6, this.lastRoll.attrVal, total, d10_1, d10_2, newResult, true);
        
        // Cancela o timeout anterior e cria um novo
        if (this.timeout) clearTimeout(this.timeout);
        this.timeout = setTimeout(() => {
            if (this.context.callback) this.context.callback(newResult);
            ui.closeModal('dice-modal');
        }, 2000);
        
        const btnBurn = document.getElementById('btn-burn-momentum');
        if (btnBurn) btnBurn.disabled = true;
    },
    
    useBond() {
        if (gameState.bond > 0) {
            gameState.bond--;
            this.context.bonus += 1;
            ui.updateBondDisplay();
            const btn = document.getElementById('btn-use-bond');
            if (btn) {
                btn.textContent = "Laço Usado (+1)";
                btn.disabled = true;
            }
        }
    },

    closeModal() {
        ui.closeModal('dice-modal');
        if (this.timeout) clearTimeout(this.timeout);
        
        // Se fechou sem rolar e era uma decisão importante, libera o jogo
        if (this.context && this.context.callback && gameState.isResolving) {
            gameState.isResolving = false;
        }
        
        this.context = null;
        this.lastRoll = null;
    }
};
