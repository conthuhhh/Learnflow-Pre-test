import { create } from 'zustand';
import { supabase } from '@/lib/supabase';
import type { Quiz, QuizQuestion, QuizAttempt, QuizAnswer } from '@/types';

interface QuizState {
  quizzes: Quiz[];
  currentQuestions: QuizQuestion[];
  attempts: QuizAttempt[];
  isLoading: boolean;
  error: string | null;

  fetchQuizzesByCourse: (courseId: string) => Promise<void>;
  fetchQuizById: (id: string) => Promise<Quiz | null>;
  fetchQuestions: (quizId: string) => Promise<void>;
  fetchAttempts: (userId: string, quizId: string) => Promise<void>;
  createQuiz: (data: Omit<Quiz, 'id' | 'created_at' | 'updated_at'>) => Promise<Quiz>;
  updateQuiz: (id: string, data: Partial<Quiz>) => Promise<void>;
  deleteQuiz: (id: string) => Promise<void>;
  addQuestion: (data: Omit<QuizQuestion, 'id' | 'created_at'>) => Promise<QuizQuestion>;
  updateQuestion: (id: string, data: Partial<QuizQuestion>) => Promise<void>;
  deleteQuestion: (id: string) => Promise<void>;
  submitAttempt: (
    userId: string,
    quizId: string,
    answers: QuizAnswer[],
    questions: QuizQuestion[],
    passScore: number,
    timeSpent: number
  ) => Promise<QuizAttempt>;
  getBestAttempt: (quizId: string) => QuizAttempt | undefined;
}

export const useQuizStore = create<QuizState>((set, get) => ({
  quizzes: [],
  currentQuestions: [],
  attempts: [],
  isLoading: false,
  error: null,

  fetchQuizzesByCourse: async (courseId) => {
    set({ isLoading: true });
    const { data } = await supabase
      .from('quizzes')
      .select('*, questions_count:quiz_questions(count)')
      .eq('course_id', courseId)
      .order('created_at');
    const quizzes = (data || []).map((q) => ({
      ...q,
      questions_count: q.questions_count?.[0]?.count || 0,
    }));
    set({ quizzes, isLoading: false });
  },

  fetchQuizById: async (id) => {
    const { data } = await supabase
      .from('quizzes')
      .select('*, questions_count:quiz_questions(count)')
      .eq('id', id)
      .single();
    return data ? { ...data, questions_count: data.questions_count?.[0]?.count || 0 } : null;
  },

  fetchQuestions: async (quizId) => {
    set({ isLoading: true });
    const { data } = await supabase
      .from('quiz_questions')
      .select('*')
      .eq('quiz_id', quizId)
      .order('order_index');

    // Parse options từ JSONB string → array nếu cần
    const questions = (data || []).map((q) => ({
      ...q,
      options: typeof q.options === 'string' ? JSON.parse(q.options) : q.options,
    }));
    set({ currentQuestions: questions, isLoading: false });
  },

  fetchAttempts: async (userId, quizId) => {
    const { data } = await supabase
      .from('quiz_attempts')
      .select('*')
      .eq('user_id', userId)
      .eq('quiz_id', quizId)
      .order('completed_at', { ascending: false });
    set({ attempts: data || [] });
  },

  createQuiz: async (quizData) => {
    const { data, error } = await supabase
      .from('quizzes')
      .insert(quizData)
      .select()
      .single();
    if (error) throw error;
    const newQuiz = { ...data, questions_count: 0 };
    set((s) => ({ quizzes: [...s.quizzes, newQuiz] }));
    return newQuiz;
  },

  updateQuiz: async (id, quizData) => {
    const { error } = await supabase
      .from('quizzes')
      .update({ ...quizData, updated_at: new Date().toISOString() })
      .eq('id', id);
    if (error) throw error;
    set((s) => ({ quizzes: s.quizzes.map((q) => q.id === id ? { ...q, ...quizData } : q) }));
  },

  deleteQuiz: async (id) => {
    const { error } = await supabase.from('quizzes').delete().eq('id', id);
    if (error) throw error;
    set((s) => ({ quizzes: s.quizzes.filter((q) => q.id !== id) }));
  },

  addQuestion: async (questionData) => {
    const { data, error } = await supabase
      .from('quiz_questions')
      .insert({ ...questionData, options: JSON.stringify(questionData.options) })
      .select()
      .single();
    if (error) throw error;
    // Always parse options back to array
    const q = { ...data, options: typeof data.options === 'string' ? JSON.parse(data.options) : data.options };
    set((s) => ({
      currentQuestions: [...s.currentQuestions, q],
      quizzes: s.quizzes.map((quiz) =>
        quiz.id === questionData.quiz_id
          ? { ...quiz, questions_count: (quiz.questions_count || 0) + 1 }
          : quiz
      ),
    }));
    return q;
  },

  updateQuestion: async (id, questionData) => {
    const payload = questionData.options
      ? { ...questionData, options: JSON.stringify(questionData.options) }
      : questionData;
    const { error } = await supabase.from('quiz_questions').update(payload).eq('id', id);
    if (error) throw error;
    set((s) => ({
      currentQuestions: s.currentQuestions.map((q) => q.id === id ? { ...q, ...questionData } : q),
    }));
  },

  deleteQuestion: async (id) => {
    const question = get().currentQuestions.find((q) => q.id === id);
    const { error } = await supabase.from('quiz_questions').delete().eq('id', id);
    if (error) throw error;
    set((s) => ({
      currentQuestions: s.currentQuestions.filter((q) => q.id !== id),
      quizzes: s.quizzes.map((quiz) =>
        quiz.id === question?.quiz_id
          ? { ...quiz, questions_count: Math.max(0, (quiz.questions_count || 1) - 1) }
          : quiz
      ),
    }));
  },

  submitAttempt: async (userId, quizId, answers, questions, passScore, timeSpent) => {
    // Calculate score
    let correct = 0;
    answers.forEach((a) => {
      const q = questions.find((q) => q.id === a.question_id);
      if (q && a.selected === q.correct_index) correct++;
    });
    const score = questions.length > 0 ? Math.round((correct / questions.length) * 100) : 0;
    const passed = score >= passScore;

    const { data, error } = await supabase
      .from('quiz_attempts')
      .insert({
        user_id: userId,
        quiz_id: quizId,
        answers: JSON.stringify(answers),
        score,
        passed,
        time_spent_seconds: timeSpent,
      })
      .select()
      .single();
    if (error) throw error;

    const attempt = { ...data, answers };
    set((s) => ({ attempts: [attempt, ...s.attempts] }));
    return attempt;
  },

  getBestAttempt: (quizId) => {
    const relevant = get().attempts.filter((a) => a.quiz_id === quizId);
    if (!relevant.length) return undefined;
    return relevant.reduce((best, a) => a.score > best.score ? a : best);
  },
}));
