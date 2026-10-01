import React, { useState } from 'react';
import { 
  CheckCircle2, 
  XCircle, 
  HelpCircle, 
  RotateCcw, 
  Sparkles, 
  Lightbulb, 
  GripVertical, 
  ArrowRight,
  ShieldCheck,
  Check,
  Award
} from 'lucide-react';
import { KnowledgeCheckpoint, TrueFalseCheckpoint, DragDropCheckpoint } from '../../types/course';

interface KnowledgeCheckpointCardProps {
  checkpoint: KnowledgeCheckpoint;
  isCompleted?: boolean;
  onComplete?: (checkpointId: string, xp: number) => void;
  theme: 'dark' | 'light';
}

export const KnowledgeCheckpointCard: React.FC<KnowledgeCheckpointCardProps> = ({
  checkpoint,
  isCompleted = false,
  onComplete,
  theme
}) => {
  const isDark = theme === 'dark';

  // True/False state
  const [selectedBool, setSelectedBool] = useState<boolean | null>(null);
  const [tfEvaluated, setTfEvaluated] = useState(isCompleted);

  // Drag & drop state: map of itemId -> targetZoneId (or null if unplaced)
  const [itemPlacements, setItemPlacements] = useState<Record<string, string>>(() => {
    if (checkpoint.type === 'drag_drop' && isCompleted) {
      // Pre-fill correct placements if completed
      const map: Record<string, string> = {};
      checkpoint.items.forEach(item => {
        map[item.id] = item.category;
      });
      return map;
    }
    return {};
  });

  // Currently selected item for click-to-place accessibility
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [draggedItemId, setDraggedItemId] = useState<string | null>(null);
  const [dragOverZoneId, setDragOverZoneId] = useState<string | null>(null);
  const [ddEvaluated, setDdEvaluated] = useState(isCompleted);
  const [ddSuccess, setDdSuccess] = useState(isCompleted);

  // Reset state
  const handleReset = () => {
    setSelectedBool(null);
    setTfEvaluated(false);
    setItemPlacements({});
    setSelectedItemId(null);
    setDdEvaluated(false);
    setDdSuccess(false);
  };

  // TRUE / FALSE EVALUATION
  const handleSelectTrueFalse = (userChoice: boolean) => {
    setSelectedBool(userChoice);
    setTfEvaluated(true);
    const tf = checkpoint as TrueFalseCheckpoint;
    const isCorrect = userChoice === tf.isTrue;
    if (isCorrect && onComplete) {
      onComplete(checkpoint.id, 20);
    }
  };

  // DRAG & DROP LOGIC
  const handlePlaceItem = (itemId: string, zoneId: string | null) => {
    setItemPlacements(prev => {
      const updated = { ...prev };
      if (zoneId === null) {
        delete updated[itemId];
      } else {
        updated[itemId] = zoneId;
      }
      return updated;
    });
    setSelectedItemId(null);
    setDdEvaluated(false);
  };

  // Check Drag & Drop answers
  const handleCheckDragDrop = () => {
    const dd = checkpoint as DragDropCheckpoint;
    let allCorrect = true;
    for (const item of dd.items) {
      if (itemPlacements[item.id] !== item.category) {
        allCorrect = false;
        break;
      }
    }
    setDdEvaluated(true);
    setDdSuccess(allCorrect);
    if (allCorrect && onComplete) {
      onComplete(checkpoint.id, 25);
    }
  };

  // Render True/False checkpoint
  const renderTrueFalse = (tf: TrueFalseCheckpoint) => {
    const isSelected = selectedBool !== null;
    const isCorrect = isSelected && selectedBool === tf.isTrue;

    return (
      <div className="space-y-4">
        <p className="text-sm font-medium leading-relaxed">
          {tf.statement}
        </p>

        {tf.codeSnippet && (
          <div className={`p-2.5 rounded text-xs font-mono border overflow-x-auto ${
            isDark ? 'bg-[#181818] border-neutral-700/60 text-emerald-300' : 'bg-neutral-100 border-neutral-300 text-emerald-800'
          }`}>
            <pre>{tf.codeSnippet}</pre>
          </div>
        )}

        {/* Buttons: True / False */}
        <div className="flex items-center gap-3 pt-1">
          <button
            onClick={() => handleSelectTrueFalse(true)}
            disabled={tfEvaluated && isCorrect}
            className={`flex-1 py-2 px-3 rounded-md text-xs font-semibold flex items-center justify-center gap-2 border transition-all cursor-pointer ${
              selectedBool === true
                ? isCorrect
                  ? 'bg-emerald-600/30 border-emerald-500 text-emerald-200 ring-2 ring-emerald-500/50'
                  : 'bg-rose-600/30 border-rose-500 text-rose-200 ring-2 ring-rose-500/50'
                : isDark 
                  ? 'bg-neutral-800/80 hover:bg-neutral-700/80 border-neutral-700 text-neutral-200' 
                  : 'bg-neutral-100 hover:bg-neutral-200 border-neutral-300 text-neutral-800'
            }`}
          >
            <Check className="w-4 h-4 text-emerald-400" />
            <span>Верно (True)</span>
          </button>

          <button
            onClick={() => handleSelectTrueFalse(false)}
            disabled={tfEvaluated && isCorrect}
            className={`flex-1 py-2 px-3 rounded-md text-xs font-semibold flex items-center justify-center gap-2 border transition-all cursor-pointer ${
              selectedBool === false
                ? isCorrect
                  ? 'bg-emerald-600/30 border-emerald-500 text-emerald-200 ring-2 ring-emerald-500/50'
                  : 'bg-rose-600/30 border-rose-500 text-rose-200 ring-2 ring-rose-500/50'
                : isDark 
                  ? 'bg-neutral-800/80 hover:bg-neutral-700/80 border-neutral-700 text-neutral-200' 
                  : 'bg-neutral-100 hover:bg-neutral-200 border-neutral-300 text-neutral-800'
            }`}
          >
            <XCircle className="w-4 h-4 text-rose-400" />
            <span>Неверно (False)</span>
          </button>
        </div>

        {/* Feedback Section */}
        {tfEvaluated && (
          <div className={`p-3 rounded-md text-xs border space-y-2 animate-in fade-in duration-200 ${
            isCorrect 
              ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-200' 
              : 'bg-rose-950/40 border-rose-500/40 text-rose-200'
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 font-semibold">
                {isCorrect ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Правильно! +20 XP</span>
                  </>
                ) : (
                  <>
                    <XCircle className="w-4 h-4 text-rose-400" />
                    <span>Не совсем так</span>
                  </>
                )}
              </div>

              {!isCorrect && (
                <button
                  onClick={handleReset}
                  className="flex items-center gap-1 text-[11px] text-amber-300 hover:underline cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Попробовать снова</span>
                </button>
              )}
            </div>

            <p className="leading-relaxed opacity-95">
              {tf.explanation}
            </p>

            {isCorrect && tf.techWriterInsight && (
              <div className="mt-2 pt-2 border-t border-emerald-500/30 flex items-start gap-2 text-emerald-300">
                <Lightbulb className="w-4 h-4 shrink-0 mt-0.5 text-amber-400" />
                <span className="leading-relaxed text-[11px]">{tf.techWriterInsight}</span>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  // Render Drag and Drop checkpoint
  const renderDragDrop = (dd: DragDropCheckpoint) => {
    // Unassigned items (not placed in any zone)
    const unassignedItems = dd.items.filter(item => !itemPlacements[item.id]);
    const allPlaced = dd.items.every(item => Boolean(itemPlacements[item.id]));

    return (
      <div className="space-y-4">
        <div>
          <p className="text-sm font-medium leading-relaxed">{dd.instruction}</p>
          <p className="text-[11px] text-neutral-400 mt-0.5">
            Перетаскивайте карточки мышью или кликните сначала по карточке, а затем по целевой зоне.
          </p>
        </div>

        {/* Unassigned Items Dock */}
        <div className={`p-2.5 rounded-md border min-h-[52px] ${
          isDark ? 'bg-[#181818] border-neutral-700/60' : 'bg-neutral-100 border-neutral-300'
        }`}>
          <div className="text-[11px] font-semibold text-neutral-400 mb-1.5 flex items-center justify-between">
            <span>Элементы для распределения:</span>
            <span>{unassignedItems.length} осталось</span>
          </div>

          <div className="flex flex-wrap gap-2">
            {unassignedItems.map(item => {
              const isSelected = selectedItemId === item.id;
              return (
                <div
                  key={item.id}
                  draggable
                  onDragStart={() => setDraggedItemId(item.id)}
                  onDragEnd={() => setDraggedItemId(null)}
                  onClick={() => setSelectedItemId(prev => prev === item.id ? null : item.id)}
                  className={`px-2.5 py-1.5 rounded text-xs font-mono cursor-grab active:cursor-grabbing border flex items-center gap-1.5 transition-all select-none shadow-sm ${
                    isSelected
                      ? 'bg-sky-600 text-white border-sky-400 ring-2 ring-sky-300 scale-105'
                      : isDark
                        ? 'bg-neutral-800 hover:bg-neutral-750 text-neutral-200 border-neutral-600 hover:border-neutral-500'
                        : 'bg-white hover:bg-neutral-50 text-neutral-800 border-neutral-300'
                  }`}
                >
                  <GripVertical className="w-3 h-3 text-neutral-400" />
                  <span>{item.label}</span>
                </div>
              );
            })}

            {unassignedItems.length === 0 && (
              <span className="text-xs text-neutral-500 italic py-1">
                Все элементы распределены по зонам. Нажмите «Проверить ответ».
              </span>
            )}
          </div>
        </div>

        {/* Drop Target Zones Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {dd.zones.map(zone => {
            const zoneItems = dd.items.filter(item => itemPlacements[item.id] === zone.id);
            const isDragTarget = dragOverZoneId === zone.id;

            return (
              <div
                key={zone.id}
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragOverZoneId(zone.id);
                }}
                onDragLeave={() => setDragOverZoneId(null)}
                onDrop={() => {
                  if (draggedItemId) {
                    handlePlaceItem(draggedItemId, zone.id);
                  }
                  setDragOverZoneId(null);
                }}
                onClick={() => {
                  if (selectedItemId) {
                    handlePlaceItem(selectedItemId, zone.id);
                  }
                }}
                className={`p-3 rounded-md border transition-all ${
                  isDragTarget || (selectedItemId && !zoneItems.some(i => i.id === selectedItemId))
                    ? 'border-sky-500 bg-sky-950/20'
                    : isDark ? 'bg-neutral-800/50 border-neutral-700/60' : 'bg-neutral-50 border-neutral-300'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-sky-400 font-mono">{zone.title}</span>
                  <span className="text-[10px] text-neutral-400">{zoneItems.length} эл.</span>
                </div>
                <p className="text-[11px] text-neutral-400 mb-2">{zone.description}</p>

                {/* Items in this zone */}
                <div className="min-h-[38px] flex flex-wrap gap-1.5 p-1 rounded bg-black/10 border border-dashed border-neutral-700/40">
                  {zoneItems.map(item => {
                    const isItemWrong = ddEvaluated && item.category !== zone.id;
                    const isItemCorrect = ddEvaluated && item.category === zone.id;

                    return (
                      <div
                        key={item.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          handlePlaceItem(item.id, null); // return to unassigned
                        }}
                        title="Кликните, чтобы вернуть обратно"
                        className={`px-2 py-1 rounded text-[11px] font-mono border flex items-center gap-1 cursor-pointer transition-colors ${
                          ddEvaluated
                            ? isItemCorrect
                              ? 'bg-emerald-950/60 border-emerald-500 text-emerald-200'
                              : 'bg-rose-950/60 border-rose-500 text-rose-200'
                            : isDark
                              ? 'bg-neutral-750 hover:bg-neutral-700 text-neutral-200 border-neutral-600'
                              : 'bg-white hover:bg-neutral-100 text-neutral-800 border-neutral-300'
                        }`}
                      >
                        {ddEvaluated && (
                          isItemCorrect 
                            ? <Check className="w-3 h-3 text-emerald-400" />
                            : <XCircle className="w-3 h-3 text-rose-400" />
                        )}
                        <span>{item.label}</span>
                        <span className="text-[9px] text-neutral-400 ml-1">✕</span>
                      </div>
                    );
                  })}

                  {zoneItems.length === 0 && (
                    <div className="w-full text-center py-1 text-[11px] text-neutral-500">
                      Перетащите или кликните сюда
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Action Controls & Verification */}
        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-2">
            <button
              onClick={handleCheckDragDrop}
              disabled={!allPlaced}
              className={`py-1.5 px-4 rounded text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm ${
                allPlaced 
                  ? 'bg-[#007acc] hover:bg-[#0062a3] text-white cursor-pointer' 
                  : 'bg-neutral-700 text-neutral-400 cursor-not-allowed'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Проверить ответ</span>
            </button>

            <button
              onClick={handleReset}
              className="py-1.5 px-3 rounded text-xs text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors flex items-center gap-1 cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Сбросить</span>
            </button>
          </div>

          <span className="text-[11px] text-neutral-400">
            {dd.items.filter(i => Boolean(itemPlacements[i.id])).length} из {dd.items.length} размещено
          </span>
        </div>

        {/* Feedback banner */}
        {ddEvaluated && (
          <div className={`p-3 rounded-md text-xs border space-y-2 animate-in fade-in duration-200 ${
            ddSuccess 
              ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-200' 
              : 'bg-rose-950/40 border-rose-500/40 text-rose-200'
          }`}>
            <div className="flex items-center gap-1.5 font-semibold">
              {ddSuccess ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Отлично! Все параметры на своих местах (+25 XP)</span>
                </>
              ) : (
                <>
                  <XCircle className="w-4 h-4 text-rose-400" />
                  <span>Есть неточности в распределении</span>
                </>
              )}
            </div>

            <p className="leading-relaxed opacity-95">
              {ddSuccess ? dd.explanation : 'Красным подсвечены элементы в неверных зонах. Нажмите на них, чтобы переместить, или воспользуйтесь кнопкой «Сбросить».'}
            </p>

            {ddSuccess && dd.techWriterInsight && (
              <div className="mt-2 pt-2 border-t border-emerald-500/30 flex items-start gap-2 text-emerald-300">
                <Lightbulb className="w-4 h-4 shrink-0 mt-0.5 text-amber-400" />
                <span className="leading-relaxed text-[11px]">{dd.techWriterInsight}</span>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className={`my-6 rounded-lg border shadow-md transition-all ${
      isDark 
        ? 'bg-[#1e1e1e] border-neutral-700/80 hover:border-neutral-600' 
        : 'bg-white border-neutral-200 hover:border-neutral-300'
    }`}>
      {/* Card Header */}
      <div className={`px-4 py-2.5 border-b rounded-t-lg flex items-center justify-between ${
        isDark ? 'bg-[#252526] border-neutral-700/60' : 'bg-neutral-100 border-neutral-200'
      }`}>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded flex items-center justify-center bg-amber-500/20 text-amber-400">
            <Sparkles className="w-3.5 h-3.5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-white tracking-wide">
                Чекпоинт знаний: {checkpoint.concept}
              </span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 font-mono">
                {checkpoint.type === 'true_false' ? 'True / False' : 'Drag & Drop'}
              </span>
            </div>
            <p className="text-[10px] text-neutral-400">
              Быстрая интерактивная проверка концепта без перехода к полному тесту
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {(tfEvaluated || ddSuccess) && (
            <div className="flex items-center gap-1 text-[11px] text-emerald-400 font-semibold px-2 py-0.5 rounded bg-emerald-950/50 border border-emerald-500/30">
              <Award className="w-3.5 h-3.5" />
              <span>Освоено</span>
            </div>
          )}
        </div>
      </div>

      {/* Card Content Body */}
      <div className="p-4">
        {checkpoint.type === 'true_false' 
          ? renderTrueFalse(checkpoint as TrueFalseCheckpoint) 
          : renderDragDrop(checkpoint as DragDropCheckpoint)
        }
      </div>
    </div>
  );
};
