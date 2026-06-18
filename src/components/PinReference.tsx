/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { WIRES } from '../data';
import { CableStandard } from '../types';
import { RefreshCw, HelpCircle, ArrowRightLeft, Settings, Info, AlertTriangle, CheckCircle2, Wrench, ShieldAlert, Zap } from 'lucide-react';

const TROUBLESHOOTING_SCENARIOS = [
  {
    id: 'symptom-gigabit-drop',
    title: '🟢 Conexão Limitada a 100 Mbps (Não atinge Gigabit/1000 Mbps)',
    description: 'A rede funciona, mas a velocidade máxima no computador fica presa em 100 Mbps em vez de 1 Gbps.',
    likelyCables: ['Par Azul (Pinos 4, 5)', 'Par Castanho (Pinos 7, 8)'],
    affectedPins: [4, 5, 7, 8],
    rootCause: 'As redes Gigabit (1000BASE-T / CAT5e ou superior) necessitam obrigatoriamente de todos os 8 fios funcionais para transmitir dados a frequências elevadas em simultâneo. Por outro lado, as ligações antigas Fast Ethernet (100 Mbps) apenas necessitam de 4 fios (Laranja e Verde). Se houver uma falha de contacto nos pinos 4, 5, 7 ou 8 (ou se eles se soltaram no conector RJ45), o switch e o computador negoceiam automaticamente uma velocidade degradada de 100 Mbps.',
    howToFix: [
      'Utilize um testador de cabos RJ45 para verificar se os LEDs correspondentes aos pinos 4, 5, 7 e 8 acendem em ambas as extremidades.',
      'Verifique se a força física exercida pelo alicate de cravar empurrou as lâminas metálicas douradas do RJ45 o suficiente para cortar o isolamento do fio azul e castanho.',
      'Corte a ponta do conector RJ45 e refaça a crimpagem assegurando que os fios azul, branco/azul, branco/castanho e castanho chegam até ao fundo do conector antes de travar.'
    ]
  },
  {
    id: 'symptom-no-poe',
    title: '⚡ Equipamento IP (Câmara ou Telefone) não liga via PoE',
    description: 'Ao ligar um telefone IP, ponto de acesso Wi-Fi ou câmara de videovigilância ao switch PoE, o dispositivo permanece desligado e sem corrente elétrica.',
    likelyCables: ['Par Azul (Pinos 4, 5) - Alimentação Positiva', 'Par Castanho (Pinos 7, 8) - Retorno Negativo'],
    affectedPins: [4, 5, 7, 8],
    rootCause: 'O Standard PoE (Power over Ethernet - Modo B) injeta corrente contínua de cerca de 48V utilizando os pares livres do cabo (Par Azul para o polo positivo e Par Castanho para o polo negativo). Se houver fraco contacto ou rutura interna nestes cabos, a alimentação nunca chegará ao dispositivo, mesmo que a rede local (dados) possa dar sinais mínimos de atividade.',
    howToFix: [
      'Teste a continuidade das linhas com um multímetro na escala de resistência física (ohms) medindo a resistência da ponta A para a ponta B; ela deve estar perto de 0 ohms.',
      'Examine o conector RJ45 para ver se as rebarbas de alumínio/cobre não estão curtas ou cruzadas nas cavidades 4, 5, 7 e 8.',
      'Substitua o injetor PoE ou mude para um padrão de crimpagem T568B novo em ambos os lados, garantindo o aperto máximo do alicate.'
    ]
  },
  {
    id: 'symptom-total-loss',
    title: '🔴 Sem Sinal / Cabo Desconectado / Perda Total de Rede',
    description: 'O computador diz "Cabo de rede desligado", os LEDs da porta LAN do switch e do PC mantêm-se totalmente apagados e não há qualquer ligação.',
    likelyCables: ['Par Laranja (Pinos 1, 2)', 'Par Verde (Pinos 3, 6)'],
    affectedPins: [1, 2, 3, 6],
    rootCause: 'O tráfego de dados elementar (TX e RX) necessitava obrigatoriamente dos pinos 1, 2 (par de transmissão) e dos pinos 3, 6 (par de receção). Se algum destes 4 fios estiver rompido, com pinos trocados ou mal cravados, o circuito elétrico fica aberto, impedindo os chips de rede de detetarem resistência mútua. A ligação falha totalmente.',
    howToFix: [
      'Verifique se conectou o cabo na porta correta e se seguiu estritamente o código de cores T568B em ambos os lados (Branco/Laranja, Laranja, Branco/Verde, Verde nos pinos 1, 2, 3 e 6).',
      'Erros muito comuns de iniciados consistem em colocar o fio Verde no pino 4 e o Azul no pino 6. Lembre-se: o par verde fica dividido! O pino 3 é Branco/Verde, e o pino 6 é Verde (pulando o par azul central nos pinos 4 e 5).',
      'Recrave as pontas utilizando novos conectores de boa qualidade.'
    ]
  },
  {
    id: 'symptom-high-loss',
    title: '📡 Flutuações de Sinal, Desconexões e Perda de Pacotes',
    description: 'A rede liga e desliga de forma intermitente, ou a internet fica extremamente lenta com perdas altas de pacotes em testes de ping.',
    likelyCables: ['Todos os pares (Principalmente problemas de Isolação/Torção)'],
    affectedPins: [1, 2, 3, 4, 5, 6, 7, 8],
    rootCause: 'As linhas de sinal num cabo de rede são entrançadas (twisted) com rácios específicos de torção para neutralizar a diafonia (crosstalk) e interferências externas. Se ao cravar o cabo RJ45 destorcer os pares excessivamente (mais de 13 milímetros), as linhas de cobre funcionam como pequenas antenas emissoras de ruído, corrompendo os pacotes que transitam a alta frequência.',
    howToFix: [
      'Ao descarnar a bainha exterior cinzenta ou azul do cabo, remova no máximo 2 centímetros de casca para não destabilizar as torções originais dos pares de cobre.',
      'Introduza os pares no RJ45 mantendo a torção até o limite máximo do encosto à ficha plástica de crimpagem.',
      'Se estiver a utilizar cabo blindado (FTP/STP) próximo a cabos elétricos de alta tensão doméstica, certifique-se de ligar o fio terra de drenagem à carcaça metálica de conectores RJ45 blindados compatíveis.'
    ]
  }
];

