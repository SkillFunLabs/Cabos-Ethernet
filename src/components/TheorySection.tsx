/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { TECHNICAL_EXPLANATIONS, PAIRS } from '../data';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowRightLeft, Radio, Zap, Server, Shield, Laptop2, HelpCircle, Activity, Check, Plus, Minus } from 'lucide-react';

const pairDetails = {
  orange: {
    name: 'Par Laranja (Tráfego TX - Envio)',
    posPin: 'Pino 1 (Branco/Laranja)',
    posPolarity: 'TX+ (Sinal de Transmissão Positivo)',
    negPin: 'Pino 2 (Laranja)',
    negPolarity: 'TX- (Sinal de Transmissão Negativo)',
    color: '#fb8c00',
    colorBg: 'rgba(251, 140, 0, 0.15)',
    colorStroke: '#fb8c00',
    colorNegStroke: '#e65100',
    colorPosText: 'text-orange-400',
    colorNegText: 'text-orange-500',
    bgStyle: { backgroundColor: '#e65100' },
    bgStripeStyle: { background: 'repeating-linear-gradient(45deg, #fb8c00, #fb8c00 4px, #ffffff 4px, #ffffff 8px)' },
  },
  green: {
    name: 'Par Verde (Tráfego RX - Receção)',
    posPin: 'Pino 3 (Branco/Verde)',
    posPolarity: 'RX+ (Sinal de Receção Positivo)',
    negPin: 'Pino 6 (Verde)',
    negPolarity: 'RX- (Sinal de Receção Negativo)',
    color: '#388e3c',
    colorBg: 'rgba(56, 142, 60, 0.15)',
    colorStroke: '#81c784',
    colorNegStroke: '#2e7d32',
    colorPosText: 'text-green-400',
    colorNegText: 'text-green-500',
    bgStyle: { backgroundColor: '#2e7d32' },
    bgStripeStyle: { background: 'repeating-linear-gradient(45deg, #388e3c, #388e3c 4px, #ffffff 4px, #ffffff 8px)' },
  },
  blue: {
    name: 'Par Azul (Canal Gigabit & PoE+)',
    posPin: 'Pino 4 (Azul)',
    posPolarity: 'BI_DA+ / PoE+ (Polaridade Positiva)',
    negPin: 'Pino 5 (Branco/Azul)',
    negPolarity: 'BI_DA- / PoE+ (Polaridade Negativa)',
    color: '#1e88e5',
    colorBg: 'rgba(30, 136, 229, 0.15)',
    colorStroke: '#64b5f6',
    colorNegStroke: '#1565c0',
    colorPosText: 'text-blue-400',
    colorNegText: 'text-blue-500',
    bgStyle: { backgroundColor: '#1e88e5' },
    bgStripeStyle: { background: 'repeating-linear-gradient(45deg, #1e88e5, #1e88e5 4px, #ffffff 4px, #ffffff 8px)' },
  },
  brown: {
    name: 'Par Castanho (Canal Gigabit & PoE- / Retorno)',
    posPin: 'Pino 7 (Branco/Castanho)',
    posPolarity: 'BI_DD+ / PoE- (Polaridade Positiva)',
    negPin: 'Pino 8 (Castanho)',
    negPolarity: 'BI_DD- / PoE- (Polaridade Negativa)',
    color: '#795548',
    colorBg: 'rgba(121, 85, 72, 0.15)',
    colorStroke: '#a1887f',
    colorNegStroke: '#4e342e',
    colorPosText: 'text-amber-500',
    colorNegText: 'text-amber-700',
    bgStyle: { backgroundColor: '#5d4037' },
    bgStripeStyle: { background: 'repeating-linear-gradient(45deg, #795548, #795548 4px, #ffffff 4px, #ffffff 8px)' },
  },
};

