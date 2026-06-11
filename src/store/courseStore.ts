import { create } from 'zustand';
import { supabase } from '@/lib/supabase';
import type { Course, Lesson, Enrollment, LessonProgress } from '@/types';

interface CourseState {
  courses: Course[];
  myCourses: Course[];
  enrollments: Enrollment[];
  lessonProgress: LessonProgress[];
  isLoading: boolean;
  error: string | null;

  fetchCourses: (filters?: { category?: string; level?: string; search?: string }) => Promise<void>;
  fetchMyCourses: (userId: string) => Promise<void>;
  fetchCourseById: (id: string) => Promise<Course | null>;
  fetchLessons: (courseId: string) => Promise<Lesson[]>;
  createCourse: (data: Omit<Course, 'id' | 'created_at' | 'updated_at'>) => Promise<Course>;
  updateCourse: (id: string, data: Partial<Course>) => Promise<void>;
  deleteCourse: (id: string) => Promise<void>;
  createLesson: (data: Omit<Lesson, 'id' | 'created_at'>) => Promise<Lesson>;
  updateLesson: (id: string, data: Partial<Lesson>) => Promise<void>;
  deleteLesson: (id: string) => Promise<void>;
  fetchEnrollments: (userId: string) => Promise<void>;
  enrollCourse: (userId: string, courseId: string) => Promise<void>;
  unenrollCourse: (userId: string, courseId: string) => Promise<void>;
  fetchLessonProgress: (userId: string, courseId: string) => Promise<void>;
  markLessonComplete: (userId: string, lessonId: string, courseId: string) => Promise<void>;
  isEnrolled: (courseId: string) => boolean;
  getCourseProgress: (courseId: string, totalLessons: number) => number;
}

