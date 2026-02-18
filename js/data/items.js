// js/data/items.js - Sistema de Itens do Jogo

const ITEMS_DATA = {
    // ============================================
    // POÇÕES E CONSUMÍVEIS
    // ============================================
    
    pocao_cura_menor: {
        id: 'pocao_cura_menor',
        name: 'Poção de Cura Menor',
        icon: '🧪',
        type: 'consumable',
        rarity: 'common',
        description: 'Um líquido vermelho que fecha ferimentos leves.',
        value: 15,
        weight: 0.5,
        usable: true,
        use: {
            effect: 'health',
            amount: 2,
            target: 'self',
            log: '🧪 Você bebe a poção. Ferimentos superficiais cicatrizam. +2 Saúde.'
        }
    },

    pocao_cura: {
        id: 'pocao_cura',
        name: 'Poção de Cura',
        icon: '🧪',
        type: 'consumable',
        rarity: 'uncommon',
        description: 'Uma poção vermelha brilhante que fecha feridas profundas.',
        value: 30,
        weight: 0.5,
        usable: true,
        use: {
            effect: 'health',
            amount: 3,
            target: 'self',
            log: '🧪 A poção age rapidamente! Ferimentos graves se fecham. +3 Saúde.'
        }
    },

    pocao_cura_maior: {
        id: 'pocao_cura_maior',
        name: 'Poção de Cura Maior',
        icon: '🧪',
        type: 'consumable',
        rarity: 'rare',
        description: 'Uma poção rubra feita com sangue de dragão. Cura quase tudo.',
        value: 60,
        weight: 0.5,
        usable: true,
        use: {
            effect: 'health',
            amount: 5,
            target: 'self',
            log: '🧪 A poção queima descendo pela garganta. Mesmo ossos quebrados se consertam! +5 Saúde (máximo).'
        }
    },

    pocao_espirito: {
        id: 'pocao_espirito',
        name: 'Elixir de Clareza',
        icon: '💙',
        type: 'consumable',
        rarity: 'uncommon',
        description: 'Um líquido azul que acalma a mente e restaura a vontade.',
        value: 30,
        weight: 0.5,
        usable: true,
        use: {
            effect: 'spirit',
            amount: 3,
            target: 'self',
            log: '💙 Você bebe o elixir. A névoa mental se dissipa. +3 Espírito.'
        }
    },

    pocao_impulso: {
        id: 'pocao_impulso',
        name: 'Essência do Destemido',
        icon: '🔥',
        type: 'consumable',
        rarity: 'rare',
        description: 'Uma poção dourada que enche o coração de coragem.',
        value: 50,
        weight: 0.5,
        usable: true,
        use: {
            effect: 'momentum',
            amount: 2,
            target: 'self',
            log: '🔥 A essência aquece seu peito. Você se sente invencível! +2 Impulso.'
        }
    },

    racao_viagem: {
        id: 'racao_viagem',
        name: 'Ração de Viagem',
        icon: '🥖',
        type: 'consumable',
        rarity: 'common',
        description: 'Pão seco, carne defumada e queijo duro. Nutritivo mas sem graça.',
        value: 5,
        weight: 1,
        usable: true,
        use: {
            effect: 'health',
            amount: 1,
            target: 'self',
            log: '🥖 Você come a ração. Não é saborosa, mas mata a fome. +1 Saúde.'
        }
    },

    agua_benta: {
        id: 'agua_benta',
        name: 'Água Benta',
        icon: '💧',
        type: 'consumable',
        rarity: 'uncommon',
        description: 'Água abençoada pelos sacerdotes. Purifica maldições menores.',
        value: 40,
        weight: 0.5,
        usable: true,
        use: {
            effect: 'spirit',
            amount: 2,
            target: 'self',
            log: '💧 Você bebe a água benta. Sente pureza percorrer suas veias. +2 Espírito. Maldições menores removidas.'
        }
    },

    // ============================================
    // ARMAS
    // ============================================

    espada_curta: {
        id: 'espada_curta',
        name: 'Espada Curta',
        icon: '🗡️',
        type: 'weapon',
        slot: 'mao_direita',
        rarity: 'common',
        description: 'Uma lâmina de aço simples mas confiável.',
        value: 25,
        weight: 3,
        bonusStats: {
            ferro: 1
        },
        equipped: false
    },

    machado_guerra: {
        id: 'machado_guerra',
        name: 'Machado de Guerra',
        icon: '🪓',
        type: 'weapon',
        slot: 'duas_maos',
        rarity: 'uncommon',
        description: 'Um machado pesado capaz de partir armaduras.',
        value: 50,
        weight: 8,
        bonusStats: {
            ferro: 2
        },
        equipped: false
    },

    arco_longo: {
        id: 'arco_longo',
        name: 'Arco Longo',
        icon: '🏹',
        type: 'weapon',
        slot: 'duas_maos',
        rarity: 'uncommon',
        description: 'Um arco de teixo capaz de atingir alvos a grande distância.',
        value: 45,
        weight: 4,
        bonusStats: {
            fogo: 2
        },
        equipped: false
    },

    adaga_sombria: {
        id: 'adaga_sombria',
        name: 'Adaga das Sombras',
        icon: '🗡️',
        type: 'weapon',
        slot: 'mao_direita',
        rarity: 'rare',
        description: 'Uma adaga negra que parece absorver a luz ao redor.',
        value: 80,
        weight: 1,
        bonusStats: {
            sombra: 2,
            fogo: 1
        },
        special: 'Crítico em furtividade: +1d6 adicional em ataques surpresa',
        equipped: false
    },

    cajado_anciao: {
        id: 'cajado_anciao',
        name: 'Cajado do Ancião',
        icon: '🪄',
        type: 'weapon',
        slot: 'duas_maos',
        rarity: 'rare',
        description: 'Um cajado entalhado com runas antigas. Pulsa com energia mística.',
        value: 100,
        weight: 5,
        bonusStats: {
            engenho: 2,
            coracao: 1
        },
        special: 'Sabedoria Antiga: +1 em testes de conhecimento',
        equipped: false
    },

    // ============================================
    // ARMADURAS
    // ============================================

    armadura_couro: {
        id: 'armadura_couro',
        name: 'Armadura de Couro',
        icon: '🦺',
        type: 'armor',
        slot: 'corpo',
        rarity: 'common',
        description: 'Armadura leve de couro curtido. Protege sem restringir movimentos.',
        value: 30,
        weight: 10,
        bonusStats: {
            ferro: 1
        },
        equipped: false
    },

    cota_malha: {
        id: 'cota_malha',
        name: 'Cota de Malha',
        icon: '🛡️',
        type: 'armor',
        slot: 'corpo',
        rarity: 'uncommon',
        description: 'Anéis de metal entrelaçados. Pesada mas resistente.',
        value: 60,
        weight: 20,
        bonusStats: {
            ferro: 2
        },
        equipped: false
    },

    manto_viajante: {
        id: 'manto_viajante',
        name: 'Manto do Viajante',
        icon: '🧥',
        type: 'armor',
        slot: 'corpo',
        rarity: 'uncommon',
        description: 'Um manto cinza com capuz que ajuda a se camuflar.',
        value: 40,
        weight: 3,
        bonusStats: {
            sombra: 1,
            engenho: 1
        },
        special: 'Camuflagem: +1 em testes para se esconder',
        equipped: false
    },

    armadura_placas: {
        id: 'armadura_placas',
        name: 'Armadura de Placas',
        icon: '🛡️',
        type: 'armor',
        slot: 'corpo',
        rarity: 'rare',
        description: 'Placas de aço forjadas por mestres ferreiros. Praticamente impenetrável.',
        value: 150,
        weight: 35,
        bonusStats: {
            ferro: 3
        },
        special: 'Fortaleza: -1 dano recebido em combate',
        equipped: false
    },

    // ============================================
    // ACESSÓRIOS
    // ============================================

    anel_protecao: {
        id: 'anel_protecao',
        name: 'Anel de Proteção',
        icon: '💍',
        type: 'accessory',
        slot: 'dedo',
        rarity: 'uncommon',
        description: 'Um anel de prata gravado com símbolos protetores.',
        value: 50,
        weight: 0.1,
        bonusStats: {
            ferro: 1
        },
        equipped: false
    },

    amuleto_coragem: {
        id: 'amuleto_coragem',
        name: 'Amuleto da Coragem',
        icon: '📿',
        type: 'accessory',
        slot: 'pescoco',
        rarity: 'uncommon',
        description: 'Um medalhão que aquece o coração em momentos de medo.',
        value: 60,
        weight: 0.2,
        bonusStats: {
            coracao: 1
        },
        special: 'Destemido: +1 em testes contra medo',
        equipped: false
    },

    colar_erlan: {
        id: 'colar_erlan',
        name: 'Medalhão de Erlan',
        icon: '🏅',
        type: 'accessory',
        slot: 'pescoco',
        rarity: 'legendary',
        description: 'O medalhão do avô de Lyra. Um dos seis Seladores.',
        value: 500,
        weight: 0.3,
        bonusStats: {
            coracao: 2,
            ferro: 1
        },
        special: 'Legado dos Seladores: +2 em testes contra criaturas sobrenaturais',
        lore: 'Erlan foi um dos seis heróis que selaram Nhar há gerações.',
        equipped: false
    },

    botas_elficas: {
        id: 'botas_elficas',
        name: 'Botas Élficas',
        icon: '👢',
        type: 'accessory',
        slot: 'pes',
        rarity: 'rare',
        description: 'Botas leves que silenciam seus passos.',
        value: 70,
        weight: 1,
        bonusStats: {
            sombra: 2
        },
        special: 'Passos Silenciosos: +2 em testes de furtividade',
        equipped: false
    },

    luvas_ladrao: {
        id: 'luvas_ladrao',
        name: 'Luvas do Ladrão',
        icon: '🧤',
        type: 'accessory',
        slot: 'maos',
        rarity: 'uncommon',
        description: 'Luvas de couro fino que melhoram destreza manual.',
        value: 40,
        weight: 0.5,
        bonusStats: {
            engenho: 1,
            sombra: 1
        },
        special: 'Mãos Leves: +1 em testes para roubar ou desarmar armadilhas',
        equipped: false
    },

    // ============================================
    // ITENS DE QUEST
    // ============================================

    diario_antigo: {
        id: 'diario_antigo',
        name: 'Diário Antigo',
        icon: '📔',
        type: 'quest',
        rarity: 'unique',
        description: 'Um diário desgastado encontrado no lago. Contém o brasão da família de Lyra.',
        value: 0,
        weight: 1,
        questItem: true,
        lore: 'As páginas falam de um ritual de selamento realizado há gerações.'
    },

    pergaminho_runas: {
        id: 'pergaminho_runas',
        name: 'Pergaminho com Runas',
        icon: '📜',
        type: 'quest',
        rarity: 'unique',
        description: 'Um pergaminho encontrado em Grend com símbolos de convocação.',
        value: 0,
        weight: 0.5,
        questItem: true,
        lore: 'As runas ainda emanam uma energia sinistra.'
    },

    mapa_altar: {
        id: 'mapa_altar',
        name: 'Mapa do Altar',
        icon: '🗺️',
        type: 'quest',
        rarity: 'unique',
        description: 'Um mapa detalhado mostrando a localização do altar nas montanhas.',
        value: 0,
        weight: 0.5,
        questItem: true
    },

    gema_negra: {
        id: 'gema_negra',
        name: 'Fragmento da Gema Negra',
        icon: '💎',
        type: 'quest',
        rarity: 'legendary',
        description: 'Um fragmento da gema que alimentava a névoa. Ainda pulsa fracamente.',
        value: 0,
        weight: 1,
        questItem: true,
        lore: 'Dizem que essas gemas são lágrimas cristalizadas de entidades antigas.'
    },

    // ============================================
    // FERRAMENTAS E UTILITÁRIOS
    // ============================================

    kit_ferramentas: {
        id: 'kit_ferramentas',
        name: 'Kit de Ferramentas',
        icon: '🔧',
        type: 'tool',
        rarity: 'common',
        description: 'Um conjunto de ferramentas básicas para reparos.',
        value: 20,
        weight: 3,
        usable: true,
        use: {
            effect: 'supplies',
            amount: 1,
            target: 'self',
            log: '🔧 Você usa as ferramentas para consertar equipamentos. +1 Suprimento.'
        }
    },

    corda: {
        id: 'corda',
        name: 'Corda (15m)',
        icon: '🪢',
        type: 'tool',
        rarity: 'common',
        description: 'Uma corda resistente de cânhamo. Essencial para escaladas.',
        value: 5,
        weight: 5
    },

    tocha: {
        id: 'tocha',
        name: 'Tocha',
        icon: '🔦',
        type: 'tool',
        rarity: 'common',
        description: 'Uma tocha que queima por várias horas.',
        value: 2,
        weight: 1,
        consumable: true
    },

    kit_medico: {
        id: 'kit_medico',
        name: 'Kit Médico',
        icon: '💊',
        type: 'tool',
        rarity: 'uncommon',
        description: 'Bandagens, ervas medicinais e instrumentos cirúrgicos básicos.',
        value: 35,
        weight: 2,
        usable: true,
        use: {
            effect: 'health',
            amount: 2,
            target: 'any',
            requiresRoll: true,
            rollAttribute: 'engenho',
            log: '💊 Você usa o kit médico com habilidade.',
            onSuccess: '+3 Saúde',
            onPartial: '+2 Saúde',
            onFail: '+1 Saúde (improvisado)'
        }
    },

    cantil: {
        id: 'cantil',
        name: 'Cantil',
        icon: '🍶',
        type: 'tool',
        rarity: 'common',
        description: 'Um cantil de couro para água. Essencial em viagens longas.',
        value: 3,
        weight: 2,
        usable: true,
        use: {
            effect: 'spirit',
            amount: 1,
            target: 'self',
            log: '🍶 Você bebe água fresca do cantil. Refrescante. +1 Espírito.'
        }
    },

    // ============================================
    // ESPECIAIS E LENDÁRIOS
    // ============================================

    espada_erlan: {
        id: 'espada_erlan',
        name: 'Lâmina de Erlan',
        icon: '⚔️',
        type: 'weapon',
        slot: 'mao_direita',
        rarity: 'legendary',
        description: 'A espada do Selador Erlan. Forjada com aço das estrelas.',
        value: 1000,
        weight: 4,
        bonusStats: {
            ferro: 3,
            coracao: 1
        },
        special: 'Banimento: Causa dano dobrado contra criaturas sobrenaturais',
        lore: 'Esta lâmina ajudou a selar Nhar há gerações. Ela reconhece o sangue de Erlan.',
        equipped: false
    },

    tomo_sabedoria: {
        id: 'tomo_sabedoria',
        name: 'Tomo da Sabedoria Antiga',
        icon: '📖',
        type: 'quest',
        rarity: 'legendary',
        description: 'Um livro antigo contendo conhecimento perdido dos Seladores.',
        value: 500,
        weight: 3,
        bonusStats: {
            engenho: 2
        },
        special: 'Conhecimento Proibido: Permite aprender rituais antigos',
        lore: 'Escrito pelos próprios Seladores antes da grande batalha.'
    },

    // ============================================
    // SUPRIMENTOS GERAIS
    // ============================================

    suprimentos_basicos: {
        id: 'suprimentos_basicos',
        name: 'Suprimentos Básicos',
        icon: '📦',
        type: 'supply',
        rarity: 'common',
        description: 'Comida, água e itens essenciais para sobrevivência.',
        value: 10,
        weight: 5,
        stackable: true
    }
};