const COLOR_REPAIR_MAP = [
  {
    colorName: 'Laranja / Branco-Laranja',
    pins: [1, 2],
    mainRole: 'Transmissão Dedicada (TX+ e TX-)',
    symptomIfBroken: 'Interrupção total em ligações Fast Ethernet (100M). Em Gigabit, impede a autonegociação de velocidade superior e causa perda total de pacotes de envio.',
    diagnosticMethod: 'Se o computador consegue receber pacotes (LED RX pisca no switch), mas falha no envio de pedidos (IP não é atribuído via DHCP), o par Laranja tem enorme probabilidade de ter falha de crimpagem no pino 1 ou 2.'
  },
  {
    colorName: 'Verde / Branco-Verde',
    pins: [3, 6],
    mainRole: 'Receção Dedicada (RX+ e RX-)',
    symptomIfBroken: 'Paragem total do fluxo de entrada de rede. O sistema não recebe respostas DNS ou pacotes de entrada, identificando cabo desconectado.',
    diagnosticMethod: 'Verifique se inverteu o pino 3 com o 6. O pino 3 de um cabo T568B deve ser indispensavelmente o Branco/Verde e o pino 6 o Verde completo. Se eles forem misturados com outros pares (ex: pino 3 com pino 4), as taxas de colisão de pacotes colapsam a ligação física.'
  },
  {
    colorName: 'Azul / Branco-Azul',
    pins: [4, 5],
    mainRole: 'Dados Auxiliares Gigabit & Injetor PoE Positivo',
    symptomIfBroken: 'Perda do suporte Gigabit de alta velocidade (cabo degrada-se funcionalmente para Fast Ethernet 100Mbps). Câmaras PoE e Aparelhos IP deixam de ligar.',
    diagnosticMethod: 'Utilize um testador de rede LAN portátil. Os canais 4 e 5 devem dar sinal contínuo acendendo em paralelo. Se apenas um acender, a linha de energia PoE e canal Gigabit está interrompida.'
  },
  {
    colorName: 'Castanho / Branco-Castanho',
    pins: [7, 8],
    mainRole: 'Dados Auxiliares Gigabit & Injetor PoE Negativo (Retorno)',
    symptomIfBroken: 'Redução drástica de largura de banda em redes que necessitam de mais de 100Mbps. Falha grave de PoE devido à quebra de retorno de terra ou energia negativa.',
    diagnosticMethod: 'Inspeccione visualmente se a ponta do fio Castanho/Branco-Castanho não ficou demasiado curta dentro do alojamento plástico do RJ45 ao cravar. Se o cobre do fio 8 não entrar em contacto com o dente metálico dourado, a velocidade Gigabit nunca será ativada.'
  }
];

