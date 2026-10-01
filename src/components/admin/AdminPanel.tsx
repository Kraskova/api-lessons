import React, { useState } from 'react';
import { 
  Plus, 
  Trash2, 
  Save, 
  RotateCcw, 
  Edit3, 
  FileText, 
  HelpCircle, 
  Check, 
  AlertCircle, 
  Sliders, 
  Eye, 
  EyeOff,
  Code,
  Terminal,
  Send,
  BookOpen,
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { CourseModule, QuizQuestion } from '../../types/course';
import { WEATHER_PRESETS } from '../../data/weatherApiPresets';

interface AdminPanelProps {
  modules: CourseModule[];
  onSaveModule: (module: CourseModule, isNew: boolean) => void;
  onDeleteModule: (moduleId: string) => void;
  onResetToDefaults: () => void;
  onSelectModuleForStudy: (module: CourseModule) => void;
  theme: 'dark' | 'light';
}

export const AdminPanel: React.FC<AdminPanelProps> = ({
  modules,
  onSaveModule,
  onDeleteModule,
  onResetToDefaults,
  onSelectModuleForStudy,
  theme
}) => {
  const isDark = theme === 'dark';

  // Selected module for editing or new module
  const [selectedModuleId, setSelectedModuleId] = useState<string>(modules[0]?.id || '');
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [showLivePreview, setShowLivePreview] = useState(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState('');

  // Form State
  const initialSelected = modules.find(m => m.id === selectedModuleId) || modules[0];

  const [formData, setFormData] = useState<CourseModule>(() => {
    return initialSelected ? JSON.parse(JSON.stringify(initialSelected)) : createBlankModule(modules.length + 1);
  });

  function createBlankModule(nextOrder: number): CourseModule {
    const id = `mod-${Date.now()}`;
    return {
      id,
      order: nextOrder,
      slug: `custom-module-${nextOrder}`,
      filename: `${nextOrder < 10 ? '0' : ''}${nextOrder}_new_module.md`,
      title: `${nextOrder}. Новый практический модуль документации`,
      shortDescription: 'Описание назначения модуля и практических навыков для технического писателя.',
      category: 'Спецификации и Документирование',
      estimatedMinutes: 25,
      content: `# ${nextOrder}. Название темы модуля\n\nВставьте сюда текст теории, примеры cURL команд и формат JSON ответа.\n\n## Подраздел практики\n\nОпишите практический кейс работы с API.`,
      postmanPresetId: WEATHER_PRESETS[0]?.id,
      defaultCurlCommand: 'curl -s "https://api.open-meteo.com/v1/forecast?latitude=55.75&longitude=37.61"',
      quiz: {
        id: `quiz-${id}`,
        moduleId: id,
        title: `Тест ${nextOrder}: Проверка знаний нового модуля`,
        passingScorePercent: 75,
        rollbackSteps: 1,
        questions: [
          {
            id: `q-${Date.now()}-1`,
            topic: 'endpoints',
            question: 'Пример проверочного вопроса для технического писателя по этой теме:',
            options: [
              'Вариант ответа A (неверный)',
              'Вариант ответа B (правильный)',
              'Вариант ответа C (неверный)',
              'Вариант ответа D (неверный)'
            ],
            correctIndex: 1,
            explanation: 'Подробное объяснение правильного ответа для студента курса.',
            techWriterTip: 'Практический совет: всегда проверяйте документацию на реальных примерах.'
          }
        ]
      }
    };
  }

  // When selected module changes in sidebar
  const handleSelectModuleToEdit = (mod: CourseModule) => {
    setIsCreatingNew(false);
    setSelectedModuleId(mod.id);
    setFormData(JSON.parse(JSON.stringify(mod)));
    setSaveSuccessMsg('');
  };

  const handleStartCreateNew = () => {
    setIsCreatingNew(true);
    const newMod = createBlankModule(modules.length + 1);
    setSelectedModuleId(newMod.id);
    setFormData(newMod);
    setSaveSuccessMsg('');
  };

  // Question editing helpers
  const handleAddQuestion = () => {
    const newQ: QuizQuestion = {
      id: `q_${Date.now()}`,
      topic: 'params',
      question: 'Новый вопрос для проверки знаний:',
      options: ['Вариант 1', 'Вариант 2', 'Вариант 3', 'Вариант 4'],
      correctIndex: 0,
      explanation: 'Пояснение почему этот ответ верный.',
      techWriterTip: 'Совет техписателю по этой теме.'
    };
    setFormData(prev => ({
      ...prev,
      quiz: {
        ...prev.quiz,
        questions: [...prev.quiz.questions, newQ]
      }
    }));
  };

  const handleUpdateQuestion = (qId: string, field: keyof QuizQuestion, value: any) => {
    setFormData(prev => ({
      ...prev,
      quiz: {
        ...prev.quiz,
        questions: prev.quiz.questions.map(q => q.id === qId ? { ...q, [field]: value } : q)
      }
    }));
  };

  const handleDeleteQuestion = (qId: string) => {
    if (formData.quiz.questions.length <= 1) {
      alert('В тесте должен оставаться хотя бы 1 вопрос!');
      return;
    }
    setFormData(prev => ({
      ...prev,
      quiz: {
        ...prev.quiz,
        questions: prev.quiz.questions.filter(q => q.id !== qId)
      }
    }));
  };

  // Submit Save
  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.filename.trim()) {
      alert('Укажите название модуля и имя файла!');
      return;
    }

    onSaveModule(formData, isCreatingNew);
    setIsCreatingNew(false);
    setSelectedModuleId(formData.id);
    setSaveSuccessMsg('✓ Модуль успешно сохранен и доступен в курсе!');
    setTimeout(() => setSaveSuccessMsg(''), 4000);
  };

  return (
    <div className={`h-full flex flex-col font-sans text-xs ${
      isDark ? 'bg-[#1e1e1e] text-[#cccccc]' : 'bg-[#f8f9fa] text-[#212529]'
    }`}>
      {/* Top Header */}
      <div className={`px-6 py-3 border-b flex flex-wrap items-center justify-between gap-3 ${
        isDark ? 'bg-[#252526] border-[#333333]' : 'bg-white border-[#dee2e6]'
      }`}>
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-teal-600 flex items-center justify-center text-white">
            <Sliders className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              Административная панель управления курсом
            </h2>
            <p className="text-[11px] text-neutral-400">
              Добавление новых модулей, редактирование теории, настройка тестов и правил отката
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {saveSuccessMsg && (
            <span className="text-emerald-400 font-semibold text-xs px-2.5 py-1 rounded bg-emerald-950/60 border border-emerald-800">
              {saveSuccessMsg}
            </span>
          )}

          <button
            onClick={handleStartCreateNew}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-500 text-white font-semibold transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Добавить модуль</span>
          </button>

          <button
            onClick={() => {
              if (confirm('Сбросить все изменения модулей к исходным 11 модулям курса?')) {
                onResetToDefaults();
              }
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-700/60 hover:bg-neutral-600 text-neutral-300 text-xs transition-colors"
            title="Восстановить исходную учебную программу"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Сброс к исходным</span>
          </button>
        </div>
      </div>

      {/* Main Split Layout: Left Module List, Right Module Editor */}
      <div className="flex-1 flex overflow-hidden">
        {/* Module Sidebar List */}
        <aside className={`w-80 border-r flex flex-col shrink-0 overflow-y-auto ${
          isDark ? 'bg-[#252526] border-[#333333]' : 'bg-[#f1f3f5] border-[#dee2e6]'
        }`}>
          <div className="p-3 border-b border-black/10 flex items-center justify-between text-[11px] font-semibold text-neutral-400 uppercase tracking-wider">
            <span>Модули курса ({modules.length})</span>
            <span>Порядок</span>
          </div>

          <div className="p-2 space-y-1">
            {modules.map(mod => {
              const isSelected = !isCreatingNew && mod.id === selectedModuleId;
              return (
                <div
                  key={mod.id}
                  onClick={() => handleSelectModuleToEdit(mod)}
                  className={`p-2.5 rounded-lg cursor-pointer transition-colors border text-left flex items-start justify-between gap-2 ${
                    isSelected
                      ? 'bg-[#007acc]/20 border-[#007acc] text-white font-medium'
                      : isDark
                        ? 'border-transparent hover:bg-neutral-800 text-neutral-300'
                        : 'border-transparent hover:bg-white text-neutral-800'
                  }`}
                >
                  <div className="flex-1 truncate">
                    <div className="flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                      <span className="truncate font-sans text-xs">{mod.title}</span>
                    </div>
                    <span className="text-[10px] text-neutral-500 font-mono block mt-0.5">
                      {mod.filename} · {mod.estimatedMinutes} мин
                    </span>
                  </div>

                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-black/20 text-neutral-400 shrink-0">
                    №{mod.order}
                  </span>
                </div>
              );
            })}
          </div>
        </aside>

        {/* Module Editor Form */}
        <main className="flex-1 flex flex-col overflow-y-auto p-6 max-w-4xl mx-auto w-full">
          <form onSubmit={handleSave} className="space-y-6">
            {/* Top Editor Toolbar */}
            <div className="flex items-center justify-between pb-4 border-b border-neutral-700/60">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs text-teal-400 font-semibold uppercase">
                  {isCreatingNew ? 'Создание нового модуля' : `Редактирование: ${formData.filename}`}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => onSelectModuleForStudy(formData)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-neutral-700 hover:bg-neutral-600 text-white text-xs font-medium transition-colors"
                  title="Открыть для изучения в редакторе"
                >
                  <BookOpen className="w-3.5 h-3.5 text-sky-400" />
                  <span>Открыть в курсе</span>
                </button>

                {!isCreatingNew && (
                  <button
                    type="button"
                    onClick={() => {
                      if (confirm(`Удалить модуль «${formData.title}»?`)) {
                        onDeleteModule(formData.id);
                      }
                    }}
                    className="flex items-center gap-1 px-3 py-1.5 rounded bg-rose-950/60 border border-rose-800/40 text-rose-300 hover:bg-rose-900 transition-colors text-xs"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Удалить</span>
                  </button>
                )}

                <button
                  type="submit"
                  className="flex items-center gap-1.5 px-4 py-1.5 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-colors shadow"
                >
                  <Save className="w-4 h-4" />
                  <span>Сохранить изменения</span>
                </button>
              </div>
            </div>

            {/* General Settings */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 rounded-xl bg-neutral-900 border border-neutral-800">
              <div className="md:col-span-2">
                <label className="block text-neutral-300 font-semibold mb-1">
                  Название модуля (Title)
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full p-2 rounded bg-neutral-800 border border-neutral-700 text-white font-sans text-xs outline-none focus:border-[#007acc]"
                />
              </div>

              <div>
                <label className="block text-neutral-300 font-semibold mb-1">
                  Имя файла (.md)
                </label>
                <input
                  type="text"
                  required
                  value={formData.filename}
                  onChange={(e) => setFormData({ ...formData, filename: e.target.value })}
                  className="w-full p-2 rounded bg-neutral-800 border border-neutral-700 text-sky-300 font-mono text-xs outline-none focus:border-[#007acc]"
                />
              </div>

              <div>
                <label className="block text-neutral-300 font-semibold mb-1">
                  Порядковый номер
                </label>
                <input
                  type="number"
                  min={1}
                  value={formData.order}
                  onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 1 })}
                  className="w-full p-2 rounded bg-neutral-800 border border-neutral-700 text-white font-mono text-xs outline-none focus:border-[#007acc]"
                />
              </div>

              <div>
                <label className="block text-neutral-300 font-semibold mb-1">
                  Категория
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                  className="w-full p-2 rounded bg-neutral-800 border border-neutral-700 text-white font-sans text-xs outline-none focus:border-[#007acc]"
                >
                  <option value="Основы API">Основы API</option>
                  <option value="Инструменты">Инструменты</option>
                  <option value="Спецификации и Документирование">Спецификации и Документирование</option>
                  <option value="Карьера и Практика">Карьера и Практика</option>
                </select>
              </div>

              <div>
                <label className="block text-neutral-300 font-semibold mb-1">
                  Время изучения (минут)
                </label>
                <input
                  type="number"
                  min={5}
                  value={formData.estimatedMinutes}
                  onChange={(e) => setFormData({ ...formData, estimatedMinutes: parseInt(e.target.value) || 20 })}
                  className="w-full p-2 rounded bg-neutral-800 border border-neutral-700 text-white font-mono text-xs outline-none focus:border-[#007acc]"
                />
              </div>

              <div className="md:col-span-3">
                <label className="block text-neutral-300 font-semibold mb-1">
                  Краткое описание (Short description)
                </label>
                <input
                  type="text"
                  value={formData.shortDescription}
                  onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })}
                  className="w-full p-2 rounded bg-neutral-800 border border-neutral-700 text-neutral-300 font-sans text-xs outline-none focus:border-[#007acc]"
                />
              </div>
            </div>

            {/* Markdown Theory Editor */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-neutral-300 font-semibold text-xs flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-sky-400" />
                  <span>Содержимое теории (Markdown Content)</span>
                </label>

                <button
                  type="button"
                  onClick={() => setShowLivePreview(!showLivePreview)}
                  className="flex items-center gap-1 text-[11px] text-sky-400 hover:text-white"
                >
                  {showLivePreview ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  <span>{showLivePreview ? 'Скрыть предпросмотр' : 'Показать предпросмотр'}</span>
                </button>
              </div>

              {/* Quick Checkpoint Insert Toolbar */}
              <div className="flex flex-wrap items-center gap-1.5 p-2 rounded-lg bg-neutral-900 border border-neutral-800 text-[11px]">
                <span className="text-amber-400 font-semibold flex items-center gap-1">
                  <Sparkles className="w-3 h-3" /> Вставить Knowledge Checkpoint:
                </span>
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, content: prev.content + '\n\n:::checkpoint auth-header-vs-query:::\n' }))}
                  className="px-2 py-0.5 rounded bg-neutral-800 hover:bg-neutral-700 text-sky-300 border border-neutral-700 transition-colors"
                  title="Добавить интерактивный True/False чекпоинт по безопасности ключей"
                >
                  + True/False: Аутентификация
                </button>
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, content: prev.content + '\n\n:::checkpoint json-schema-types-dragdrop:::\n' }))}
                  className="px-2 py-0.5 rounded bg-neutral-800 hover:bg-neutral-700 text-teal-300 border border-neutral-700 transition-colors"
                  title="Добавить интерактивный Drag & Drop чекпоинт по типам данных JSON Schema"
                >
                  + Drag&Drop: JSON Schema
                </button>
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, content: prev.content + '\n\n:::checkpoint param-locations-dragdrop:::\n' }))}
                  className="px-2 py-0.5 rounded bg-neutral-800 hover:bg-neutral-700 text-purple-300 border border-neutral-700 transition-colors"
                  title="Добавить Drag & Drop чекпоинт по локациям параметров"
                >
                  + Drag&Drop: Параметры
                </button>
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, content: prev.content + '\n\n:::checkpoint status-codes-dragdrop:::\n' }))}
                  className="px-2 py-0.5 rounded bg-neutral-800 hover:bg-neutral-700 text-emerald-300 border border-neutral-700 transition-colors"
                  title="Добавить Drag & Drop чекпоинт по статус-кодам HTTP"
                >
                  + Drag&Drop: Статус-коды
                </button>
              </div>

              <div className={`grid ${showLivePreview ? 'grid-cols-2 gap-3' : 'grid-cols-1'}`}>
                <textarea
                  rows={14}
                  required
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  className="w-full p-3.5 rounded-lg bg-neutral-900 border border-neutral-700 text-neutral-200 font-mono text-xs leading-relaxed outline-none focus:border-[#007acc]"
                />

                {showLivePreview && (
                  <div className="p-3.5 rounded-lg bg-[#252526] border border-neutral-700/60 overflow-y-auto max-h-[300px] text-xs font-sans text-neutral-200 leading-relaxed whitespace-pre-wrap">
                    {formData.content}
                  </div>
                )}
              </div>
            </div>

            {/* Postman & cURL Defaults */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 rounded-xl bg-neutral-900 border border-neutral-800">
              <div>
                <label className="text-neutral-300 font-semibold mb-1 flex items-center gap-1.5">
                  <Send className="w-3.5 h-3.5 text-orange-400" />
                  <span>Связанный сценарий в Postman:</span>
                </label>
                <select
                  value={formData.postmanPresetId || WEATHER_PRESETS[0]?.id}
                  onChange={(e) => setFormData({ ...formData, postmanPresetId: e.target.value })}
                  className="w-full p-2 rounded bg-neutral-800 border border-neutral-700 text-white font-sans text-xs outline-none"
                >
                  {WEATHER_PRESETS.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-neutral-300 font-semibold mb-1 flex items-center gap-1.5">
                  <Terminal className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Команда cURL по умолчанию:</span>
                </label>
                <input
                  type="text"
                  value={formData.defaultCurlCommand || ''}
                  onChange={(e) => setFormData({ ...formData, defaultCurlCommand: e.target.value })}
                  placeholder='curl -s "https://api.open-meteo.com/v1/forecast?..."'
                  className="w-full p-2 rounded bg-neutral-800 border border-neutral-700 text-sky-300 font-mono text-xs outline-none"
                />
              </div>
            </div>

            {/* Quiz & Rollback Configuration */}
            <div className="p-5 rounded-xl bg-[#252526] border border-neutral-700 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-neutral-700/60 pb-3">
                <div className="flex items-center gap-2">
                  <RotateCcw className="w-4 h-4 text-amber-400" />
                  <h4 className="font-semibold text-white text-xs">
                    Настройка контрольного теста и правила отката (Rollback Engine)
                  </h4>
                </div>

                <button
                  type="button"
                  onClick={handleAddQuestion}
                  className="flex items-center gap-1 px-3 py-1 rounded bg-[#007acc] hover:bg-[#0062a3] text-white text-xs font-semibold transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Добавить вопрос к тесту</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-neutral-400 block mb-1">Название теста:</label>
                  <input
                    type="text"
                    value={formData.quiz.title}
                    onChange={(e) => setFormData({
                      ...formData,
                      quiz: { ...formData.quiz, title: e.target.value }
                    })}
                    className="w-full p-2 rounded bg-neutral-900 border border-neutral-700 text-white text-xs outline-none"
                  />
                </div>

                <div>
                  <label className="text-neutral-400 block mb-1">Проходной балл (%):</label>
                  <input
                    type="number"
                    min={50}
                    max={100}
                    value={formData.quiz.passingScorePercent}
                    onChange={(e) => setFormData({
                      ...formData,
                      quiz: { ...formData.quiz, passingScorePercent: parseInt(e.target.value) || 75 }
                    })}
                    className="w-full p-2 rounded bg-neutral-900 border border-neutral-700 text-amber-400 font-mono text-xs outline-none"
                  />
                </div>

                <div>
                  <label className="text-neutral-400 block mb-1">Шагов отката назад при неудаче:</label>
                  <input
                    type="number"
                    min={1}
                    max={5}
                    value={formData.quiz.rollbackSteps}
                    onChange={(e) => setFormData({
                      ...formData,
                      quiz: { ...formData.quiz, rollbackSteps: parseInt(e.target.value) || 1 }
                    })}
                    className="w-full p-2 rounded bg-neutral-900 border border-neutral-700 text-rose-400 font-mono text-xs outline-none"
                  />
                </div>
              </div>

              {/* Questions List */}
              <div className="space-y-4 pt-2">
                <h5 className="font-semibold text-neutral-300 text-xs">
                  Список вопросов ({formData.quiz.questions.length}):
                </h5>

                {formData.quiz.questions.map((q, qIdx) => (
                  <div key={q.id} className="p-4 rounded-lg bg-neutral-900 border border-neutral-700/80 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-sky-400 font-bold text-xs">
                        Вопрос #{qIdx + 1}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleDeleteQuestion(q.id)}
                        className="text-neutral-500 hover:text-rose-400 p-1 transition-colors"
                        title="Удалить вопрос"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div>
                      <label className="text-neutral-400 block mb-1 text-[11px]">Текст вопроса:</label>
                      <input
                        type="text"
                        value={q.question}
                        onChange={(e) => handleUpdateQuestion(q.id, 'question', e.target.value)}
                        className="w-full p-2 rounded bg-neutral-800 border border-neutral-700 text-white text-xs outline-none"
                      />
                    </div>

                    {/* 4 options with radio for correct answer */}
                    <div>
                      <label className="text-neutral-400 block mb-1 text-[11px]">
                        Варианты ответов (отметьте радиокнопкой верный):
                      </label>
                      <div className="space-y-1.5">
                        {q.options.map((opt, optIdx) => (
                          <div key={optIdx} className="flex items-center gap-2">
                            <input
                              type="radio"
                              name={`correct_${q.id}`}
                              checked={q.correctIndex === optIdx}
                              onChange={() => handleUpdateQuestion(q.id, 'correctIndex', optIdx)}
                              className="accent-emerald-500 cursor-pointer"
                            />
                            <span className="font-mono text-neutral-500 text-xs w-4">
                              {String.fromCharCode(65 + optIdx)}:
                            </span>
                            <input
                              type="text"
                              value={opt}
                              onChange={(e) => {
                                const newOpts = [...q.options];
                                newOpts[optIdx] = e.target.value;
                                handleUpdateQuestion(q.id, 'options', newOpts);
                              }}
                              className="flex-1 p-1.5 rounded bg-neutral-800 border border-neutral-700 text-xs text-neutral-200 outline-none"
                            />
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                      <div>
                        <label className="text-neutral-400 block mb-1 text-[11px]">Пояснение (Explanation):</label>
                        <textarea
                          rows={2}
                          value={q.explanation}
                          onChange={(e) => handleUpdateQuestion(q.id, 'explanation', e.target.value)}
                          className="w-full p-1.5 rounded bg-neutral-800 border border-neutral-700 text-xs text-neutral-300 outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-neutral-400 block mb-1 text-[11px]">Совет техписателю (Tip):</label>
                        <textarea
                          rows={2}
                          value={q.techWriterTip}
                          onChange={(e) => handleUpdateQuestion(q.id, 'techWriterTip', e.target.value)}
                          className="w-full p-1.5 rounded bg-neutral-800 border border-neutral-700 text-xs text-sky-200 outline-none"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Bottom Save Bar */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-neutral-700/60 pb-12">
              <button
                type="submit"
                className="px-6 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-colors flex items-center gap-2 shadow-lg"
              >
                <Save className="w-4 h-4" />
                <span>Сохранить модуль</span>
              </button>
            </div>
          </form>
        </main>
      </div>
    </div>
  );
};
