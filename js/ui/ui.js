// js/ui/ui.js
const ui = {
    showScreen(id) {
        document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
        const screen = document.getElementById(id);
        if (screen) {
            screen.classList.add('active');
        } else {
            console.error(`Tela não encontrada: ${id}`);
        }
    },

    openModal(id) { document.getElementById(id).classList.add('active'); },
    closeModal(id) { document.getElementById(id).classList.remove('active'); },

    updateCharacterDisplay() {
        [1, 2].forEach(num => {
            const p = gameState.getPlayer(num);
            if (!p) return;
            const el = document.getElementById(`char${num}-status`);
            
            // Destaque de turno no modo offline
            if (typeof game !== 'undefined' && game.mode === 'offline') {
                if (game.currentPlayer === num) el.classList.add('active-turn');
                else el.classList.remove('active-turn');
            } else {
                el.classList.remove('active-turn');
            }
            
            // Barras
            const hpPct = (p.status.health / p.status.maxHealth) * 100;
            const spPct = (p.status.spirit / p.status.maxSpirit) * 100;
            const supPct = (p.status.supplies / p.status.maxSupplies) * 100;
            const momPct = ((p.status.momentum + 6) / 16) * 100; // Normaliza -6 a 10

            el.innerHTML = `
                <h4>${p.icon} ${p.name}</h4>
                <div class="status-row"><span>❤️</span><div class="bar-track"><div class="bar-fill health" style="width:${hpPct}%"></div></div><span>${p.status.health}</span></div>
                <div class="status-row"><span>🧠</span><div class="bar-track"><div class="bar-fill spirit" style="width:${spPct}%"></div></div><span>${p.status.spirit}</span></div>
                <div class="status-row" title="Impulso"><span>🔥</span><div class="bar-track"><div class="bar-fill momentum" style="width:${momPct}%"></div></div><span>${p.status.momentum}</span></div>
                <div class="assets-list">
                    <small>Ativos:</small>
                    ${p.assets ? p.assets.map(a => `<div class="asset-tag" title="${a.ability}">${a.icon} ${a.name}</div>`).join('') : ''}
                </div>
            `;
        });
        this.updateBondDisplay();
        this.checkRestRecommendation(); // Verifica se precisa sugerir descanso
    },

    updateBondDisplay() {
        const el = document.getElementById('bond-display');
        let hearts = '❤️'.repeat(gameState.bond) + '🖤'.repeat(5 - gameState.bond);
        el.innerHTML = `<small>Laços</small><div>${hearts}</div>`;
    },

    updateProgress() {
        const progressBar = document.getElementById('progress-bar');
        const progressText = document.getElementById('progress-text');
        
        if (progressBar) {
            const percent = (gameState.progress / gameState.maxProgress) * 100;
            progressBar.style.width = `${percent}%`;
        }
        if (progressText) {
            progressText.textContent = `${gameState.progress}/${gameState.maxProgress} Marcos`;
        }
        
        this.updateFog();
    },

    updateFog() {
        const fog = document.getElementById('fog-overlay');
        if (fog) {
            // Névoa aumenta conforme o progresso (efeito dramático) ou diminui (purificação)
            // Vamos assumir que diminui conforme completam o juramento
            let opacity = 0.8 - (gameState.progress / gameState.maxProgress) * 0.6;
            fog.style.opacity = Math.max(0.1, opacity);
        }
    },

    renderScene(scene) {
        const container = document.getElementById('scene-container');
        
        // Boss Bar
        let bossHtml = '';
        if (scene.boss) {
            const max = gameState.maxBossProgress || scene.boss.maxHP || 10;
            const current = Math.max(0, max - gameState.bossProgress);
            const pct = (current / max) * 100;
            bossHtml = `
                <div class="boss-container" id="boss-ui-container">
                    <h3 class="boss-name">☠️ ${scene.boss.name}</h3>
                    <div class="boss-bar-track">
                        <div class="boss-bar-fill" id="boss-health-bar" style="width: ${pct}%"></div>
                    </div>
                </div>`;
        }

        container.innerHTML = `
            ${bossHtml}
            <div class="scene-content">
                <h2 class="scene-title">${scene.title}</h2>
                ${scene.description.map(p => `<p class="scene-text">${p}</p>`).join('')}
            </div>
        `;

        // Renderiza Decisões
        const decContainer = document.getElementById('decision-container');
        decContainer.innerHTML = scene.decisions.map((d, i) => {
            // Verifica se a decisão é exclusiva de um jogador
            let disabledClass = '';
            let tooltipAttr = '';
            
            if (game.mode === 'online' && d.rollInfo && d.rollInfo.playerNum !== game.currentPlayer) {
                // Opcional: Desabilitar visualmente, mas permitir clique para "sugerir" ação?
                // Por segurança, vamos marcar visualmente.
                disabledClass = 'disabled-decision';
                const pName = gameState.getPlayer(d.rollInfo.playerNum).name;
                tooltipAttr = `data-tooltip="Aguardando decisão de ${pName}"`;
            }
            
            // Verifica requisitos de recursos/itens
            if (d.requires && typeof game !== 'undefined') {
                const missing = [];
                const req = d.requires;
                
                // Verifica Suprimentos (Global) - Movido para fora do check de player
                if (req.supplies && gameState.sharedSupplies < req.supplies) missing.push(`${req.supplies} Suprimentos (Grupo)`);

                if (req.player) {
                    const p = gameState.getPlayer(req.player);
                    if (req.spirit && p.status.spirit < req.spirit) missing.push(`${req.spirit} Espírito`);
                    if (req.health && p.status.health < req.health) missing.push(`${req.health} Saúde`);
                }
                
                if (req.item) {
                    const hasItem = gameState.inventory.some(i => i.name === req.item || i.id === req.item);
                    if (!hasItem) missing.push(`Item: ${req.item}`);
                }

                if (missing.length > 0) {
                    disabledClass = 'disabled-decision';
                    tooltipAttr = `data-tooltip="🔒 Requer: ${missing.join(', ')}"`;
                }
            }

            return `<div class="decision-card ${disabledClass}" onclick="game.handleDecision(${i})" ${tooltipAttr}>
                <h4>${d.icon} ${d.title}</h4>
                <p>${d.description}</p>
                ${d.requiresRoll ? 
                    `<small>🎲 <strong>${gameState.getPlayer(d.rollInfo.playerNum).name}</strong> testa ${d.rollInfo.attribute}</small>` 
                    : ''}
            </div>`;
        }).join('');

        // Atualiza Ambiente
        document.body.className = scene.environment || '';
        if (scene.weather) document.body.classList.add(`weather-${scene.weather}`);
    },

    highlightDecision(index) {
        const cards = document.querySelectorAll('.decision-card');
        if (cards[index]) {
            cards[index].classList.add('suggested-action');
            // Remove o destaque após alguns segundos
            setTimeout(() => cards[index].classList.remove('suggested-action'), 4000);
        }
    },

    displayDiceResult(d6, attr, total, d10_1, d10_2, result, burned = false) {
        const el = document.getElementById('dice-result');
        el.style.display = 'flex';
        el.innerHTML = `
            <div class="dice-display">
                <div class="die-box action-die"><span class="die-label">Ação</span><span class="die-val">${d6}+${attr}</span></div>
                <div class="die-box total-die"><span class="die-label">Total</span><span class="die-val">${total}</span></div>
                <div class="die-box challenge-die"><span class="die-label">Desafio</span><span class="die-val">${d10_1}</span></div>
                <div class="die-box challenge-die"><span class="die-label">Desafio</span><span class="die-val">${d10_2}</span></div>
            </div>
            <div class="verdict ${result}">
                ${burned ? '🔥 IMPULSO QUEIMADO: ' : ''}
                ${result === 'success' ? 'SUCESSO FORTE' : result === 'partial' ? 'SUCESSO FRACO' : 'FALHA'}
            </div>
        `;
    },

    updateLog() {
        const el = document.getElementById('log-container');
        const logs = gameState.gameLog.slice(-8);
        el.innerHTML = logs.map(l => `<div class="log-entry ${l.type}"><small style="opacity:0.6">[${l.time.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}]</small> ${l.text}</div>`).join('');
        el.scrollTop = el.scrollHeight;
    },

    triggerDamageEffect() {
        const el = document.getElementById('game-screen') || document.body;
        el.classList.add('shake-effect');
        setTimeout(() => el.classList.remove('shake-effect'), 500);
    },

    // Modais auxiliares
    showRules() { this.showScreen('rules-screen'); },
    hideRules() { this.showScreen('start-screen'); },
    
    showInventory() { 
        const container = document.getElementById('inventory-content');
        
        // Remove notificação visual ao abrir
        const btnInv = document.getElementById('btn-inventory');
        if (btnInv) btnInv.classList.remove('has-notification');

        const items = gameState.inventory;
        
        if (items.length === 0) {
            container.innerHTML = '<p style="text-align:center; color:#777;">Mochila vazia.</p>';
        } else {
            container.innerHTML = `<ul class="inventory-list">
                ${items.map(item => {
                    const ownerName = item.owner === 1 ? gameState.player1.name : gameState.player2.name;
                    let actionBtn = '';

                    // Botão de Usar (Consumíveis)
                    if (item.consumable) {
                        actionBtn = `<button class="btn-small" onclick="game.useItem('${item.id}')">Usar</button>`;
                    } 
                    // Botão de Equipar (Armas/Armaduras/Acessórios)
                    else if (['weapon', 'armor', 'accessory'].includes(item.type)) {
                        const btnText = item.equipped ? 'Desequipar' : 'Equipar';
                        const btnClass = item.equipped ? 'btn-small active' : 'btn-small';
                        actionBtn = `<button class="${btnClass}" onclick="game.toggleEquipItem('${item.id}')">${btnText}</button>`;
                    }

                    return `
                    <li class="inventory-item">
                        <span>${item.equipped ? '🛡️' : ''} ${item.icon || '📦'} ${item.name} <small>(${ownerName})</small></span>
                        ${actionBtn}
                    </li>`;
                }).join('')}
            </ul>`;
        }
        this.openModal('inventory-modal'); 
    },

    showRestModal() { 
        const container = document.getElementById('rest-content');
        
        // Verifica se tem Herbalista no grupo
        const hasHerbalist = (gameState.player1 && gameState.player1.assets.some(a => a.id === 'herbalista')) || 
                             (gameState.player2 && gameState.player2.assets.some(a => a.id === 'herbalista'));
        
        const herbalistText = hasHerbalist ? `<p style="color:var(--success)">🌿 Herbalista ativo: +1 Saúde extra ao descansar.</p>` : '';

        container.innerHTML = `
            <p>O acampamento é um momento de respiro nas Terras de Ferro.</p>
            ${herbalistText}
            <div class="rest-options">
                <button class="btn-action" onclick="game.performRest('health')">
                    🍖 Comer e Descansar (+${hasHerbalist ? '3' : '2'} Saúde, -1 Suprimento)
                </button>
                <button class="btn-action" onclick="game.performRest('spirit')">
                    🔥 Conversar na Fogueira (+2 Espírito, -1 Suprimento)
                </button>
            </div>
        `;
        this.openModal('rest-modal'); 
    },

    showJournal() { this.openModal('journal-modal'); /* Implementar renderização */ },
    showLevelUpModal() { this.openModal('level-up-modal'); /* Implementar renderização */ },
    
    showMap() {
        const container = document.getElementById('map-content');
        container.innerHTML = SCENES.map((scene, index) => {
            const isUnlocked = index <= gameState.maxSceneReached;
            const isCurrent = index === gameState.currentScene;
            
            let statusClass = 'locked';
            if (isCurrent) statusClass = 'current unlocked';
            else if (isUnlocked) statusClass = 'unlocked';

            // Extrai o número da cena (ex: "Cena 1")
            const num = index + 1;

            return `
                <div class="map-node ${statusClass}" onclick="${isUnlocked ? `game.travelToScene(${index})` : ''}">
                    <div class="node-marker">${num}</div>
                    <div class="node-info">
                        <h4>${isUnlocked ? scene.title : '???'}</h4>
                        <small>${isUnlocked ? scene.number : 'Bloqueado'}</small>
                    </div>
                </div>
            `;
        }).join('');
        
        this.openModal('map-modal');
    },

    renderAssets(assetsData) {
        const grid = document.getElementById('asset-grid');
        grid.innerHTML = Object.values(assetsData).map(asset => `
            <div class="asset-card" data-id="${asset.id}" onclick="game.selectAsset('${asset.id}')">
                <div class="asset-header">
                    <span class="asset-icon">${asset.icon}</span>
                    <h4>${asset.name}</h4>
                </div>
                <small>${asset.type}</small>
                <p>${asset.description}</p>
                <div class="asset-ability">${asset.ability}</div>
            </div>
        `).join('');
    },

    updateAssetStatus() {
        const status = document.getElementById('asset-status');
        let text = "";
        if (gameState.player1 && gameState.player1.assets && gameState.player1.assets.length > 0) text += `✅ ${gameState.player1.name} pronto. `;
        if (gameState.player2 && gameState.player2.assets && gameState.player2.assets.length > 0) text += `✅ ${gameState.player2.name} pronto.`;
        status.textContent = text;

        // Atualização Visual dos Cards (Highlight)
        if (typeof game !== 'undefined') {
            const myPlayerKey = `p${game.currentPlayer}`;
            const mySelectedAssetId = game.selectedAssets[myPlayerKey];

            document.querySelectorAll('.asset-card').forEach(card => {
                if (card.dataset.id === mySelectedAssetId) {
                    card.classList.add('selected');
                } else {
                    card.classList.remove('selected');
                }
            });
        }
    },

    // Nova Função: Verifica se deve sugerir descanso
    checkRestRecommendation() {
        const btnRest = document.getElementById('btn-rest');
        if (!btnRest) return;

        // 1. Verifica se tem suprimentos (Bloqueio)
        if (gameState.sharedSupplies <= 0) {
            btnRest.disabled = true;
            btnRest.title = "Sem suprimentos para descansar.";
            btnRest.classList.remove('recommended'); // Remove pulso se estiver bloqueado
            return; // Interrompe aqui
        }
        
        btnRest.disabled = false;

        // Critério: Algum jogador com Saúde ou Espírito <= 2 E temos suprimentos
        let needsRest = false;
        [1, 2].forEach(num => {
            const p = gameState.getPlayer(num);
            if (p && (p.status.health <= 2 || p.status.spirit <= 2)) {
                needsRest = true;
            }
        });

        // Só recomenda se tiver suprimentos para pagar
        if (needsRest) {
            btnRest.classList.add('recommended');
            btnRest.title = "Seu grupo está ferido. Recomendado descansar.";
        } else {
            btnRest.classList.remove('recommended');
            btnRest.title = "";
        }
    }
};
