import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  BookOpen, Brain, Clock, TrendingUp, ArrowRight,
  Play, Plus, BarChart2
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useCourseStore } from '@/store/courseStore';
import { useFlashcardStore } from '@/store/flashcardStore';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Progress } from '@/components/ui/Progress';
import { Badge } from '@/components/ui/Badge';
import { Spinner } from '@/components/ui/Spinner';
import { formatRelativeTime, getLevelLabel, getLevelColor } from '@/lib/utils';

// ─── Student Dashboard ────────────────────────────────────────────────────────
function StudentDashboard() {
  const { user } = useAuthStore();
  const { enrollments, fetchEnrollments, isLoading: coursesLoading } = useCourseStore();
  const { decks, fetchDecks, getDueCards, isLoading: cardsLoading } = useFlashcardStore();

  useEffect(() => {
    if (!user) return;
    fetchEnrollments(user.id);
    fetchDecks(user.id);
  }, [user, fetchEnrollments, fetchDecks]);

  const totalDueCards = decks.reduce((acc, d) => acc + getDueCards(d.id).length, 0);
  const completedCourses = enrollments.filter((e) => e.progress_percentage >= 100).length;
  const isLoading = coursesLoading || cardsLoading;

  const stats = [
    { label: 'Khóa học đang học', value: enrollments.length, icon: BookOpen, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Bộ Flashcard', value: decks.length, icon: Brain, color: 'text-purple-600', bg: 'bg-purple-50' },
    { label: 'Thẻ cần ôn hôm nay', value: totalDueCards, icon: Clock, color: 'text-orange-600', bg: 'bg-orange-50' },
    { label: 'Khóa học hoàn thành', value: completedCourses, icon: TrendingUp, color: 'text-green-600', bg: 'bg-green-50' },
  ];

  return (
    <>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Xin chào, {user?.full_name?.split(' ').pop() || 'bạn'} 👋
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Tiếp tục hành trình học tập hôm nay</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map(({ label, value, icon: Icon, color, bg }) => (
          <Card key={label}>
            <CardContent className="p-5">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center shrink-0`}>
                  <Icon className={`h-5 w-5 ${color}`} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Enrolled Courses */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Khóa học của tôi</h2>
            <Link to="/courses">
              <Button variant="ghost" size="sm">Xem tất cả <ArrowRight className="h-4 w-4" /></Button>
            </Link>
          </div>
          {isLoading ? (
            <div className="flex justify-center py-12"><Spinner /></div>
          ) : enrollments.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <BookOpen className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <h3 className="font-medium text-gray-900 dark:text-white mb-1">Chưa đăng ký khóa học nào</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Khám phá các khóa học phù hợp</p>
                <Link to="/courses"><Button size="sm">Khám phá ngay</Button></Link>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {enrollments.slice(0, 5).map((enrollment) => {
                const course = enrollment.course as { title: string; level: string } | undefined;
                if (!course) return null;
                return (
                  <Card hover key={enrollment.id}>
                    <Link to={`/courses/${enrollment.course_id}/learn`}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <h3 className="font-medium text-gray-900 dark:text-white truncate">{course.title}</h3>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge className={getLevelColor(course.level)}>
                                {getLevelLabel(course.level)}
                              </Badge>
                              <span className="text-xs text-gray-500 dark:text-gray-400">
                                {formatRelativeTime(enrollment.enrolled_at)}
                              </span>
                            </div>
                            <div className="mt-2">
                              <Progress value={enrollment.progress_percentage} showLabel color="blue" />
                            </div>
                          </div>
                          <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center shrink-0">
                            <Play className="h-4 w-4 text-blue-600" />
                          </div>
                        </div>
                      </CardContent>
                    </Link>
                  </Card>
                );
              })}
            </div>
          )}
        </div>

        {/* Flashcard Decks */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Bộ Flashcard</h2>
            <Link to="/flashcards">
              <Button variant="ghost" size="sm">Xem tất cả <ArrowRight className="h-4 w-4" /></Button>
            </Link>
          </div>
          {decks.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center">
                <Brain className="h-10 w-10 text-gray-300 mx-auto mb-2" />
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">Chưa có bộ thẻ nào</p>
                <Link to="/flashcards">
                  <Button size="sm" variant="outline">Tạo bộ thẻ</Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {decks.slice(0, 5).map((deck) => {
                const dueCount = getDueCards(deck.id).length;
                return (
                  <Card hover key={deck.id}>
                    <Link to={`/flashcards/${deck.id}`}>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <h3 className="font-medium text-gray-900 dark:text-white truncate text-sm">{deck.title}</h3>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{deck.cards_count || 0} thẻ</p>
                          </div>
                          {dueCount > 0 && (
                            <span className="bg-orange-100 text-orange-700 text-xs font-medium px-2 py-0.5 rounded-full shrink-0">
                              {dueCount} thẻ
                            </span>
                          )}
                        </div>
                        {dueCount > 0 && (
                          <Link to={`/flashcards/${deck.id}/study`} onClick={(e) => e.stopPropagation()}>
                            <Button size="sm" className="w-full mt-3">
                              <Play className="h-3 w-3" /> Ôn tập ngay
                            </Button>
                          </Link>
                        )}
                      </CardContent>
                    </Link>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

// ─── Instructor Dashboard ─────────────────────────────────────────────────────
function InstructorDashboard() {
  const { user } = useAuthStore();
  const { myCourses, fetchMyCourses, isLoading } = useCourseStore();

  useEffect(() => {
    if (user) fetchMyCourses(user.id);
  }, [user, fetchMyCourses]);

  const publishedCount = myCourses.filter((c) => c.status === 'published').length;
  const draftCount = myCourses.filter((c) => c.status === 'draft').length;
  const totalLessons = myCourses.reduce((s, c) => s + (c.lessons_count || 0), 0);

  const stats = [
    { label: 'Tổng khóa học', value: myCourses.length, icon: BookOpen, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Đã xuất bản', value: publishedCount, icon: TrendingUp, color: 'text-green-600', bg: 'bg-green-50' },
    { label: 'Đang nháp', value: draftCount, icon: Clock, color: 'text-yellow-600', bg: 'bg-yellow-50' },
    { label: 'Tổng bài học', value: totalLessons, icon: BarChart2, color: 'text-purple-600', bg: 'bg-purple-50' },
  ];

  return (
    <>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Xin chào, {user?.full_name?.split(' ').pop() || 'Giảng viên'} 👋
          </h1>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-gray-500 dark:text-gray-400">Trang quản lý giảng viên</span>
            <span className="bg-purple-100 text-purple-700 text-xs font-semibold px-2 py-0.5 rounded-full">
              Instructor
            </span>
          </div>
        </div>
        <Link to="/courses/manage">
          <Button>
            <Plus className="h-4 w-4" /> Tạo khóa học mới
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map(({ label, value, icon: Icon, color, bg }) => (
          <Card key={label}>
            <CardContent className="p-5">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center shrink-0`}>
                  <Icon className={`h-5 w-5 ${color}`} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Course List */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Khóa học của tôi</h2>
          <Link to="/courses/manage">
            <Button variant="outline" size="sm">
              Quản lý tất cả <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12"><Spinner /></div>
        ) : myCourses.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <BookOpen className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <h3 className="font-medium text-gray-900 dark:text-white mb-1">Chưa có khóa học nào</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Bắt đầu tạo khóa học đầu tiên</p>
              <Link to="/courses/manage">
                <Button size="sm"><Plus className="h-4 w-4" /> Tạo ngay</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {myCourses.slice(0, 6).map((course) => (
              <Card key={course.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-medium text-gray-900 dark:text-white truncate">{course.title}</h3>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium shrink-0 ${
                          course.status === 'published'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                        }`}>
                          {course.status === 'published' ? 'Đã xuất bản' : 'Nháp'}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
                        <span className={`px-2 py-0.5 rounded-full ${getLevelColor(course.level)}`}>
                          {getLevelLabel(course.level)}
                        </span>
                        <span className="flex items-center gap-1">
                          <BookOpen className="h-3 w-3" />
                          {course.lessons_count || 0} bài học
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <Link to={`/courses/${course.id}/lessons`}>
                        <Button variant="outline" size="sm">Bài học</Button>
                      </Link>
                      <Link to={`/courses/${course.id}`}>
                        <Button variant="ghost" size="sm">Xem</Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </>
  );
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────
export function DashboardPage() {
  const { user, isInstructor } = useAuthStore();

  if (!user) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {isInstructor() ? <InstructorDashboard /> : <StudentDashboard />}
    </div>
  );
}