export function TheorySection() {
  const [speedMode, setSpeedMode] = useState<'100mbps' | '1000mbps'>('1000mbps');
  const [poeActive, setPoeActive] = useState<boolean>(true);

  // States for Differential Signaling Waveform Display
  const [waveType, setWaveType] = useState<'sine' | 'digital'>('sine');
  const [noiseLevel, setNoiseLevel] = useState<number>(0.4); // 0 to 1 scale
  const [selectedPair, setSelectedPair] = useState<'orange' | 'green' | 'blue' | 'brown'>('orange');

  // States for PoE Distance & Voltage Drop Calculator
  const [cableLength, setCableLength] = useState<number>(65); // distance in meters
  const [poeStandard, setPoeStandard] = useState<'af' | 'at' | 'bt'>('at'); // af (PoE), at (PoE+), bt (PoE++)
  const [cableMaterial, setCableMaterial] = useState<'copper' | 'cca'>('copper'); // Solid Copper vs Copper Clad Aluminum

  // State for tooling best practices active card
  const [activeToolTab, setActiveToolTab] = useState<'crimp' | 'stripper' | 'tester'>('crimp');

  const poeCalculatorResult = useMemo(() => {
    // Loop resistance in Ohms per meter (Standard 24AWG CAT5e/CAT6)
    // Pure Solid Copper is approx 0.085 Ohm/meter loop.
    // Copper Clad Aluminum (CCA) is highly lossy, approx 0.160 Ohm/meter loop.
    const rPerMeter = cableMaterial === 'copper' ? 0.085 : 0.165;
    const totalResistance = cableLength * rPerMeter;
    
    let sourceVoltage = 48.0; // Vaf source
    let maxCurrent = 0.350; // 350mA for af
    let sourcePower = 15.4; // Watts af 
    let deviceMinVolts = 37.0; // Vaf min
    let standardName = 'IEEE 802.3af (PoE - Classe 3)';

    if (poeStandard === 'at') {
      sourceVoltage = 50.0; // Vat source
      maxCurrent = 0.600; // 600mA for at
      sourcePower = 30.0; // Watts at
      deviceMinVolts = 42.5; // Vat min
      standardName = 'IEEE 802.3at (PoE+ - Classe 4)';
    } else if (poeStandard === 'bt') {
      sourceVoltage = 54.0; // Vbt source
      maxCurrent = 0.960; // 960mA for bt class 8
      sourcePower = 90.0; // Watts
      deviceMinVolts = 41.0; // Vbt min
      standardName = 'IEEE 802.3bt (PoE++ Tipo 4 - Classe 8)';
    }

    // Voltage Drop (V_drop = I * R)
    const voltageDrop = maxCurrent * totalResistance;
    const deviceVoltage = Math.max(0, sourceVoltage - voltageDrop);

    // Power Dissipated in cable (P_lost = I^2 * R)
    const powerLost = Math.pow(maxCurrent, 2) * totalResistance;
    const powerAtDevice = Math.max(0, sourcePower - powerLost);

    let health: 'ok' | 'warning' | 'fail' = 'ok';
    let statusText = 'CONEXÃO EXCELENTE ✔️';
    let statusDesc = 'A voltagem no recetor está bem acima do limite operacional e as perdas de potência são mínimas. Cabo 100% elegível.';

    if (deviceVoltage < deviceMinVolts || cableLength > 100) {
      health = 'fail';
      statusText = '⚠️ QUEDA OPERACIONAL CRÍTICA!';
      statusDesc = cableLength > 100 
        ? 'A distância ultrapassa o padrão Ethernet máximo de 100m. Riscos graves de atenuação e perda de pacotes de dados.'
        : 'Tensão baixa demais para ligar o aparelho local (< Min Tolerado). O dispositivo sofrerá reinicializações constantes ou continuará desligado.';
    } else if (deviceVoltage < (deviceMinVolts + 2.8) || cableLength > 85) {
      health = 'warning';
      statusText = '⚡ LIMITE PRÓXIMO / INSTABILIDADE';
      statusDesc = 'Fusão térmica aquecendo o cabo RJ45 ou queda perigosa de sinal. Recomendado cabo 100% cobre sólido ou menor extensão.';
    }

    return {
      standardName,
      totalResistance: totalResistance.toFixed(2),
      voltageDrop: voltageDrop.toFixed(2),
      deviceVoltage: deviceVoltage.toFixed(2),
      powerLost: powerLost.toFixed(2),
      powerAtDevice: powerAtDevice.toFixed(2),
      maxCurrent: (maxCurrent * 1000).toFixed(0),
      sourceVoltage,
      deviceMinVolts,
      health,
      statusText,
      statusDesc,
      percentDrop: ((voltageDrop / sourceVoltage) * 100).toFixed(1)
    };
  }, [cableLength, poeStandard, cableMaterial]);

  // Generate SVG curve paths dynamically
  const signalPaths = useMemo(() => {
    const width = 520;
    const generatePath = (phase: number, hasNoise: boolean, isOutput: boolean) => {
      const points: string[] = [];
      const frequency = 0.035;
      // If output, the subtraction of positive and negative doubles the amplitude (Sinal+ - (-Sinal-) = 2 * Sinal)
      const amplitude = isOutput ? 22 : 12;
      const centerY = 45; // local center of each scope track
      
      for (let x = 0; x <= width; x += 2.5) {
        let baseVal = 0;
        if (waveType === 'sine') {
          baseVal = Math.sin(x * frequency) * amplitude * phase;
        } else {
          // Digital square pulse generator
          const periodValue = Math.floor(x / 45) % 2;
          baseVal = (periodValue === 0 ? amplitude : -amplitude) * phase;
        }
        
        let noiseVal = 0;
        if (hasNoise) {
          // Electromagnetic Interference Noise is Common-Mode (exactly identical on both wires)
          noiseVal = noiseLevel * (
            Math.sin(x * 0.18) * 7 + 
            Math.cos(x * 0.42) * 4.5 + 
            Math.sin(x * 0.85) * 2.5
          );
        }
        
        const y = centerY + baseVal + noiseVal;
        if (x === 0) {
          points.push(`M ${x} ${y}`);
        } else {
          points.push(`L ${x} ${y}`);
        }
      }
      return points.join(' ');
    };

    return {
      positive: generatePath(1, true, false),   // Phase +, contains noise
      negative: generatePath(-1, true, false),  // Phase -, contains identical noise
      output: generatePath(1, false, true),     // Reconstructed, noise-free output!
    };
  }, [waveType, noiseLevel]);

  return (
    <div className="space-y-8" id="theory-section">
      
      {/* Dynamic Animated Signal Flow Board */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h3 className="text-white font-semibold text-lg flex items-center gap-2">
              🔬 Simulador de Tráfego de Sinal (RX / TX, Gigabit & PoE)
            </h3>
            <p className="text-slate-400 text-xs mt-1">
              Altere a velocidade da rede para ver a diferença física de dados fluindo pelos fios elétricos.
            </p>
          </div>
          
          <div className="flex bg-slate-950 p-1.5 rounded-lg border border-slate-800 self-start md:self-center gap-2">
            <button
              onClick={() => setSpeedMode('100mbps')}
              className={`px-3 py-1.5 rounded text-xs font-semibold uppercase tracking-wider transition ${
                speedMode === '100mbps'
                  ? 'bg-amber-500 text-black shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              10/100 Mbps (Fast)
            </button>
            <button
              onClick={() => setSpeedMode('1000mbps')}
              className={`px-3 py-1.5 rounded text-xs font-semibold uppercase tracking-wider transition ${
                speedMode === '1000mbps'
                  ? 'bg-cyan-500 text-black shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              1 Gbps (Gigabit)
            </button>
          </div>
        </div>

        {/* Animated flow canvas SVG */}
        <div className="bg-slate-950/70 border border-slate-800/85 rounded-xl p-4 relative overflow-hidden">
          
          {/* Legend and controls */}
          <div className="absolute top-2 left-2 flex items-center gap-4 z-10">
            <span className="flex items-center gap-1.5 text-[10px] text-slate-400">
              <span className="w-2.5 h-2.5 rounded-full bg-orange-400 inline-block"></span>
              Par Laranja (TX - Envio)
            </span>
            <span className="flex items-center gap-1.5 text-[10px] text-slate-400">
              <span className="w-2.5 h-2.5 rounded-full bg-green-500 inline-block"></span>
              Par Verde (RX - Receção)
            </span>
          </div>

          <div className="absolute top-2 right-2 flex items-center gap-3 z-10">
            <label className="flex items-center gap-2 cursor-pointer text-[10px] text-slate-400 bg-slate-900 border border-slate-800 rounded px-2 py-1">
              <input
                type="checkbox"
                checked={poeActive}
                onChange={(e) => setPoeActive(e.target.checked)}
                className="rounded border-slate-800 accent-cyan-500"
              />
              Injetar PoE (Energia)
            </label>
          </div>

          {/* SVG Traffic System */}
          <svg viewBox="0 0 800 240" className="w-full h-auto mt-6" xmlns="http://www.w3.org/2000/svg">
            <defs>
              {/* Dynamic glow filter */}
              <filter id="glow-heavy" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="3.5" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
              <filter id="glow-soft" x="-10%" y="-10%" width="120%" height="120%">
                <feGaussianBlur stdDeviation="1" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>

            {/* Left Box: Virtual Computer Terminal */}
            <g transform="translate(10, 40)">
              <rect width="90" height="140" rx="8" fill="#1e1e24" stroke="#475569" strokeWidth="1.5" />
              <text x="45" y="45" fill="#f8fafc" fontSize="10" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">🖥️ PC LOCAL</text>
              <rect x="15" y="75" width="60" height="20" rx="3" fill="#0f172a" />
              <text x="45" y="88" fill="#38bdf8" fontSize="8" fontFamily="monospace" textAnchor="middle">192.168.1.5</text>
              <text x="45" y="115" fill="#64748b" fontSize="8.5" textAnchor="middle">Placa RJ45</text>
            </g>

            {/* Right Box: Virtual Switch/Router Server */}
            <g transform="translate(700, 40)">
              <rect width="90" height="140" rx="8" fill="#1e1e24" stroke="#475569" strokeWidth="1.5" />
              <text x="45" y="45" fill="#f8fafc" fontSize="10" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">⚙️ SWITCH / ROTEADOR</text>
              <rect x="15" y="75" width="60" height="20" rx="3" fill="#0f172a" />
              <text x="45" y="88" fill="#10b981" fontSize="8" fontFamily="monospace" textAnchor="middle">GATEWAY</text>
              <text x="45" y="115" fill="#64748b" fontSize="8.5" textAnchor="middle">Porta WAN/LAN</text>
            </g>

            {/* Fios Centrais - Linhas */}
            {/* Par 1: Laranja (TX) */}
            <g>
              <line x1="100" y1="70" x2="700" y2="70" stroke="#fb8c00" strokeWidth="3" />
              {/* Animated signals for Orange (TX - local to server) */}
              <circle r="4.5" fill="#ffb74d" filter="url(#glow-heavy)">
                <animateMotion dur={speedMode === '100mbps' ? "2.5s" : "1.2s"} repeatCount="indefinite" path="M100,70 L700,70" />
              </circle>
              {speedMode === '1000mbps' && (
                <circle r="4.5" fill="#ffffff" filter="url(#glow-heavy)">
                  <animateMotion dur="1s" repeatCount="indefinite" path="M700,70 L100,70" />
                </circle>
              )}
              <text x="400" y="62" fill="#fb8c00" fontSize="8.5" fontFamily="monospace" textAnchor="middle" fontWeight="bold">
                {speedMode === '100mbps' ? 'TX+ / TX- (Apenas Envio)' : 'Canal A (Bidirecional Simultâneo)'}
              </text>
            </g>

            {/* Par 2: Verde (RX) */}
            <g>
              <line x1="100" y1="110" x2="700" y2="110" stroke="#388e3c" strokeWidth="3" />
              {/* Animated signals for Green (RX - server to local) */}
              <circle r="4.5" fill="#81c784" filter="url(#glow-heavy)">
                <animateMotion dur={speedMode === '100mbps' ? "2.5s" : "1.2s"} repeatCount="indefinite" path="M700,110 L100,110" />
              </circle>
              {speedMode === '1000mbps' && (
                <circle r="4.5" fill="#ffffff" filter="url(#glow-heavy)">
                  <animateMotion dur="1s" repeatCount="indefinite" path="M100,110 L700,110" />
                </circle>
              )}
              <text x="400" y="102" fill="#4caf50" fontSize="8.5" fontFamily="monospace" textAnchor="middle" fontWeight="bold">
                {speedMode === '100mbps' ? 'RX+ / RX- (Apenas Receção)' : 'Canal B (Bidirecional Simultâneo)'}
              </text>
            </g>

            {/* Par 3: Azul (Gigabit / PoE) */}
            <g>
              <line x1="100" y1="150" x2="700" y2="150" stroke="#1e88e5" strokeWidth="3" strokeDasharray={speedMode === '100mbps' ? "6 6" : "0"} opacity={speedMode === '100mbps' ? '0.4' : '1'} />
              {/* If Gigabit, we have busy bi-directional data flow */}
              {speedMode === '1000mbps' && (
                <>
                  <circle r="4" fill="#64b5f6" filter="url(#glow-soft)">
                    <animateMotion dur="1.5s" repeatCount="indefinite" path="M100,150 L700,150" />
                  </circle>
                  <circle r="4" fill="#ffffff" filter="url(#glow-heavy)">
                    <animateMotion dur="1.5s" repeatCount="indefinite" path="M700,150 L100,150" />
                  </circle>
                </>
              )}
              {/* If PoE active, show voltage aura */}
              {poeActive && (
                <line x1="100" y1="150" x2="700" y2="150" stroke="#f59e0b" strokeWidth="1.5" strokeDasharray="3 30" opacity="0.8">
                  <animate attributeName="stroke-dashoffset" values="0;150" dur="2s" repeatCount="indefinite" />
                </line>
              )}
              <text x="400" y="142" fill="#1e88e5" fontSize="8.5" fontFamily="monospace" textAnchor="middle" fontWeight="bold">
                {speedMode === '100mbps' 
                  ? (poeActive ? 'Ocioso para Dados · PoE Ativo (⚡ V+)' : 'Ocioso (Sem tráfego de dados)') 
                  : `+ Dados Gigabit (${poeActive ? '⚡ PoE Ativo' : 'Sinal Ativo'})`}
              </text>
            </g>

            {/* Par 4: Castanho (Gigabit / PoE++) */}
            <g>
              <line x1="100" y1="190" x2="700" y2="190" stroke="#795548" strokeWidth="3" strokeDasharray={speedMode === '100mbps' ? "6 6" : "0"} opacity={speedMode === '100mbps' ? '0.4' : '1'} />
              {/* If Gigabit, data flows */}
              {speedMode === '1000mbps' && (
                <>
                  <circle r="4" fill="#a1887f" filter="url(#glow-soft)">
                    <animateMotion dur="1.5s" repeatCount="indefinite" path="M100,190 L700,190" />
                  </circle>
                  <circle r="4" fill="#ffffff" filter="url(#glow-heavy)">
                    <animateMotion dur="1.5s" repeatCount="indefinite" path="M700,190 L100,190" />
                  </circle>
                </>
              )}
              {/* If PoE active, show voltage aura */}
              {poeActive && (
                <line x1="100" y1="190" x2="700" y2="190" stroke="#f59e0b" strokeWidth="1.5" strokeDasharray="3 30" opacity="0.8">
                  <animate attributeName="stroke-dashoffset" values="150;0" dur="2s" repeatCount="indefinite" />
                </line>
              )}
              <text x="400" y="182" fill="#8d6e63" fontSize="8.5" fontFamily="monospace" textAnchor="middle" fontWeight="bold">
                {speedMode === '100mbps' 
                  ? (poeActive ? 'Ocioso para Dados · PoE++ Ativo (⚡ V-)' : 'Ocioso (Sem tráfego de dados)') 
                  : `++ Dados Gigabit (${poeActive ? '⚡ PoE++ (Até 90W)' : 'Sinal Ativo'})`}
              </text>
            </g>
          </svg>
        </div>

        {/* Floating Quick Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 text-xs font-sans">
          <div className="bg-slate-950 p-3.5 rounded-lg border border-slate-800">
            <span className="text-amber-400 font-semibold uppercase tracking-wider block font-mono text-[9px] mb-1">
              Modo Fast Ethernet (10/100 Mbps)
            </span>
            <p className="text-slate-300 leading-relaxed">
              Consome apenas <strong className="text-white">2 dos 4 pares</strong> eletromagnéticos para comunicação. Fios 1, 2 (Transmitir) e 3, 6 (Receber) atuam como circuitos dedicados unidirecionais. O resto fica inutilizado para dados.
            </p>
          </div>
          <div className="bg-slate-950 p-3.5 rounded-lg border border-slate-800">
            <span className="text-cyan-400 font-semibold uppercase tracking-wider block font-mono text-[9px] mb-1">
              Modo Gigabit Ethernet (1000 Mbps)
            </span>
            <p className="text-slate-300 leading-relaxed">
              Engenharia inovadora! <strong className="text-white">Usa os 4 pares</strong> de cabos simultaneamente. Cada par atua de modo bi-direcional inteligente com supressão de eco. Isso gera 4 conexões individuais simultâneas de 250 Mbps = 1 Gbps total!
            </p>
          </div>
        </div>
      </div>

      {/* Interactive Oscilloscope of Differential Signaling */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 relative overflow-hidden">
        {/* Glow backdrop decorative */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-500/5 rounded-full blur-[120px] pointer-events-none" />
        
        <div className="border-b border-slate-850 pb-5 mb-6">
          <div className="flex items-center gap-2">
            <span className="p-1 rounded bg-blue-950/40 border border-blue-900/30 text-blue-400">
              <Activity className="w-4 h-4" />
            </span>
            <h3 className="text-white font-semibold text-lg">
              📈 Simulador de Sinalização Diferencial & Cancelamento de Ruído (EMI)
            </h3>
          </div>
          <p className="text-slate-400 text-xs mt-1 leading-relaxed">
            Descubra a eletrofísica dos cabos de rede: como os fios positivo <strong className="text-emerald-400">(+)</strong> e negativo <strong className="text-red-400">(-)</strong> utilizam correntes simétricas invertidas para neutralizar interferências magnéticas externas.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          {/* Controls Bar */}
          <div className="lg:col-span-4 space-y-5 flex flex-col justify-between">
            <div className="space-y-4">
              {/* Pair Selector */}
              <div>
                <label className="text-[10px] text-slate-500 font-mono uppercase tracking-wider block mb-2">
                  1. Selecionar Par Trançado de Cobre:
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {(Object.keys(pairDetails) as Array<keyof typeof pairDetails>).map((pKey) => {
                    const isSel = selectedPair === pKey;
                    const det = pairDetails[pKey];
                    return (
                      <button
                        key={pKey}
                        onClick={() => setSelectedPair(pKey)}
                        className={`text-left p-2.5 rounded-lg border text-xs flex flex-col justify-between transition-all ${
                          isSel
                            ? 'bg-slate-950 border-cyan-500/80 shadow-inner'
                            : 'bg-slate-950/30 border-slate-850 hover:border-slate-800 hover:bg-slate-950/50'
                        }`}
                      >
                        <div className="flex items-center gap-1.5 mb-1">
                          <span 
                            className="w-2.5 h-2.5 rounded-full border border-black/45" 
                            style={{ backgroundColor: det.color }} 
                          />
                          <span className={`font-bold uppercase text-[9px] ${isSel ? 'text-white' : 'text-slate-400'}`}>
                            {pKey === 'orange' ? 'Laranja' : pKey === 'green' ? 'Verde' : pKey === 'blue' ? 'Azul' : 'Castanho'}
                          </span>
                        </div>
                        <span className="text-[9px] text-slate-500 font-mono leading-none">
                          Pinos {pKey === 'orange' ? '1-2' : pKey === 'green' ? '3-6' : pKey === 'blue' ? '4-5' : '7-8'}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Modulation Format */}
              <div>
                <label className="text-[10px] text-slate-500 font-mono uppercase tracking-wider block mb-2">
                  2. Tipo de Modulação de Sinal:
                </label>
                <div className="grid grid-cols-2 bg-slate-950 p-1 rounded-lg border border-slate-855">
                  <button
                    onClick={() => setWaveType('sine')}
                    className={`py-1 rounded text-[11px] font-bold transition-all ${
                      waveType === 'sine' ? 'bg-cyan-600 text-white shadow' : 'text-slate-400'
                    }`}
                  >
                    🚀 Analógico (Senoide)
                  </button>
                  <button
                    onClick={() => setWaveType('digital')}
                    className={`py-1 rounded text-[11px] font-bold transition-all ${
                      waveType === 'digital' ? 'bg-cyan-600 text-white shadow' : 'text-slate-400'
                    }`}
                  >
                    💾 Digital (Ethernet)
                  </button>
                </div>
              </div>

              {/* Slider for Noise Level */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-[10px] text-slate-500 font-mono uppercase tracking-wider">
                    3. Interferência Externa (EMI/Ruído):
                  </label>
                  <span className={`text-[11px] font-mono font-bold ${noiseLevel > 0.6 ? 'text-red-400 animate-pulse' : noiseLevel > 0.2 ? 'text-amber-400' : 'text-emerald-400'}`}>
                    {Math.round(noiseLevel * 100)}% {noiseLevel > 0.6 ? 'Crítico (⚠️)' : noiseLevel > 0 ? 'Forte' : 'Nulo'}
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1.2"
                  step="0.1"
                  value={noiseLevel}
                  onChange={(e) => setNoiseLevel(parseFloat(e.target.value))}
                  className="w-full xl:h-1.5 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                />
                <span className="text-[9px] text-slate-500 block leading-normal mt-1">
                  Gerador de indução por cabo elétrico paralelo de alta tensão.
                </span>
              </div>
            </div>

            {/* Micro schematic annotation of the pair details & Polarities */}
            <div className="bg-slate-950 border border-slate-850 p-3.5 rounded-xl space-y-3">
              <div className="flex items-center gap-1">
                <span className="text-[10px] font-mono text-cyan-400 font-bold uppercase">Polaridade dos Condutores:</span>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2.5 text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-2.5 rounded border border-black/30" style={pairDetails[selectedPair].bgStripeStyle} />
                    <span className="font-semibold text-slate-300">Positivo (+)</span>
                  </div>
                  <span className="font-mono text-[10px] text-emerald-400 bg-emerald-950/20 px-1.5 py-0.5 rounded border border-emerald-900/30">
                    {pairDetails[selectedPair].posPin}
                  </span>
                </div>
                <div className="text-[10px] text-slate-400 pl-7 leading-none">
                  {pairDetails[selectedPair].posPolarity}
                </div>

                <div className="flex items-center justify-between gap-2.5 text-xs pt-1 border-t border-slate-900">
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-2.5 rounded border border-black/30" style={pairDetails[selectedPair].bgStyle} />
                    <span className="font-semibold text-slate-300">Negativo (-)</span>
                  </div>
                  <span className="font-mono text-[10px] text-red-500 bg-red-950/20 px-1.5 py-0.5 rounded border border-red-900/30">
                    {pairDetails[selectedPair].negPin}
                  </span>
                </div>
                <div className="text-[10px] text-slate-400 pl-7 leading-none">
                  {pairDetails[selectedPair].negPolarity}
                </div>
              </div>
            </div>
          </div>

          {/* Stacked Oscilloscope Screen SVG */}
          <div className="lg:col-span-8 flex flex-col">
            <div className="bg-slate-950 border border-slate-850 rounded-2xl p-3 flex-1 flex flex-col justify-between">
              
              {/* Tech Header of Oscilloscope */}
              <div className="flex items-center justify-between border-b border-slate-900 pb-2 mb-2 px-1 text-[10px] font-mono">
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping" />
                  <span className="text-slate-400">ANALISADOR DE LINHA DE SINAL (OSCILOSCÓPIO REAL)</span>
                </div>
                <span className="text-cyan-500">ACONDICIONAMENTO AUTOMÁTICO</span>
              </div>

              {/* Stacked oscilloscope viewports inside one SVG */}
              <div className="bg-slate-900 border border-slate-950 rounded-xl overflow-hidden relative" style={{ minHeight: '300px' }}>
                
                {/* Background grid for oscilloscope screens */}
                <div className="absolute inset-0 grid grid-cols-12 grid-rows-6 opacity-10 pointer-events-none">
                  {Array.from({ length: 72 }).map((_, i) => (
                    <div key={i} className="border-r border-b border-cyan-500" />
                  ))}
                </div>

                <svg viewBox="0 0 540 300" className="w-full h-full relative z-10" xmlns="http://www.w3.org/2000/svg">
                  <defs>
                    <filter id="neon-glow" x="-20%" y="-20%" width="140%" height="140%">
                      <feGaussianBlur stdDeviation="2.5" result="blur" />
                      <feComposite in="SourceGraphic" in2="blur" operator="over" />
                    </filter>
                  </defs>

                  {/* CHANNEL 1: POSITIVE WIRE (+) */}
                  <g transform="translate(10, 5)">
                    {/* Channel Background banner */}
                    <text x="5" y="15" fill="#94a3b8" fontSize="8" fontFamily="monospace" fontWeight="bold">
                      🔴 Fio Positivo (+) · {pairDetails[selectedPair].posPin}
                    </text>
                    <text x="520" y="15" fill="#f43f5e" fontSize="7" fontFamily="monospace" textAnchor="end">
                      Sinal(+) + Ruído(EMI)
                    </text>
                    {/* Zero reference line */}
                    <line x1="5" y1="45" x2="525" y2="45" stroke="#334155" strokeWidth="0.5" strokeDasharray="4 4" />
                    {/* Signal Wave */}
                    <path
                      d={signalPaths.positive}
                      fill="none"
                      stroke={pairDetails[selectedPair].color}
                      strokeWidth="1.8"
                      filter="url(#neon-glow)"
                      className="transition-all duration-100"
                    />
                    {/* Dynamic Indicator label on wave end */}
                    <circle cx="525" cy="45" r="2.5" fill={pairDetails[selectedPair].color} />
                  </g>

                  {/* CHANNEL 2: NEGATIVE WIRE (-) */}
                  <g transform="translate(10, 100)">
                    {/* Channel Background banner */}
                    <text x="5" y="15" fill="#94a3b8" fontSize="8" fontFamily="monospace" fontWeight="bold">
                      ⚪ Fio Negativo (-) · {pairDetails[selectedPair].negPin}
                    </text>
                    <text x="520" y="15" fill="#ef4444" fontSize="7" fontFamily="monospace" textAnchor="end">
                      Invertido(-) + Ruído(EMI)
                    </text>
                    {/* Zero reference line */}
                    <line x1="5" y1="45" x2="525" y2="45" stroke="#334155" strokeWidth="0.5" strokeDasharray="4 4" />
                    {/* Signal Wave inverted but with exactly same noise direction! */}
                    <path
                      d={signalPaths.negative}
                      fill="none"
                      stroke={pairDetails[selectedPair].colorNegStroke}
                      strokeWidth="1.8"
                      filter="url(#neon-glow)"
                      className="transition-all duration-100"
                    />
                    <circle cx="525" cy="45" r="2.5" fill={pairDetails[selectedPair].colorNegStroke} />
                  </g>

                  {/* CHANNEL 3: COMBINED OUTPUT AT RECEIVER */}
                  <g transform="translate(10, 195)">
                    {/* Channel separator line */}
                    <line x1="0" y1="-5" x2="530" y2="-5" stroke="#1e293b" strokeWidth="1" />
                    {/* Channel Header */}
                    <text x="5" y="15" fill="#f8fafc" fontSize="8.5" fontFamily="monospace" fontWeight="extrabold">
                      ✨ RECETOR DIFERENCIAL · Saída Consolidada (Subtração: + menos -)
                    </text>
                    <text x="520" y="15" fill="#10b981" fontSize="7.5" fontFamily="monospace" fontWeight="bold" textAnchor="end">
                      Sinal Limpo: 2V (Ruído Cancelado Math!)
                    </text>
                    {/* Zero reference line */}
                    <line x1="5" y1="45" x2="525" y2="45" stroke="#334155" strokeWidth="0.5" strokeDasharray="4 4" />
                    {/* Output Clean Wave: Subtraction kills noise completely because: (Signal + Noise) - (-Signal + Noise) = 2 * Signal */}
                    <path
                      d={signalPaths.output}
                      fill="none"
                      stroke="#10b981"
                      strokeWidth="2.5"
                      filter="url(#neon-glow)"
                      className="transition-all duration-100 animate-pulse"
                    />
                    <circle cx="525" cy="45" r="3" fill="#10b981" />
                  </g>
                </svg>
              </div>

              {/* Informative Math Footer */}
              <div className="mt-3.5 bg-slate-900 border border-slate-850 p-3 rounded-lg flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2 text-slate-300">
                  <span className="p-1.5 rounded-full bg-emerald-950/40 text-emerald-400 font-mono text-[9px] font-bold">
                    FÓRMULA
                  </span>
                  <span className="font-mono text-[11px]">
                    Sinal Reconstruído = [s(+) + e] - [s(-) + e] = 2 × s(+)
                  </span>
                </div>
                <p className="text-[10px] text-slate-500 text-center sm:text-right">
                  * Como o ruído induzido (<strong className="text-slate-400">e</strong>) é igual em ambos os fios ruidosos, a subtração anula-o totalmente.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Structured Written Explanations addressing the user questions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* RX and TX Explainer Card */}
        <div className="bg-slate-900 border border-slate-800/80 rounded-2xl p-6 flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 rounded-xl bg-orange-950 border border-orange-900 flex items-center justify-center text-orange-400 mb-4 font-bold text-sm">
              TX/RX
            </div>
            
            <h3 className="text-white font-semibold text-lg mb-2">
              {TECHNICAL_EXPLANATIONS.rxtx.title}
            </h3>
            
            <p className="text-slate-400 text-xs font-mono bg-slate-950 p-3 rounded-lg border border-slate-850/80 leading-relaxed mb-4">
              {TECHNICAL_EXPLANATIONS.rxtx.concept}
            </p>

            <div className="space-y-3.5 text-xs text-slate-300 leading-relaxed">
              {TECHNICAL_EXPLANATIONS.rxtx.content.map((paragraph, idx) => (
                <div key={idx} className="flex gap-2.5 items-start">
                  <span className="text-orange-400 font-semibold mt-0.5">•</span>
                  <p>{paragraph}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-800/60 flex items-center gap-2 text-xs text-slate-400">
            <Shield className="w-4 h-4 text-emerald-400" />
            <span>Sinalização diferencial isolada elimina crosstalk e ruído comum.</span>
          </div>
        </div>

        {/* Gigabit and Gigabit++ / PoE Card */}
        <div className="bg-slate-900 border border-slate-800/80 rounded-2xl p-6 flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 rounded-xl bg-cyan-950 border border-cyan-900 flex items-center justify-center text-cyan-400 mb-4 font-bold text-sm">
              1000B
            </div>
            
            <h3 className="text-white font-semibold text-lg mb-2">
              {TECHNICAL_EXPLANATIONS.gigabit.title}
            </h3>
            
            <p className="text-slate-400 text-xs font-mono bg-slate-950 p-3 rounded-lg border border-slate-850/80 leading-relaxed mb-4">
              {TECHNICAL_EXPLANATIONS.gigabit.concept}
            </p>

            <div className="space-y-3.5 text-xs text-slate-300 leading-relaxed">
              {TECHNICAL_EXPLANATIONS.gigabit.content.map((paragraph, idx) => (
                <div key={idx} className="flex gap-2.5 items-start">
                  <span className="text-cyan-400 font-semibold mt-0.5">•</span>
                  <p>{paragraph}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-800/60 flex items-center gap-2 text-xs text-slate-400">
            <Zap className="w-4 h-4 text-yellow-400 animate-pulse" />
            <span>PoE++ injeta até 90W para antenas Wi-Fi e câmaras motorizadas.</span>
          </div>
        </div>

      </div>

      {/* Pair Matrix */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
        <h3 className="text-white font-medium text-sm mb-4 flex items-center gap-1.5">
          📊 Matriz das Funções de cada Par (Cores Únicas + Pinos Associados)
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {PAIRS.map((pair, idx) => (
            <div key={idx} className="bg-slate-950 border border-slate-850 rounded-xl p-4 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-lg">{pair.funcIcon}</span>
                  <span className={`text-[10px] font-bold font-mono uppercase px-1.5 py-0.5 rounded border`}
                        style={{ color: pair.color, borderColor: `${pair.color}44`, backgroundColor: `${pair.color}11` }}>
                    {pair.name}
                  </span>
                </div>
                <h4 className="text-white font-semibold text-xs mb-1">{pair.funcTitle}</h4>
                <p className="text-slate-400 text-[11px] leading-relaxed mb-3">{pair.funcDesc}</p>
              </div>
              <div className="border-t border-slate-850 pt-2 text-[10px] font-mono text-slate-500 leading-normal">
                {pair.detailedTech}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ⚡ INTERACTIVE POE VOLTAGE DROP CALCULATOR */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
        <div className="border-b border-slate-800/80 pb-4">
          <div className="flex items-center gap-2">
            <span className="p-1 px-2 text-yellow-400 bg-yellow-950/50 border border-yellow-900/50 rounded text-[9px] font-mono font-bold uppercase tracking-wider">
              Análise de Rede Alimentada
            </span>
            <h3 className="text-white font-bold text-base sm:text-lg">
              ⚡ Calculadora Inteligente de Perda de Tensão & Extensão PoE
            </h3>
          </div>
          <p className="text-slate-400 text-xs mt-1 leading-relaxed">
            Meça em tempo real a queda de voltagem que ocorre devido à impedância interna resistiva dos cabos de cobre CAT5e/CAT6 ao utilizar diferentes padrões de energia PoE.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          
          {/* Inputs Panel: Length, Standard and Cable Material (5 cols) */}
          <div className="lg:col-span-5 bg-slate-955 border border-slate-850 p-5 rounded-xl space-y-4">
            <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider font-mono">
              Parâmetros Físicos do Cabo
            </h4>

            {/* Cable Length Slider */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400 font-medium">Comprimento do Cabo:</span>
                <span className="text-white font-mono font-bold bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                  {cableLength} metros
                </span>
              </div>
              <input
                type="range"
                min="5"
                max="150"
                step="5"
                value={cableLength}
                onChange={(e) => setCableLength(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-900 rounded-lg appearance-none cursor-pointer accent-cyan-500"
              />
              <div className="flex justify-between text-[9px] font-mono text-slate-500">
                <span>5m</span>
                <span>Limite Norma (100m) 🚫</span>
                <span>Extremo (150m)</span>
              </div>
            </div>

            {/* PoE standard selector */}
            <div className="space-y-1.5">
              <span className="text-xs text-slate-400 font-medium block">Padrão PoE Selecionado:</span>
              <div className="grid grid-cols-3 gap-1.5">
                {[
                  { id: 'af', label: 'af (PoE)', desc: '15.4 W | 48 V' },
                  { id: 'at', label: 'at (PoE+)', desc: '30.0 W | 50 V' },
                  { id: 'bt', label: 'bt (PoE++)', desc: '90.0 W | 54 V' }
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setPoeStandard(item.id as any)}
                    className={`p-2 rounded-lg border text-left transition ${
                      poeStandard === item.id
                        ? 'bg-yellow-950/20 text-yellow-400 border-yellow-500/60 shadow-[0_0_10px_rgba(234,179,8,0.1)]'
                        : 'bg-slate-950/40 text-slate-400 border-slate-850 hover:bg-slate-950 hover:text-white'
                    }`}
                  >
                    <div className="text-xs font-bold font-mono">{item.label}</div>
                    <div className="text-[9px] text-slate-500 mt-0.5 font-mono">{item.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Cable conductor material */}
            <div className="space-y-1.5">
              <span className="text-xs text-slate-400 font-medium block">Material Condutor das Margens:</span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setCableMaterial('copper')}
                  className={`p-2.5 rounded-lg border flex flex-col transition text-left ${
                    cableMaterial === 'copper'
                      ? 'bg-emerald-950/10 text-emerald-400 border-emerald-500/60 shadow-inner'
                      : 'bg-slate-950/30 text-slate-400 border-slate-850 hover:bg-slate-950'
                  }`}
                >
                  <span className="text-xs font-bold">Cobre Sólido Nu</span>
                  <span className="text-[9.5px] font-mono text-slate-500 mt-0.5">Baixa resistência (0.085Ω/m)</span>
                </button>
                <button
                  onClick={() => setCableMaterial('cca')}
                  className={`p-2.5 rounded-lg border flex flex-col transition text-left ${
                    cableMaterial === 'cca'
                      ? 'bg-rose-955/10 text-rose-400 border-rose-500/50 shadow-inner'
                      : 'bg-slate-950/30 text-slate-400 border-slate-850 hover:bg-slate-950'
                  }`}
                >
                  <span className="text-xs font-bold">CCA (Alumínio C/ Cobre)</span>
                  <span className="text-[9.5px] font-mono text-slate-500 mt-0.5">Grave perigo térmico (0.165Ω/m)</span>
                </button>
              </div>
            </div>
          </div>

          {/* Outputs Dashboard Screen (7 cols) */}
          <div className="lg:col-span-7 bg-slate-950 border border-slate-850/80 p-5 rounded-xl flex flex-col justify-between space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-850 pb-3">
              <div>
                <span className="text-[9px] font-mono text-slate-500 uppercase block">Norma de Distribuição</span>
                <span className="text-xs font-bold text-white font-mono">{poeCalculatorResult.standardName}</span>
              </div>
              <div className={`px-2.5 py-1 text-[10px] font-bold font-mono rounded-full border ${poeCalculatorResult.statusColor}`}>
                {poeCalculatorResult.statusText}
              </div>
            </div>

            {/* Calculations metrics grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 my-2">
              <div className="bg-slate-900/40 p-2.5 rounded-lg border border-slate-850/50">
                <span className="text-[9.5px] font-mono text-slate-500 block">Queda de Voltagem:</span>
                <span className="text-sm font-bold text-white font-mono">{poeCalculatorResult.voltageDrop} V</span>
                <span className="text-[8.5px] text-slate-500 font-mono block mt-0.5">({poeCalculatorResult.percentDrop}% de perda)</span>
              </div>
              
              <div className="bg-slate-900/40 p-2.5 rounded-lg border border-slate-850/50">
                <span className="text-[9.5px] font-mono text-slate-500 block">Tensão no Aparelho:</span>
                <span className={`text-sm font-bold font-mono ${poeCalculatorResult.health === 'fail' ? 'text-red-400' : 'text-emerald-400'}`}>
                  {poeCalculatorResult.deviceVoltage} V
                </span>
                <span className="text-[8.5px] text-slate-500 font-mono block mt-0.5">(Fonte: {poeCalculatorResult.sourceVoltage}V | Mín: {poeCalculatorResult.deviceMinVolts}V)</span>
              </div>
              
              <div className="bg-slate-900/40 p-2.5 rounded-lg border border-slate-850/50 col-span-2 md:col-span-1">
                <span className="text-[9.5px] font-mono text-slate-500 block">Dissipação de Calor:</span>
                <span className="text-sm font-bold text-white font-mono">{poeCalculatorResult.powerLost} W</span>
                <span className="text-[8.5px] text-slate-500 font-mono block mt-0.5">({poeCalculatorResult.maxCurrent}mA em circuito)</span>
              </div>
            </div>

            {/* Graph Visual track for energy drop along distance lines */}
            <div className="space-y-1.5 mt-2 bg-slate-900/20 p-3 rounded-lg border border-slate-850">
              <div className="flex justify-between text-[9px] font-mono text-slate-400 uppercase">
                <span>Injetor PoE local (100% Energia)</span>
                <span>Remoto ({poeCalculatorResult.percentDrop}% Perdido)</span>
              </div>
              
              <div className="relative h-6 bg-slate-950 border border-slate-850 rounded-full flex items-center overflow-hidden">
                {/* Simulated voltage drop gradient line bar */}
                <div 
                  className={`h-full bg-gradient-to-r transition-all duration-300 ${
                    poeCalculatorResult.health === 'fail'
                      ? 'from-emerald-500 via-yellow-500 to-rose-600'
                      : poeCalculatorResult.health === 'warning'
                      ? 'from-emerald-500 via-emerald-400 to-yellow-500'
                      : 'from-emerald-500 to-emerald-400'
                  }`}
                  style={{ width: `${Math.max(10, 100 - Number(poeCalculatorResult.percentDrop))}%` }}
                />
                <span className="absolute left-3 text-[9px] font-mono font-bold text-slate-950 uppercase">
                  {poeCalculatorResult.sourceVoltage} Volts
                </span>
                <span className="absolute right-3 text-[9px] font-mono font-bold text-slate-200">
                  {poeCalculatorResult.deviceVoltage}V Recebidos
                </span>
              </div>
            </div>

            <p className="text-[10.5px] text-slate-400 italic bg-slate-900/40 p-3 rounded-lg border border-slate-850/60 leading-normal">
              <strong>Análise Física:</strong> {poeCalculatorResult.statusDesc}
            </p>
          </div>

        </div>
      </div>

      {/* 🛠️ TOOL BEST PRACTICES SECTION */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
        <div className="border-b border-slate-800/80 pb-4">
          <div className="flex items-center gap-2">
            <span className="p-1 px-2.5 rounded bg-emerald-950/80 border border-emerald-800/50 text-emerald-300 font-mono text-[9px] uppercase font-bold">
              Instruções de Campo
            </span>
            <h3 className="text-white font-bold text-base sm:text-lg">
              🛠️ Manual de Boas Práticas e Uso Correto de Ferramentas
            </h3>
          </div>
          <p className="text-slate-400 text-xs mt-1 leading-relaxed">
            A crimpagem perfeita de cabos estruturados exige o uso qualificado de ferramentas. Conheça as instruções e as armadilhas comuns encontradas nos alicates e testadores locais.
          </p>
        </div>

        {/* Tab Menu for Tools */}
        <div className="flex flex-wrap gap-1 bg-slate-950 p-1.5 rounded-xl border border-slate-850 max-w-sm">
          {[
            { id: 'crimp', label: 'Alicate Crimpador' },
            { id: 'stripper', label: 'Decapador (Stripper)' },
            { id: 'tester', label: 'Testador de Cabos' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveToolTab(tab.id as any)}
              className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold transition ${
                activeToolTab === tab.id
                  ? 'bg-slate-850 text-white shadow-inner border border-slate-800'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab contents details container */}
        <div className="bg-slate-950/30 border border-slate-850 p-5 rounded-xl">
          <AnimatePresence mode="wait">
            {activeToolTab === 'crimp' && (
              <motion.div
                key="tab-crimp"
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                className="grid grid-cols-1 md:grid-cols-2 gap-6"
              >
                <div className="space-y-4">
                  <h4 className="text-white font-bold text-sm flex items-center gap-2 text-cyan-400">
                    ⚙️ O Alicate de Crimpagem de Pressão Mecânica
                  </h4>
                  <p className="text-slate-300 text-xs leading-relaxed">
                    A ferramenta atua descendo dentes de bronze dourados contra os pinos expostos do RJ45. Empregar pressão inadequada ou desalinhamento causará loops abertos e mau funcionamento de dados.
                  </p>

                  <div className="space-y-2.5">
                    <div className="p-3 bg-slate-950/80 rounded-lg border border-slate-850 flex gap-2.5 items-start">
                      <span className="p-1 rounded bg-cyan-950 text-cyan-300 text-[10px] font-mono leading-none">01</span>
                      <p className="text-slate-300 text-xs leading-normal">
                        <strong>Verifique os Dentes:</strong> Olhe o alicate de frente para constatar se nenhum dos 8 dentes cravadores metálicos está torto ou desgastado.
                      </p>
                    </div>
                    <div className="p-3 bg-slate-950/80 rounded-lg border border-slate-850 flex gap-2.5 items-start">
                      <span className="p-1 rounded bg-cyan-950 text-cyan-300 text-[10px] font-mono leading-none">02</span>
                      <p className="text-slate-300 text-xs leading-normal">
                        <strong>Pressão Dupla:</strong> Mantenha o alicate totalmente fechado até ouvir o estalo final da catraca de segurança que certifica a crimpagem homogênea.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-900 border border-slate-850/50 space-y-3">
                  <span className="text-[9px] font-mono font-bold text-rose-400 uppercase tracking-widest block">
                    ❌ Erro Comum no Alicate: "Fios Desalinhados"
                  </span>
                  <p className="text-slate-400 text-xs leading-relaxed">
                    Se introduzir o cabo sem que os 8 fios encostem na parede frontal de plástico do conetor RJ45, os dentes metálicos morderão apenas o isolamento vazio (Circuito Aberto).
                  </p>
                  <div className="bg-slate-950 p-2.5 rounded-md border border-slate-850/30 font-mono text-[9.5px] text-slate-500">
                    💡 <strong>Conselho Profissional:</strong> Olhe sempre pela lateral transparente do conector RJ45 antes de apertar o alicate para verificar se todas as pontas de cobre brilham no fundo.
                  </div>
                </div>
              </motion.div>
            )}

            {activeToolTab === 'stripper' && (
              <motion.div
                key="tab-stripper"
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                className="grid grid-cols-1 md:grid-cols-2 gap-6"
              >
                <div className="space-y-4">
                  <h4 className="text-white font-bold text-sm flex items-center gap-2 text-emerald-400">
                    ✂️ O Decapador e Descascador de Capas PVC
                  </h4>
                  <p className="text-slate-300 text-xs leading-relaxed">
                    O decapador serve exclusivamente para fatiar o revestimento exterior cinzento/azul do cabo UTP, sem arranhar minimamente a cobertura dos 4 pares de fios de cobre coloridos internos.
                  </p>

                  <div className="space-y-2.5">
                    <div className="p-3 bg-slate-950/80 rounded-lg border border-slate-850 flex gap-2.5 items-start">
                      <span className="p-1 rounded bg-emerald-950 text-emerald-300 text-[10px] font-mono leading-none">01</span>
                      <p className="text-slate-300 text-xs leading-normal">
                        <strong>Encaixe da Lâmina:</strong> Gire o decapador apenas uma volta completa ao redor do cabo. Evite girar repetidamente para não penetrar os fios internos.
                      </p>
                    </div>
                    <div className="p-3 bg-slate-950/80 rounded-lg border border-slate-850 flex gap-2.5 items-start">
                      <span className="p-1 rounded bg-emerald-950 text-emerald-300 text-[10px] font-mono leading-none">02</span>
                      <p className="text-slate-300 text-xs leading-normal">
                        <strong>Comprimento Ideal:</strong> Decape cerca de 2.5 cm a 3 cm de cabo. Isto dá margem confortável para esticar e ordenar os fios sem pressa.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-900 border border-slate-850/50 space-y-3">
                  <span className="text-[9px] font-mono font-bold text-rose-400 uppercase tracking-widest block">
                    ❌ Feridas Invisíveis: "Fios Marcados" (Nicked Wires)
                  </span>
                  <p className="text-slate-400 text-xs leading-relaxed">
                    Se a lâmina do decapador ferir o isolamento interno, os fios de cobre finos ficarão expostos, tocando-se e gerando um curto-circuito impossível de ver do exterior do cabo.
                  </p>
                  <div className="bg-slate-950 p-2.5 rounded-md border border-slate-850/30 font-mono text-[9.5px] text-slate-500">
                    ⚠️ <strong>Dica de Prática:</strong> Puxe levemente a ponta decapada, se sentir que os condutores estalam ou estão vincados de mais, corte essa ponta e decape de novo.
                  </div>
                </div>
              </motion.div>
            )}

            {activeToolTab === 'tester' && (
              <motion.div
                key="tab-tester"
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                className="grid grid-cols-1 md:grid-cols-2 gap-6"
              >
                <div className="space-y-4">
                  <h4 className="text-white font-bold text-sm flex items-center gap-2 text-violet-400">
                    📊 O Testador de Sequência Ethernet & Continuidade
                  </h4>
                  <p className="text-slate-300 text-xs leading-relaxed">
                    O testador de rede local envia consecutivamente um sinal em cada um dos pinos da ponta Master, enquanto na ponta Remote verifica-se se acende o LED correspondente de forma perfeitamente coordenada.
                  </p>

                  <div className="space-y-2.5">
                    <div className="p-3 bg-slate-950/80 rounded-lg border border-slate-850 flex gap-2.5 items-start">
                      <span className="p-1 rounded bg-violet-950 text-violet-300 text-[10px] font-mono leading-none">01</span>
                      <p className="text-slate-300 text-xs leading-normal">
                        <strong>Testar a Velocidade:</strong> Varreduras lentas (S) facilitam a identificação visual rápida de inversões ou saltos nas linhas (ex: 1 acende, mas no remoto acende o 3).
                      </p>
                    </div>
                    <div className="p-3 bg-slate-950/80 rounded-lg border border-slate-850 flex gap-2.5 items-start">
                      <span className="p-1 rounded bg-violet-950 text-violet-300 text-[10px] font-mono leading-none">02</span>
                      <p className="text-slate-300 text-xs leading-normal">
                        <strong>O Perigo das Split Pairs:</strong> Cuidado! Um testador LED básico apenas verifica continuidade óbvia. Ele não deteta pares divididos (Split Pairs), que causam perdas gravíssimas de frequência.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-900 border border-slate-850/50 space-y-3">
                  <span className="text-[9px] font-mono font-bold text-amber-400 uppercase tracking-widest block">
                    ⚡ PoE e Certificações Avançadas
                  </span>
                  <p className="text-slate-400 text-xs leading-relaxed">
                    Para redes corporativas ou segurança por câmaras PoE, testadores comuns de LED não validam se a impedância suportará cargas de 54V/90W contínuos sem sobreaquecimento severo na linha.
                  </p>
                  <div className="bg-slate-950 p-2.5 rounded-md border border-slate-850/30 font-mono text-[9.5px] text-slate-500">
                    💡 <strong>Equipamentos Industriais:</strong> Para infraestruturas comerciais, use certificadores digitais de alto nível (como Fluke Networks) que emitem frequências até 500 MHz.
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

    </div>
  );
}