export function PinReference() {
  const [selectedStandard, setSelectedStandard] = useState<CableStandard>('T568B');
  
  // States for Left-End and Right-End of a network cable to calculate Direct vs Crossover
  const [leftEnd, setLeftEnd] = useState<CableStandard>('T568B');
  const [rightEnd, setRightEnd] = useState<CableStandard>('T568B');

  // Diagnostics states
  const [selectedSymptom, setSelectedSymptom] = useState<string>('symptom-gigabit-drop');
  const [activeDiagnosticTab, setActiveDiagnosticTab] = useState<'symptoms' | 'colors'>('symptoms');

  const orderedWires = [...WIRES].sort((a, b) => {
    const valA = selectedStandard === 'T568B' ? a.pin : a.pinA;
    const valB = selectedStandard === 'T568B' ? b.pin : b.pinA;
    return valA - valB;
  });

  const getCableTypeInfo = () => {
    if (leftEnd === rightEnd) {
      return {
        type: 'Cabo Direto (Straight-Through / Patch Cable)',
        colorClass: 'text-cyan-400 bg-cyan-950/30 border-cyan-800/40',
        useCase: 'O cabo universal padrão. Usado principalmente para conectar dispositivos finais (como Computadores, Consolas, Smart TVs, Impressoras) a dispositivos de rede (Switch, Hub ou Router).',
        techExplanation: 'Os pinos correspondem exatamente nas duas pontas (ex: Pino 1 de um lado conecta com o Pino 1 do outro). Como os sinais de Transmissão (TX) vão direto para o destino, o Switch faz a inversão interna necessária para o canal RX receptivo.'
      };
    } else {
      return {
        type: 'Cabo Cruzado (Crossover Cable)',
        colorClass: 'text-amber-400 bg-amber-950/30 border-amber-800/40',
        useCase: 'Usado para conectar dois equipamentos iguais diretamente (ex: Computador para Computador, Router para Router, Switch para Switch sem porta uplink).',
        techExplanation: 'Como não há um switch intermediário inteligente para intermediar os sinais, este cabo cruza fisicamente as linhas RX com TX de uma extremidade para a outra. Por isso, a ponta esquerda usa o padrão T568B (fios laranja transmitem) e a ponta direita usa o padrão T568A (fios laranja recebem, e vice-versa).'
      };
    }
  };

  const cableType = getCableTypeInfo();

  return (
    <div className="space-y-8" id="pin-reference">
      
      {/* SECTION 1: Interative Table & color configuration */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h3 className="text-white font-semibold text-lg flex items-center gap-2">
              📋 Tabela Oficial de Pinagem das Normas
            </h3>
            <p className="text-slate-400 text-xs mt-1">
              Visualize e estude a sequência correta de cores para cada norma de cablagem.
            </p>
          </div>
          
          <div className="flex bg-slate-950 p-1 rounded-lg border border-slate-850 self-start">
            <button
              onClick={() => setSelectedStandard('T568B')}
              className={`px-3 py-1.5 rounded text-xs font-semibold ${
                selectedStandard === 'T568B'
                  ? 'bg-orange-500 text-black font-bold shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Padrão T568B (Comum)
            </button>
            <button
              onClick={() => setSelectedStandard('T568A')}
              className={`px-3 py-1.5 rounded text-xs font-semibold ${
                selectedStandard === 'T568A'
                  ? 'bg-green-600 text-white font-bold shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Padrão T568A (Legado)
            </button>
          </div>
        </div>

        {/* Tabular rendering of standard */}
        <div className="border border-slate-800 rounded-xl overflow-hidden bg-slate-950/40">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-950 text-slate-400 uppercase tracking-wider text-[10px] font-mono border-b border-slate-850">
                <th className="py-3 px-4 font-bold">Pino</th>
                <th className="py-3 px-4 font-bold">Amostra Visual</th>
                <th className="py-3 px-4 font-bold">Cor do Fio</th>
                <th className="py-3 px-4 font-bold">Sinal / Canal</th>
                <th className="py-3 px-4 font-bold">Par de Rede</th>
                <th className="py-3 px-4 font-bold hidden md:table-cell">Função do Canal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-850">
              {orderedWires.map((wire) => {
                const pinNum = selectedStandard === 'T568B' ? wire.pin : wire.pinA;
                return (
                  <tr key={wire.id} className="hover:bg-slate-900/40 transition-colors">
                    {/* Pin number */}
                    <td className="py-3.5 px-4 font-bold text-slate-200 font-mono text-sm">
                      {pinNum}
                    </td>

                    {/* Wire sample block */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center">
                        <div
                          className="w-11 h-4 rounded-full border border-black/50 relative overflow-hidden flex-shrink-0"
                          style={{ backgroundColor: wire.color }}
                        >
                          {wire.striped && (
                            <div
                              className="absolute inset-x-0 h-full opacity-85"
                              style={{
                                backgroundImage: `repeating-linear-gradient(45deg, #ffffff 0px, #ffffff 4px, transparent 4px, transparent 8px)`
                              }}
                            />
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Wire label text */}
                    <td className="py-3.5 px-4">
                      <span className="text-white font-medium text-xs sm:text-sm">{wire.label}</span>
                      <span className="text-[10px] block text-slate-500 font-mono mt-0.5">
                        {wire.striped ? '○ Branco com Risca' : '● Cor Sólida'}
                      </span>
                    </td>

                    {/* TX / RX Signal role */}
                    <td className="py-3.5 px-4 font-semibold">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-mono border ${
                        wire.roleClass === 'role-tx'
                          ? 'bg-amber-950/20 text-orange-400 border-orange-950'
                          : wire.roleClass === 'role-rx'
                          ? 'bg-emerald-950/20 text-emerald-400 border-emerald-950'
                          : 'bg-indigo-950/20 text-indigo-400 border-indigo-950'
                      }`}>
                        {selectedStandard === 'T568B' ? wire.role : (pinNum === 1 || pinNum === 2 ? (pinNum === 1 ? 'TX+' : 'TX-') : (pinNum === 3 || pinNum === 6 ? (pinNum === 3 ? 'RX+' : 'RX-') : wire.role))}
                      </span>
                    </td>

                    {/* Network Pair */}
                    <td className="py-3.5 px-4 text-slate-400 text-[11px] font-mono">
                      {wire.pairName}
                    </td>

                    {/* Long details */}
                    <td className="py-3.5 px-4 text-slate-400 leading-relaxed text-[11px] hidden md:table-cell max-w-xs">
                      {wire.detail}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Crimp Sequence Shortcut Mnemonic */}
        <div className="mt-6 bg-slate-950 rounded-xl p-4 border border-slate-850">
          <h4 className="text-white font-medium text-sm flex items-center gap-1.5 mb-2">
            🧠 Mnemónica de Sequência para Crimpador (Esquerda para Direita)
          </h4>
          <p className="text-slate-400 text-xs leading-relaxed mb-4">
            Em instalações rápidas no terreno, memorize as iniciais de cada cor para acelerar a crimpagem sem recorrer ao manual.
          </p>

          <div className="flex flex-wrap gap-2">
            {(selectedStandard === 'T568B' 
              ? ['Branco-Laranja', 'Laranja', 'Branco-Verde', 'Azul', 'Branco-Azul', 'Verde', 'Branco-Castanho', 'Castanho']
              : ['Branco-Verde', 'Verde', 'Branco-Laranja', 'Azul', 'Branco-Azul', 'Laranja', 'Branco-Castanho', 'Castanho']
            ).map((lbl, idx) => {
              const matchedWire = WIRES.find(w => w.label.replace('/', '-') === lbl || w.label === lbl);
              const isStriped = lbl.startsWith('Branco-');
              return (
                <div
                  key={idx}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-800 text-xs font-mono font-medium"
                >
                  <span
                    className="w-2.5 h-2.5 rounded-full inline-block border border-black/30"
                    style={{
                      backgroundColor: matchedWire ? matchedWire.color : '#fff',
                      backgroundImage: isStriped ? `linear-gradient(45deg, #fff 50%, ${matchedWire?.color} 50%)` : 'none'
                    }}
                  />
                  <span className="text-slate-200">
                    P{idx + 1}: {lbl}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* SECTION 2: Direct vs Crossover Analyzer */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
        <div>
          <h3 className="text-white font-semibold text-lg flex items-center gap-2">
            🔌 Detector Inteligente: Cabo Direto vs Cruzado
          </h3>
          <p className="text-slate-400 text-xs mt-1">
            Configure as regras de crimpagem de ambas as extremidades (Ponta A e Ponta B) para verificar que tipo de cabo você fabricou eletronicamente.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch mt-6">
          
          {/* Controls: Left End selection (4 cols) */}
          <div className="md:col-span-4 bg-slate-950 border border-slate-850 rounded-xl p-4 flex flex-col justify-between">
            <div>
              <span className="text-[10px] uppercase font-mono tracking-wider font-semibold text-orange-400">Ponta Esquerda (A)</span>
              <h4 className="text-white font-medium text-sm mt-1">Extremidade do Cabo L</h4>
            </div>
            
            <div className="space-y-2 mt-4">
              {['T568B', 'T568A'].map((std) => (
                <button
                  key={std}
                  onClick={() => setLeftEnd(std as CableStandard)}
                  className={`w-full py-2.5 rounded-lg text-xs font-semibold uppercase tracking-wider border transition-all ${
                    leftEnd === std
                      ? (std === 'T568B' ? 'bg-orange-500 text-black border-orange-400 font-bold shadow' : 'bg-green-600 text-white border-green-500 font-bold shadow')
                      : 'bg-slate-900 text-slate-400 border-slate-800 hover:border-slate-700 hover:text-white'
                  }`}
                >
                  Configuração {std}
                </button>
              ))}
            </div>

            <div className="text-[10px] text-slate-500 mt-4 leading-normal">
              Inicia com {leftEnd === 'T568B' ? 'Branco-Laranja, Laranja' : 'Branco-Verde, Verde'}.
            </div>
          </div>

          {/* Core Indicator Display (4 cols) */}
          <div className="md:col-span-4 bg-gradient-to-t from-slate-950 to-slate-900 border border-slate-850 rounded-xl p-5 flex flex-col justify-center items-center text-center">
            <span className="text-[10px] uppercase font-mono tracking-wider text-slate-500 mb-2">Relatório do Chipset</span>
            
            <div className="w-12 h-12 bg-slate-850 rounded-full flex items-center justify-center border border-slate-800 mb-3 text-cyan-400">
              <ArrowRightLeft className="w-6 h-6" />
            </div>

            <span className={`text-xs font-mono font-medium px-2.5 py-1 rounded-full border ${cableType.colorClass}`}>
              {cableType.type}
            </span>
          </div>

          {/* Controls: Right End selection (4 cols) */}
          <div className="md:col-span-4 bg-slate-950 border border-slate-850 rounded-xl p-4 flex flex-col justify-between">
            <div>
              <span className="text-[10px] uppercase font-mono tracking-wider font-semibold text-green-500">Ponta Direita (B)</span>
              <h4 className="text-white font-medium text-sm mt-1">Extremidade do Cabo R</h4>
            </div>

            <div className="space-y-2 mt-4">
              {['T568B', 'T568A'].map((std) => (
                <button
                  key={std}
                  onClick={() => setRightEnd(std as CableStandard)}
                  className={`w-full py-2.5 rounded-lg text-xs font-semibold uppercase tracking-wider border transition-all ${
                    rightEnd === std
                      ? (std === 'T568B' ? 'bg-orange-500 text-black border-orange-400 font-bold shadow' : 'bg-green-600 text-white border-green-500 font-bold shadow')
                      : 'bg-slate-900 text-slate-400 border-slate-800 hover:border-slate-700 hover:text-white'
                  }`}
                >
                  Configuração {std}
                </button>
              ))}
            </div>

            <div className="text-[10px] text-slate-500 mt-4 leading-normal">
              Inicia com {rightEnd === 'T568B' ? 'Branco-Laranja, Laranja' : 'Branco-Verde, Verde'}.
            </div>
          </div>

        </div>

        {/* Summary Details */}
        <div className="mt-5 p-4 rounded-xl bg-slate-950 border border-slate-850 space-y-2">
          <p className="text-slate-300 text-xs font-semibold">🔍 Cenário Ideal de Aplicação:</p>
          <p className="text-slate-400 text-xs leading-relaxed">{cableType.useCase}</p>
          <div className="h-px bg-slate-850 my-3" />
          <p className="text-slate-300 text-xs font-semibold">⚙️ Funcionamento Físico:</p>
          <p className="text-slate-400 text-xs leading-relaxed">{cableType.techExplanation}</p>
          
          <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-850 mt-4 text-[11px] text-slate-500 flex gap-2 items-start leading-normal">
            <Info className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" />
            <span>
              <strong>Dica Tecnológica (Auto MDI-X):</strong> Antigamente de facto necessitávamos imenso de cabos cruzados para ligar dois computadores direto. No entanto, hoje as placas de rede modernas usam o padrão <strong>Auto MDI-X</strong>. Este circuito inteligente analisa a ligação de silício e inverte os sinais TX e RX através de matrizes eletrónicas internas. Portanto, qualquer caboDireto moderno funcionará mesmo em ligações PC-para-PC.
            </span>
          </div>
        </div>
      </div>

      {/* SECTION 3: Dedicated Troubleshooting & Cable Repair Matrix */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        {/* Glow backdrop decorative */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-red-500/5 rounded-full blur-[100px] pointer-events-none" />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5 mb-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1 rounded bg-red-950/40 border border-red-900/30 text-red-400">
                <Wrench className="w-4 h-4" />
              </span>
              <h3 className="text-white font-semibold text-lg">
                🛠️ Guia de Diagnóstico & Reparação de Avarias por Cor
              </h3>
            </div>
            <p className="text-slate-400 text-xs mt-1">
              Saiba mapear que fio de cobre ou cor específica origina cada perda de sinal e como testar e reparar de forma profissional.
            </p>
          </div>

          <div className="flex bg-slate-950 p-1 rounded-lg border border-slate-850 self-start">
            <button
              onClick={() => setActiveDiagnosticTab('symptoms')}
              className={`px-3 py-1.5 rounded text-xs font-semibold flex items-center gap-1.5 transition-all ${
                activeDiagnosticTab === 'symptoms'
                  ? 'bg-red-650 text-white font-bold shadow-[0_0_12px_rgba(239,68,68,0.25)]'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5 text-red-500" />
              Sintomas de Rede
            </button>
            <button
              onClick={() => setActiveDiagnosticTab('colors')}
              className={`px-3 py-1.5 rounded text-xs font-semibold flex items-center gap-1.5 transition-all ${
                activeDiagnosticTab === 'colors'
                  ? 'bg-blue-600 text-white font-bold shadow-[0_0_12px_rgba(59,130,246,0.25)]'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Info className="w-3.5 h-3.5 text-blue-400" />
              Análise por Par/Cor
            </button>
          </div>
        </div>

        {activeDiagnosticTab === 'symptoms' ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* List of select buttons on Left */}
            <div className="lg:col-span-5 space-y-2.5">
              <span className="text-[10px] text-slate-500 font-mono uppercase tracking-wider block mb-1">Escolha o problema detetado:</span>
              {TROUBLESHOOTING_SCENARIOS.map((sc) => {
                const isSelected = selectedSymptom === sc.id;
                return (
                  <button
                    key={sc.id}
                    onClick={() => setSelectedSymptom(sc.id)}
                    className={`w-full text-left p-3.5 rounded-xl border transition-all flex gap-3 ${
                      isSelected
                        ? 'bg-slate-950 border-red-500/60 shadow-lg shadow-red-950/20'
                        : 'bg-slate-950/40 border-slate-850 hover:border-slate-800 hover:bg-slate-950/60'
                    }`}
                  >
                    <div className="flex-shrink-0 mt-0.5">
                      <div className={`w-2.5 h-2.5 rounded-full ${
                        isSelected ? 'bg-red-500 animate-ping' : 'bg-slate-600'
                      }`} />
                    </div>
                    <div>
                      <h4 className={`text-xs font-bold font-sans tracking-tight transition-colors ${
                        isSelected ? 'text-red-400' : 'text-slate-200'
                      }`}>
                        {sc.title}
                      </h4>
                      <p className="text-[10px] text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                        {sc.description}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Interactive display and simulation schema in standard B */}
            <div className="lg:col-span-7 bg-slate-950 border border-slate-850 rounded-2xl p-5 space-y-6">
              {(() => {
                const activeSymptom = TROUBLESHOOTING_SCENARIOS.find(s => s.id === selectedSymptom) || TROUBLESHOOTING_SCENARIOS[0];
                return (
                  <>
                    <div className="flex flex-col md:flex-row gap-5 items-stretch border-b border-slate-850 pb-5">
                      {/* Left: Simulating RJ45 crimped pins highlighting */}
                      <div className="flex-shrink-0 flex flex-col justify-between bg-slate-900 border border-slate-800 p-4 rounded-xl min-w-[210px] items-center text-center">
                        <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest block mb-3">Pinos no Conector</span>
                        
                        <div className="relative bg-slate-950 border border-slate-800 p-3 rounded-lg flex flex-col justify-end w-36 h-28 shadow-inner overflow-hidden">
                          {/* Inner wires layout */}
                          <div className="flex items-end justify-between gap-1 h-full w-full">
                            {[1, 2, 3, 4, 5, 6, 7, 8].map((pNum) => {
                              const isWarn = activeSymptom.affectedPins.includes(pNum);
                              const standardBColorMap: Record<number, string> = {
                                1: '#fb8c00', // Branco/Laranja striped
                                2: '#e65100', // Laranja solid
                                3: '#388e3c', // Branco/Verde striped
                                4: '#1e88e5', // Azul solid
                                5: '#1e88e5', // Branco/Azul striped
                                6: '#2e7d32', // Verde solid
                                7: '#795548', // Branco/Castanho striped
                                8: '#5d4037', // Castanho solid
                              };
                              return (
                                <div key={pNum} className="flex-1 flex flex-col justify-end items-center h-full">
                                  {/* Golden contact plate */}
                                  <div className={`w-full h-5 rounded-t-xs transition-all duration-300 ${
                                    isWarn 
                                      ? 'bg-red-500 animate-pulse border border-red-400 shadow-[0_0_8px_rgba(239,68,68,0.8)]' 
                                      : 'bg-amber-500/40 border border-amber-500/20'
                                  }`} />
                                  <span className="text-[8px] font-mono font-bold text-slate-500 mt-0.5">{pNum}</span>
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        <div className="mt-3 text-[10px] text-red-400 font-medium">
                          ⚠ {activeSymptom.affectedPins.length} fios sob suspeita!
                        </div>
                      </div>

                      {/* Right: Technical diagnostics */}
                      <div className="flex-1 space-y-3">
                        <div className="bg-red-950/15 border border-red-900/30 p-2.5 rounded-lg flex items-start gap-2 text-[11px] text-red-300">
                          <CheckCircle2 className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                          <div>
                            <span className="font-bold">Cobre e Vias Suspeitas: </span>
                            <span className="font-mono">{activeSymptom.likelyCables.join(' & ')}</span>
                          </div>
                        </div>

                        <div>
                          <span className="text-[10px] text-slate-500 font-mono uppercase tracking-wider block">Causa Original Física:</span>
                          <p className="text-slate-300 text-xs leading-relaxed mt-1">
                            {activeSymptom.rootCause}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Step by step instructions list to repair */}
                    <div>
                      <div className="flex items-center gap-1.5 mb-3 text-slate-300 text-xs font-bold">
                        <Wrench className="w-3.5 h-3.5 text-cyan-400" />
                        Ações Recomendadas para Diagnóstico & Reparação no Terreno:
                      </div>
                      <div className="space-y-2">
                        {activeSymptom.howToFix.map((step, idx) => (
                          <div key={idx} className="flex items-start gap-2.5 bg-slate-900 border border-slate-850 p-2.5 rounded-lg">
                            <span className="w-5 h-5 bg-slate-800 rounded-full flex items-center justify-center font-mono font-bold text-[10px] text-cyan-400 flex-shrink-0">
                              {idx + 1}
                            </span>
                            <p className="text-slate-400 text-[11px] sm:text-xs leading-relaxed">{step}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                );
              })()}
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <span className="text-[10px] text-slate-500 font-mono uppercase tracking-wider block">Inspeção Detalhada por Par Físico e Cor:</span>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {COLOR_REPAIR_MAP.map((crm, idx) => (
                <div key={idx} className="bg-slate-950 border border-slate-850 rounded-xl p-4 space-y-3 hover:border-slate-800 transition-colors">
                  <div className="flex items-center justify-between border-b border-slate-900 pb-2">
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-3.5 h-3.5 rounded-full border border-black/40"
                        style={{
                          backgroundColor: crm.pins[0] === 1 ? '#fb8c00' : crm.pins[0] === 3 ? '#388e3c' : crm.pins[0] === 4 ? '#1e88e5' : '#795548',
                          backgroundImage: `linear-gradient(45deg, #fff 40%, transparent 40%)`
                        }}
                      />
                      <h4 className="text-white text-xs font-bold">{crm.colorName}</h4>
                    </div>
                    <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950/30 border border-cyan-900/40 px-1.5 py-0.5 rounded">
                      Pinos: {crm.pins.join(' e ')}
                    </span>
                  </div>

                  <div className="space-y-2">
                    <div>
                      <span className="text-[9px] text-slate-500 font-mono uppercase">Função Fisiológica de Rede:</span>
                      <p className="text-slate-200 text-xs font-medium leading-relaxed font-sans">{crm.mainRole}</p>
                    </div>

                    <div>
                      <span className="text-[9px] text-slate-500 font-mono uppercase">Sintoma Clínico se Falhar:</span>
                      <p className="text-slate-400 text-xs leading-relaxed">{crm.symptomIfBroken}</p>
                    </div>

                    <div className="bg-slate-900/60 border border-slate-850/50 p-2.5 rounded-sm">
                      <span className="text-[9px] text-emerald-400 font-mono uppercase font-bold block mb-0.5">Como Isolar / Diagnosticar:</span>
                      <p className="text-slate-400 text-[11px] leading-relaxed">{crm.diagnosticMethod}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-slate-950 border border-slate-850/60 p-4.5 rounded-xl text-slate-400 text-xs space-y-2 leading-relaxed">
              <p className="text-white font-bold text-xs flex items-center gap-1.5">
                <ShieldAlert className="w-4 h-4 text-amber-500" />
                Dica Profissional de Certificação de Redes CAT6 e CAT6A:
              </p>
              <p>
                Os cabos modernos de Categoria 6 (CAT6) e superiores operam com frequências de até 250MHz (onde cada par é separado fisicamente por um separador cruzado plástico central chamado <em>spline</em>). Ao efetuar reparações manuais ou cravar fichas novas, evite esticar fisicamente ou amolgar o cabo com as mãos perto do conector. A integridade física da geometria helicoidal dos fios internos é o que assegura as taxas de transferência multi-gigabit livres de interferência.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
