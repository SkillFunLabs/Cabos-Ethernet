/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { WireType, PairType, QuizQuestion } from './types';

export const WIRES: WireType[] = [
  {
    id: 'ow',
    pin: 1,
    pinA: 3,
    label: 'Branco/Laranja',
    striped: true,
    color: '#fb8c00', // Saturated orange for high visibility
    role: 'TX+',
    shortRole: 'Transmissão Positiva (Transmit +)',
    roleDescription: 'Linha positiva para envio de dados do computador para a rede.',
    roleClass: 'role-tx',
    pairName: 'Par Laranja',
    detail: 'No padrão T568B, este fio atua como o polo positivo de transmissão de dados (TX+). Juntos com o Laranja (Pin 2), formam um par diferencial torcido para cancelamento de ruído.'
  },
  {
    id: 'o',
    pin: 2,
    pinA: 6,
    label: 'Laranja',
    striped: false,
    color: '#e65100',
    role: 'TX−',
    shortRole: 'Transmissão Negativa (Transmit −)',
    roleDescription: 'Linha de retorno (negativa) para o canal de envio de dados.',
    roleClass: 'role-tx',
    pairName: 'Par Laranja',
    detail: 'Atua como o polo negativo de transmissão de dados (TX-). Torcido firmemente com o Branco/Laranja para garantir imunidade contra interferências eletromagnéticas.'
  },
  {
    id: 'gw',
    pin: 3,
    pinA: 1,
    label: 'Branco/Verde',
    striped: true,
    color: '#388e3c',
    role: 'RX+',
    shortRole: 'Receção Positiva (Receive +)',
    roleDescription: 'Linha positiva para receber dados vindos da rede para o computador.',
    roleClass: 'role-rx',
    pairName: 'Par Verde',
    detail: 'No padrão T568B, faz o papel de polo positivo de receção de dados (RX+). Forma um par diferencial com o Verde (Pin 6). Curiosamente, está separado do seu parceiro físico pelos pinos 4 e 5.'
  },
  {
    id: 'b',
    pin: 4,
    pinA: 4,
    label: 'Azul',
    striped: false,
    color: '#1e88e5',
    role: 'BI_DA+ / PoE+',
    shortRole: 'Dados Bidirecionais A / Alimentação PoE',
    roleDescription: 'Inativo em 10/100 Mbps. Em Gigabit, atua como canal de dados bidirecional. Em PoE, transporta energia política positiva.',
    roleClass: 'role-poe',
    pairName: 'Par Azul',
    detail: 'No modo Gigabit, atua no terceiro canal bidirecional (dados extra). Em redes antigas de 100 Mbps (Fast Ethernet), este par não servia para dados e era aproveitado para energia (PoE) ou telefonia.'
  },
  {
    id: 'bw',
    pin: 5,
    pinA: 5,
    label: 'Branco/Azul',
    striped: true,
    color: '#1e88e5',
    role: 'BI_DA− / PoE−',
    shortRole: 'Dados Bidirecionais A / Alimentação PoE (Retorno)',
    roleDescription: 'Inativo em 10/100 Mbps. Em Gigabit, atua como canal bidirecional. Em PoE, fornece retorno negativo de alimentação.',
    roleClass: 'role-poe',
    pairName: 'Par Azul',
    detail: 'Trabalha em par diferencial com o Azul (Pin 4). Importante para canais Gigabit Ethernet e em redes que alimentam pontos de acesso (APs), telefones ou câmaras IP via Standard PoE.'
  },
  {
    id: 'g',
    pin: 6,
    pinA: 2,
    label: 'Verde',
    striped: false,
    color: '#2e7d32',
    role: 'RX−',
    shortRole: 'Receção Negativa (Receive −)',
    roleDescription: 'Linha de retorno (negativa) para o canal de receção de dados.',
    roleClass: 'role-rx',
    pairName: 'Par Verde',
    detail: 'Polo negativo de receção de dados (RX-). É torcido em par diferencial com o Branco/Verde (Pin 3). Em cablagem T568B, este par precisa ser aberto ao cravar para pular os pinos centrais (Azuis).'
  },
  {
    id: 'brw',
    pin: 7,
    pinA: 7,
    label: 'Branco/Castanho',
    striped: true,
    color: '#795548',
    role: 'BI_DD+ / PoE++',
    shortRole: 'Dados Bidirecionais D / Alimentação PoE de Alta Potência',
    roleDescription: 'Canal extra para dados em Gigabit. Suporta redes de dados ultra velozes e nova geração de energia PoE++.',
    roleClass: 'role-poe',
    pairName: 'Par Castanho',
    detail: 'Forma um par com o Castanho (Pin 8). Ativado para elevar a velocidade a 1 Gbps (Gigabit). Também crucial para PoE de altíssima potência (PoE++ ou UPOE) de até 90W.'
  },
  {
    id: 'br',
    pin: 8,
    pinA: 8,
    label: 'Castanho',
    striped: false,
    color: '#5d4037',
    role: 'BI_DD− / PoE--',
    shortRole: 'Dados Bidirecionais D / Alimentação PoE de Alta Potência (Retorno)',
    roleDescription: 'Retorno de canal para dados Gigabit e retorno de energia para PoE++.',
    roleClass: 'role-poe',
    pairName: 'Par Castanho',
    detail: 'Este é o último fio do RJ45. Completa o par diferencial com o Branco/Castanho. Atua na transmissão de dados simultânea Gigabit e no circuito de retorno de alta voltagem para PoE++.'
  }
];