export const useCourseStore = create<CourseState>((set, get) => ({
  courses: [],
  myCourses: [],
  enrollments: [],
  lessonProgress: [],
  isLoading: false,
  error: null,

  fetchCourses: async (filters) => {
    set({ isLoading: true, error: null });
    try {
      let query = supabase
        .from('courses')
        .select(`
          *,
          instructor:profiles(id, full_name, avatar_url),
          lessons_count:lessons(count)
        `)
        .eq('status', 'published')
        .order('created_at', { ascending: false });

      if (filters?.category) query = query.eq('category', filters.category);
      if (filters?.level) query = query.eq('level', filters.level);
      if (filters?.search) query = query.ilike('title', `%${filters.search}%`);

      const { data, error } = await query;
      if (error) throw error;

      const courses = (data || []).map((c) => ({
        ...c,
        lessons_count: c.lessons_count?.[0]?.count || 0,
      }));

      set({ courses });
    } catch (err) {
      set({ error: err instanceof Error ? err.message : 'Lỗi tải khóa học' });
    } finally {
      set({ isLoading: false });
    }
  },

  fetchMyCourses: async (userId) => {
    set({ isLoading: true });
    try {
      const { data, error } = await supabase
        .from('courses')
        .select(`
          *,
          lessons_count:lessons(count)
        `)
        .eq('instructor_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const myCourses = (data || []).map((c) => ({
        ...c,
        lessons_count: c.lessons_count?.[0]?.count || 0,
      }));

      set({ myCourses });
    } finally {
      set({ isLoading: false });
    }
  },

  fetchCourseById: async (id) => {
    try {
      const { data, error } = await supabase
        .from('courses')
        .select(`
          *,
          instructor:profiles(id, full_name, avatar_url),
          lessons_count:lessons(count)
        `)
        .eq('id', id)
        .single();

      if (error) return null;
      return {
        ...data,
        lessons_count: data.lessons_count?.[0]?.count || 0,
      };
    } catch {
      return null;
    }
  },

  fetchLessons: async (courseId) => {
    const { data } = await supabase
      .from('lessons')
      .select('*')
      .eq('course_id', courseId)
      .order('order_index');
    return data || [];
  },

  createCourse: async (courseData) => {
    const { data, error } = await supabase
      .from('courses')
      .insert(courseData)
      .select()
      .single();

    if (error) throw error;

    const { myCourses } = get();
    set({ myCourses: [data, ...myCourses] });
    return data;
  },

  updateCourse: async (id, courseData) => {
    const { error } = await supabase
      .from('courses')
      .update({ ...courseData, updated_at: new Date().toISOString() })
      .eq('id', id);

    if (error) throw error;

    set((state) => ({
      myCourses: state.myCourses.map((c) =>
        c.id === id ? { ...c, ...courseData } : c
      ),
      courses: state.courses.map((c) =>
        c.id === id ? { ...c, ...courseData } : c
      ),
    }));
  },

  deleteCourse: async (id) => {
    const { error } = await supabase.from('courses').delete().eq('id', id);
    if (error) throw error;

    set((state) => ({
      myCourses: state.myCourses.filter((c) => c.id !== id),
      courses: state.courses.filter((c) => c.id !== id),
    }));
  },

  createLesson: async (lessonData) => {
    const { data, error } = await supabase
      .from('lessons')
      .insert(lessonData)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  updateLesson: async (id, lessonData) => {
    const { error } = await supabase
      .from('lessons')
      .update(lessonData)
      .eq('id', id);
    if (error) throw error;
  },

  deleteLesson: async (id) => {
    const { error } = await supabase.from('lessons').delete().eq('id', id);
    if (error) throw error;
  },

  fetchEnrollments: async (userId) => {
    const { data } = await supabase
      .from('enrollments')
      .select(`*, course:courses(*)`)
      .eq('user_id', userId);

    const enrollments = (data || []).map((e) => ({
      ...e,
      completed_lessons: [],
      progress_percentage: 0,
    }));
    set({ enrollments });
  },

  enrollCourse: async (userId, courseId) => {
    const { error } = await supabase
      .from('enrollments')
      .insert({ user_id: userId, course_id: courseId });

    if (error) throw error;
    await get().fetchEnrollments(userId);
  },

  unenrollCourse: async (userId, courseId) => {
    await supabase
      .from('enrollments')
      .delete()
      .eq('user_id', userId)
      .eq('course_id', courseId);

    set((state) => ({
      enrollments: state.enrollments.filter((e) => e.course_id !== courseId),
    }));
  },

  fetchLessonProgress: async (userId, courseId) => {
    const { data } = await supabase
      .from('lesson_progress')
      .select('*')
      .eq('user_id', userId)
      .eq('course_id', courseId);
    set({ lessonProgress: data || [] });
  },

  markLessonComplete: async (userId, lessonId, courseId) => {
    const { error } = await supabase.from('lesson_progress').upsert({
      user_id: userId,
      lesson_id: lessonId,
      course_id: courseId,
      completed: true,
      completed_at: new Date().toISOString(),
    });

    if (!error) {
      set((state) => {
        const existing = state.lessonProgress.find((p) => p.lesson_id === lessonId);
        if (existing) {
          return {
            lessonProgress: state.lessonProgress.map((p) =>
              p.lesson_id === lessonId ? { ...p, completed: true } : p
            ),
          };
        }
        return {
          lessonProgress: [
            ...state.lessonProgress,
            {
              id: lessonId,
              user_id: userId,
              lesson_id: lessonId,
              course_id: courseId,
              completed: true,
              completed_at: new Date().toISOString(),
            },
          ],
        };
      });
    }
  },

  isEnrolled: (courseId) => {
    return get().enrollments.some((e) => e.course_id === courseId);
  },

  getCourseProgress: (courseId, totalLessons) => {
    if (totalLessons === 0) return 0;
    const completed = get().lessonProgress.filter(
      (p) => p.course_id === courseId && p.completed
    ).length;
    return Math.round((completed / totalLessons) * 100);
  },
}));
