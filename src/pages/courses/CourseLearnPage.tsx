import { useState, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate, Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, CheckCircle, Circle, Menu, ArrowLeft, BookOpen, Clock } from 'lucide-react';
import { useCourseStore } from '@/store/courseStore';
import { useAuthStore } from '@/store/authStore';
import { useUIStore } from '@/store/uiStore';
import { useQuizStore } from '@/store/quizStore';
import { Button } from '@/components/ui/Button';
import { Progress } from '@/components/ui/Progress';
import { Spinner } from '@/components/ui/Spinner';
import { cn, toYouTubeEmbedUrl } from '@/lib/utils';
import type { Course, Lesson } from '@/types';

export function CourseLearnPage() {
  const { id } = useParams<{ id: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const {
    fetchCourseById, fetchLessons, fetchLessonProgress,
    lessonProgress, markLessonComplete, getCourseProgress
  } = useCourseStore();
  const { fetchQuizzesByCourse } = useQuizStore();
  const { toast } = useUIStore();

  const [course, setCourse] = useState<Course | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [currentLesson, setCurrentLesson] = useState<Lesson | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [completing, setCompleting] = useState(false);

  const lessonId = searchParams.get('lesson');
  const progress = id ? getCourseProgress(id, lessons.length) : 0;

  useEffect(() => {
    if (!id || !user) return;

    (async () => {
      setIsLoading(true);
      const [courseData, lessonsData] = await Promise.all([
        fetchCourseById(id),
        fetchLessons(id),
      ]);

      if (!courseData) {
        navigate('/courses');
        return;
      }

      setCourse(courseData);
      setLessons(lessonsData);

      await fetchLessonProgress(user.id, id);
      await fetchQuizzesByCourse(id);

      // Set current lesson
      if (lessonId) {
        const lesson = lessonsData.find((l) => l.id === lessonId);
        setCurrentLesson(lesson || lessonsData[0] || null);
      } else {
        setCurrentLesson(lessonsData[0] || null);
      }

      setIsLoading(false);
    })();
  }, [id, user]);

  const selectLesson = (lesson: Lesson) => {
    setCurrentLesson(lesson);
    setSearchParams({ lesson: lesson.id });
  };

  const handleComplete = async () => {
    if (!user || !currentLesson || !id) return;
    setCompleting(true);
    try {
      await markLessonComplete(user.id, currentLesson.id, id);
      toast.success('Đã hoàn thành bài học!');

      // Auto advance to next lesson
      const idx = lessons.findIndex((l) => l.id === currentLesson.id);
      if (idx < lessons.length - 1) {
        selectLesson(lessons[idx + 1]);
      }
    } catch {
      toast.error('Có lỗi xảy ra');
    } finally {
      setCompleting(false);
    }
  };

  const currentIndex = lessons.findIndex((l) => l.id === currentLesson?.id);
  const isCurrentCompleted = lessonProgress.some(
    (p) => p.lesson_id === currentLesson?.id && p.completed
  );

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!course) return null;

  return (
    <div className="flex h-[calc(100vh-64px)] bg-gray-50 dark:bg-gray-950">
      {/* Sidebar */}
      <aside
        className={cn(
          'fixed lg:relative inset-y-0 left-0 z-30 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 transition-all duration-300 flex flex-col',
          sidebarOpen ? 'w-72' : 'w-0 lg:w-12 overflow-hidden'
        )}
      >
        <div className={cn('flex-1 overflow-y-auto', !sidebarOpen && 'lg:hidden')}>
          {/* Sidebar Header */}
          <div className="p-4 border-b border-gray-100 dark:border-gray-800">
            <Link
              to={`/courses/${id}`}
              className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 mb-3"
            >
              <ArrowLeft className="h-4 w-4" />
              Thông tin khóa học
            </Link>
            <h2 className="font-semibold text-gray-900 dark:text-white text-sm leading-tight">{course.title}</h2>
            <div className="mt-2">
              <Progress value={progress} showLabel color="blue" />
            </div>
          </div>

          {/* Lesson List */}
          <div className="p-2">
            {lessons.map((lesson, index) => {
              const completed = lessonProgress.some(
                (p) => p.lesson_id === lesson.id && p.completed
              );
              const isCurrent = currentLesson?.id === lesson.id;

              return (
                <button
                  key={lesson.id}
                  onClick={() => selectLesson(lesson)}
                  className={cn(
                    'w-full text-left p-3 rounded-xl mb-1 flex items-start gap-3 transition-colors',
                    isCurrent
                      ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                  )}
                >
                  <div className="shrink-0 mt-0.5">
                    {completed ? (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    ) : (
                      <Circle className={cn('h-5 w-5', isCurrent ? 'text-blue-500' : 'text-gray-300 dark:text-gray-600')} />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium leading-snug truncate">
                      {index + 1}. {lesson.title}
                    </p>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{lesson.duration_minutes} phút</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Toggle button on desktop */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="hidden lg:flex absolute -right-4 top-1/2 -translate-y-1/2 w-8 h-8 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-full items-center justify-center shadow-sm hover:bg-gray-50 dark:hover:bg-gray-800 z-10"
          aria-label={sidebarOpen ? 'Thu sidebar' : 'Mở sidebar'}
        >
          {sidebarOpen ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
        </button>
      </aside>

      {/* Sidebar overlay on mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        {/* Top bar */}
        <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-4 py-3 flex items-center gap-3">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-1.5 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg lg:hidden"
          >
            <Menu className="h-5 w-5" />
          </button>

          <div className="flex-1 min-w-0">
            <h1 className="font-semibold text-gray-900 dark:text-white truncate text-sm sm:text-base">
              {currentLesson?.title || 'Chọn bài học'}
            </h1>
            {currentLesson && (
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Bài {currentIndex + 1}/{lessons.length} • {currentLesson.duration_minutes} phút
              </p>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={currentIndex <= 0}
              onClick={() => currentIndex > 0 && selectLesson(lessons[currentIndex - 1])}
            >
              <ChevronLeft className="h-4 w-4" />
              <span className="hidden sm:inline">Trước</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={currentIndex >= lessons.length - 1}
              onClick={() => currentIndex < lessons.length - 1 && selectLesson(lessons[currentIndex + 1])}
            >
              <span className="hidden sm:inline">Tiếp</span>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Lesson Content */}
        {!currentLesson ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <BookOpen className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
              <p className="text-gray-500 dark:text-gray-400">Chọn một bài học để bắt đầu</p>
            </div>
          </div>
        ) : (
          <div className="max-w-3xl mx-auto px-4 py-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{currentLesson.title}</h2>
            <div className="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400 mb-6">
              <span className="flex items-center gap-1.5">
                <Clock className="h-4 w-4" />
                {currentLesson.duration_minutes} phút
              </span>
              {isCurrentCompleted && (
                <span className="flex items-center gap-1.5 text-green-600">
                  <CheckCircle className="h-4 w-4" />
                  Đã hoàn thành
                </span>
              )}
            </div>

            {/* Video */}
            {currentLesson.video_url ? (() => {
              const embedUrl = toYouTubeEmbedUrl(currentLesson.video_url);
              return embedUrl ? (
                <div className="aspect-video bg-black rounded-xl mb-6 overflow-hidden">
                  <iframe
                    src={embedUrl}
                    className="w-full h-full"
                    allowFullScreen
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    title={currentLesson.title}
                  />
                </div>
              ) : (
                /* Link không phải YouTube — thử nhúng trực tiếp */
                <div className="aspect-video bg-black rounded-xl mb-6 overflow-hidden">
                  <iframe
                    src={currentLesson.video_url}
                    className="w-full h-full"
                    allowFullScreen
                    title={currentLesson.title}
                  />
                </div>
              );
            })() : (
              <div className="aspect-video bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-950 dark:to-indigo-900 rounded-xl mb-6 flex items-center justify-center">
                <div className="text-center">
                  <BookOpen className="h-12 w-12 text-blue-400 mx-auto mb-2" />
                  <p className="text-blue-600 dark:text-blue-400 font-medium">Nội dung văn bản</p>
                </div>
              </div>
            )}

            {/* Content */}
            <div className="prose prose-gray dark:prose-invert max-w-none">
              <div
                className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap text-base"
                dangerouslySetInnerHTML={{ __html: currentLesson.content.replace(/\n/g, '<br/>') }}
              />
            </div>

            {/* Complete Button */}
            <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-800 flex items-center justify-between">
              <Button
                variant="outline"
                disabled={currentIndex <= 0}
                onClick={() => currentIndex > 0 && selectLesson(lessons[currentIndex - 1])}
              >
                <ChevronLeft className="h-4 w-4" /> Bài trước
              </Button>

              {isCurrentCompleted ? (
                <div className="flex items-center gap-2 text-green-600">
                  <CheckCircle className="h-5 w-5" />
                  <span className="font-medium">Đã hoàn thành</span>
                </div>
              ) : (
                <Button onClick={handleComplete} isLoading={completing}>
                  <CheckCircle className="h-4 w-4" />
                  Đánh dấu hoàn thành
                </Button>
              )}

              <Button
                variant="outline"
                disabled={currentIndex >= lessons.length - 1}
                onClick={() => currentIndex < lessons.length - 1 && selectLesson(lessons[currentIndex + 1])}
              >
                Bài tiếp <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
