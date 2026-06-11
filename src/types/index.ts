// ============ Auth Types ============
export type UserRole = 'student' | 'instructor';

export interface User {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  role: UserRole;
  created_at: string;
}

// ============ Course Types ============
export type CourseLevel = 'beginner' | 'intermediate' | 'advanced';
export type CourseStatus = 'draft' | 'published';

export interface Course {
  id: string;
  title: string;
  description: string;
  thumbnail_url: string | null;
  category: string;
  level: CourseLevel;
  status: CourseStatus;
  instructor_id: string;
  instructor?: User;
  lessons_count?: number;
  enrolled_count?: number;
  created_at: string;
  updated_at: string;
}

export interface Lesson {
  id: string;
  course_id: string;
  title: string;
  content: string;
  video_url: string | null;
  order_index: number;
  duration_minutes: number;
  created_at: string;
}

export interface Enrollment {
  id: string;
  user_id: string;
  course_id: string;
  course?: Course;
  enrolled_at: string;
  completed_lessons: string[];
  progress_percentage: number;
}

export interface LessonProgress {
  id: string;
  user_id: string;
  lesson_id: string;
  course_id: string;
  completed: boolean;
  completed_at: string | null;
}

// ============ Flashcard Types ============
export type CardDifficulty = 'easy' | 'medium' | 'hard';

export interface FlashcardDeck {
  id: string;
  user_id: string;
  title: string;
  description: string;
  category: string;
  is_public: boolean;
  cards_count?: number;
  created_at: string;
  updated_at: string;
}

export interface Flashcard {
  id: string;
  deck_id: string;
  front: string;
  back: string;
  order_index: number;
  created_at: string;
}

export interface CardReview {
  id: string;
  user_id: string;
  card_id: string;
  deck_id: string;
  difficulty: CardDifficulty;
  next_review_at: string;
  interval_days: number;
  ease_factor: number;
  review_count: number;
  last_reviewed_at: string;
}

// ============ Study Session Types ============
export interface StudySession {
  deckId: string;
  cards: Flashcard[];
  currentIndex: number;
  results: StudyResult[];
  startedAt: Date;
}

export interface StudyResult {
  cardId: string;
  difficulty: CardDifficulty;
  timeSpent: number;
}

// ============ Quiz Types ============
export interface Quiz {
  id: string;
  course_id: string;
  title: string;
  description: string;
  time_limit_minutes: number | null;
  pass_score: number;
  questions_count?: number;
  created_at: string;
  updated_at: string;
}

export interface QuizQuestion {
  id: string;
  quiz_id: string;
  question: string;
  options: string[];        // 4 options
  correct_index: number;    // 0-3
  explanation: string;
  order_index: number;
  created_at: string;
}

export interface QuizAttempt {
  id: string;
  user_id: string;
  quiz_id: string;
  answers: QuizAnswer[];
  score: number;
  passed: boolean;
  time_spent_seconds: number;
  completed_at: string;
}

export interface QuizAnswer {
  question_id: string;
  selected: number;   // -1 = skipped
}
export interface Toast {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  message: string;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
}
