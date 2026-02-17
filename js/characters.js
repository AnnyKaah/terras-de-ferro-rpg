// characters.js - Sistema de gerenciamento de personagens

const CHARACTERS = {
    lyra: {
        name: "Lyra",
        role: "A Caçadora",
        icon: "🏹",
        avatar: "assets/images/avatar_lyra.png",
        stats: {
            fogo: 3,
            sombra: 2,
            engenho: 2,
            ferro: 1,
            coracao: 1
        },
        status: {
            health: 5,
            maxHealth: 5,
            spirit: 5,
            maxSpirit: 5,
            supplies: 5,
            maxSupplies: 5
        },
        special: "Arqueira: +1 ao atirar com arco",
        theme: "lyra-theme"
    },
    daren: {
        name: "Daren",
        role: "O Curandeiro",
        icon: "🌿",
        avatar: "assets/images/avatar_daren.png",
        stats: {
            coracao: 3,
            sombra: 2,
            engenho: 2,
            ferro: 1,
            fogo: 1
        },
        status: {
            health: 5,
            maxHealth: 5,
            spirit: 5,
            maxSpirit: 5,
            supplies: 5,
            maxSupplies: 5
        },
        special: "Curandeiro: Cura 3 HP sem rolar (1x por sessão)",
        healingUsed: false,
        theme: "daren-theme"
    }
};

const ACHIEVEMENTS_DATA = {
    diplomata: {
        id: 'diplomata',
        title: 'Diplomata',
        description: 'Resolveu um conflito através de palavras, não armas.',
        icon: '🤝'
    },
    guerreiro: {
        id: 'guerreiro',
        title: 'Guerreiro',
        description: 'Venceu uma batalha contra probabilidades terríveis.',
        icon: '⚔️'
    },
    erudito: {
        id: 'erudito',
        title: 'Erudito',
        description: 'Usou conhecimento antigo para superar um obstáculo.',
        icon: '📜'
    },
    sobrevivente: {
        id: 'sobrevivente',
        title: 'Sobrevivente',
        description: 'Completou a primeira missão com vida.',
        icon: '🏔️'
    },
    lenda: {
        id: 'lenda',
        title: 'Lenda',
        description: 'Salvou as Terras de Ferro de uma ameaça ancestral.',
        icon: '👑'
    }
};

class GameState {
    constructor() {
        this.player1 = null;
        this.player2 = null;
        this.currentScene = 0;
        this.progress = 0;
        this.maxProgress = 6;
        this.inventory = [];
        this.gameLog = [];
        this.currentMission = 1;
        this.unlockedAchievements = [];
        this.journal = [];
        this.bond = 2; // Aumentado para 2 para facilitar para iniciantes
        this.maxBond = 5;
        this.tutorialSeen = false;
    }

    selectCharacter(playerNum, charId) {
        const char = JSON.parse(JSON.stringify(CHARACTERS[charId]));
        
        if (playerNum === 1) {
            this.player1 = { ...char, playerId: 1, charId: charId };
        } else {
            this.player2 = { ...char, playerId: 2, charId: charId };
        }
    }

    bothPlayersSelected() {
        return this.player1 !== null && this.player2 !== null;
    }

    getPlayer(num) {
        return num === 1 ? this.player1 : this.player2;
    }

    updateHealth(playerNum, amount) {
        const player = this.getPlayer(playerNum);
        player.status.health = Math.max(0, Math.min(player.status.maxHealth, player.status.health + amount));
        this.updateCharacterDisplay();
        
        if (player.status.health === 0) {
            this.log(`⚠️ ${player.name} está em perigo de morte!`, 'danger');
        }
    }

    updateSpirit(playerNum, amount) {
        const player = this.getPlayer(playerNum);
        player.status.spirit = Math.max(0, Math.min(player.status.maxSpirit, player.status.spirit + amount));
        this.updateCharacterDisplay();
        
        if (player.status.spirit === 0) {
            this.log(`😰 ${player.name} entrou em colapso emocional!`, 'danger');
        }
    }

