import React, { useState } from 'react';
import { 
  GitPullRequest, 
  GitCommit, 
  GitBranch, 
  CheckCircle2, 
  ExternalLink, 
  Sparkles, 
  FolderGit2, 
  FileText, 
  Terminal,
  Check,
  Award
} from 'lucide-react';

interface SimulatedIssue {
  id: number;
  title: string;
  labels: string[];
  author: string;
  description: string;
  targetFile: string;
  suggestedFix: string;
}

const ISSUES: SimulatedIssue[] = [
  {
    id: 142,
    title: 'docs(api): Add documentation for rate limits and 429 Too Many Requests in weather-engine',
    labels: ['documentation', 'good first issue', 'api'],
    author: 'maintainer_dev',
    description: 'Our weather forecasting API enforces a 10,000 req/day rate limit, but this is completely missing from the README and OpenAPI spec. Users are confused when they receive HTTP 429.',
    targetFile: 'SPECS/weather_openapi_spec.yaml',
    suggestedFix: 'Добавить описание заголовков X-RateLimit-Limit, X-RateLimit-Remaining и примера тела ошибки 429.'
  },
  {
    id: 156,
    title: 'docs: Fix parameter type and missing enum values for temperature_unit in Open-Meteo client',
    labels: ['documentation', 'docs-as-code'],
    author: 'frontend_lead',
    description: 'Parameter temperature_unit is described as string without mentioning that only "celsius" and "fahrenheit" are valid enum values.',
    targetFile: '03_query_path_headers.md',
    suggestedFix: 'Указать тип string (enum) и перечислить допустимые значения: ["celsius", "fahrenheit"].'
  }
];