// ============================================
// FUNÇÕES AUXILIARES
// ============================================

// Retorna item por ID
function getItemById(id) {
    return ITEMS_DATA[id] || null;
}

// Retorna todos os itens de um tipo
function getItemsByType(type) {
    return Object.values(ITEMS_DATA).filter(item => item.type === type);
}

// Retorna todos os itens de uma raridade
function getItemsByRarity(rarity) {
    return Object.values(ITEMS_DATA).filter(item => item.rarity === rarity);
}

// Retorna itens equipáveis em um slot específico
function getItemsBySlot(slot) {
    return Object.values(ITEMS_DATA).filter(item => item.slot === slot);
}

// Retorna todos os itens consumíveis
function getConsumables() {
    return Object.values(ITEMS_DATA).filter(item => item.usable || item.consumable);
}

// Retorna todos os itens de quest
function getQuestItems() {
    return Object.values(ITEMS_DATA).filter(item => item.questItem);
}

// Calcula o bônus total de stats de itens equipados
function calculateEquippedStats(equippedItems) {
    const stats = {
        fogo: 0,
        sombra: 0,
        ferro: 0,
        coracao: 0,
        engenho: 0
    };

    equippedItems.forEach(item => {
        if (item.bonusStats) {
            Object.keys(item.bonusStats).forEach(stat => {
                if (stats.hasOwnProperty(stat)) {
                    stats[stat] += item.bonusStats[stat];
                }
            });
        }
    });

    return stats;
}

// Exporta para uso global
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        ITEMS_DATA,
        getItemById,
        getItemsByType,
        getItemsByRarity,
        getItemsBySlot,
        getConsumables,
        getQuestItems,
        calculateEquippedStats
    };
}