/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { WIRES } from '../data';
import { WireType, CableStandard } from '../types';
import { 
  Check, 
  Info, 
  RefreshCw, 
  Smartphone, 
  Monitor, 
  ShieldAlert, 
  Award,
  Zap,
  Play,
  Pause,
  Activity,
  AlertTriangle,
  Lightbulb,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';

// Specialized Web Audio synthesizer for pleasant retro game sound effects
const playSound = (type: 'success' | 'error' | 'click' | 'complete') => {
  try {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    if (type === 'success') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      osc.frequency.setValueAtTime(880, ctx.currentTime + 0.1);  // A5
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.25);
      osc.start();
      osc.stop(ctx.currentTime + 0.25);
    } else if (type === 'error') {
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(220, ctx.currentTime);      // A3
      osc.frequency.setValueAtTime(147, ctx.currentTime + 0.08); // D3
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
      osc.start();
      osc.stop(ctx.currentTime + 0.3);
    } else if (type === 'click') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(440, ctx.currentTime);
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.05);
      osc.start();
      osc.stop(ctx.currentTime + 0.05);
    } else if (type === 'complete') {
      osc.type = 'sine';
      const now = ctx.currentTime;
      // Arpeggio C Major: C5, E5, G5, C6
      osc.frequency.setValueAtTime(523.25, now);
      osc.frequency.setValueAtTime(659.25, now + 0.1);
      osc.frequency.setValueAtTime(783.99, now + 0.2);
      osc.frequency.setValueAtTime(1046.50, now + 0.3);
      gain.gain.setValueAtTime(0.12, now);
      gain.gain.setValueAtTime(0.12, now + 0.3);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.65);
      osc.start();
      osc.stop(now + 0.7);
    }
  } catch (e) {
    // Fail silently if browser audio settings prevent autoplay
  }
};

