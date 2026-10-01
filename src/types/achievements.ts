export interface Achievement {
  id: string;
  title: string;
  description: string;
  iconName: 'trophy' | 'flame' | 'award' | 'terminal' | 'radio' | 'git' | 'zap' | 'shield' | 'send';
  category: 'starter' | 'streak' | 'mastery' | 'practice';
  xpReward: number;
  unlockedAt?: number;
  progress: {
    current: number;
    max: number;
    unit?: string;
  };
  isUnlocked: boolean;
}

export interface AchievementNotification {
  id: string;
  title: string;
  description: string;
  xpReward: number;
}