export const PAIRS: PairType[] = [
  {
    name: 'Par Laranja (Pinos 1 e 2)',
    color: '#fb8c00',
    pinsB: [1, 2],
    pinsA: [3, 6],
    funcIcon: '📤',
    funcTitle: 'Dados TX (Transmission)',
    funcDesc: 'Este par é encarregado de enviar dados que saem do seu computador ou dispositivo local para o switch ou roteador (Transmissão de Saída).',
    detailedTech: 'Em redes tradicionais de 10/100 Mbps, este par opera de forma independente para enviar os dados. Consiste nos Pinos 1 (Branco/Laranja, TX+) e 2 (Laranja, TX-). Funciona como um sinal diferencial elétrico equilibrado.'
  },
  {
    name: 'Par Verde (Pinos 3 e 6)',
    color: '#388e3c',
    pinsB: [3, 6],
    pinsA: [1, 2],
    funcIcon: '📥',
    funcTitle: 'Dados RX (Reception)',
    funcDesc: 'Este par é encarregado de capturar os dados que chegam da rede ao seu computador ou placa de rede (Receção de Entrada).',
    detailedTech: 'Em redes Fast Ethernet (10/100 Mbps), o par verde escuta os dados elétricos entrantes da rede. É feito pelos Pinos 3 (Branco/Verde, RX+) e 6 (Verde, RX-). No conector RJ45, este par está separado fisicamente pelos pinos 4 e 5 (par Azul), um design de atenuação de "Cross-Talk" (segregação de sinais para evitar crosstalk indutivo).'
  },
  {
    name: 'Par Azul (Pinos 4 e 5)',
    color: '#1e88e5',
    pinsB: [4, 5],
    pinsA: [4, 5],
    funcIcon: '⚡',
    funcTitle: '+ Dados Gigabit & PoE',
    funcDesc: 'Em redes antigas (10/100 Mbps), o par azul ficava ocioso (livre de dados) e era usado para telefonia analógica ou PoE simples. Em redes modernas de 1000 Mbps (Gigabit), este par passa a transmitir e receber dados simultaneamente usando cancelamento ativo de eco!',
    detailedTech: 'Os pinos 4 (Azul, positivo) e 5 (Branco/Azul, negativo) atuam em conjunto. Em Gigabit Ethernet (1000BASE-T), todos os canais deixam de ser exclusivamente unidirecionais (TX ou RX separados). Eles passam a funcionar de modo Bidirecional de Alta Velocidade (BI_DA), dobrando a largura de banda. Paralelamente, em redes ativas, este par é usado para injetar eletricidade DC de até 48-57 Volts (Power over Ethernet - PoE) para alimentar telefones IP ou câmaras de vigilância sem precisar de tomada de parede.'
  },
  {
    name: 'Par Castanho (Pinos 7 e 8)',
    color: '#795548',
    pinsB: [7, 8],
    pinsA: [7, 8],
    funcIcon: '🔌',
    funcTitle: '++ Dados Gigabit & PoE++',
    funcDesc: 'Idêntico ao par azul em Gigabit: converte-se em canal ativo bidirecional de dados. Além disso, no novo padrão de energia de alta eficiência (PoE++ / Type 3 e 4), ele transporta até 90 Watts de potência elétrica!',
    detailedTech: 'Os pinos 7 (Branco/Castanho) e 8 (Castanho) fecham o conjunto físico do cabo de rede UTP CAT5e/CAT6. Juntos, constituem o quarto canal ativo para viabilizar as elevadas taxas de transferência de ligações Gigabit (BI_DD). Atuam como suporte em sistemas com PoE++ (802.3bt), que dividem a carga de energia entre todos os pares ou injetam alta potência nos pares livres para acionar displays, switches maiores e roteadores Wi-Fi 6/7.'
  }
];