    updateSupplies(playerNum, amount) {
        const player = this.getPlayer(playerNum);
        player.status.supplies = Math.max(0, Math.min(player.status.maxSupplies, player.status.supplies + amount));
        this.updateCharacterDisplay();
    }

    updateBond(amount) {
        this.bond = Math.max(0, Math.min(this.maxBond, this.bond + amount));
        this.updateBondDisplay();
        if (amount > 0) this.log(`❤️ Laço fortalecido! (+${amount})`, 'info');
    }

    updateBondDisplay() {
        const container = document.getElementById('bond-display');
        if (!container) return;
        
        // Renderiza corações
        let hearts = '';
        for (let i = 0; i < this.maxBond; i++) {
            if (i < this.bond) hearts += '❤️';
            else hearts += '🖤';
        }
        
        container.innerHTML = `
            <h4>Laços</h4>
            <div class="bond-hearts">${hearts}</div>
        `;
        
        // Atualiza também o modal se estiver aberto
        const modalCount = document.getElementById('bond-count-modal');
        if (modalCount) modalCount.textContent = `${this.bond}/${this.maxBond}`;
    }

    addProgress(points) {
        this.progress = Math.min(this.maxProgress, this.progress + points);
        this.updateProgressDisplay();
        this.log(`📈 +${points} pontos de progresso! (${this.progress}/${this.maxProgress})`, 'info');
        
        if (this.progress >= this.maxProgress) {
            this.log(`🎉 Juramento completo! Chegou ao confronto final!`, 'success');
        }
    }

    addItem(itemName, owner = 1) {
        // Cria um objeto de item com ID único e dono
        const newItem = {
            id: Date.now() + Math.random().toString(36).substr(2, 9),
            name: itemName,
            owner: owner // 1 ou 2
        };
        this.inventory.push(newItem);
        
        const ownerName = owner === 1 ? (this.player1 ? this.player1.name : 'Jogador 1') : (this.player2 ? this.player2.name : 'Jogador 2');
        this.log(`🎒 ${ownerName} obteve: ${itemName}`, 'info');
    }

    removeItem(itemName) {
        // Encontra o index do primeiro item com esse nome
        const index = this.inventory.findIndex(i => i.name === itemName || i === itemName);
        if (index > -1) {
            const removed = this.inventory.splice(index, 1)[0];
            const name = removed.name || removed;
            this.log(`🗑️ Item perdido: ${name}`, 'info');
        }
    }

    transferItem(itemId, newOwner) {
        const item = this.inventory.find(i => i.id === itemId);
        if (item) {
            item.owner = newOwner;
            const newOwnerName = newOwner === 1 ? this.player1.name : this.player2.name;
            this.log(`🤝 Item entregue para ${newOwnerName}`, 'info');
        }
    }

    // Novo: Adiciona um item equipado a um jogador
    equipItem(itemId, playerNum, slot) {
        const item = this.inventory.find(i => i.id === itemId);
        if (item && item.slot === slot) { // Verifica se o item pode ser equipado no slot
            const player = this.getPlayer(playerNum);
            if (player) {
                // Desequipa o item antigo no mesmo slot, se houver
                this.unequipItemBySlot(playerNum, slot);

                player.equippedItems[slot] = item;
                item.equipped = true;
                this.log(`⚔️ ${player.name} equipou ${item.name}!`, 'info');
                this.updateCharacterDisplay();
            }
        } else {
            this.log(`⚠️ ${item.name} não pode ser equipado no slot ${slot}.`, 'warning');
        }
    }

    // Novo: Remove um item equipado de um jogador
    unequipItem(itemId, playerNum) {
        const item = this.inventory.find(i => i.id === itemId);
        if (item && item.equipped) {
            const player = this.getPlayer(playerNum);
            if (player && player.equippedItems[item.slot] && player.equippedItems[item.slot].id === itemId) {
                delete player.equippedItems[item.slot];
                item.equipped = false;
                this.log(`🛡️ ${player.name} desequipou ${item.name}.`, 'info');
                this.updateCharacterDisplay();
            }
        }
    }

