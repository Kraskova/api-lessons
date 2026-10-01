export interface ParameterDef {
  name: string;
  type: 'string' | 'number' | 'integer' | 'boolean' | 'array' | 'object';
  location: 'query' | 'path' | 'header' | 'body';
  required: boolean;
  default?: string | number | boolean;
  example: string | number | boolean;
  description: string;
}

export interface QuizQuestion {
  id: string;
  topic: string; // e.g., 'endpoints', 'params', 'auth', 'status_codes', 'json', 'curl'
  question: string;
  codeSnippet?: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  techWriterTip: string;
}

export interface ModuleQuiz {
  id: string;
  moduleId: string;
  title: string;
  passingScorePercent: number; // e.g. 75
  rollbackSteps: number; // number of modules to rollback if failed
  questions: QuizQuestion[];
}

export type CheckpointType = 'true_false' | 'drag_drop';

export interface TrueFalseCheckpoint {
  id: string;
  type: 'true_false';
  concept: string; // e.g., 'Аутентификация API' or 'JSON Схемы'
  statement: string; // The statement to evaluate
  codeSnippet?: string;
  isTrue: boolean;
  explanation: string;
  techWriterInsight: string;
}

export interface DragDropItem {
  id: string;
  label: string;
  category: string; // The correct target zone / bucket id
}

export interface DragDropTargetZone {
  id: string;
  title: string;
  description: string;
}

export interface DragDropCheckpoint {
  id: string;
  type: 'drag_drop';
  concept: string;
  instruction: string;
  zones: DragDropTargetZone[];
  items: DragDropItem[];
  explanation: string;
  techWriterInsight: string;
}

export type KnowledgeCheckpoint = TrueFalseCheckpoint | DragDropCheckpoint;

export interface CourseModule {
  id: string;
  order: number;
  slug: string;
  filename: string;
  title: string;
  shortDescription: string;
  category: 'Основы API' | 'Инструменты' | 'Спецификации и Документирование' | 'Карьера и Практика';
  estimatedMinutes: number;
  prerequisites?: string[];
  content: string; // Rich Markdown text
  quiz: ModuleQuiz;
  postmanPresetId?: string;
  defaultCurlCommand?: string;
  checkpoints?: KnowledgeCheckpoint[];
}

export interface PostmanParam {
  id: string;
  key: string;
  value: string;
  description: string;
  enabled: boolean;
}

export interface PostmanHeader {
  id: string;
  key: string;
  value: string;
  description: string;
  enabled: boolean;
}

export interface PostmanRequest {
  id: string;
  name: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  url: string;
  params: PostmanParam[];
  headers: PostmanHeader[];
  authType: 'none' | 'apiKeyQuery' | 'apiKeyHeader' | 'bearer';
  authKey?: string;
  authValue?: string;
  bodyType: 'none' | 'json';
  bodyContent: string;
  description: string;
}

export interface PostmanResponse {
  status: number;
  statusText: string;
  timeMs: number;
  sizeKb: number;
  headers: Record<string, string>;
  data: any;
  error?: string;
}

export interface RollbackEvent {
  timestamp: number;
  moduleId: string;
  moduleTitle: string;
  scorePercent: number;
  rolledBackToModuleId: string;
  rolledBackToModuleTitle: string;
  failedTopics: string[];
  reason: string;
}

export interface HistoryEvent {
  id: string;
  timestamp: number;
  type: 'module_started' | 'quiz_passed' | 'quiz_failed' | 'rollback' | 'postman_tested' | 'pr_merged' | 'module_created' | 'module_updated' | 'module_deleted' | 'checkpoint_passed';
  moduleId?: string;
  moduleTitle?: string;
  title: string;
  description: string;
  scorePercent?: number;
  xpEarned?: number;
}

export interface StudentProgress {
  currentModuleId: string;
  completedModuleIds: string[];
  completedCheckpointIds?: string[];
  quizScores: Record<string, number>; // quizId -> scorePercent
  rollbackHistory: RollbackEvent[];
  history: HistoryEvent[];
  xp: number;
  streakDays: number;
  activeDays?: string[]; // array of 'YYYY-MM-DD'
}
