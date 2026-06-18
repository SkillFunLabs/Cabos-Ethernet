/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { QUIZ_QUESTIONS } from '../data';
import { QuizQuestion } from '../types';
import { CheckCircle2, XCircle, Award, RefreshCw, Star, Info, HelpCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export function Quiz() {
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState<boolean>(false);
  const [score, setScore] = useState<number>(0);
  const [quizFinished, setQuizFinished] = useState<boolean>(false);
  const [answersLog, setAnswersLog] = useState<{ questionId: number; gotRight: boolean }[]>([]);

  const currentQuestion = QUIZ_QUESTIONS[currentIndex];

  const handleAnswerSubmit = (option: string) => {
    if (isAnswered) return;
    setSelectedAnswer(option);
    setIsAnswered(true);

    const isCorrect = option === currentQuestion.correctAnswer;
    if (isCorrect) {
      setScore(prev => prev + 1);
    }

    setAnswersLog(prev => [...prev, { questionId: currentQuestion.id, gotRight: isCorrect }]);
  };

  const handleNext = () => {
    setSelectedAnswer(null);
    setIsAnswered(false);

    if (currentIndex + 1 < QUIZ_QUESTIONS.length) {
      setCurrentIndex(prev => prev + 1);
    } else {
      setQuizFinished(true);
    }
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setSelectedAnswer(null);
    setIsAnswered(false);
    setScore(0);
    setQuizFinished(false);
    setAnswersLog([]);
  };

  // Determine achievement tier based on performance
  const getAchievement = () => {
    const ratio = score / QUIZ_QUESTIONS.length;
    if (ratio === 1) {
      return {
        title: 'Lenda da Infraestrutura (Ouro)',
        color: 'text-amber-400',
        borderColor: 'border-amber-500/30',
        bg: 'bg-amber-950/20',
        desc: 'Incrível! Acertou 100% das perguntas! Conhece a fundo as teorias de atenuação, sinalização diferencial, gigabit duplex e sabe cravar cabos dormindo.'
      };
    } else if (ratio >= 0.7) {
      return {
        title: 'Técnico de Redes Sénior (Prata)',
        color: 'text-slate-200',
        borderColor: 'border-slate-500/30',
        bg: 'bg-slate-900/40',
        desc: 'Excelente trabalho! Demonstrou grande domínio sobre a norma T568B, funções de pares de rede, cabo crossover e PoE.'
      };
    } else {
      return {
        title: 'Instalador Aprendiz (Bronze)',
        color: 'text-amber-600',
        borderColor: 'border-amber-700/30',
        bg: 'bg-amber-950/10',
        desc: 'Bom começo! Você já entende a fiação básica, mas vale a pena revisar de perto as abas de Teoria e Padrões para cravar sem erros no terreno.'
      };
    }
  };

  const badge = getAchievement();

  return (
    <div id="quiz-container" className="max-w-2xl mx-auto space-y-6">
      
      {/* Quiz card panel */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
        
        {!quizFinished ? (
          <div>
            {/* Header: Score info & tracker */}
            <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-800">
              <span className="text-[10px] sm:text-xs font-mono font-semibold py-1 px-2.5 rounded bg-slate-950 text-amber-500 border border-amber-950">
                Pergunta {currentIndex + 1} de {QUIZ_QUESTIONS.length}
              </span>
              <span className="text-xs text-slate-400 font-mono">
                Acertos: <strong className="text-emerald-400">{score}</strong>
              </span>
            </div>

            {/* Question Text */}
            <h4 className="text-white font-medium text-base sm:text-lg leading-relaxed mb-6 flex gap-2.5 items-start">
              <span className="text-slate-500 mt-1 flex-shrink-0 text-sm">Q:</span>
              <span>{currentQuestion.question}</span>
            </h4>

            {/* Options List */}
            <div className="space-y-3">
              {currentQuestion.options.map((option, index) => {
                const letter = String.fromCharCode(65 + index); // A, B, C, D
                const isCurrentSelected = selectedAnswer === option;
                const isCorrectOption = option === currentQuestion.correctAnswer;
                
                let buttonStyle = 'bg-slate-950/60 border-slate-850 text-slate-300 hover:border-slate-700 hover:bg-slate-950';
                
                if (isAnswered) {
                  if (isCorrectOption) {
                    buttonStyle = 'bg-emerald-950/20 border-emerald-500/50 text-emerald-300 shadow-[0_0_12px_rgba(16,185,129,0.1)]';
                  } else if (isCurrentSelected) {
                    buttonStyle = 'bg-rose-950/20 border-rose-500/50 text-rose-300 shadow-[0_0_12px_rgba(239,68,68,0.1)]';
                  } else {
                    buttonStyle = 'bg-slate-950/30 border-slate-900 text-slate-600 opacity-60';
                  }
                }

                return (
                  <button
                    key={index}
                    onClick={() => handleAnswerSubmit(option)}
                    disabled={isAnswered}
                    className={`w-full flex items-start gap-4 p-4 rounded-xl border text-left text-xs sm:text-sm font-medium transition-all duration-200 ${buttonStyle}`}
                  >
                    <span className={`w-6 h-6 rounded-lg flex items-center justify-center font-mono text-xs border flex-shrink-0 ${
                      isAnswered 
                        ? (isCorrectOption ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400' : isCurrentSelected ? 'bg-rose-500/20 border-rose-500 text-rose-400' : 'bg-slate-900 border-slate-800 text-slate-500')
                        : 'bg-slate-900 border-slate-800 text-slate-400'
                    }`}>
                      {letter}
                    </span>
                    <span className="mt-0.5 leading-relaxed">{option}</span>
                  </button>
                );
              })}
            </div>

            {/* Expanded Explaner Feedback */}
            <AnimatePresence>
              {isAnswered && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-6 pt-5 border-t border-slate-800"
                >
                  <div className={`p-4 rounded-xl border text-xs sm:text-sm ${
                    selectedAnswer === currentQuestion.correctAnswer
                      ? 'bg-emerald-950/15 border-emerald-900/50 text-emerald-300'
                      : 'bg-rose-950/15 border-rose-900/50 text-rose-300'
                  }`}>
                    <div className="flex gap-2.5 items-start">
                      {selectedAnswer === currentQuestion.correctAnswer ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                      ) : (
                        <XCircle className="w-5 h-5 text-rose-400 flex-shrink-0 mt-0.5" />
                      )}
                      
                      <div>
                        <p className="font-semibold mb-1">
                          {selectedAnswer === currentQuestion.correctAnswer ? 'Resposta Correta!' : 'Resposta Incorreta'}
                        </p>
                        <p className="leading-relaxed text-slate-300 font-sans">{currentQuestion.explanation}</p>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={handleNext}
                    className="w-full mt-4 py-2.5 bg-slate-200 hover:bg-white text-slate-950 rounded-xl font-bold text-xs sm:text-sm transition shadow-[0_4px_12px_rgba(255,255,255,0.05)]"
                  >
                    {currentIndex + 1 === QUIZ_QUESTIONS.length ? 'Concluir Quiz 🏁' : 'Próxima Questão →'}
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ) : (
          /* Finished State card */
          <div className="text-center py-6 space-y-6">
            <span className="text-5xl block animate-bounce">🏆</span>
            
            <div>
              <h3 className="text-white font-bold text-xl sm:text-2xl">Balanço das Investigações</h3>
              <p className="text-slate-400 text-xs sm:text-sm mt-1.5">
                Você completou com sucesso a verificação teórica do RJ45.
              </p>
            </div>

            {/* Score ring */}
            <div className="p-5 rounded-2xl bg-slate-950 border border-slate-850 inline-block max-w-sm mx-auto">
              <div className="font-mono text-3xl font-extrabold text-white">
                {score} <span className="text-slate-600 font-normal">/</span> {QUIZ_QUESTIONS.length}
              </div>
              <div className="text-[10px] uppercase font-mono tracking-wider text-slate-500 mt-1">Pontuação Final</div>
            </div>

            {/* Achievement Badge details */}
            <div className={`p-5 rounded-xl border text-left max-w-md mx-auto ${badge.bg} ${badge.borderColor}`}>
              <div className="flex gap-3 items-start">
                <div className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-amber-400">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <h4 className={`font-bold text-sm ${badge.color}`}>{badge.title}</h4>
                  <p className="text-slate-300 text-xs mt-1.5 leading-relaxed font-sans">{badge.desc}</p>
                </div>
              </div>
            </div>

            <button
              onClick={handleRestart}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-xl text-xs sm:text-sm shadow-lg transition hover:scale-[1.02] active:scale-[0.98]"
            >
              <RefreshCw className="w-4 h-4" />
              Reiniciar Simulado Teórico
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
