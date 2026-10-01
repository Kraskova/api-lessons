import React, { useState } from 'react';
import { 
  Award, 
  CheckCircle2, 
  XCircle, 
  ArrowRight, 
  RotateCcw, 
  Send, 
  BookOpen, 
  Sparkles,
  HelpCircle,
  AlertTriangle
} from 'lucide-react';
import { CourseModule, QuizQuestion, RollbackEvent } from '../../types/course';

interface QuizRunnerProps {
  module: CourseModule;
  allModules: CourseModule[];
  onPassModule: (moduleId: string, score: number) => void;
  onRollback: (event: RollbackEvent) => void;
  onOpenPostman: (presetId?: string) => void;
  onOpenTheory: () => void;
  onNextModule?: () => void;
  theme: 'dark' | 'light';
}

export const QuizRunner: React.FC<QuizRunnerProps> = ({
  module,
  allModules,
  onPassModule,
  onRollback,
  onOpenPostman,
  onOpenTheory,
  onNextModule,
  theme
}) => {
  const isDark = theme === 'dark';
  const quiz = module.quiz;
  const questions = quiz.questions;

  // Quiz state
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState(false);
  const [userAnswers, setUserAnswers] = useState<{ [qId: string]: number }>({});
  const [isQuizFinished, setIsQuizFinished] = useState(false);

  const currentQ = questions[currentIndex];

  const handleSelectOption = (index: number) => {
    if (isAnswerSubmitted) return;
    setSelectedOption(index);
  };

  const handleSubmitAnswer = () => {
    if (selectedOption === null) return;
    setIsAnswerSubmitted(true);
    setUserAnswers(prev => ({ ...prev, [currentQ.id]: selectedOption }));
  };

  const handleNextQuestion = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setSelectedOption(null);
      setIsAnswerSubmitted(false);
    } else {
      finishQuiz();
    }
  };

  const finishQuiz = () => {
    setIsQuizFinished(true);
    let correctCount = 0;
    const failedTopics: string[] = [];

    questions.forEach(q => {
      const userAns = userAnswers[q.id];
      if (userAns === q.correctIndex) {
        correctCount++;
      } else {
        if (!failedTopics.includes(q.topic)) {
          failedTopics.push(q.topic);
        }
      }
    });

    const scorePercent = Math.round((correctCount / questions.length) * 100);

    if (scorePercent >= quiz.passingScorePercent) {
      // Pass
      onPassModule(module.id, scorePercent);
    } else {
      // Fail -> TRIGGER ROLLBACK!
      // Calculate rollback target:
      // If current module order is 5 and rollbackSteps is 2, target order is 3
      const currentOrder = module.order;
      const steps = Math.max(1, quiz.rollbackSteps || 1);
      const targetOrder = Math.max(1, currentOrder - steps);
      const targetModule = allModules.find(m => m.order === targetOrder) || allModules[0];

      const rollbackEvent: RollbackEvent = {
        timestamp: Date.now(),
        moduleId: module.id,
        moduleTitle: module.title,
        scorePercent,
        rolledBackToModuleId: targetModule.id,
        rolledBackToModuleTitle: targetModule.title,
        failedTopics,
        reason: `Тестирование по модулю «${module.title}» не пройдено (набрано ${scorePercent}% при пороге ${quiz.passingScorePercent}%). В соответствии с правилами глубокого усвоения выполнен откат на ${steps} шага(-ов) назад.`
      };

      onRollback(rollbackEvent);
    }
  };

  const handleRetry = () => {
    setCurrentIndex(0);
    setSelectedOption(null);
    setIsAnswerSubmitted(false);
    setUserAnswers({});
    setIsQuizFinished(false);
  };

  // Calculate final metrics if finished
  const correctTotal = questions.filter(q => userAnswers[q.id] === q.correctIndex).length;
  const finalPercent = Math.round((correctTotal / questions.length) * 100);
  const isPassed = finalPercent >= quiz.passingScorePercent;

  return (
    <div className={`h-full flex flex-col overflow-y-auto ${
      isDark ? 'bg-[#1e1e1e] text-[#cccccc]' : 'bg-white text-[#24292f]'
    }`}>
      {/* Quiz Header Bar */}
      <div className={`px-6 py-4 border-b flex items-center justify-between ${
        isDark ? 'bg-[#252526] border-[#333333]' : 'bg-[#f6f8fa] border-[#d0d7de]'
      }`}>
        <div>
          <span className="text-[11px] font-mono text-amber-400 font-semibold tracking-wider uppercase">
            Контрольное тестирование знаний
          </span>
          <h2 className="text-lg font-bold text-white mt-0.5">
            {quiz.title}
          </h2>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right text-xs">
            <span className="text-neutral-400 block">Проходной балл:</span>
            <span className="font-mono font-bold text-amber-400">{quiz.passingScorePercent}%</span>
          </div>

          <button
            onClick={onOpenTheory}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded text-xs bg-neutral-700/50 hover:bg-neutral-600 text-neutral-200 transition-colors"
          >
            <BookOpen className="w-3.5 h-3.5 text-sky-400" />
            <span>Вернуться к теории</span>
          </button>
        </div>
      </div>

      {/* Main Body */}
      <div className="flex-1 max-w-3xl mx-auto w-full p-6 flex flex-col justify-center">
        {!isQuizFinished ? (
          <div>
            {/* Progress indicators */}
            <div className="mb-6">
              <div className="flex items-center justify-between text-xs text-neutral-400 mb-2">
                <span>Вопрос {currentIndex + 1} из {questions.length}</span>
                <span className="font-mono text-sky-400">Тема: {currentQ.topic}</span>
              </div>
              <div className="w-full bg-neutral-800 h-1.5 rounded-full overflow-hidden">
                <div 
                  className="bg-[#007acc] h-full transition-all duration-300"
                  style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
                />
              </div>
            </div>

            {/* Question card */}
            <div className={`p-6 rounded-xl border ${
              isDark ? 'bg-[#252526] border-[#3c3c3c]' : 'bg-neutral-50 border-neutral-300'
            }`}>
              <h3 className="text-base font-semibold text-white leading-relaxed mb-4">
                {currentQ.question}
              </h3>

              {currentQ.codeSnippet && (
                <pre className="p-3 my-3 rounded bg-black/40 border border-neutral-700/60 font-mono text-xs text-sky-300 overflow-x-auto">
                  <code>{currentQ.codeSnippet}</code>
                </pre>
              )}

              {/* Options */}
              <div className="space-y-2.5 mt-5">
                {currentQ.options.map((opt, idx) => {
                  const isSelected = selectedOption === idx;
                  const isCorrect = idx === currentQ.correctIndex;

                  let optionStyle = isDark 
                    ? 'border-neutral-700 hover:border-neutral-500 bg-[#1e1e1e] text-neutral-200' 
                    : 'border-neutral-300 hover:border-neutral-400 bg-white text-neutral-800';

                  if (isAnswerSubmitted) {
                    if (isCorrect) {
                      optionStyle = 'border-emerald-500 bg-emerald-950/40 text-emerald-200 font-medium';
                    } else if (isSelected && !isCorrect) {
                      optionStyle = 'border-rose-500 bg-rose-950/40 text-rose-200';
                    } else {
                      optionStyle = 'opacity-40 border-neutral-800';
                    }
                  } else if (isSelected) {
                    optionStyle = 'border-[#007acc] bg-[#007acc]/10 text-white font-medium ring-1 ring-[#007acc]';
                  }

                  return (
                    <button
                      key={idx}
                      onClick={() => handleSelectOption(idx)}
                      disabled={isAnswerSubmitted}
                      className={`w-full text-left p-3.5 rounded-lg border transition-all flex items-start gap-3 text-xs leading-relaxed ${optionStyle}`}
                    >
                      <span className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 font-mono text-[11px] mt-0.5 ${
                        isSelected ? 'border-sky-400 bg-sky-500/20 text-sky-300' : 'border-neutral-600 text-neutral-400'
                      }`}>
                        {String.fromCharCode(65 + idx)}
                      </span>
                      <span className="flex-1">{opt}</span>

                      {isAnswerSubmitted && isCorrect && (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      )}
                      {isAnswerSubmitted && isSelected && !isCorrect && (
                        <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Immediate Feedback Explanation Box */}
              {isAnswerSubmitted && (
                <div className="mt-5 p-4 rounded-lg bg-neutral-900 border border-neutral-700/60 text-xs space-y-2 animate-in fade-in duration-200">
                  <div className="flex items-center gap-2 font-semibold">
                    {selectedOption === currentQ.correctIndex ? (
                      <span className="text-emerald-400 flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4" /> Верно! Отличный результат.
                      </span>
                    ) : (
                      <span className="text-rose-400 flex items-center gap-1.5">
                        <XCircle className="w-4 h-4" /> Неверный ответ.
                      </span>
                    )}
                  </div>
                  <p className="text-neutral-300 leading-relaxed">
                    {currentQ.explanation}
                  </p>
                  <div className="p-2.5 rounded bg-sky-950/40 border border-sky-800/40 text-sky-200 text-[11px]">
                    <strong>💡 Совет техническому писателю:</strong> {currentQ.techWriterTip}
                  </div>
                </div>
              )}

              {/* Action buttons */}
              <div className="mt-6 flex items-center justify-end gap-3 pt-3 border-t border-neutral-700/50">
                {!isAnswerSubmitted ? (
                  <button
                    onClick={handleSubmitAnswer}
                    disabled={selectedOption === null}
                    className={`px-5 py-2 rounded-lg font-semibold text-xs text-white transition-colors ${
                      selectedOption !== null 
                        ? 'bg-[#007acc] hover:bg-[#0062a3]' 
                        : 'bg-neutral-700 opacity-50 cursor-not-allowed'
                    }`}
                  >
                    Ответить на вопрос
                  </button>
                ) : (
                  <button
                    onClick={handleNextQuestion}
                    className="px-5 py-2 rounded-lg font-semibold text-xs bg-emerald-600 hover:bg-emerald-500 text-white transition-colors flex items-center gap-2"
                  >
                    <span>{currentIndex < questions.length - 1 ? 'Следующий вопрос' : 'Завершить тест'}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          </div>
        ) : (
          /* FINAL RESULTS VIEW */
          <div className={`p-8 rounded-2xl border text-center ${
            isPassed 
              ? 'bg-emerald-950/20 border-emerald-500/40' 
              : 'bg-rose-950/20 border-rose-500/40'
          }`}>
            <div className="w-16 h-16 rounded-2xl mx-auto flex items-center justify-center mb-4 shadow-xl">
              {isPassed ? (
                <div className="w-full h-full rounded-2xl bg-emerald-500/20 border border-emerald-500/50 flex items-center justify-center text-emerald-400">
                  <Award className="w-8 h-8" />
                </div>
              ) : (
                <div className="w-full h-full rounded-2xl bg-rose-500/20 border border-rose-500/50 flex items-center justify-center text-rose-400">
                  <RotateCcw className="w-8 h-8" />
                </div>
              )}
            </div>

            <h3 className="text-xl font-bold text-white">
              {isPassed ? 'Поздравляем! Модуль успешно освоен' : 'Материал усвоен недостаточно хорошо'}
            </h3>

            <div className="my-4 inline-block font-mono text-3xl font-extrabold px-6 py-2 rounded-xl bg-black/40 border border-neutral-700">
              <span className={isPassed ? 'text-emerald-400' : 'text-rose-400'}>
                {finalPercent}%
              </span>
              <span className="text-xs text-neutral-400 font-sans block mt-1 font-normal">
                Правильных ответов: {correctTotal} из {questions.length} (Порог: {quiz.passingScorePercent}%)
              </span>
            </div>

            <p className="text-xs text-neutral-300 max-w-md mx-auto leading-relaxed mb-6">
              {isPassed ? (
                <>Вам начислено <strong className="text-amber-300 font-semibold">+100 XP</strong>. Знания подтверждены. Вы можете закрепить вызовы в Postman или сразу перейти к следующему модулю.</>
              ) : (
                <>
                  Результат ниже проходного балла. Сработал механизм повторения: 
                  <strong className="text-amber-300"> прогресс курса откатился назад</strong>, чтобы вы могли еще раз вдумчиво пройти фундаментальную теорию и практику в Postman.
                </>
              )}
            </p>

            <div className="flex flex-wrap items-center justify-center gap-3">
              <button
                onClick={() => onOpenPostman(module.postmanPresetId)}
                className="px-4 py-2 rounded-lg text-xs font-semibold bg-orange-600 hover:bg-orange-500 text-white flex items-center gap-2 transition-colors shadow"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Закрепить в Postman</span>
              </button>

              <button
                onClick={handleRetry}
                className="px-4 py-2 rounded-lg text-xs font-semibold bg-neutral-700 hover:bg-neutral-600 text-white flex items-center gap-2 transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Пройти тест повторно</span>
              </button>

              {isPassed && onNextModule && (
                <button
                  onClick={onNextModule}
                  className="px-5 py-2 rounded-lg text-xs font-semibold bg-[#007acc] hover:bg-[#0062a3] text-white flex items-center gap-2 transition-colors shadow-lg"
                >
                  <span>Следующий модуль</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
