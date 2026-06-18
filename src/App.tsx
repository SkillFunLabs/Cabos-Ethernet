/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CrimpSimulator } from './components/CrimpSimulator';
import { PinReference } from './components/PinReference';
import { TheorySection } from './components/TheorySection';
import { Quiz } from './components/Quiz';
import { 
  Wrench, 
  BookOpen, 
  Network, 
  HelpCircle, 
  Signal, 
  ShieldAlert, 
  ChevronRight, 
  GitCompare,
  Zap
} from 'lucide-react';

type TabID = 'simulator' | 'reference' | 'theory' | 'quiz';

export default function App() {
  const [activeTab, setActiveTab] = useState<TabID>('simulator');

  return (
    <div className="min-h-screen bg-[#0A0F1D] text-[#E2E8F0] font-sans antialiased selection:bg-blue-600 selection:text-white">
      
      {/* Decorative ambient lighting backdrops */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-10 left-1/4 w-96 h-96 bg-emerald-500/5 rounded-full blur-[150px] pointer-events-none" />

      {/* Top Navigation / Status Bar in High Density layout */}
      <header className="border-b border-[#1E293B] bg-[#0F172A] sticky top-0 z-40 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center font-bold text-white">RJ</div>
            <div>
              <h1 className="text-sm font-bold tracking-tight uppercase text-[#E2E8F0]">Simulador RJ45 <span className="text-blue-500 font-mono text-[10px] bg-blue-950/40 border border-blue-900/60 px-1.5 py-0.5 rounded ml-1">v4.2.0-PRO</span></h1>
              <p className="text-[10px] text-slate-500 uppercase tracking-widest">Padrões T568B & T568A · Análise Física</p>
            </div>
          </div>

          <div className="flex gap-6 items-center">
            <div className="hidden sm:flex flex-col items-end">
              <span className="text-[10px] text-slate-500 uppercase">Canal Principal</span>
              <span className="text-xs font-mono text-emerald-400">1000 Mbps Ativo</span>
            </div>
            <div className="hidden md:flex flex-col items-end">
              <span className="text-[10px] text-slate-500 uppercase">Modulação de Fios</span>
              <span className="text-xs font-mono text-blue-400">Full-Duplex</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_#10b981]" />
              <span className="text-[10px] font-mono text-slate-400">OPERADOR_ROOT</span>
            </div>
          </div>
        </div>
      </header>

      {/* Hero section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-3">
        <div className="bg-gradient-to-r from-slate-950 to-slate-900 border border-slate-850/80 rounded-2xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
          <div className="absolute inset-y-0 right-0 w-1/3 bg-[radial-gradient(circle_at_right,_var(--tw-gradient-stops))] from-cyan-950/20 via-transparent to-transparent pointer-events-none" />
          
          <div className="max-w-3xl relative z-10">
            <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-cyan-400 bg-cyan-950/60 border border-cyan-800/50 px-2.5 py-1 rounded">
              Infraestrutura & Teoria de Redes
            </span>
            <h2 className="text-white text-2xl sm:text-3xl font-extrabold tracking-tight mt-3">
              Como são os fios de um cabo de rede?
            </h2>
            <p className="text-slate-400 text-xs sm:text-sm mt-2 leading-relaxed">
              Explore a fundo a mecânica dos sinais elétricos diferencial de cobre, pratique a montagem de conectores RJ45 sem desperdiçar materiais reais, e tire todas as suas dúvidas sobre a sinalização de alta velocidade em redes modernas.
            </p>
          </div>

          {/* QUICK DIRECT EXPLANATIONS OF USER QUESTIONS */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6 pt-6 border-t border-slate-850">
            
            {/* Quick Answer 1 */}
            <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-850 flex items-start gap-3">
              <div className="p-2 rounded-lg bg-orange-950/50 text-orange-400 border border-orange-900/60 flex-shrink-0">
                <Network className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-white font-semibold text-xs uppercase tracking-wide">O que são dados RX e TX?</h4>
                <p className="text-slate-400 text-[11px] leading-relaxed mt-1">
                  <strong>TX (Transmit)</strong> é a transmissão: envia os bits do PC para a rede (Pino 1 e 2). <strong>RX (Receive)</strong> é a receção: traz dados de fora para o PC (Pino 3 e 6). Elas usam pares torcidos independentes de sinal diferencial elétrico para blindar dados contra interferências eletrostáticas externas.
                </p>
              </div>
            </div>

            {/* Quick Answer 2 */}
            <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-850 flex items-start gap-3">
              <div className="p-2 rounded-lg bg-cyan-950/50 text-cyan-400 border border-cyan-900/60 flex-shrink-0">
                <Zap className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-white font-semibold text-xs uppercase tracking-wide">Dados Gigabit + ou ++?</h4>
                <p className="text-slate-400 text-[11px] leading-relaxed mt-1">
                  Em redes de 100 Mbps (Fast), os pinos 4, 5, 7, 8 ficavam ociosos. Em Gigabit (1000 Mbps), ativamos o par azul <strong className="text-slate-200">(+ dados)</strong> e castanho <strong className="text-slate-200">(++ dados)</strong> de forma bidirecional simultânea. O par castanho também opera em circuitos de alimentação <strong className="text-yellow-400">PoE++</strong> de até 90W.
                </p>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Interactive Tabs Menu Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        
        {/* Navigation bar tabs */}
        <div className="flex border-b border-slate-900 mt-6 overflow-x-auto no-scrollbar scroll-smooth">
          <div className="flex gap-1">
            
            {/* Tab: Simulator */}
            <button
              onClick={() => setActiveTab('simulator')}
              className={`flex items-center gap-2 py-3.5 px-4 text-xs sm:text-sm font-semibold border-b-2 transition-all duration-200 ${
                activeTab === 'simulator'
                  ? 'border-cyan-500 text-white bg-slate-900/30'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Wrench className="w-4 h-4 text-cyan-400" />
              Simulador Prático (Crimpagem)
            </button>

            {/* Tab: Standard Reference */}
            <button
              onClick={() => setActiveTab('reference')}
              className={`flex items-center gap-2 py-3.5 px-4 text-xs sm:text-sm font-semibold border-b-2 transition-all duration-200 ${
                activeTab === 'reference'
                  ? 'border-cyan-500 text-white bg-slate-900/30'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <GitCompare className="w-4 h-4 text-[#fb8c00]" />
              Guia de Padrões & Cabos
            </button>

            {/* Tab: Detailed Theory */}
            <button
              onClick={() => setActiveTab('theory')}
              className={`flex items-center gap-2 py-3.5 px-4 text-xs sm:text-sm font-semibold border-b-2 transition-all duration-200 ${
                activeTab === 'theory'
                  ? 'border-cyan-500 text-white bg-slate-900/30'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <BookOpen className="w-4 h-4 text-[#388e3c]" />
              Física do Sinal (RX, TX, Gigabit)
            </button>

            {/* Tab: Quiz */}
            <button
              onClick={() => setActiveTab('quiz')}
              className={`flex items-center gap-2 py-3.5 px-4 text-xs sm:text-sm font-semibold border-b-2 transition-all duration-200 ${
                activeTab === 'quiz'
                  ? 'border-cyan-500 text-white bg-slate-900/30'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <HelpCircle className="w-4 h-4 text-amber-500" />
              Auto-Avaliação (Mini-Quiz)
            </button>

          </div>
        </div>

        {/* Tab content renderer inside AnimatePresence */}
        <div className="py-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.15 }}
            >
              {activeTab === 'simulator' && <CrimpSimulator />}
              {activeTab === 'reference' && <PinReference />}
              {activeTab === 'theory' && <TheorySection />}
              {activeTab === 'quiz' && <Quiz />}
            </motion.div>
          </AnimatePresence>
        </div>

      </main>

      {/* Clean elegant footer */}
      <footer className="border-t border-slate-950 py-8 bg-[#05060a] text-xs text-slate-600 text-center">
        <div className="max-w-7xl mx-auto px-4 space-y-2">
          <p>© 2026 Simulador RJ45 T568B — Desenvolvido com fins pedagógicos de alta performance.</p>
          <p className="font-mono text-[10px]">
            Sinalização Inteligente de Cobre · Suporte para Standard EIA/TIA-568A, EIA/TIA-568B, Fast Ethernet e Gigabit IEEE 802.3ab.
          </p>
        </div>
      </footer>

    </div>
  );
}