export const TECHNICAL_EXPLANATIONS = {
  rxtx: {
    title: 'O que são os dados RX e TX?',
    concept: 'RX (Receive, Receção) e TX (Transmit, Transmissão) são as duas tarefas cruciais em qualquer comunicação de fibra óptica ou cobre.',
    content: [
      'Em redes Ethernet de 10/100 Mbps (Fast Ethernet), a transmissão e a receção de dados eram físicas e eletricamente redundantes e separadas. O par laranja cuidava de empurrar o sinal (TX), enquanto o par verde esperava o sinal e o interpretava (RX).',
      'Essa separação garantia que o cabo não necessitasse de processadores complexos nem de chips avançados para separar sinais numa mesma linha física, operando como uma estrada de mão dupla perfeitamente segmentada.',
      'A sinalização é Diferencial: O sinal viaja em duas vias invertidas (um fio positivo, ex: TX+, e o outro negativo, ex: TX-). O receptor não mede o sinal contra a terra, mas sim a diferença entre os dois fios. Qualquer ruído elétrico externo afetará ambos os fios igualmente; quando o sinal é subtraído no circuito integrado principal, o ruído desaparece de forma limpa. Este truque torna os cabos de rede imunes a perturbações eletromagnéticas próximas (ruído comum).'
    ]
  },
  gigabit: {
    title: 'O que são os "+ Dados Gigabit" e "++ Dados Gigabit"?',
    concept: 'Explicação detalhada sobre a transição de taxas Fast Ethernet (100 Mbps) para Gigabit Ethernet (1000 Mbps).',
    content: [
      'No padrão antigo de 100 Mbps, apenas os pinos 1, 2, 3 e 6 eram ativos para rede. Os pinos 4, 5, 7 e 8 ficavam "vazios".',
      'Para alcançar velocidades de 1.000 Mbps (1 Gbps) mantendo a mesma compatibilidade física (conector RJ45 e os mesmos 8 fios), a engenharia não pôde simplesmente aumentar a frequência para níveis infinitos por questões de diafonia. A solução foi re-arquitetar o uso dos fios ociosos de forma inteligente.',
      'Ativação do Par Azul (+ Dados Gigabit): O terceiro canal elétrico composto pelos pinos 4 e 5 é ativado. Em Gigabit, as interfaces utilizam circuitos híbridos termo-acoplados ("transceivers") com supressão inteligente de ecos. Em vez de termos um receptor passivo ou transmissor passivo, cada par transmite E recebe dados ao mesmo tempo, de modo Full Duplex bidirecional combinatório.',
      'Ativação do Par Castanho (++ Dados Gigabit): Os pinos 7 e 8, constituindo o quarto canal (par Castanho), passam pela exata mesma transformação física, cooperando simultaneamente na malha. Desse modo, as quatro estradas físicas operam na velocidade máxima bidirecional de 250 Mbps cada uma. Somativas, o tráfego atinge a marca consolidada de exatos 1.000 Mbps (1 Gbps).',
      'Portabilidade de Carga (Super PoE): Os pinos "++" adicionados ao par castanho expandem as tecnologias de alimentação elétrica. O PoE++ (802.3bt Classe 8) utiliza canais simultâneos em todos os 4 pares para bombear elevadas amperagens de energia com perdas mínimas por sobreaquecimento, assegurando alta potência (até 90W) para operar equipamentos pesados na rede física sem perigos elétricos.'
    ]
  }
};