export function CrimpSimulator() {
  const [standard, setStandard] = useState<CableStandard>('T568B');
  const [shuffledWires, setShuffledWires] = useState<WireType[]>([]);
  const [placed, setPlaced] = useState<{ [pin: number]: string }>({}); // pin_number -> wire_id
  const [selectedWireId, setSelectedWireId] = useState<string | null>(null);
  const [draggedWireId, setDraggedWireId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ text: string; status: 'idle' | 'ok' | 'fail' }>({
    text: 'Toque num fio abaixo para selecionar e depois toque num slot do RJ45 para o encaixar, ou simplesmente arraste e solte o cabo!',
    status: 'idle'
  });
  const [isCompleted, setIsCompleted] = useState<boolean>(false);
  const [crimped, setCrimped] = useState<boolean>(false);
  const [wrongAttempts, setWrongAttempts] = useState<number>(0);
  const [errorFlashPin, setErrorFlashPin] = useState<number | null>(null);

  // States for Crimping Pin Pressure Animation overlay
  const [isCrimping, setIsCrimping] = useState<boolean>(false);

  // States for interactive local tester component
  const [testerCabinCable, setTesterCabinCable] = useState<'my-crimp' | 'straight' | 'crossover' | 'open-pair' | 'short-circuit'>('straight');
  const [isTestingOn, setIsTestingOn] = useState<boolean>(false);
  const [activeTestPin, setActiveTestPin] = useState<number>(0); // 0 = idle, 1..8 = Pins, 9 = Ground/Shield (G)
  const [testerSpeed, setTesterSpeed] = useState<number>(550); // test loop interval ms
  const [testerLogs, setTesterLogs] = useState<string[]>([
    '📟 Testador Remoto Ligado. Conecte um cabo e aperte "Iniciar Varredura" para emitir pulsos elétricos de 5V.'
  ]);

  // Cable Tester physical mapping simulator function
  const getTestMapping = (pin: number) => {
    if (pin === 9) {
      return { remotePin: 9, status: 'ok', label: 'Blindagem de Terra (Shield G)' };
    }
    switch (testerCabinCable) {
      case 'straight':
        return { remotePin: pin, status: 'ok', label: `Direto (Pino ${pin})` };
        
      case 'crossover': {
        // Crossover swaps 1->3, 2->6, 3->1, 6->2, others straight
        if (pin === 1) return { remotePin: 3, status: 'cross', label: 'Cruza para o Pino 3' };
        if (pin === 2) return { remotePin: 6, status: 'cross', label: 'Cruza para o Pino 6' };
        if (pin === 3) return { remotePin: 1, status: 'cross', label: 'Cruza para o Pino 1' };
        if (pin === 6) return { remotePin: 2, status: 'cross', label: 'Cruza para o Pino 2' };
        return { remotePin: pin, status: 'ok', label: `Direto (Pino ${pin})` };
      }
      
      case 'open-pair': {
        // Pairs 4 & 5 (Blue pair) are open/cut
        if (pin === 4 || pin === 5) {
          return { remotePin: null, status: 'open', label: 'Aberto (Sem Continuidade)' };
        }
        return { remotePin: pin, status: 'ok', label: `Direto (Pino ${pin})` };
      }
      
      case 'short-circuit': {
        // Pin 1 & 2 are shorted on receiver
        if (pin === 1) return { remotePin: 2, status: 'swap', label: 'Invertido com Pino 2' };
        if (pin === 2) return { remotePin: 1, status: 'swap', label: 'Invertido com Pino 1' };
        return { remotePin: pin, status: 'ok', label: `Direto (Pino ${pin})` };
      }
      
      case 'my-crimp': {
        if (!crimped) {
          return { remotePin: null, status: 'open', label: 'Aberto (Cabo não foi Crimpado!)' };
        }
        const wireId = placed[pin];
        if (!wireId) {
          return { remotePin: null, status: 'open', label: 'Aberto (Pino Desconectado)' };
        }
        const wire = WIRES.find(w => w.id === wireId);
        if (!wire) {
          return { remotePin: null, status: 'open', label: 'Aberto (Nulo/Inexistente)' };
        }
        // Check standard mapping: in a standard tester terminal socket:
        // id 'ow' goes to target Pin 1
        // id 'o' goes to target Pin 2
        // id 'gw' goes to target Pin 3
        // id 'b' goes to target Pin 4
        // id 'bw' goes to target Pin 5
        // id 'g' goes to target Pin 6
        // id 'brw' goes to target Pin 7
        // id 'br' goes to target Pin 8
        let targetSocketPin = 0;
        if (wire.id === 'ow') targetSocketPin = 1;
        else if (wire.id === 'o') targetSocketPin = 2;
        else if (wire.id === 'gw') targetSocketPin = 3;
        else if (wire.id === 'b') targetSocketPin = 4;
        else if (wire.id === 'bw') targetSocketPin = 5;
        else if (wire.id === 'g') targetSocketPin = 6;
        else if (wire.id === 'brw') targetSocketPin = 7;
        else if (wire.id === 'br') targetSocketPin = 8;

        if (targetSocketPin === pin) {
          return { remotePin: targetSocketPin, status: 'ok', label: `Direto (Pino ${targetSocketPin})` };
        } else {
          return { remotePin: targetSocketPin, status: 'swap', label: `Invertido p/ Pino ${targetSocketPin}` };
        }
      }
      default:
        return { remotePin: pin, status: 'ok', label: `Direto` };
    }
  };

  // 1. Effect for the automatic scanning interval
  useEffect(() => {
    let interval: any = null;
    if (isTestingOn) {
      interval = setInterval(() => {
        setActiveTestPin((prev) => {
          let next = prev + 1;
          if (next > 9) {
            next = 1; // loop pin 1..9
          }
          return next;
        });
      }, testerSpeed);
    } else {
      setActiveTestPin(0);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isTestingOn, testerSpeed]);

  // 2. Effect for appending real-time diagnostic logs during tester walks
  useEffect(() => {
    if (activeTestPin > 0) {
      const mapping = getTestMapping(activeTestPin);
      let logMsg = '';
      if (activeTestPin === 9) {
        logMsg = `🔋 Linha G (GND/Shield): Continuidade do pino de aterramento blindado testada OK.`;
      } else {
        if (mapping.remotePin === null) {
          logMsg = `⚠️ P${activeTestPin} [Master] ➔ Aberto / Sem Contato no terminal remoto. Falha de Crimpagem detectada!`;
        } else if (mapping.status === 'cross') {
          logMsg = `🔀 P${activeTestPin} [Master] ➔ Cruzou para o receptor R${mapping.remotePin} (Cabo Crossover detetado).`;
        } else if (mapping.status === 'swap') {
          logMsg = `❌ P${activeTestPin} [Master] ➔ Desalinhado / Conectado em R${mapping.remotePin}. Ligações elétricas incorretas!`;
        } else {
          logMsg = `✅ P${activeTestPin} [Master] ➔ Recebido em R${mapping.remotePin} (Continuidade de cobre a 100% OK).`;
        }
      }
      setTesterLogs((prev) => {
        const kept = prev.slice(-4); // keep latest 5 messages
        return [...kept, logMsg];
      });
    }
  }, [activeTestPin]);

  // Initialize practice pool
  const resetSimulator = () => {
    setPlaced({});
    setSelectedWireId(null);
    setDraggedWireId(null);
    setIsCompleted(false);
    setCrimped(false);
    setWrongAttempts(0);
    setErrorFlashPin(null);
    setIsTestingOn(false);
    setActiveTestPin(0);
    setFeedback({
      text: `Arraste ou selecione fios para montar o cabo padrão ${standard}!`,
      status: 'idle'
    });

    // Shuffle wires
    const wiresPool = [...WIRES].sort(() => Math.random() - 0.5);
    setShuffledWires(wiresPool);
  };

  useEffect(() => {
    resetSimulator();
  }, [standard]);

  // Handle standard wire insertion decision
  const attemptInsert = (pinIndex: number, wireId: string) => {
    const wire = WIRES.find(w => w.id === wireId);
    if (!wire) return;

    // Correct position according to chosen standard
    const targetPin = standard === 'T568B' ? wire.pin : wire.pinA;

    if (targetPin === pinIndex) {
      playSound('success');
      setPlaced(prev => ({ ...prev, [pinIndex]: wireId }));
      setSelectedWireId(null);
      setFeedback({
        text: `Excelente! Pin ${pinIndex} - ${wire.label} (${wire.role}) está cravado perfeitamente! Ela atua como ${wire.shortRole}.`,
        status: 'ok'
      });

      // Check if finished
      const updatedPlaced = { ...placed, [pinIndex]: wireId };
      if (Object.keys(updatedPlaced).length === 8) {
        setIsCompleted(true);
        playSound('complete');
        setFeedback({
          text: 'Incrível! Todos os fios estão alinhados no conetor. Agora clique no botão abaixo para usar o Alicate e Crimpar o cabo RJ45!',
          status: 'ok'
        });
      }
    } else {
      playSound('error');
      setWrongAttempts(prev => prev + 1);
      setErrorFlashPin(pinIndex);
      setTimeout(() => setErrorFlashPin(null), 800);
      
      const correctWireAtPin = WIRES.find(w => (standard === 'T568B' ? w.pin : w.pinA) === pinIndex);
      setFeedback({
        text: `Ops! Esse não é o fio correto para o Pin ${pinIndex}. Dica: Para o padrão ${standard}, a posição ${pinIndex} requer o fio "${correctWireAtPin?.label}".`,
        status: 'fail'
      });
    }
  };

  // Click handler for wire selection
  const handleWireSelect = (wireId: string) => {
    if (placedWiresIds.includes(wireId)) return;
    playSound('click');
    setSelectedWireId(wireId === selectedWireId ? null : wireId);
  };

  // Click handler for pin placement
  const handleSlotClick = (pinIndex: number) => {
    if (placed[pinIndex]) {
      // Already filled, explain it
      const wireId = placed[pinIndex];
      const wire = WIRES.find(w => w.id === wireId);
      if (wire) {
        setFeedback({
          text: `Pino ${pinIndex} já está preenchido com <strong>${wire.label}</strong> pertencente ao <strong>${wire.pairName}</strong>.`,
          status: 'ok'
        });
      }
      return;
    }

    if (selectedWireId) {
      attemptInsert(pinIndex, selectedWireId);
    } else {
      const neededWire = WIRES.find(w => (standard === 'T568B' ? w.pin : w.pinA) === pinIndex);
      setFeedback({
        text: `Este slot do Pino ${pinIndex} está vazio! Procure pelo fio "${neededWire?.label}" no mostrador abaixo para colocá-lo aqui.`,
        status: 'idle'
      });
    }
  };

  const handleCrimp = () => {
    playSound('click');
    setIsCrimping(true);
    setFeedback({
      text: `⚡ <strong>CRIMPANDO CABO...</strong> As lâminas cortantes de bronze fosforizado revestidas a ouro estão a ser pressionadas com 150 libras de força mecânica para perfurar o invólucro termoplástico e penetrar os filamentos de cobre!`,
      status: 'idle'
    });

    setTimeout(() => {
      setIsCrimping(false);
      setCrimped(true);
      playSound('complete');
      setFeedback({
        text: `🎉 <strong>Cabo RJ45 cravado com êxito!</strong> Lâminas metálicas travaram de forma permanente com os condutores. Pode selecionar <strong>"Meu Cabo Crimpado"</strong> no Testador de Cabo abaixo para comprovar eletronicamente!`,
        status: 'ok'
      });
      // Automatically update the tester selection to analyze the newly finished user crimp
      setTesterCabinCable('my-crimp');
    }, 2800);
  };

  const placedWiresIds = Object.values(placed);
  const remainingWires = shuffledWires.filter(w => !placedWiresIds.includes(w.id));
  const progressCount = placedWiresIds.length;
  const progressPercent = (progressCount / 8) * 100;

  return (
    <div id="crimp-simulator" className="space-y-6">
      {/* Settings Panel */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="text-white font-medium text-lg flex items-center gap-2">
            🛠️ Modos de Treino & Padrões
          </h3>
          <p className="text-slate-400 text-sm mt-1">
            Selecione qual padrão industrial deseja treinar. Dica: O T568B é o mais utilizado globalmente para instalações domésticas e comerciais.
          </p>
        </div>
        <div className="flex bg-slate-950 p-1.5 rounded-lg border border-slate-800 self-start md:self-center">
          <button
            onClick={() => setStandard('T568B')}
            className={`px-4 py-1.5 rounded-md text-xs font-semibold uppercase tracking-wider transition ${
              standard === 'T568B'
                ? 'bg-[#fb8c00] text-black shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Padrão T568B
          </button>
          <button
            onClick={() => setStandard('T568A')}
            className={`px-4 py-1.5 rounded-md text-xs font-semibold uppercase tracking-wider transition ${
              standard === 'T568A'
                ? 'bg-[#388e3c] text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Padrão T568A
          </button>
        </div>
      </div>

      {/* Main Sandbox Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        
        {/* Left Interactive Connector Workspace: 7 cols */}
        <div className="lg:col-span-8 bg-slate-900/40 border border-slate-800/80 rounded-2xl p-6 flex flex-col justify-between min-h-[480px] relative">
          
          {/* Dynamic blade crimp animation overlay container */}
          <AnimatePresence>
            {isCrimping && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 z-50 bg-slate-950/95 flex flex-col items-center justify-center p-6 border-2 border-cyan-500/30 rounded-2xl overflow-hidden backdrop-blur-sm"
              >
                <div className="text-center max-w-md space-y-6">
                  <div className="inline-flex p-3 rounded-full bg-cyan-950 border border-cyan-500/50 text-cyan-400 animate-pulse">
                    <Zap className="w-8 h-8 stroke-[2.5]" />
                  </div>
                  
                  <div>
                    <h3 className="text-white font-bold text-xl tracking-tight uppercase">
                      💥 Pressão Métrico-Lâminas (IDC)
                    </h3>
                    <p className="text-slate-400 text-xs mt-1 leading-relaxed">
                      Lâminas cortantes do conector RJ45 estão a ser empurradas verticalmente para penetrar o invólucro isolador de plástico e selar o contato de cobre sólido.
                    </p>
                  </div>

                  {/* Core SVG pressure animation */}
                  <div className="w-full bg-slate-900/80 border border-slate-850 p-4 rounded-xl h-44 relative flex items-center justify-center overflow-hidden">
                    <div className="absolute w-32 h-32 border border-slate-800 rounded-full bg-slate-950/40 opacity-30 pointer-events-none" />
                    
                    <svg viewBox="0 0 200 120" className="w-48 h-full">
                      {/* Solid Copper Core inside wire */}
                      <circle cx="100" cy="80" r="16" fill="#f59e0b" className="animate-pulse" />
                      <text x="100" y="84" fill="#000" fontSize="8.5" fontWeight="black" textAnchor="middle" fontFamily="monospace">COBRE</text>
                      
                      {/* Plastic outer insulation tube */}
                      <circle cx="100" cy="80" r="30" fill="none" stroke="#2563eb" strokeWidth="8" strokeLinecap="round" opacity="0.65" />
                      <text x="100" y="44" fill="#60a5fa" fontSize="7" fontWeight="bold" textAnchor="middle" fontFamily="monospace">ISOLAMENTO</text>

                      {/* Metal blade/jaw coming down vertical path */}
                      <motion.g
                        initial={{ y: -45 }}
                        animate={{ y: 2 }}
                        transition={{ duration: 1.3, ease: "easeInOut", repeat: 1, repeatType: "reverse" }}
                      >
                        {/* Gold double tooth path */}
                        <path d="M 88 5 L 112 5 L 112 50 L 105 68 L 95 68 L 88 50 Z" fill="#fbbf24" stroke="#d97706" strokeWidth="1.5" />
                        <path d="M 95 68 L 100 62 L 105 68" fill="none" stroke="#d97706" strokeWidth="1.5" />
                        <line x1="100" y1="10" x2="100" y2="55" stroke="#fef08a" strokeWidth="1" opacity="0.5" />
                        <text x="100" y="30" fill="#78350f" fontSize="7" fontWeight="black" textAnchor="middle" fontFamily="monospace">LÂMINA</text>
                      </motion.g>

                      {/* Sparks glow area generated on wire cut pierce */}
                      <motion.circle
                        cx="100"
                        cy="68"
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: [0, 1.8, 0], opacity: [0, 0.95, 0] }}
                        transition={{ delay: 0.9, duration: 0.6, repeat: Infinity }}
                        r="18"
                        fill="url(#spark-glow-circle)"
                      />
                      
                      <defs>
                        <radialGradient id="spark-glow-circle" cx="50%" cy="50%" r="50%">
                          <stop offset="0%" stopColor="#38bdf8" stopOpacity="1" />
                          <stop offset="100%" stopColor="#2563eb" stopOpacity="0" />
                        </radialGradient>
                      </defs>
                    </svg>
                    
                    <div className="absolute bottom-1.5 inset-x-0 text-center">
                      <span className="text-[9px] font-mono text-cyan-400 font-bold uppercase tracking-wider">
                        Deslocamento por Penetração de Cobre (IDC)
                      </span>
                    </div>
                  </div>

                  {/* Progressive visual timer loading bar */}
                  <div className="space-y-1">
                    <div className="w-full h-1.5 bg-slate-950 border border-slate-800 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ x: "-100%" }}
                        animate={{ x: "0%" }}
                        transition={{ duration: 2.8, ease: "linear" }}
                        className="h-full bg-gradient-to-r from-amber-500 via-cyan-500 to-emerald-500 rounded-full"
                      />
                    </div>
                    <div className="flex justify-between text-[9px] font-mono text-slate-500 uppercase tracking-widest">
                      <span>Corte</span>
                      <span>Tração</span>
                      <span>Fusão Feita</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-[10px] sm:text-xs font-mono py-1 px-2.5 rounded bg-slate-950/80 text-cyan-400 border border-cyan-950 uppercase tracking-widest">
                RJ-45 Conector · Vista Superior Geral
              </span>
              <span className="text-xs text-slate-400 flex items-center gap-1.5 font-mono">
                Erros: <strong className="text-rose-400">{wrongAttempts}</strong>
              </span>
            </div>

            {/* RJ45 Shell */}
            <div className="relative my-8 bg-gradient-to-b from-slate-950/90 to-slate-900 border-2 border-slate-800/80 rounded-2xl px-4 py-8 shadow-2xl overflow-hidden max-w-xl mx-auto">
              
              {/* Gold pins background */}
              <div className="absolute top-0 inset-x-8 h-2 flex justify-between bg-zinc-800/30 rounded-b border-b border-zinc-700/20">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="w-4 h-full bg-amber-400/80 rounded-b shadow-[0_1px_3px_rgba(251,191,36,0.5)]"></div>
                ))}
              </div>

              {/* Slots Row */}
              <div className="grid grid-cols-8 gap-1.5 sm:gap-2.5 relative pt-4 pb-2 z-10">
                {[...Array(8)].map((_, index) => {
                  const pinNumber = index + 1;
                  const placedWireId = placed[pinNumber];
                  const wire = WIRES.find(w => w.id === placedWireId);
                  const isFlashedError = errorFlashPin === pinNumber;

                  return (
                    <motion.button
                      key={pinNumber}
                      onClick={() => handleSlotClick(pinNumber)}
                      className={`flex flex-col items-center gap-2 py-4 px-1 rounded-xl border-2 transition-all relative ${
                        isFlashedError
                          ? 'border-rose-500 bg-rose-500/10 shadow-[0_0_15px_rgba(239,68,68,0.3)] animate-shake'
                          : wire
                          ? 'border-emerald-600/50 bg-emerald-950/10 cursor-default'
                          : 'border-dashed border-slate-800 hover:border-slate-600 hover:bg-slate-900/60'
                      }`}
                      whileHover={!wire ? { scale: 1.03 } : {}}
                      whileTap={!wire ? { scale: 0.97 } : {}}
                    >
                      {/* Pin label inside conector */}
                      <span className="text-[10px] font-mono font-medium text-slate-500">P{pinNumber}</span>

                      {/* Placed Wire Object */}
                      {wire ? (
                        <div className="w-full flex flex-col items-center gap-1.5">
                          {/* Stripe pattern or solid wire drawing */}
                          <div
                            className="w-5 h-20 rounded-md relative overflow-hidden border border-black/40 shadow-inner"
                            style={{ backgroundColor: wire.striped ? '#ffffff' : wire.color }}
                          >
                            {wire.striped && (
                              <div
                                className="absolute inset-x-0 h-full opacity-95"
                                style={{
                                  backgroundImage: `repeating-linear-gradient(45deg, ${wire.color} 0px, ${wire.color} 5px, transparent 5px, transparent 10px)`
                                }}
                              />
                            )}
                          </div>
                          
                          <div className="bg-emerald-500 text-slate-950 rounded-full p-0.5 mt-1 border border-black/10">
                            <Check className="w-2.5 h-2.5 stroke-[4px]" />
                          </div>
                        </div>
                      ) : (
                        <div className="h-20 w-5 rounded-md border border-slate-950 bg-slate-950 flex flex-col justify-center items-center shadow-inner">
                          <span className="text-[9px] text-slate-700 font-bold">+</span>
                        </div>
                      )}
                    </motion.button>
                  );
                })}
              </div>

              {/* Outer guide indicator lines */}
              <div className="flex justify-between px-1.5 mt-2 text-[9px] font-mono text-slate-500 opacity-60">
                <span>← Pino 1 (Esquerda)</span>
                <span>Pino 8 (Direita) →</span>
              </div>

              {/* Cable sleeve simulation under the pins */}
              <div className="w-3/4 mx-auto h-12 bg-slate-950 border-t border-slate-800/80 rounded-t-xl mt-6 relative flex items-center justify-center">
                <span className="text-[9px] font-mono text-slate-600">Revestimento PVC (Cabo)</span>
                {/* Simulated colorful wires coming up from the bottom sleeve */}
                <div className="absolute -top-6 inset-x-4 h-6 flex justify-between px-2 opacity-30">
                  {WIRES.map(w => (
                    <div key={w.id} className="w-1 h-full rounded" style={{ backgroundColor: w.color }}></div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Assistant Terminal Feedback Banner */}
          <div className={`p-4 rounded-xl border text-sm transition-all shadow-inner ${
            feedback.status === 'ok'
              ? 'bg-emerald-950/20 border-emerald-900/60 text-emerald-300'
              : feedback.status === 'fail'
              ? 'bg-rose-950/20 border-rose-900/60 text-rose-300'
              : 'bg-slate-950/60 border-slate-850 text-slate-300'
          }`}>
            <div className="flex items-start gap-2.5">
              <span className="mt-0.5 text-base text-slate-400">ℹ️</span>
              <div>
                <p className="leading-relaxed font-sans" dangerouslySetInnerHTML={{ __html: feedback.text }}></p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Inventory list & Wire Pool: 5 cols */}
        <div className="lg:col-span-4 flex flex-col gap-6 justify-between">
          
          {/* Wire Pool */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 flex-1 flex flex-col justify-between">
            <div>
              <div className="mb-4">
                <h4 className="text-white font-medium text-sm flex items-center gap-1">
                  🌐 Lista de Fios UTP Desfocados
                </h4>
                <p className="text-slate-400 text-xs mt-0.5">
                  Clique para marcar e después encaixe no pino metálico correspondente.
                </p>
              </div>

              <div className="space-y-1.5 mt-4 max-h-[340px] overflow-y-auto pr-2 custom-scrollbar">
                {remainingWires.length > 0 ? (
                  remainingWires.map(wire => {
                    const isSelected = selectedWireId === wire.id;
                    
                    // Determine PoE Polarity markers based on popular PoE Standards (Mode A / Mode B)
                    let polarityText = '';
                    let polarityColorAndBg = '';
                    
                    if (wire.id === 'b' || wire.id === 'bw') {
                      polarityText = 'PoE (+) Positivo';
                      polarityColorAndBg = 'bg-blue-950/50 text-blue-400 border-blue-900/60';
                    } else if (wire.id === 'br' || wire.id === 'brw') {
                      polarityText = 'PoE (−) Negativo';
                      polarityColorAndBg = 'bg-amber-950/50 text-amber-500 border-amber-900/60';
                    } else if (wire.id === 'ow' || wire.id === 'o') {
                      polarityText = 'Dados TX (Envio)';
                      polarityColorAndBg = 'bg-orange-950/35 text-orange-400 border-orange-900/30';
                    } else if (wire.id === 'gw' || wire.id === 'g') {
                      polarityText = 'Dados RX (Receção)';
                      polarityColorAndBg = 'bg-green-950/35 text-green-400 border-green-900/30';
                    }

                    return (
                      <button
                        key={wire.id}
                        onClick={() => handleWireSelect(wire.id)}
                        className={`w-full flex items-center justify-between p-2.5 rounded-xl border transition-all text-left ${
                          isSelected
                            ? 'bg-slate-950 text-white border-cyan-500 shadow-[0_0_12px_rgba(6,182,212,0.15)] scale-[1.01]'
                            : 'bg-slate-950/50 text-slate-300 border-slate-800 hover:border-slate-700 hover:bg-slate-950'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          {/* Tube visual */}
                          <div
                            className="w-10 h-4.5 rounded-full border border-black/40 relative overflow-hidden flex-shrink-0 shadow-inner"
                            style={{ backgroundColor: wire.color }}
                          >
                            {wire.striped && (
                              <div
                                className="absolute inset-0 opacity-80"
                                style={{
                                  backgroundImage: `repeating-linear-gradient(45deg, #ffffff 0px, #ffffff 4px, transparent 4px, transparent 8px)`
                                }}
                              />
                            )}
                          </div>
                          
                          <div>
                            <div className="text-xs font-semibold">{wire.label}</div>
                            {polarityText && (
                              <div className="flex items-center gap-1.5 mt-0.5">
                                <span className={`text-[8.5px] font-mono px-1 py-0.5 rounded border ${polarityColorAndBg}`}>
                                  {polarityText}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>

                        {isSelected ? (
                          <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-cyan-950 border border-cyan-800/80 text-cyan-300 animate-pulse">
                            Pronto
                          </span>
                        ) : (
                          <span className="text-[9px] font-mono text-slate-500 bg-slate-900/35 px-1 py-0.5 rounded border border-slate-850">
                            Selecionar
                          </span>
                        )}
                      </button>
                    );
                  })
                ) : (
                  <div className="text-center py-8 text-xs text-slate-500 border border-slate-800/50 rounded-xl bg-slate-950/20">
                    Nenhum fio restante na paleta! 🎉
                  </div>
                )}
              </div>
            </div>

            {/* Progress indicators */}
            <div className="mt-6 pt-4 border-t border-slate-800/60">
              <div className="flex justify-between items-center text-xs text-slate-400 mb-1.5 font-mono">
                <span>Progresso da Pinagem</span>
                <span className="font-bold text-white">{progressCount} / 8 fios</span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-950 border border-slate-800/60 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-cyan-500 to-emerald-500 rounded-full transition-all duration-300"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          </div>

          {/* Action Trigger Card (Crimping) */}
          <AnimatePresence>
            {isCompleted && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="bg-gradient-to-br from-emerald-950/70 to-slate-950 border border-emerald-500/30 p-5 rounded-2xl flex flex-col justify-between"
              >
                {!crimped ? (
                  <div>
                    <span className="text-[10px] font-semibold text-emerald-400 uppercase tracking-widest font-mono">
                      Cabo Perfeitamente Alinhado!
                    </span>
                    <h4 className="text-white font-medium text-base mt-1.5">
                      Falta apenas crimpar!
                    </h4>
                    <p className="text-slate-300 text-xs mt-1 leading-relaxed">
                      Use a ferramenta de alicate crimpador virtual para fechar as lâminas de cobre do RJ45 sobre os condutores elétricos.
                    </p>
                    <button
                      onClick={handleCrimp}
                      className="w-full mt-4 py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-xl font-bold text-sm tracking-wide transition shadow-[0_4px_20px_rgba(16,185,129,0.3)] hover:scale-[1.02] active:scale-[0.98]"
                    >
                      ⚡ Apertar Alicate (Crimpar)
                    </button>
                  </div>
                ) : (
                  <div className="text-center py-4 space-y-3">
                    <span className="text-3xl">🎉</span>
                    <h4 className="text-white font-bold text-base">Cabo Crimpado com Sucesso!</h4>
                    <p className="text-emerald-400 text-xs font-mono font-medium">
                      Conexão em cobre gigabit e PoE 100% testada e robusta!
                    </p>
                    <button
                      onClick={resetSimulator}
                      className="inline-flex items-center gap-1.5 mt-2 px-4 py-2 bg-slate-900 border border-slate-800 text-xs font-semibold text-slate-300 hover:text-white rounded-lg hover:bg-slate-850 transition"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      Praticar novamente
                    </button>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* 📟 INTERACTIVE CABLE TESTER & DIAGNOSTIC PANEL */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1 px-2.5 rounded bg-cyan-950/80 border border-cyan-800/50 text-cyan-300 font-mono text-[10px] uppercase font-bold">
                Módulo Eletrónico
              </span>
              <h3 className="text-white font-bold text-lg md:text-xl">
                📟 Testador de Continuidade de Cabos (Virtual Cable Tester)
              </h3>
            </div>
            <p className="text-slate-400 text-xs mt-1 leading-relaxed">
              Injete pulsos elétricos de 5V na unidade <strong>Master</strong> e verifique o retorno na unidade de encaixe <strong>Remote</strong> para detetar curto-circuitos, pares partidos e erros de pinagem em tempo real!
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 font-mono">Modo de Análise:</span>
            <select
              value={testerCabinCable}
              onChange={(e: any) => {
                setTesterCabinCable(e.target.value);
                setIsTestingOn(false);
                setActiveTestPin(0);
                setTesterLogs([
                  `📟 Alternado para o cabo: "${e.target.value.toUpperCase()}". Pronto para varredura.`
                ]);
              }}
              className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 font-medium"
            >
              <option value="straight">Cabo Direto Perfeito (T568B - Gigabit & PoE+) 🟢</option>
              {crimped ? (
                <option value="my-crimp">Meu Cabo Crimpado Atual (Realizado por si) 🛠️</option>
              ) : (
                <option value="my-crimp" disabled>Meu Cabo Crimpado Atual (Bloqueado - Crimpe primeiro) 🔒</option>
              )}
              <option value="crossover">Cabo Cruzado (Crossover - T568A x T568B) 🔀</option>
              <option value="open-pair">Par Partido / Circuito Aberto (Pinos RX 3 e 6 abertos) ⚠️</option>
              <option value="short-circuit">Curto-Circuito (Pinos TX 1 e 2 invertidos no recetor) ❌</option>
            </select>
          </div>
        </div>

        {/* Tester Grid: Controls + Visual LEDs + Live Console */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-stretch">
          
          {/* Col 1: Scan Controls & Metrics (3 cols) */}
          <div className="xl:col-span-3 bg-slate-950/50 border border-slate-850 p-4 rounded-xl flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-cyan-400" />
                Painel do Oscilador
              </h4>
              
              <div className="space-y-2">
                {!isTestingOn ? (
                  <button
                    onClick={() => {
                      setIsTestingOn(true);
                      playSound('success');
                    }}
                    className="w-full py-2.5 bg-cyan-600 hover:bg-cyan-500 text-slate-950 rounded-lg font-bold text-xs flex items-center justify-center gap-1.5 transition"
                  >
                    <Play className="w-3.5 h-3.5 fill-black" />
                    Iniciar varredura automática
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      setIsTestingOn(false);
                      playSound('click');
                    }}
                    className="w-full py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-lg font-bold text-xs flex items-center justify-center gap-1.5 transition"
                  >
                    <Pause className="w-3.5 h-3.5 fill-black" />
                    Pausar Varredura
                  </button>
                )}

                <button
                  onClick={() => {
                    playSound('click');
                    // Manual step
                    setActiveTestPin((prev) => (prev >= 9 ? 1 : prev + 1));
                  }}
                  disabled={isTestingOn}
                  className="w-full py-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 disabled:opacity-50 text-slate-300 font-semibold text-xs rounded-lg flex items-center justify-center gap-1.5 transition"
                >
                  <RefreshCw className="w-3 h-3" />
                  Passo Manual (Avançar)
                </button>
              </div>

              {/* Speed Controller */}
              <div className="space-y-1.5 mt-4">
                <label className="text-[10px] text-slate-500 font-mono block">Velocidade da Varredura:</label>
                <div className="grid grid-cols-3 gap-1 bg-slate-950 p-1 rounded-md border border-slate-850">
                  {[
                    { label: 'Lento', val: 1000 },
                    { label: 'Médio', val: 550 },
                    { label: 'Rápido', val: 200 }
                  ].map((s) => (
                    <button
                      key={s.label}
                      onClick={() => setTesterSpeed(s.val)}
                      className={`py-1 text-[9px] font-semibold rounded-md transition ${
                        testerSpeed === s.val
                          ? 'bg-slate-850 text-white shadow-inner'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* General Technical Verdict Alert */}
            <div className="pt-3 border-t border-slate-850">
              <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest block mb-1">
                Resultado de Diagnóstico
              </span>
              {testerCabinCable === 'straight' && (
                <div className="p-2.5 rounded-lg bg-emerald-950/20 border border-emerald-900/40 text-emerald-300 text-[11px] leading-relaxed">
                  <strong>CABO DIRETO APROVADO!</strong> Excelente continuidade 100% direta. Perfeito para redes gigabit 1000Base-T e alimentação PoE 802.3 af, at, bt.
                </div>
              )}
              {testerCabinCable === 'crossover' && (
                <div className="p-2.5 rounded-lg bg-blue-950/20 border border-blue-900/30 text-blue-300 text-[11px] leading-relaxed">
                  <strong>CABO CROSSOVER DETETADO!</strong> Pinos TX e RX cruzados estrategicamente. Indicado apenas para interconexão direta PC-a-PC sem intermediários.
                </div>
              )}
              {testerCabinCable === 'open-pair' && (
                <div className="p-2.5 rounded-lg bg-rose-950/20 border border-rose-900/40 text-rose-300 text-[11px] leading-relaxed">
                  <strong>FALHA DE CONTINUIDADE!</strong> Loop ausente nos canais RX (3 e 6). Este cabo não estabelecerá enlace Ethernet (Sem Link). Necessita reparação!
                </div>
              )}
              {testerCabinCable === 'short-circuit' && (
                <div className="p-2.5 rounded-lg bg-amber-950/20 border border-amber-900/40 text-amber-300 text-[11px] leading-relaxed">
                  <strong>CURTO-CIRCUITO / INVERSÃO!</strong> Pinos 1 e 2 foram invertidos na receção. Risco de queda severa na integridade do pacote de dados.
                </div>
              )}
              {testerCabinCable === 'my-crimp' && (
                (() => {
                  // Count matches
                  let correctCount = 0;
                  for (let i = 1; i <= 8; i++) {
                    const mapResult = getTestMapping(i);
                    if (mapResult && mapResult.remotePin === i) {
                      correctCount++;
                    }
                  }
                  if (correctCount === 8) {
                    return (
                      <div className="p-2.5 rounded-lg bg-emerald-950/30 border border-emerald-500/30 text-emerald-400 text-[11.5px] leading-relaxed shadow-lg">
                        <strong>🏅 SEU CABO É EXCELENTE!</strong> 8/8 pinos com continuidade perfeita. Cabo gigabit Ethernet e PoE totalmente utilizável e resiliente! Excecional crimpagem!
                      </div>
                    );
                  } else {
                    return (
                      <div className="p-2.5 rounded-lg bg-rose-950/20 border border-rose-900/40 text-rose-300 text-[11px] leading-relaxed">
                        <strong>⚠️ CABO INSUBSTANCIAL!</strong> Apenas {correctCount}/8 pinos corretos. Há erros de ordenação de fios no conector que provocarão colisões ou falhas PoE. Pratique novamente!
                      </div>
                    );
                  }
                })()
              )}
            </div>
          </div>

          {/* Col 2: The Physical Side-by-Side Instrument GUI (6 cols) */}
          <div className="xl:col-span-6 bg-slate-950 border border-slate-850 p-4 rounded-xl flex flex-col justify-between select-none overflow-hidden min-h-[360px]">
            <div className="flex justify-between items-center bg-slate-900/60 p-2 border border-slate-800 rounded-lg text-center mb-4">
              <span className="text-[10px] font-mono text-cyan-400 uppercase font-semibold">
                Sinalizador Master (Local)
              </span>
              <span className="text-[9px] font-mono text-slate-500 animate-pulse">
                {isTestingOn ? '🎛️ Varredura Ativa...' : '⏸️ Varredura Pausada'}
              </span>
              <span className="text-[10px] font-mono text-emerald-400 uppercase font-semibold">
                Sinalizador Remote (Terminal)
              </span>
            </div>

            {/* Side by side LED Columns connected by live wire lines */}
            <div className="relative grid grid-cols-12 gap-2 h-64 my-auto">
              {/* Absolute background SVG for connector tracing */}
              <div className="absolute inset-0 z-0 pointer-events-none">
                <svg className="w-full h-full" viewBox="0 0 400 240" preserveAspectRatio="none">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((pNum) => {
                    const isPinActive = activeTestPin === pNum;
                    const mapping = getTestMapping(pNum);
                    
                    if (isPinActive && mapping.remotePin !== null) {
                      // Calculate positions
                      // Master Pin y coordinate index:
                      const masterY = 15 + (pNum - 1) * 25.5;
                      const remoteY = 15 + (mapping.remotePin - 1) * 25.5;
                      
                      let strokeColor = '#10b981'; // perfect green
                      let strokeDash = '';
                      
                      if (mapping.status === 'cross') {
                        strokeColor = '#3b82f6'; // blue
                        strokeDash = '4,4';
                      } else if (mapping.status === 'swap') {
                        strokeColor = '#ef4444'; // red
                      } else if (mapping.status === 'open') {
                        strokeColor = '#ef4444'; // red
                      }
                      
                      return (
                        <motion.line
                          key={`line-${pNum}`}
                          x1="35"
                          y1={`${masterY}`}
                          x2="365"
                          y2={`${remoteY}`}
                          stroke={strokeColor}
                          strokeWidth="3.5"
                          strokeLinecap="round"
                          strokeDasharray={strokeDash}
                          initial={{ pathLength: 0 }}
                          animate={{ pathLength: 1 }}
                          transition={{ duration: 0.15 }}
                        />
                      );
                    }
                    
                    // Stationary silent backgrounds of connection lines
                    const masterY = 15 + (pNum - 1) * 25.5;
                    return (
                      <line
                        key={`bgline-${pNum}`}
                        x1="35"
                        y1={`${masterY}`}
                        x2="365"
                        y2={`${masterY}`}
                        stroke="#1e293b"
                        strokeWidth="1"
                        opacity="0.3"
                      />
                    );
                  })}
                </svg>
              </div>

              {/* Master Terminal LEDs: pins 1 to 8 + G (Col span 4) */}
              <div className="col-span-4 flex flex-col justify-between h-full z-10">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((pNum) => {
                  const isPinActive = activeTestPin === pNum;
                  const label = pNum === 9 ? 'G' : `P${pNum}`;
                  
                  // Wire identification
                  let wireLabel = '';
                  let wireColor = '#475569';
                  if (pNum !== 9) {
                    // Match wire color in real layout
                    const placedId = placed[pNum];
                    const wItem = WIRES.find(w => w.id === placedId);
                    if (wItem) {
                      wireLabel = wItem.label.split('/')[1] || wItem.label;
                      wireColor = wItem.color;
                    } else if (pNum === 1) { wireColor = '#fb8c00'; wireLabel = 'Br/Lar'; }
                    else if (pNum === 2) { wireColor = '#e65100'; wireLabel = 'Laranja'; }
                    else if (pNum === 3) { wireColor = '#4caf50'; wireLabel = 'Br/Verde'; }
                    else if (pNum === 4) { wireColor = '#2196f3'; wireLabel = 'Azul'; }
                    else if (pNum === 5) { wireColor = '#03a9f4'; wireLabel = 'Br/Azul'; }
                    else if (pNum === 6) { wireColor = '#2e7d32'; wireLabel = 'Verde'; }
                    else if (pNum === 7) { wireColor = '#8d6e63'; wireLabel = 'Br/Cast'; }
                    else if (pNum === 8) { wireColor = '#5d4037'; wireLabel = 'Castanho'; }
                  } else {
                    wireLabel = 'Blindagem';
                    wireColor = '#94a3b8';
                  }

                  return (
                    <div key={`m-led-${pNum}`} className="flex items-center gap-2">
                      <div
                        className={`w-3 h-3 rounded-full border transition-all duration-100 flex-shrink-0 ${
                          isPinActive
                            ? 'bg-amber-400 border-amber-300 shadow-[0_0_10px_rgba(251,191,36,0.85)] scale-110'
                            : 'bg-slate-800 border-slate-700'
                        }`}
                      />
                      <span className="text-[10px] font-mono text-slate-300 font-bold bg-slate-900/60 px-1.5 py-0.5 rounded border border-slate-850/60 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: wireColor }} />
                        {label} <span className="text-[8px] text-slate-500 font-normal hidden sm:inline">{wireLabel}</span>
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Center spacer: (Col span 4) */}
              <div className="col-span-4" />

              {/* Remote Terminal LEDs: pins 1 to 8 + G (Col span 4) */}
              <div className="col-span-4 flex flex-col justify-between items-end h-full z-10">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((pNum) => {
                  // Does this remote pin light up on activeTestPin?
                  // Remote pin lights up when activeTestPin signals it!
                  let isRemoteActive = false;
                  let remoteStatus = 'idle';
                  let activeIncomingMaster = 0;

                  if (activeTestPin > 0) {
                    const mapping = getTestMapping(activeTestPin);
                    if (mapping.remotePin === pNum) {
                      isRemoteActive = true;
                      remoteStatus = mapping.status;
                      activeIncomingMaster = activeTestPin;
                    }
                  }

                  const label = pNum === 9 ? 'G' : `R${pNum}`;

                  return (
                    <div key={`r-led-${pNum}`} className="flex items-center gap-2">
                      <span className="text-[10px] font-mono text-slate-300 font-bold bg-slate-900/60 px-1.5 py-0.5 rounded border border-slate-850/60 flex items-center justify-end">
                        {label}
                        {isRemoteActive && (
                          <span className="text-[8px] text-cyan-400 ml-1 font-normal font-sans">
                            (de M{activeIncomingMaster})
                          </span>
                        )}
                      </span>
                      <div
                        className={`w-3 h-3 rounded-full border transition-all duration-100 flex-shrink-0 ${
                          !isRemoteActive
                            ? 'bg-slate-800 border-slate-700'
                            : remoteStatus === 'ok'
                            ? 'bg-emerald-400 border-emerald-300 shadow-[0_0_10px_rgba(52,211,153,0.9)] scale-110'
                            : remoteStatus === 'cross'
                            ? 'bg-blue-400 border-blue-300 shadow-[0_0_10px_rgba(96,165,250,0.9)] scale-110'
                            : 'bg-rose-500 border-rose-400 shadow-[0_0_10px_rgba(244,63,94,0.9)] scale-110'
                        }`}
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Col 3: Live Running Logs Screen (3 cols) */}
          <div className="xl:col-span-3 bg-slate-950 border border-slate-850 p-4 rounded-xl flex flex-col justify-between font-mono text-xs">
            <div className="space-y-3">
              <h4 className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 flex items-center gap-1">
                🖥️ Diagnóstico Elétrico (Logs)
              </h4>
              
              <div className="bg-slate-900/90 border border-slate-850/60 p-3 h-52 rounded-lg font-mono text-[10px] text-cyan-400/90 space-y-2 overflow-y-auto custom-scrollbar">
                {testerLogs.map((log, index) => (
                  <div key={index} className="leading-relaxed border-b border-slate-850/30 pb-1.5 last:border-0">
                    <span className="text-slate-600 block text-[9px]">SYSTEM@ANALYSIS ~</span>
                    {log}
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-850 text-[10px] text-slate-400 space-y-1">
              <span className="text-slate-200 font-bold block mb-0.5">Legenda eletrónica:</span>
              <div className="flex items-center gap-1.5 text-[9px]">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
                <span>Ligação direta contínua</span>
              </div>
              <div className="flex items-center gap-1.5 text-[9px]">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block" />
                <span>Pares Cruzados (Crossover)</span>
              </div>
              <div className="flex items-center gap-1.5 text-[9px]">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block" />
                <span>Circuito Aberto ou Erro Grave</span>
              </div>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
