// js/core/state.js
const CHARACTERS = {
    lyra: {
        name: "Lyra", role: "A Caçadora", icon: "🏹",
        avatar: "assets/images/avatar_lyra.png",
        stats: { fogo: 3, sombra: 2, engenho: 2, ferro: 1, coracao: 1 },
        special: "Arqueira: +1 em Fogo"
    },
    daren: {
        name: "Daren", role: "O Curandeiro", icon: "🌿",
        avatar: "assets/images/avatar_daren.png",
        stats: { coracao: 3, sombra: 2, engenho: 2, ferro: 1, fogo: 1 },
        special: "Curandeiro: Cura sem rolar (1x)"
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

const ASSETS_DATA = {
    veterano: {
        id: 'veterano',
        name: 'Veterano',
        type: 'Caminho',
        icon: '⚔️',
        description: 'Você sobreviveu a batalhas que mataram outros.',
        ability: 'Ao rolar *Entrar em Combate* com Ferro, adicione +1.'
    },
    vidente: {
        id: 'vidente',
        name: 'Vidente',
        type: 'Ritual',
        icon: '🔮',
        description: 'Os espíritos sussurram segredos para você.',
        ability: 'Ao rolar *Investigar* ou *Reunir Informações* com Sombra, adicione +1.'
    },
    herbalista: {
        id: 'herbalista',
        name: 'Herbalista',
        type: 'Caminho',
        icon: '🌿',
        description: 'Você conhece as plantas que curam e matam.',
        ability: 'Ao *Acampar*, você pode curar +1 de Saúde extra para você ou um aliado.'
    },
    corvo: {
        id: 'corvo',
        name: 'Corvo',
        type: 'Companheiro',
        icon: '🦅',
        description: 'Um espião alado que vê o que você não vê.',
        ability: 'Ao rolar *Engenho* para perceber perigo, adicione +1 e ganhe +1 Impulso.'
    }
};

class GameState {
    constructor() {
        this.reset();
    }

    reset() {
        this.player1 = null;
        this.player2 = null;
        this.currentScene = 0;
        this.progress = 0; // Juramento
        this.maxProgress = 10;
        this.inventory = [];
        this.gameLog = [];
        this.bond = 2;
        this.bossProgress = 0;
        this.maxBossProgress = 0;
        this.isResolving = false;
        this.unlockedAchievements = [];
        this.maxSceneReached = 0; // Novo: Rastreia o progresso máximo
        this.sharedSupplies = 5; // Suprimentos globais do grupo
        this.maxSharedSupplies = 5;
    }

    initPlayer(slot, charId) {
        const base = CHARACTERS[charId];
        const player = {
            ...base,
            id: slot,
            charId: charId,
            status: {
                health: 5, maxHealth: 5,
                spirit: 5, maxSpirit: 5,
                supplies: this.sharedSupplies, maxSupplies: 5, // Sincroniza inicial
                momentum: 2, maxMomentum: 10, minMomentum: -6 // Ironsworn rules
            },
            xp: 0,
            level: 1,
            equipped: {},
            assets: [] // Novo: Lista de ativos do jogador
        };
        if (slot === 1) this.player1 = player;
        else this.player2 = player;
    }

    getPlayer(num) { return num === 1 ? this.player1 : this.player2; }

    updateStatus(playerNum, type, amount) {
        const p = this.getPlayer(playerNum);
        if (!p) return;
        
        let current = p.status[type];
        let max = p.status[`max${type.charAt(0).toUpperCase() + type.slice(1)}`];
        let min = type === 'momentum' ? p.status.minMomentum : 0;

        if (type === 'supplies') {
            // Lógica de Suprimentos COMPARTILHADOS
            this.sharedSupplies = Math.max(0, Math.min(this.maxSharedSupplies, this.sharedSupplies + amount));
            
            // Sincroniza o valor visual para AMBOS os jogadores
            if (this.player1) this.player1.status.supplies = this.sharedSupplies;
            if (this.player2) this.player2.status.supplies = this.sharedSupplies;
            
            // Log específico para grupo
            if (amount !== 0) this.addLog(`🎒 Suprimentos do grupo: ${this.sharedSupplies} (${amount > 0 ? '+' : ''}${amount})`, 'info');
        } else {
            // Lógica Individual (Health, Spirit, Momentum)
            p.status[type] = Math.max(min, Math.min(max, current + amount));
        }
        
        // Feedback visual se for dano
        if (amount < 0 && (type === 'health' || type === 'spirit')) {
            ui.triggerDamageEffect();
        }

        // Feedback Informativo (Senior UX): Notifica exatamente o que mudou
        if (amount !== 0 && typeof game !== 'undefined' && game.notify) {
            const icons = { health: '💔', spirit: '🧠', supplies: '🎒', momentum: '🔥' };
            const labels = { health: 'Saúde', spirit: 'Espírito', supplies: 'Suprimentos', momentum: 'Impulso' };
            const sign = amount > 0 ? '+' : '';
            const notifType = amount > 0 ? 'success' : 'damage'; // Usa tipo 'damage' para perdas
            
            game.notify(`${icons[type] || ''} ${sign}${amount} ${labels[type] || type}`, notifType);
        }

        // Verifica Game Over (Morte)
        if (type === 'health' && p.status.health <= 0) {
            // Pequeno delay para o jogador ver o dano antes da tela mudar
            setTimeout(() => game.triggerGameOver(playerNum), 1000);
        }
        
        ui.updateCharacterDisplay();
    }

    addAsset(playerNum, assetId) {
        const p = this.getPlayer(playerNum);
        if (!p || !ASSETS_DATA[assetId]) return;
        
        // Ironsworn permite 3, mas vamos começar com 1 no setup inicial
        if (p.assets.length === 0) {
            p.assets.push(ASSETS_DATA[assetId]);
        }
    }

    addLog(text, type = 'info') {
        this.gameLog.push({ text, type, time: new Date() });
        ui.updateLog();
    }

    // --- Gerenciamento de Inventário ---

    addItem(itemData, owner = 1) {
        const playerItems = this.inventory.filter(i => i.owner === owner);
        if (playerItems.length >= 5) {
            const p = this.getPlayer(owner);
            const itemName = typeof itemData === 'object' ? itemData.name : itemData;
            this.addLog(`⚠️ Inventário de ${p.name} cheio! Item perdido: ${itemName}`, 'warning');
            return false;
        }

        let newItem = {
            id: Date.now() + Math.random().toString(36).substr(2, 9),
            owner: owner
        };
        
        if (typeof itemData === 'object') {
            newItem = { ...newItem, ...itemData };
        } else {
            newItem.name = itemData;
        }

        this.inventory.push(newItem);
        const p = this.getPlayer(owner);
        this.addLog(`🎒 ${p.name} obteve: ${newItem.name}`, 'info');
        return true;
    }

    removeItem(itemOrName) {
        let index = -1;
        if (typeof itemOrName === 'string') {
            index = this.inventory.findIndex(i => i.name === itemOrName);
        } else {
            index = this.inventory.indexOf(itemOrName);
        }

        if (index > -1) {
            const removed = this.inventory.splice(index, 1)[0];
            this.addLog(`🗑️ Item perdido: ${removed.name}`, 'info');
        }
    }

    // --- Progresso e Conquistas ---

    addProgress(points) {
        this.progress = Math.min(this.maxProgress, this.progress + points);
        ui.updateProgress(); // Atualiza a barra de progresso na UI
        this.addLog(`📈 +${points} progresso no Juramento!`, 'info');
        
        if (this.progress >= this.maxProgress) {
            this.addLog(`🎉 Juramento completo! O destino aguarda!`, 'success');
        }
    }

    updateBond(amount) {
        this.bond = Math.max(0, Math.min(10, this.bond + amount));
        this.addLog(`❤️ Laço atualizado: ${this.bond}`, 'info');
    }

    unlockAchievement(id) {
        if (!ACHIEVEMENTS_DATA[id]) return;
        if (this.unlockedAchievements.includes(id)) return;

        this.unlockedAchievements.push(id);
        this.addLog(`🏆 Conquista: ${ACHIEVEMENTS_DATA[id].title}`, 'success');
        // ui.showAchievement(ACHIEVEMENTS_DATA[id]); // Implementar se desejar notificação visual
    }

    addJournalEntry(sceneTitle, decisionTitle, outcome, result) {
        // Implementação simplificada para o log
        this.addLog(`✍️ Diário: ${decisionTitle} -> ${result}`, 'system');
    }

    // --- Utilitários ---

    getStat(playerNum, statName) {
        const player = this.getPlayer(playerNum);
        if (!player) return 0;

        let baseStat = player.stats[statName] || 0;
        // Verifica itens equipados (simplificado: procura no inventário itens com bonusStats)
        // Para uma implementação completa de 'equipado', precisaríamos da flag 'equipped' nos itens
        this.inventory.filter(i => i.owner === playerNum && i.equipped && i.bonusStats && i.bonusStats[statName])
            .forEach(i => baseStat += i.bonusStats[statName]);
            
        return baseStat;
    }

    updateBossProgress(amount) {
        this.bossProgress = Math.max(0, Math.min(this.maxBossProgress, this.bossProgress + amount));
        if (typeof ui !== 'undefined' && ui.updateBossDisplay) ui.updateBossDisplay();
    }

    save() {
        try {
            const data = {
                player1: this.player1,
                player2: this.player2,
                currentScene: this.currentScene,
                progress: this.progress,
                inventory: this.inventory,
                gameLog: this.gameLog,
                bond: this.bond,
                unlockedAchievements: this.unlockedAchievements,
                maxSceneReached: this.maxSceneReached,
                bossProgress: this.bossProgress,
                maxBossProgress: this.maxBossProgress,
                sharedSupplies: this.sharedSupplies
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
            this.currentScene = parsed.currentScene || 0;
            this.progress = parsed.progress || 0;
            this.inventory = parsed.inventory || [];
            this.gameLog = parsed.gameLog || [];
            this.bond = parsed.bond !== undefined ? parsed.bond : 2;
            this.unlockedAchievements = parsed.unlockedAchievements || [];
            this.maxSceneReached = parsed.maxSceneReached || 0;
            this.bossProgress = parsed.bossProgress || 0;
            this.maxBossProgress = parsed.maxBossProgress || 0;
            this.sharedSupplies = parsed.sharedSupplies !== undefined ? parsed.sharedSupplies : 5;

            if (this.gameLog) {
                this.gameLog.forEach(log => log.time = new Date(log.time));
            }

            return true;
        } catch (e) {
            console.error("Erro ao carregar jogo:", e);
            return false;
        }
    }
}

const gameState = new GameState();
