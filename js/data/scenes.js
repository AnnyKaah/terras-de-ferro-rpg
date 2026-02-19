// scenes.js - Dados das cenas e decisões

const SCENES = [
    // --- MISSÃO 1: O SEGREDO DAS BRUMAS ---

    {
        number: "Cena 1",
        title: "Chegada a Vorgheim",
        environment: "env-village",
        description: [
            "É fim de tarde. A aldeia é pequena — talvez 40 pessoas. As casas são de madeira escura e pedra. O lago ao fundo brilha de forma estranha sob o crepúsculo.",
            "Poucos aldeões estão nas ruas, e os que estão evitam olhar nos olhos de vocês.",
            'Uma mulher idosa chamada Solveig se aproxima: "Forasteiros… vieram pela névoa, é? Melhor entrar antes do anoitecer. Já perdi meu filho para ela."'
        ],
        decisionTitle: "O que vocês fazem?",
        decisions: [
            {
                icon: "🏠",
                title: "Seguir Solveig",
                description: "Entrem na casa dela e ouçam o que ela tem a dizer sobre os desaparecimentos.",
                roll: "Daren → Coração (1d6 + 3)",
                requiresRoll: true,
                rollInfo: { playerNum: 2, attribute: 'coracao' },
                outcomes: {
                    success: "Ela conta que seu filho Halvar foi o primeiro a desaparecer — e que viu o conselheiro Grend perto do lago na noite anterior.",
                    partial: "Conta sobre Halvar, mas fica em pânico antes de mencionar Grend. Precisa ser acalmada.",
                    fail: "Ela desconfia de vocês, fecha a porta e grita que são espiões da névoa. Os aldeões ficam agitados."
                },
                effects: {
                    success: { progress: 1 },
                    partial: { progress: 0 },
                    fail: { progress: 0, spirit: { 1: -1, 2: -1 } }
                }
            },
            {
                icon: "🔍",
                title: "Explorar a Aldeia",
                description: "Vasculhem as ruas, ouçam conversas e observem comportamentos suspeitos antes do anoitecer.",
                roll: "Lyra → Sombra (1d6 + 2)",
                requiresRoll: true,
                rollInfo: { playerNum: 1, attribute: 'sombra' },
                outcomes: {
                    success: "Encontram símbolos de convocação entalhados nos postes — frescos, feitos há menos de uma semana. Alguém está alimentando a névoa.",
                    partial: "Acham os símbolos mas não entendem o significado ainda. A névoa chega mais cedo.",
                    fail: "São vistos pelo conselheiro Grend espionando. Ele os aborda com hostilidade."
                },
                effects: {
                    success: { progress: 1 },
                    partial: { progress: 0 },
                    fail: { progress: 0 }
                }
            }
        ]
    },

    // CENA 2 - Os Espectros da Névoa
    {
        number: "Cena 2",
        title: "Os Espectros da Névoa",
        environment: "env-mist",
        weather: "rain",
        description: [
            "Quando o sol se põe, a névoa negra rola pelo vale. Ela é densa, fria e cheira a terra molhada e algo mais — sangue velho e ferro enferrujado.",
            "Três criaturas emergem da névoa — humanoides distorcidos, feitos de sombra e fumaça. Elas cercam vocês lentamente.",
            'A do centro para e levanta um braço — não para atacar, mas para apontar. Aponta para dentro da aldeia. Para a casa do conselheiro Grend.'
        ],
        decisionTitle: "Como reagir às criaturas?",
        decisions: [
            {
                icon: "⚔️",
                title: "Atacar",
                description: "Lyra ataca com o arco as três criaturas.",
                roll: "Lyra → Fogo + Especial (1d6 + 4)",
                requiresRoll: true,
                rollInfo: { playerNum: 1, attribute: 'fogo', bonus: 1 },
                outcomes: {
                    success: "Dispersa as três. Mas a névoa fica mais densa.",
                    partial: "Dispersa duas, a terceira arranha Lyra.",
                    fail: "São cercados e atacados. Ambos levam dano."
                },
                effects: {
                    success: { progress: 1 },
                    partial: { progress: 0, health: { 1: -2 } },
                    fail: { health: { 1: -2, 2: -2 }, supplies: { 1: -1 } }
                }
            },
            {
                icon: "💬",
                title: "Escutar o Gesto",
                description: "Daren tenta compreender o que as criaturas querem comunicar.",
                roll: "Daren → Coração (1d6 + 3)",
                requiresRoll: true,
                rollInfo: { playerNum: 2, attribute: 'coracao' },
                outcomes: {
                    success: "As criaturas recuam. Vocês percebem que estão apontando para Grend — ele é a chave.",
                    partial: "Entendem o gesto, mas uma criatura avança nervosamente antes de recuar.",
                    fail: "As criaturas não conseguem se comunicar. Avançam juntas em desespero."
                },
                effects: {
                    success: { progress: 2, bond: 1 },
                    partial: { progress: 1, spirit: { 2: -1 } },
                    fail: { health: { 1: -2, 2: -2 } }
                }
            },
            {
                icon: "🏃",
                title: "Fugir para dentro",
                description: "Correm para a casa de Grend — as criaturas parecem evitá-la.",
                roll: "Ambos → Fogo (1d6 + Fogo)",
                requiresRoll: true,
                rollInfo: { playerNum: 1, attribute: 'fogo' }, // Um dos dois rola
                outcomes: {
                    success: "Chegam à casa de Grend. As criaturas param na porta — não podem entrar.",
                    partial: "Chegam, mas Lyra cai no caminho e perde o arco temporariamente.",
                    fail: "Perdidos na névoa. Gastam tempo e suprimentos até achar o caminho."
                },
                effects: {
                    success: { progress: 1 },
                    partial: { progress: 0, health: { 1: -1 } },
                    fail: { supplies: { 1: -2 }, spirit: { 1: -1, 2: -1 } }
                }
            }
        ]
    },

    // CENA 2.5 - O Pesadelo (NOVA CENA)
    {
        number: "Cena 2.5",
        title: "Sussurros na Escuridão",
        environment: "env-mist",
        description: [
            "Vocês encontram um abrigo temporário antes de confrontar Grend. O cansaço vence o medo.",
            "Mas o sono não traz descanso. Vocês compartilham um pesadelo: uma figura encapuzada oferece poder em troca de traição.",
            "A voz sussurra: 'Apenas um de vocês sairá vivo das montanhas. Abandone o outro.'"
        ],
        decisionTitle: "Como vocês reagem ao pesadelo?",
        decisions: [
            {
                icon: "🤝",
                title: "Reafirmar o Laço",
                description: "Acordam suando frio e prometem proteger um ao outro, não importa o custo.",
                roll: "Daren → Coração (1d6 + 3)",
                requiresRoll: true,
                rollInfo: { playerNum: 2, attribute: 'coracao' },
                outcomes: {
                    success: "A confiança afasta a sombra. Vocês se sentem renovados e unidos.",
                    partial: "Prometem lealdade, mas a dúvida planta uma semente no fundo da mente.",
                    fail: "A desconfiança cresce. Vocês se olham diferente pela manhã."
                },
                effects: {
                    success: { bond: 1, spirit: { 1: 1, 2: 1 } },
                    partial: { spirit: { 1: 1, 2: 1 }, bond: 0 },
                    fail: { spirit: { 1: -1, 2: -1 }, bond: -1 }
                }
            },
            {
                icon: "🧘",
                title: "Meditar sobre a Visão",
                description: "Lyra tenta entender a origem mágica desse sonho intrusivo.",
                roll: "Lyra → Engenho (1d6 + 2)",
                requiresRoll: true,
                rollInfo: { playerNum: 1, attribute: 'engenho' },
                outcomes: {
                    success: "Não foi um sonho. Foi Valdris tentando dividi-los. Agora vocês conhecem o inimigo.",
                    partial: "Percebe que é magia, mas a energia mental gasta causa dor de cabeça.",
                    fail: "A mente de Lyra fica vulnerável aos sussurros."
                },
                effects: {
                    success: { progress: 1, achievement: 'erudito' },
                    partial: { spirit: { 1: -1 } },
                    fail: { spirit: { 1: -2 } }
                }
            }
        ]
    },

    // CENA 3 - O Segredo de Grend
    {
        number: "Cena 3",
        title: "O Segredo de Grend",
        environment: "env-village",
        description: [
            "De manhã, vocês confrontam Grend, o conselheiro da aldeia — um homem de meia-idade com olhos que evitam o contato.",
            "Na mesa dele, semioculto sob um mapa, há um pergaminho com os mesmos símbolos dos postes.",
            "Ele sabe de algo. A questão é: ele é vítima, cúmplice ou vilão?"
        ],
        decisionTitle: "Como lidar com Grend?",
        decisions: [
            {
                icon: "⚔️",
                title: "Confrontar Abertamente",
                description: "Mostrem o pergaminho e exijam respostas. Intimidação direta.",
                roll: "Lyra → Ferro (1d6 + 1)",
                requiresRoll: true,
                rollInfo: { playerNum: 1, attribute: 'ferro' },
                outcomes: {
                    success: "Grend desmorona: confessa que ativou os símbolos sem saber o que faziam, seguindo instruções de um monge viajante chamado Valdris. Diz onde está o altar.",
                    partial: "Confessa parcialmente mas nega responsabilidade. Foge durante a noite — mas antes esconde mais pistas.",
                    fail: "Nega tudo e chama os aldeões. Vocês são expulsos da aldeia por perturbação da paz. Precisam agir sozinhos."
                },
                effects: {
                    success: { progress: 2 },
                    partial: { progress: 1 },
                    fail: { progress: 0, supplies: { 1: -1, 2: -1 } }
                }
            },
            {
                icon: "🕵️",
                title: "Investigar às Escondidas",
                description: "Enquanto Daren distrai Grend com conversa, Lyra vasculha a casa.",
                roll: "Lyra → Sombra (1d6 + 2) + Daren → Coração (1d6 + 3)",
                requiresRoll: true,
                rollInfo: { playerNum: 1, attribute: 'sombra' },
                outcomes: {
                    success: "Lyra encontra um diário com o mapa completo do altar E a identidade do monge: Valdris, o Encantador.",
                    partial: "Encontram o mapa mas fazem barulho. Grend os vê — exige explicações.",
                    fail: "Grend percebe e queima o diário. A pista se perde."
                },
                effects: {
                    success: { progress: 2 },
                    partial: { progress: 1 },
                    fail: { spirit: { 1: -1, 2: -1 } }
                }
            },
            {
                icon: "🤝",
                title: "Oferecer Ajuda",
                description: "Percebem que Grend está assustado. Oferecem proteção em troca de informação.",
                roll: "Daren → Coração (1d6 + 3)",
                requiresRoll: true,
                rollInfo: { playerNum: 2, attribute: 'coracao' },
                outcomes: {
                    success: "Grend chora e conta tudo: foi coagido pelo monge Valdris. Dá o mapa do altar e se junta a vocês como aliado.",
                    partial: "Conta o suficiente para encontrar o altar, mas foge antes de dar detalhes sobre Valdris.",
                    fail: "Grend mente que não sabe de nada. Mais tarde vocês o encontram tentando destruir evidências no lago."
                },
                effects: {
                    success: { progress: 2 },
                    partial: { progress: 1 },
                    fail: { supplies: { 1: -1 } }
                }
            }
        ]
    },

    // CENA 4 - A Traição no Caminho
    {
        number: "Cena 4",
        title: "A Traição no Caminho",
        environment: "env-mist",
        description: [
            "A caminho do altar nas montanhas, vocês são emboscados. Mas não por criaturas — por dois aldeões armados, liderados por ninguém menos que Solveig.",
            '"Vocês não vão destruir o altar. Meu filho Halvar está lá dentro. Se destruírem, ele morre de vez."',
            "Ela não está mentindo. E ela não está errada."
        ],
        decisionTitle: "Como resolver a emboscada?",
        decisions: [
            {
                icon: "💬",
                title: "Convencer Solveig",
                description: "Daren tenta explicar que há outra forma de salvar Halvar.",
                roll: "Daren → Coração (1d6 + 3)",
                requiresRoll: true,
                rollInfo: { playerNum: 2, attribute: 'coracao' },
                outcomes: {
                    success: "Ela abaixa as armas e chora. Conta sobre o sonho com Halvar. Solveig vira aliada.",
                    partial: "Ela recua, mas os aldeões ficam hostis. Vocês passam, mas ganham inimigos.",
                    fail: "Ela não acredita. Briga inevitável. Ela foge jurando vingança."
                },
                effects: {
                    success: { progress: 1, achievement: 'diplomata', bond: 1 },
                    partial: { progress: 1 },
                    fail: { health: { 1: -2, 2: -2 } }
                }
            },
            {
                icon: "🏃",
                title: "Driblar a Emboscada",
                description: "Lyra cria uma distração com fogo enquanto Daren guia por uma rota alternativa.",
                roll: "Lyra → Fogo (1d6 + 3)",
                requiresRoll: true,
                rollInfo: { playerNum: 1, attribute: 'fogo' },
                outcomes: {
                    success: "Escapam sem violência. Lyra nota marcas de queimadura em Solveig — ela também é uma vítima.",
                    partial: "Escapam, mas ficam separados na névoa por um tempo.",
                    fail: "Caem numa armadilha e ficam presos até o amanhecer."
                },
                effects: {
                    success: { progress: 1 },
                    partial: { spirit: { 1: -1, 2: -1 } },
                    fail: { supplies: { 1: -2, 2: -2 } }
                }
            }
        ]
    },

    // CENA 5 - O Altar nas Montanhas
    {
        number: "Cena 5",
        title: "O Altar nas Montanhas",
        environment: "env-crypt",
        description: [
            "O altar é uma pedra enorme coberta de runas. No centro, uma gema negra pulsa. Ao lado, Valdris, o Encantador, está sentado.",
            '"Finalmente. Alguém que pode terminar o que comecei." Ele não criou a maldição. Ele está preso nela há 40 anos.',
            "Ele revela que destruir a gema matará as almas presas. É preciso um sacrifício para libertá-las."
        ],
        decisionTitle: "O que fazer no altar?",
        decisions: [
            {
                icon: "💥",
                title: "Destruir a Gema",
                description: "Lyra decide que o risco é alto demais e golpeia a gema.",
                roll: "Lyra → Ferro (1d6 + 1)",
                requiresRoll: true,
                rollInfo: { playerNum: 1, attribute: 'ferro' },
                outcomes: {
                    success: "A gema quebra. A névoa recua. Mas Valdris e as almas desaparecem. A missão é cumprida, mas a um custo terrível.",
                    partial: "A gema racha e explode energia. Vocês são lançados para trás feridos.",
                    fail: "A gema é indestrutível. Valdris suspira: 'Precisam de outro caminho'."
                },
                effects: {
                    success: { progress: 2 },
                    partial: { progress: 1, health: { 1: -2, 2: -2 } },
                    fail: { health: { 1: -1 } }
                }
            },
            {
                icon: "📖",
                title: "Estudar com Valdris",
                description: "Daren tenta aprender o Ritual da Inversão com o monge.",
                roll: "Daren → Engenho (1d6 + 2)",
                requiresRoll: true,
                rollInfo: { playerNum: 2, attribute: 'engenho' },
                outcomes: {
                    success: "Valdris ensina o ritual: exige um sacrifício voluntário na névoa.",
                    partial: "Aprendem parte do ritual. Sabem que precisam de lágrimas verdadeiras.",
                    fail: "A névoa ataca enquanto estudam. Valdris se sacrifica para protegê-los."
                },
                effects: {
                    success: { progress: 2, achievement: 'erudito' },
                    partial: { progress: 1 },
                    fail: { spirit: { 1: -1, 2: -1 } }
                }
            },
            {
                icon: "🌫️",
                title: "Entrar na Névoa",
                description: "Um de vocês entra na névoa para buscar Halvar e a Pedra Âncora.",
                roll: "Lyra → Coração (1d6 + 1)",
                requiresRoll: true,
                rollInfo: { playerNum: 1, attribute: 'coracao' },
                outcomes: {
                    success: "Encontra Halvar e a localização da Pedra Âncora.",
                    partial: "Entra, mas começa a ser absorvida. Daren precisa puxá-la de volta ferida.",
                    fail: "Fica presa. Daren gasta tudo o que tem para resgatá-la."
                },
                effects: {
                    success: { progress: 2 },
                    partial: { progress: 1, health: { 1: -2 } },
                    fail: { health: { 1: -1, 2: -1 }, spirit: { 1: -1, 2: -1 } }
                }
            }
        ]
    },

    // CENA 6 - Clímax da Missão 1
    {
        number: "Cena 6",
        title: "O Confronto com Aldrek",
        environment: "env-combat",
        boss: { name: "Aldrek, o Colosso", maxHP: 3 }, // Configuração do Chefe
        description: [
            "A névoa se concentra e dela emerge Aldrek — um guerreiro colossal feito de raiva acumulada.",
            '"Liberdade ou silêncio eterno. Escolham."',
            "Este é o momento final da primeira missão."
        ],
        decisionTitle: "Decisão Final da Missão 1",
        decisions: [
            {
                icon: "⚔️",
                title: "A Grande Batalha",
                description: "Enfrentem Aldrek em combate direto. É preciso desgastá-lo.",
                roll: "Lyra → Ferro (1d6 + 1)",
                requiresRoll: true,
                rollInfo: { playerNum: 1, attribute: 'ferro' },
                stayInScene: true, // O padrão é ficar na cena até vencer
                outcomes: {
                    success: "Golpe certeiro! A armadura de Aldrek racha sob o impacto.",
                    partial: "Você acerta Aldrek, mas ele contra-ataca com brutalidade.",
                    fail: "Aldrek bloqueia e absorve sua energia vital para se regenerar."
                },
                effects: {
                    success: { bossProgress: 1, progress: 1, achievement: 'sobrevivente' }, // Adicionado progress: 1 para recompensar o combate
                    partial: { bossProgress: 1, health: { 1: -2 } },
                    fail: { health: { 1: -3, 2: -3 }, bossProgress: -1 }
                },
            },
            {
                icon: "️",
                title: "Negociar com Aldrek",
                description: "Daren tenta alcançar a humanidade restante no monstro.",
                roll: "Daren → Coração (1d6 + 3)",
                requiresRoll: true,
                rollInfo: { playerNum: 2, attribute: 'coracao' },
                outcomes: {
                    success: 'Aldrek para. "Finalmente alguém me vê." Ele se dissolve em luz. Final emocionante!',
                    partial: "Ele hesita, mas a raiva vence. O combate é inevitável, mas ele está enfraquecido.",
                    fail: "Ele não ouve. O ataque é brutal."
                },
                effects: {
                    success: { progress: 2 },
                    partial: { progress: 1 },
                    fail: { health: { 1: -2, 2: -2 } }
                }
            }
        ]
    },

    // CENA 6.5 - Acampamento (Downtime)
    {
        number: "Interlúdio",
        title: "O Mercador da Estrada",
        environment: "env-village",
        description: [
            "A poeira da batalha assenta. Na estrada, vocês encontram um mercador viajante com uma carroça cheia de curiosidades.",
            '"Tempos difíceis, viajantes", diz ele. "Tenho itens que podem ajudar na jornada, se tiverem suprimentos para trocar."'
        ],
        decisionTitle: "Loja do Mercador (Gastar Suprimentos)",
        decisions: [
            {
                icon: "🧪",
                title: "Lyra: Comprar Poção (2 Sup)",
                description: "Uma poção vermelha que fecha feridas instantaneamente.",
                requiresRoll: false,
                requires: { supplies: 2, player: 1 },
                stayInScene: true, // Permite continuar na loja
                outcomes: { success: "Lyra troca suprimentos por uma poção de cura." },
                effects: { 
                    success: { 
                        supplies: { 1: -2 }, 
                        addItem: { name: "Poção de Cura", consumable: true, use: { effect: 'health', amount: 3, log: "🧪 Poção usada: +3 Saúde" } } 
                    } 
                }
            },
            {
                icon: "🧪",
                title: "Daren: Comprar Poção (2 Sup)",
                description: "Uma poção vermelha que fecha feridas instantaneamente.",
                requiresRoll: false,
                requires: { supplies: 2, player: 2 },
                stayInScene: true,
                outcomes: { success: "Daren troca suprimentos por uma poção de cura." },
                effects: { 
                    success: { 
                        supplies: { 2: -2 }, 
                        addItem: { name: "Poção de Cura", consumable: true, use: { effect: 'health', amount: 3, log: "🧪 Poção usada: +3 Saúde" } } 
                    } 
                }
            },
            {
                icon: "🛡️",
                title: "Comprar Capa de Viajante (3 Sup)",
                description: "Lyra: Uma capa resistente que ajuda a se esconder.",
                requiresRoll: false,
                requires: { supplies: 3, player: 1 },
                stayInScene: true,
                outcomes: { success: "Lyra adquire uma capa de excelente qualidade." },
                effects: { 
                    success: { supplies: { 1: -3 }, addItem: { name: "Capa de Viajante", slot: "corpo", bonusStats: { sombra: 1 } } } 
                }
            },
            {
                icon: "👋",
                title: "Seguir Viagem",
                description: "Agradecer ao mercador e continuar a jornada para o Lago Sombrio.",
                requiresRoll: false,
                stayInScene: false,
                nextScene: 7 // Aponta explicitamente para a Cena 7 (Lago Sombrio)
            }
        ]
    },

    // --- MISSÃO 2: O CHAMADO DO LAGO PROFUNDO ---

    // CENA 7 (M2-1) - O Lago Sombrio
    {
        number: "Cena 7",
        title: "O Lago Sombrio",
        environment: "env-lake",
        weather: "rain",
        description: [
            "Três dias após Vorgheim. O Lago Sombrio começa a borbulhar. Lyra descobre que seu amuleto tem o mesmo símbolo do altar.",
            "Kjeld, um pescador, revela uma entrada submersa. 'O verdadeiro altar está embaixo d'água'.",
            "Vocês precisam descer."
        ],
        decisionTitle: "Como explorar o lago?",
        decisions: [
            {
                icon: "⛵",
                title: "Usar o Barco",
                description: "Navegar com cuidado e usar luzes para afastar as sombras.",
                roll: "Lyra → Engenho (1d6 + 2)",
                requiresRoll: true,
                rollInfo: { playerNum: 1, attribute: 'engenho' },
                outcomes: {
                    success: "Encontram a caverna seca e intacta. Acham um diário com o brasão da família de Lyra.",
                    partial: "Encontram a caverna, mas uma criatura ataca o barco. Lyra se fere.",
                    fail: "O barco afunda. Vocês nadam até a margem perdendo suprimentos."
                },
                effects: {
                    success: { 
                        progress: 2, 
                        addItem: [
                            { name: "Diário Antigo" },
                            { name: "Poção de Cura Menor", consumable: true, use: { effect: 'health', amount: 2, log: "🧪 Uma poção foi usada, restaurando 2 de Saúde!" } }
                        ]
                    },
                    partial: { progress: 1, health: { 1: -2 } },
                    fail: { supplies: { 1: -2, 2: -2 } }
                }
            },
            {
                icon: "🏊",
                title: "Mergulhar",
                description: "Nadar diretamente para a entrada submersa, confiando na resistência física.",
                roll: "Daren → Ferro (1d6 + 1)",
                requiresRoll: true,
                rollInfo: { playerNum: 2, attribute: 'ferro' },
                outcomes: {
                    success: "Encontram a caverna com ar! Há escritos antigos nas paredes.",
                    partial: "Chegam, mas quase se perdem no escuro. Exaustos e com frio.",
                    fail: "Criaturas percebem vocês. Precisam emergir imediatamente."
                },
                effects: {
                    success: { progress: 2 },
                    partial: { progress: 1, health: { 2: -2 }, spirit: { 2: -1 } },
                    fail: { health: { 1: -1, 2: -1 }, supplies: { 1: -1, 2: -1 } }
                }
            }
        ]
    },

    // CENA 8 (M2-2) - A Cripta Submersa
    {
        number: "Cena 8",
        title: "A Cripta Submersa",
        environment: "env-crypt",
        description: [
            "A caverna leva a uma cripta antiga. Daren traduz: 'Aqui jaz o que não deve acordar. Selado pelos Seis.'",
            "Lyra vê o nome de seu avô, Erlan, entre os Seladores. Ela é a última descendente.",
            "O Despertar só pode ser resselado por sangue dos Seis."
        ],
        decisionTitle: "O que fazer com essa revelação?",
        decisions: [
            {
                icon: "🩸",
                title: "Usar Sangue Agora",
                description: "Lyra oferece seu sangue imediatamente para fortalecer o selo.",
                roll: "Lyra → Ferro (1d6 + 1)",
                requiresRoll: true,
                rollInfo: { playerNum: 1, attribute: 'ferro' },
                outcomes: {
                    success: "As inscrições brilham. A cripta estabiliza. O ritual inicia.",
                    partial: "O ritual inicia, mas instável. A cripta começa a afundar lentamente.",
                    fail: "Reação violenta. Lyra é jogada contra a parede e ferida gravemente."
                },
                effects: {
                    success: { progress: 2 },
                    partial: { progress: 1 },
                    fail: { health: { 1: -3 } }
                }
            },
            {
                icon: "📜",
                title: "Decifrar Primeiro",
                description: "Daren tenta entender as nuances do ritual antes de agir.",
                roll: "Daren → Engenho (1d6 + 2)",
                requiresRoll: true,
                rollInfo: { playerNum: 2, attribute: 'engenho' },
                outcomes: {
                    success: "Descobre que precisa de sangue E uma promessa dita em voz alta. O nome do mal é Nhar.",
                    partial: "Decifra parcialmente. Sabe do sangue, mas perde detalhes da promessa.",
                    fail: "Nhar desperta parcialmente. Um tentáculo de névoa ataca."
                },
                effects: {
                    success: { progress: 2 },
                    partial: { progress: 1 },
                    fail: { health: { 1: -2, 2: -2 } }
                }
            }
        ]
    },

    // CENA 9 (M2-3) - Os Guardiões de Nhar
    {
        number: "Cena 9",
        title: "Os Guardiões de Nhar",
        environment: "env-combat",
        boss: { name: "Guardiões de Pedra", maxHP: 4 }, // Adiciona barra de vida de 4 pontos
        description: [
            "Quatro guardiões de pedra e névoa bloqueiam o caminho. Foram criados para impedir intrusos.",
            "Um deles carrega um medalhão com o símbolo de Erlan, avô de Lyra."
        ],
        decisionTitle: "Como passar pelos guardiões?",
        decisions: [
            {
                icon: "⚔️",
                title: "Lutar Juntos",
                description: "Lyra e Daren combinam forças para destruir os quatro guardiões.",
                roll: "Lyra e Daren → Fogo Combinado (1d6 + 4)",
                requiresRoll: true,
                rollInfo: { playerNum: 1, attribute: 'fogo', bonus: 1 }, // Bônus simulando ajuda
                stayInScene: true, // Mantém na cena até zerar a vida do chefe
                outcomes: {
                    success: "Destroem todos. Lyra recupera o medalhão de seu avô.",
                    partial: "Passam, mas com custo sério. Ambos feridos na batalha.",
                    fail: "São empurrados de volta e perdem tempo precioso."
                },
                effects: {
                    success: { 
                        bossProgress: 2, // Causa 2 de dano no chefe (ataque forte)
                        addItem: { 
                            name: "Medalhão de Erlan", 
                            slot: "pescoço",
                            bonusStats: { coracao: 1 } 
                        }, 
                        achievement: 'guerreiro', 
                        bond: 1 },
                    partial: { bossProgress: 1, health: { 1: -3, 2: -3 } }, // Causa 1 de dano
                    fail: { supplies: { 1: -2, 2: -2 } }
                }
            },
            {
                icon: "🏅",
                title: "Usar o Medalhão",
                description: "Lyra tenta usar sua conexão ancestral para comandar os guardiões.",
                requires: { item: "Medalhão de Erlan" },
                roll: "Lyra → Coração (1d6 + 1)",
                requiresRoll: true,
                rollInfo: { playerNum: 1, attribute: 'coracao' },
                outcomes: {
                    success: "Os guardiões reconhecem o sangue de Erlan e abrem passagem.",
                    partial: "Dois param, dois atacam. Daren precisa distraí-los.",
                    fail: "Eles não a reconhecem. O combate é inevitável."
                },
                effects: {
                    success: { progress: 2 },
                    partial: { progress: 1, health: { 2: -1 } },
                    fail: { health: { 1: -2 } }
                }
            }
        ]
    },

    // CENA 10 (M2-4) - A Torre Submersa
    {
        number: "Cena 10",
        title: "A Torre Submersa de Nhar",
        environment: "env-crypt",
        description: [
            "A câmara central contém uma torre onde queima uma chama negra: Nhar, a Fome Eterna.",
            "No pedestal, o amuleto de Erlan tem um encaixe vazio esperando o sangue de Lyra.",
            "Nhar está despertando."
        ],
        decisionTitle: "O Dilema do Amuleto",
        decisions: [
            {
                icon: "✋",
                title: "Completar o Selo",
                description: "Lyra corre para colocar o sangue no amuleto enquanto Daren a protege.",
                roll: "Daren → Coração (1d6 + 3)",
                requiresRoll: true,
                rollInfo: { playerNum: 2, attribute: 'coracao' },
                outcomes: {
                    success: "O amuleto brilha. Nhar urra e a torre começa a colapsar. Precisam fugir!",
                    partial: "O selo ativa mas incompleto. Nhar está preso, mas não selado.",
                    fail: "Nhar derruba Lyra antes que ela toque o amuleto. Situação crítica."
                },
                effects: {
                    success: { progress: 2 },
                    partial: { progress: 1 },
                    fail: { health: { 1: -3 } }
                }
            },
            {
                icon: "🗣️",
                title: "Dizer a Promessa",
                description: "Daren dita as palavras antigas para Lyra repetir com convicção.",
                roll: "Daren → Engenho (1d6 + 2)",
                requiresRoll: true,
                rollInfo: { playerNum: 2, attribute: 'engenho' },
                outcomes: {
                    success: "O amuleto voa para a mão de Lyra. O ritual se completa perfeitamente.",
                    partial: "As palavras funcionam, mas exigem um sacrifício vital de Lyra.",
                    fail: "Daren lembra errado. A promessa errada acorda Nhar completamente."
                },
                effects: {
                    success: { progress: 2 },
                    partial: { progress: 2, health: { 1: -3 } },
                    fail: { spirit: { 1: -2, 2: -2 } }
                }
            }
        ]
    },

    // CENA 11 (M2-Clímax) - O Despertar de Nhar
    {
        number: "Cena Final",
        title: "O Despertar de Nhar",
        environment: "env-combat",
        description: [
            "Nhar não é um ser, é uma mentira: a de que a fome é maior que tudo.",
            "Para selá-lo, Lyra precisa acreditar que o laço entre vocês é mais forte que o vazio.",
            "Conversem entre si: o que seus personagens sentem um pelo outro agora?"
        ],
        decisionTitle: "Decisão Final da Campanha",
        decisions: [
            {
                icon: "❤️",
                title: "O Selo do Laço",
                description: "Usem a força da conexão entre Lyra e Daren para banir a escuridão.",
                roll: "Daren → Coração (1d6 + 3)",
                requiresRoll: true,
                rollInfo: { playerNum: 2, attribute: 'coracao' },
                outcomes: {
                    success: "O amuleto explode em luz. Nhar some. O lago fica azul. Vocês venceram!",
                    partial: "Nhar é selado, mas o amuleto parte ao meio. Uma ligação permanente entre vocês.",
                    fail: "O selo falha parcialmente. Nhar escapa enfraquecido. A luta continua outro dia."
                },
                effects: {
                    success: { progress: 2, achievement: 'lenda', bond: 2 },
                    partial: { progress: 2, health: { 1: -3 } },
                    fail: { progress: 1 }
                }
            },
            {
                icon: "✨",
                title: "Sacrificar o Amuleto",
                description: "Lyra decide destruir a herança de sua família para acabar com Nhar de vez.",
                roll: "Lyra → Ferro (1d6 + 1)",
                requiresRoll: true,
                rollInfo: { playerNum: 1, attribute: 'ferro' },
                outcomes: {
                    success: "O amuleto se desfaz em energia pura. Nhar é desfeito. Final definitivo.",
                    partial: "Nhar recua, dormente por gerações. É suficiente por hoje.",
                    fail: "A energia é absorvida. Nhar fica mais forte. Fujam!"
                },
                effects: {
                    success: { progress: 2, removeItem: "Medalhão de Erlan" },
                    partial: { progress: 2 },
                    fail: { health: { 1: -2, 2: -2 } }
                }
            }
        ]
    },

    // CENA 12 - Epílogo
    {
        number: "Epílogo",
        title: "O Legado dos Heróis",
        environment: "env-village",
        description: [
            "A calmaria retorna às Terras de Ferro. A névoa se dissipou, revelando um amanhecer claro.",
            "Vocês olham para o caminho que percorreram. As cicatrizes permanecem, mas a escuridão recuou. Agora, resta uma última questão.",
            "O que será da parceria entre a Caçadora e o Curandeiro?"
        ],
        decisionTitle: "O Destino dos Laços",
        decisions: [
            {
                icon: "⚔️",
                title: "Irmãos de Armas (Requer Laço Alto)",
                description: "Seus destinos estão entrelaçados. Vocês partem juntos para a próxima aventura.",
                requiresRoll: true, // Simula um teste para verificar o valor
                roll: "Teste de Laços (Automático)",
                rollInfo: { playerNum: 1, attribute: 'coracao' }, // Dummy info
                outcomes: {
                    success: "Vocês juram lutar juntos até o fim dos dias. Uma nova lenda nasce.",
                    partial: "Vocês viajam juntos por um tempo, mas sabem que um dia seus caminhos se separarão.",
                    fail: "Apesar da vitória, as diferenças são muitas. Vocês se despedem com respeito."
                },
                // Usamos a lógica de 'roll' para simular a verificação de Bond no game.js ou apenas narrativa
                // Como o sistema atual é baseado em dados, vamos fazer uma decisão narrativa que depende do jogador interpretar seu Bond
                // OU, melhor: Uma decisão que não rola dados, mas o texto final depende da imaginação (RPG raiz).
                // Vamos manter simples e narrativo:
                requiresRoll: false,
                onSelect: () => {
                    // Esta lógica seria idealmente tratada no game.js, mas aqui deixamos a escolha narrativa
                    // O jogador escolhe baseado no que sente que conquistou.
                }
            },
            {
                icon: "👋",
                title: "Caminhos Separados",
                description: "A missão acabou. É hora de voltar para casa, cada um para o seu lado.",
                requiresRoll: false
            }
        ]
    }
];