    // Novo: Desequipa um item de um slot específico
    unequipItemBySlot(playerNum, slot) {
        const player = this.getPlayer(playerNum);
        if (player && player.equippedItems[slot]) {
            const item = player.equippedItems[slot];
            item.equipped = false;
            delete player.equippedItems[slot];
            this.log(`🛡️ ${player.name} desequipou ${item.name} do slot ${slot}.`, 'info');
            this.updateCharacterDisplay();
        }
    }

    unlockAchievement(id) {
        if (!ACHIEVEMENTS_DATA[id]) return;
        if (this.unlockedAchievements.includes(id)) return;

        this.unlockedAchievements.push(id);
        this.log(`🏆 Conquista Desbloqueada: ${ACHIEVEMENTS_DATA[id].title}`, 'success');
        this.showAchievementNotification(ACHIEVEMENTS_DATA[id]);
    }

    showAchievementNotification(achievement) {
        const container = document.getElementById('achievement-notification-container');
        if (!container) return;

        const notification = document.createElement('div');
        notification.className = 'achievement-notification';
        notification.innerHTML = `
            <div class="ach-icon">${achievement.icon}</div>
            <div class="ach-text">
                <h4>Conquista Desbloqueada!</h4>
                <p>${achievement.title}</p>
            </div>
        `;
        
        container.appendChild(notification);
        
        // Remove após animação
        setTimeout(() => {
            notification.classList.add('hide');
            setTimeout(() => notification.remove(), 500);
        }, 4000);
    }

    addJournalEntry(scene, decision, outcome, resultType) {
        this.journal.push({
            scene,
            decision,
            outcome,
            resultType,
            timestamp: new Date()
        });
        this.log(`✍️ Diário atualizado.`, 'system');
    }

    log(message, type = 'system') {
        this.gameLog.push({
            text: message,
            timestamp: new Date(),
            type: type
        });
        this.updateLogDisplay();
    }

    updateCharacterDisplay() {
        this.renderCharStatus(1, 'char1-status');
        this.renderCharStatus(2, 'char2-status');
        this.updateBondDisplay();
        this.updateSpecialAbilityButton();
    }

    updateSpecialAbilityButton() {
        const btn = document.getElementById('btn-special-ability');
        if (!btn) return;

        let daren = null;
        if (this.player1 && this.player1.name === 'Daren') daren = this.player1;
        else if (this.player2 && this.player2.name === 'Daren') daren = this.player2;

        if (daren) {
            btn.style.display = 'block';
            if (daren.healingUsed) {
                btn.disabled = true;
                btn.textContent = "🌿 Cura Usada (Daren)";
                btn.style.opacity = "0.5";
                btn.style.cursor = "not-allowed";
            } else {
                btn.disabled = false;
                btn.textContent = "🌿 Cura de Daren (+3 HP)";
                btn.style.opacity = "1";
                btn.style.cursor = "pointer";
            }
        } else {
            btn.style.display = 'none';
        }
    }

    resetSpecialAbilities() {
        if (this.player1) this.player1.healingUsed = false;
        if (this.player2) this.player2.healingUsed = false;
    }

