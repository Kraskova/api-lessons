import { StudentProgress } from '../types/course';
import { Achievement } from '../types/achievements';

const SEEN_ACHIEVEMENTS_KEY = 'techwriter_seen_achievements_v1';

export function calculateAchievements(progress: StudentProgress, totalModules: number): {
  achievements: Achievement[];
  unlockedCount: number;
  newUnlockedCount: number;
} {
  const completedCount = progress.completedModuleIds.length;
  const passedQuizzesCount = Object.values(progress.quizScores || {}).filter(score => score >= 75).length;
  const streakDays = progress.streakDays || 1;
  const checkpointsCount = (progress.completedCheckpointIds || []).length;
  const historyEvents = progress.history || [];
  
  const hasUsedPostman = historyEvents.some(e => e.type === 'postman_tested') || historyEvents.length > 3;
  const hasMergedPr = historyEvents.some(e => e.type === 'pr_merged');
  const hasPassedCheckpoints = checkpointsCount >= 1;

  const rawList: Omit<Achievement, 'isUnlocked'>[] = [
    {
      id: 'first_test',
      title: 'Первый тест пройден',
      description: 'Успешно завершите и сдайте тестирование к любому модулю курса с результатом не ниже 75%.',
      iconName: 'award',
      category: 'starter',
      xpReward: 50,
      progress: {
        current: Math.min(1, passedQuizzesCount),
        max: 1,
        unit: 'тест'
      }
    },
    {
      id: 'streak_5',
      title: '5 дней подряд',
      description: 'Занимайтесь регулярно и поддерживайте непрерывную серию обучения в течение 5 дней.',
      iconName: 'flame',
      category: 'streak',
      xpReward: 100,
      progress: {
        current: Math.min(5, streakDays),
        max: 5,
        unit: 'дней'
      }
    },
    {
      id: 'api_master',
      title: 'Мастер API',
      description: 'Полностью освойте и завершите все учебные модули интерактивного курса.',
      iconName: 'trophy',
      category: 'mastery',
      xpReward: 250,
      progress: {
        current: completedCount,
        max: totalModules || 8,
        unit: 'мод.'
      }
    },
    {
      id: 'postman_guru',
      title: 'Гуру Postman',
      description: 'Отправьте и исследуйте реальные сетевые запросы с параметрами и заголовками в клиенте Postman.',
      iconName: 'send',
      category: 'practice',
      xpReward: 50,
      progress: {
        current: hasUsedPostman ? 1 : 0,
        max: 1,
        unit: 'запрос'
      }
    },
    {
      id: 'checkpoint_scout',
      title: 'Знаток концептов',
      description: 'Пройдите интерактивные чекпоинты знаний (True/False и Drag & Drop) прямо в тексте уроков.',
      iconName: 'zap',
      category: 'practice',
      xpReward: 75,
      progress: {
        current: Math.min(3, checkpointsCount),
        max: 3,
        unit: 'чекпоинта'
      }
    },
    {
      id: 'open_source_contributor',
      title: 'Open Source Контрибьютор',
      description: 'Сформируйте и успешно замержите Pull Request с улучшением технической документации API.',
      iconName: 'git',
      category: 'practice',
      xpReward: 150,
      progress: {
        current: hasMergedPr ? 1 : 0,
        max: 1,
        unit: 'PR'
      }
    },
    {
      id: 'safe_developer',
      title: 'Страж безопасности',
      description: 'Изучите принципы защиты ключей доступа, заголовки авторизации и токены Bearer.',
      iconName: 'shield',
      category: 'mastery',
      xpReward: 80,
      progress: {
        current: progress.completedModuleIds.includes('mod-4') ? 1 : 0,
        max: 1,
        unit: 'модуль'
      }
    },
    {
      id: 'logger_inspector',
      title: 'Сетевой аналитик',
      description: 'Исследуйте трассировку сетевых вызовов, заголовков и статус-кодов в API Response Logger.',
      iconName: 'radio',
      category: 'practice',
      xpReward: 60,
      progress: {
        current: historyEvents.length >= 2 ? 1 : 0,
        max: 1,
        unit: 'инспекция'
      }
    }
  ];

  let seenIds: string[] = [];
  try {
    const rawSeen = localStorage.getItem(SEEN_ACHIEVEMENTS_KEY);
    if (rawSeen) {
      seenIds = JSON.parse(rawSeen);
    }
  } catch {}

  let unlockedCount = 0;
  let newUnlockedCount = 0;

  const achievements: Achievement[] = rawList.map(item => {
    const isUnlocked = item.progress.current >= item.progress.max;
    if (isUnlocked) {
      unlockedCount++;
      if (!seenIds.includes(item.id)) {
        newUnlockedCount++;
      }
    }
    return {
      ...item,
      isUnlocked,
      unlockedAt: isUnlocked ? Date.now() : undefined
    };
  });

  return {
    achievements,
    unlockedCount,
    newUnlockedCount
  };
}

export function markAchievementsAsSeen(achievementIds: string[]) {
  try {
    localStorage.setItem(SEEN_ACHIEVEMENTS_KEY, JSON.stringify(achievementIds));
  } catch {}
}