export const OpenSourceGuide: React.FC<{ theme: 'dark' | 'light'; onAwardXp?: (xp: number) => void }> = ({ 
  theme, 
  onAwardXp 
}) => {
  const isDark = theme === 'dark';
  const [selectedIssue, setSelectedIssue] = useState<SimulatedIssue>(ISSUES[0]);
  const [prTitle, setPrTitle] = useState('docs(api): document rate limits and 429 error response format');
  const [prDescription, setPrDescription] = useState('Resolves #142.\n\n### Summary of Changes:\n- Added explicit documentation for HTTP 429 status code.\n- Described X-RateLimit-* headers in the API reference.\n- Added cURL example demonstrating backoff retry logic.');
  const [isPrSubmitted, setIsPrSubmitted] = useState(false);
  const [isMerged, setIsMerged] = useState(false);

  const handleSubmitPR = () => {
    setIsPrSubmitted(true);
    setTimeout(() => {
      setIsMerged(true);
      if (onAwardXp) {
        onAwardXp(150);
      }
    }, 1800);
  };

  const handleReset = () => {
    setIsPrSubmitted(false);
    setIsMerged(false);
  };

  return (
    <div className={`h-full flex flex-col overflow-y-auto font-sans text-xs ${
      isDark ? 'bg-[#1e1e1e] text-[#cccccc]' : 'bg-white text-[#24292f]'
    }`}>
      {/* Top Header */}
      <div className={`px-6 py-4 border-b flex items-center justify-between ${
        isDark ? 'bg-[#252526] border-[#333333]' : 'bg-[#f6f8fa] border-[#d0d7de]'
      }`}>
        <div>
          <div className="flex items-center gap-1.5 text-purple-400 font-mono text-[11px] font-semibold uppercase">
            <GitPullRequest className="w-4 h-4" />
            <span>Open Source Практикум</span>
          </div>
          <h2 className="text-lg font-bold text-white mt-0.5">
            Симулятор контрибьюта в проекты с открытым исходным кодом
          </h2>
        </div>

        <div className="flex items-center gap-2 bg-purple-950/40 border border-purple-800/40 px-3 py-1.5 rounded-lg text-purple-200">
          <Sparkles className="w-3.5 h-3.5 text-purple-400" />
          <span>Награда за первый Merged PR: +150 XP</span>
        </div>
      </div>

      <div className="flex-1 max-w-4xl mx-auto w-full p-6 space-y-6">
        {/* Instructions banner */}
        <div className="p-4 rounded-xl bg-neutral-900 border border-neutral-700/60 leading-relaxed text-xs">
          <h4 className="font-semibold text-white text-sm mb-1.5">
            Как техническому писателю собрать реальное портфолио на GitHub
          </h4>
          <p className="text-neutral-300">
            Мейнтейнеры открытых библиотек всегда рады техническим писателям, которые исправляют документацию, 
            добавляют недостающие параметры в OpenAPI спецификации или пишут понятные README.
            Ниже представлен симулятор реального репозитория: выберите открытую задачу (Issue) и оформите Pull Request!
          </p>
        </div>

        {/* Simulated Issues List */}
        <div>
          <h4 className="font-semibold text-white text-xs uppercase tracking-wider mb-2.5 flex items-center gap-2">
            <FolderGit2 className="w-4 h-4 text-purple-400" />
            <span>Открытые задачи репозитория (Issues)</span>
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {ISSUES.map(issue => {
              const isSelected = selectedIssue.id === issue.id;
              return (
                <div
                  key={issue.id}
                  onClick={() => {
                    setSelectedIssue(issue);
                    handleReset();
                  }}
                  className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                    isSelected 
                      ? 'border-purple-500 bg-purple-950/20 ring-1 ring-purple-500/50' 
                      : 'border-neutral-700/60 bg-[#252526] hover:border-neutral-500'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="font-mono text-purple-400 font-bold">#{issue.id}</span>
                    <div className="flex flex-wrap gap-1">
                      {issue.labels.map(l => (
                        <span key={l} className="px-1.5 py-0.5 rounded text-[10px] bg-neutral-800 text-neutral-300 border border-neutral-700">
                          {l}
                        </span>
                      ))}
                    </div>
                  </div>

                  <h5 className="font-semibold text-neutral-100 text-xs line-clamp-2">
                    {issue.title}
                  </h5>

                  <p className="text-neutral-400 text-[11px] mt-2 line-clamp-2">
                    {issue.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* PR Submission Flow */}
        <div className="p-5 rounded-xl border border-neutral-700 bg-[#252526] space-y-4">
          <div className="flex items-center justify-between border-b border-neutral-700/60 pb-3">
            <div className="flex items-center gap-2">
              <GitBranch className="w-4 h-4 text-emerald-400" />
              <span className="font-mono text-xs text-neutral-300">
                Ветка: <strong className="text-white">docs/fix-issue-{selectedIssue.id}</strong>
              </span>
            </div>
            <span className="text-[11px] text-neutral-400 font-mono">
              Целевой файл: {selectedIssue.targetFile}
            </span>
          </div>

          <div>
            <label className="block text-neutral-300 font-semibold mb-1">
              Название Pull Request (Commit Title):
            </label>
            <input
              type="text"
              value={prTitle}
              onChange={(e) => setPrTitle(e.target.value)}
              className="w-full p-2.5 rounded bg-neutral-900 border border-neutral-700 font-mono text-xs text-sky-300 outline-none"
            />
          </div>

          <div>
            <label className="block text-neutral-300 font-semibold mb-1">
              Описание изменений для ревьюера (PR Description):
            </label>
            <textarea
              rows={4}
              value={prDescription}
              onChange={(e) => setPrDescription(e.target.value)}
              className="w-full p-2.5 rounded bg-neutral-900 border border-neutral-700 font-sans text-xs text-neutral-200 outline-none"
            />
          </div>

          {/* PR Status & Review Simulation */}
          {!isPrSubmitted ? (
            <button
              onClick={handleSubmitPR}
              className="w-full py-2.5 rounded-lg bg-purple-600 hover:bg-purple-500 font-semibold text-white flex items-center justify-center gap-2 shadow-lg transition-colors"
            >
              <GitPullRequest className="w-4 h-4" />
              <span>Создать Pull Request на ревью</span>
            </button>
          ) : (
            <div className="p-4 rounded-lg bg-neutral-900 border border-neutral-700 space-y-3">
              <div className="flex items-center gap-2 text-xs">
                {!isMerged ? (
                  <>
                    <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                    <span className="text-amber-300 font-semibold">Ревью мейнтейнером проекта...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span className="text-emerald-300 font-semibold">Pull Request принят и влит в main (Merged)! 🎉</span>
                  </>
                )}
              </div>

              {isMerged && (
                <div className="p-3 rounded bg-emerald-950/40 border border-emerald-800/40 text-emerald-200 text-xs">
                  <p>
                    <strong>Комментарий мейнтейнера:</strong> «Прекрасная работа над документацией! Все параметры описаны предельно четко, спецификация прошла Spectral-валидатор без замечаний. Огромное спасибо за вклад в проект!»
                  </p>
                  <p className="mt-2 text-amber-300 font-semibold">
                    ✓ Начислено +150 XP в портфолио технического писателя!
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