    renderCharStatus(playerNum, elementId) {
        const player = this.getPlayer(playerNum);
        if (!player) return;

        const element = document.getElementById(elementId); // Corrigido para usar elementId
        if (!element) return;

        const healthPercent = (player.status.health / player.status.maxHealth) * 100;
        const spiritPercent = (player.status.spirit / player.status.maxSpirit) * 100;
        const suppliesPercent = (player.status.supplies / player.status.maxSupplies) * 100;

        element.innerHTML = `
            <h4><img src="${player.avatar}" class="char-avatar-small"> ${player.name}</h4>
            <div class="status-bar" data-tooltip="Saúde: Condição física. Se chegar a 0, você corre risco de morte.">
                <span>❤️</span>
                <div class="bar-container">
                    <div class="bar-fill health" style="width: ${healthPercent}%"></div>
                </div>
                <span>${player.status.health}/${player.status.maxHealth}</span>
            </div>
            <div class="status-bar" data-tooltip="Espírito: Condição mental. Se chegar a 0, você entra em colapso.">
                <span>🧠</span>
                <div class="bar-container">
                    <div class="bar-fill spirit" style="width: ${spiritPercent}%"></div>
                </div>
                <span>${player.status.spirit}/${player.status.maxSpirit}</span>
            </div>
            <div class="status-bar" data-tooltip="Suprimentos: Comida e recursos. Necessário para Descansar e viajar.">
                <span>🎒</span>
                <div class="bar-container">
                    <div class="bar-fill supplies" style="width: ${suppliesPercent}%"></div>
                </div>
                <span>${player.status.supplies}/${player.status.maxSupplies}</span>
            </div>
            <div class="player-equipment">
                <p>Equipamento:</p>
                ${Object.keys(player.equippedItems || {}).map(slot => {
                    const item = player.equippedItems[slot];
                    return `<div class="equipped-item" data-tooltip="${item.name} (${slot})">
                                ${item.icon || '🛡️'} ${item.name}
                            </div>`;
                }).join('')}
                ${Object.keys(player.equippedItems || {}).length === 0 ? '<p class="text-muted">Nenhum item equipado.</p>' : ''}
            </div>
            <div class="player-level-xp">
                <span>⭐ Nível: ${player.level}</span>
                <span>✨ XP: ${player.xp}/${this.xpToNextLevel}</span>
                <div class="xp-bar-container"><div class="xp-bar-fill" style="width: ${(player.xp / this.xpToNextLevel) * 100}%"></div></div>
            </div>
        `;
    }

    updateProgressDisplay() {
        const progressBar = document.getElementById('progress-bar');
        const progressText = document.getElementById('progress-text');
        
        if (progressBar) {
            const percent = (this.progress / this.maxProgress) * 100;
            progressBar.style.width = `${percent}%`;
        }
        
        if (progressText) {
            progressText.textContent = `${this.progress}/${this.maxProgress} pontos`;
        }

        this.updateFogDisplay();
    }

    updateFogDisplay() {
        const fog = document.getElementById('fog-overlay');
        if (fog) {
            // A névoa começa em 0 e vai até 0.9 de opacidade no máximo do progresso
            // Adiciona um valor base pequeno (0.1) se o progresso for > 0
            let opacity = 0;
            if (this.progress > 0) {
                opacity = 0.1 + (this.progress / this.maxProgress) * 0.8;
            }
            fog.style.opacity = opacity;
        }
    }

    updateLogDisplay() {
        const logContainer = document.getElementById('log-container');
        if (!logContainer) return;        

        logContainer.innerHTML = this.gameLog.slice(-10).map(log => `
            <div class="log-entry ${log.type || 'system'}">${log.text}</div>
        `).join('');

        // Auto-scroll to bottom
        logContainer.scrollTop = logContainer.scrollHeight;
    }

    // --- Sistema de Salvamento ---

    save() {
        try {
            const data = {
                player1: this.player1,
                player2: this.player2,
                currentScene: this.currentScene,
                progress: this.progress,
                inventory: this.inventory,
                gameLog: this.gameLog,
                currentMission: this.currentMission,
                unlockedAchievements: this.unlockedAchievements,
                journal: this.journal,
                bond: this.bond,
                tutorialSeen: this.tutorialSeen,
                level: this.level,
                xp: this.xp,
                xpToNextLevel: this.xpToNextLevel,
                // Salva também os itens equipados de cada jogador
                player1: this.player1,
                player2: this.player2
            };
            localStorage.setItem('terrasDeFerroSave', JSON.stringify(data));
        } catch (e) {
            console.error("Erro ao salvar jogo:", e);
        }
    }