export const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: 1,
    question: 'Qual é o fio que deve ser cravado na posição 1 (Pin 1) no padrão T568B?',
    options: ['Laranja sólido', 'Branco/Laranja', 'Branco/Verde', 'Azul sólido'],
    correctAnswer: 'Branco/Laranja',
    explanation: 'No padrão T568B, o fio de início (Pin 1) é sempre o Branco com riscas laranja (Branco/Laranja), que opera a polaridade positiva do canal de Transmissão (TX+).'
  },
  {
    id: 2,
    question: 'O par Verde (pinos 3 e 6) serve principalmente para qual função em redes Fast Ethernet (10/100 Mbps)?',
    options: ['Apenas PoE', 'Transmitir dados (TX)', 'Receber dados (RX)', 'Apenas telefonia'],
    correctAnswer: 'Receber dados (RX)',
    explanation: 'Em redes Fast Ethernet, o par Verde composto pelos pinos 3 (Branco/Verde) e 6 (Verde sólido) atua de forma exclusiva para a receção (RX) de dados elétricos.'
  },
  {
    id: 3,
    question: 'Por que a tecnologia Gigabit Ethernet (1000 Mbps) precisa de todos os 4 pares ativos?',
    options: [
      'Porque ela opera de forma bidirecional simultânea em cada um dos 4 pares, dividindo a taxa total (250 Mbps por par).',
      'Porque ela desliga os pinos TX e RX originais.',
      'Para que o cabo fique mais pesado e não sofra balanço com o vento.',
      'Apenas para fornecer energia elétrica para todos os dispositivos.'
    ],
    correctAnswer: 'Porque ela opera de forma bidirecional simultânea em cada um dos 4 pares, dividindo a taxa total (250 Mbps por par).',
    explanation: 'A rede Gigabit (1000BASE-T) ativou os canais Azul (+ Dados) e Castanho (++ Dados). Ela utiliza tecnologia inteligente de cancelamento de eco fazendo dados fluírem nos dois sentidos simultaneamente em todos os 4 pares.'
  },
  {
    id: 4,
    question: 'O sinal elétrico que viaja nos pares diferencial é eliciado de que forma para neutralizar o ruído eletromagnético?',
    options: [
      'Subtraindo o sinal de um fio do outro (TX+ menos TX-), o que elimina qualquer ruído de modo comum que tenha afetado ambos nos trajetos.',
      'O sinal elétrico é blindado por um fluxo de ar que circula entre os fios.',
      'Com um revestimento de chumbo cobrindo cada cabo internamente.',
      'Fios com riscas brancas recusam-se a carregar ruídos elétricos.'
    ],
    correctAnswer: 'Subtraindo o sinal de um fio do outro (TX+ menos TX-), o que elimina qualquer ruído de modo comum que tenha afetado ambos nos trajetos.',
    explanation: 'O par diferencial usa polaridades inversas. Como o ruído induzido afeta ambos os fios da mesma forma, ao subtrair os sinais no destino, o ruído comum se cancela perfeitamente, permitindo sinal claro mesmo em longas distâncias.'
  },
  {
    id: 5,
    question: 'A qual especificação física corresponde a sigla "PoE++\'" associada principalmente ao Par Castanho no padrão T568B?',
    options: [
      'Alimentação elétrica simplificada de 5V para hubs USB.',
      'Alimentação elétrica de alta potência por cabo de rede (IEEE 802.3bt), injetando até 90W de potência para antenas de Wi-Fi 6/7 ou displays inteligentes.',
      'Um recurso exclusivo de cablagem subterrânea submarina.',
      'Nenhuma de dados, apenas para isolar contra calor.'
    ],
    correctAnswer: 'Alimentação elétrica de alta potência por cabo de rede (IEEE 802.3bt), injetando até 90W de potência para antenas de Wi-Fi 6/7 ou displays inteligentes.',
    explanation: 'A sigla PoE++ (Power over Ethernet Avançado) viabiliza alimentar grandes infraestruturas elétricas usando a fiação de dados Ethernet de cobre ativa compartilhada.'
  },
  {
    id: 6,
    question: 'Qual é a correta orientação física do conector RJ45 de plástico para contar os pinos de 1 a 8 em ordem?',
    options: [
      'Com a presilha (trava) de plástico voltada para CIMA e os contatos metálicos virados para longe de si.',
      'Com a presilha (trava) de plástico voltada para BAIXO, os contatos metálicos de cobre virados para SI, contando da esquerda para a direita.',
      'Sempre contando da direita para a esquerda de cabeça para baixo.',
      'Não há regra padrão, depende do fabricante.'
    ],
    correctAnswer: 'Com a presilha (trava) de plástico voltada para BAIXO, os contatos metálicos de cobre virados para SI, contando da esquerda para a direita.',
    explanation: 'A convenção universal estabelece: com a patilha virada para trás/baixo e os dentes dourados à sua frente, o pino 1 fica no extremo esquerdo e o pino 8 reside na extrema direita.'
  },
  {
    id: 7,
    question: 'Que fios mudam de lugar entre o padrão T568A e o padrão T568B?',
    options: [
      'O par verde muda inteiramente de lugar com o par laranja (os pinos 1, 2, 3 e 6 trocam posições entre si).',
      'O par azul e o par castanho invertem posições.',
      'Apenas os fios sólidos trocam com os de riscas brancas.',
      'Nenhum, os dois padrões são idênticos em cores, mudando apenas a velocidade.'
    ],
    correctAnswer: 'O par verde muda inteiramente de lugar com o par laranja (os pinos 1, 2, 3 e 6 trocam posições entre si).',
    explanation: 'No T568A, o par verde entra nos pinos 1 e 2, enquanto o par laranja passa a residir nos pinos 3 e 6. O resto do cabo (azul e castanho) permanece rigorosamente inalterado.'
  }
];