    load() {
        try {
            const data = localStorage.getItem('terrasDeFerroSave');
            if (!data) return false;

            const parsed = JSON.parse(data);
            this.player1 = parsed.player1;
            this.player2 = parsed.player2;
            
            // Garante compatibilidade com saves antigos (inicializa equippedItems se não existir)
            if (this.player1 && !this.player1.equippedItems) this.player1.equippedItems = {};
            if (this.player2 && !this.player2.equippedItems) this.player2.equippedItems = {};

            this.currentScene = parsed.currentScene || 0;
            this.progress = parsed.progress || 0;
            this.inventory = parsed.inventory || [];
            this.gameLog = parsed.gameLog || [];
            this.currentMission = parsed.currentMission || 1;
            this.unlockedAchievements = parsed.unlockedAchievements || [];
            this.journal = parsed.journal || [];
            this.bond = parsed.bond !== undefined ? parsed.bond : 1;
            this.tutorialSeen = parsed.tutorialSeen || false;

            // Restaurar objetos Date
            this.gameLog.forEach(log => log.timestamp = new Date(log.timestamp));
            this.journal.forEach(entry => entry.timestamp = new Date(entry.timestamp));

            // Migração de dados antigos (se inventory for array de strings)
            if (this.inventory.length > 0 && typeof this.inventory[0] === 'string') {
                this.inventory = this.inventory.map(name => ({
                    id: Date.now() + Math.random(),
                    name: name,
                    owner: 1 // Default para Player 1 em saves antigos
                }));
            }

            return true;
        } catch (e) {
            console.error("Erro ao carregar jogo:", e);
            return false;
        }
    }

    // Novo: Calcula o valor de um atributo considerando itens equipados
    getStat(playerNum, statName) {
        const player = this.getPlayer(playerNum);
        if (!player) return 0;

        let baseStat = player.stats[statName] || 0;
        // Adiciona bônus de itens equipados
        for (const slot in player.equippedItems) {
            const item = player.equippedItems[slot];
            if (item.bonusStats && item.bonusStats[statName]) {
                baseStat += item.bonusStats[statName];
            }
        }
        return baseStat;
    }

    reset() {
        // Reinicia o estado para um novo jogo
        Object.assign(this, new GameState());
        this.clearSave();
    }

    clearSave() {
        localStorage.removeItem('terrasDeFerroSave');
    }

    performSpecialAbility() {
        // Procura por Daren
        let daren = null;
        let playerNum = 0;
        if (this.player1 && this.player1.name === 'Daren') { daren = this.player1; playerNum = 1; }
        else if (this.player2 && this.player2.name === 'Daren') { daren = this.player2; playerNum = 2; }

        if (!daren) return;

        if (daren.healingUsed) {
            this.log("⚠️ Daren já usou sua habilidade nesta sessão.", 'warning');
            return;
        }

        // Aplica a cura e marca como usado
        daren.healingUsed = true; // Marca antes para atualizar UI corretamente
        this.updateHealth(playerNum, 3);
        this.log("🌿 Daren usou conhecimentos antigos para curar 3 de Saúde!", 'info');
        this.triggerHealingAnimation(playerNum);
    }

    triggerHealingAnimation(playerNum) {
        const elementId = playerNum === 1 ? 'char1-status' : 'char2-status';
        const element = document.getElementById(elementId);
        if (!element) return;

        const rect = element.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        // Cria 20 partículas
        for (let i = 0; i < 20; i++) {
            setTimeout(() => {
                const particle = document.createElement('div');
                particle.className = 'heal-particle';
                particle.innerHTML = Math.random() > 0.5 ? '➕' : '✨';
                
                // Posição aleatória ao redor do centro do card do personagem
                const x = centerX + (Math.random() - 0.5) * 100;
                const y = centerY + (Math.random() - 0.5) * 60;
                
                particle.style.left = `${x}px`;
                particle.style.top = `${y}px`;
                
                document.body.appendChild(particle);
                
                // Remove do DOM após a animação
                setTimeout(() => particle.remove(), 1500);
            }, i * 50); // Intervalo para efeito de "chuva"
        }
    }
}

// Instância global do estado do jogo
const gameState = new GameState();
