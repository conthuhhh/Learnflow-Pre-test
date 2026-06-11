import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft, Clock, CheckCircle, XCircle, Trophy,
  ChevronLeft, ChevronRight, Flag, RotateCcw, AlertCircle, Target
} from 'lucide-react';
import { useQuizStore } from '@/store/quizStore';
import { useAuthStore } from '@/store/authStore';
import { useUIStore } from '@/store/uiStore';
import { Button } from '@/components/ui/Button';
import { Progress } from '@/components/ui/Progress';
import { Spinner } from '@/components/ui/Spinner';
import { cn } from '@/lib/utils';
import type { Quiz, QuizQuestion, QuizAnswer } from '@/types';

const LABELS = ['A', 'B', 'C', 'D'];

// ─── Result Screen ────────────────────────────────────────────────────────────
function ResultScreen({ quiz, questions, answers, score, passed, timeSpent, onRetry, courseId }: {
  quiz: Quiz; questions: QuizQuestion[]; answers: QuizAnswer[];
  score: number; passed: boolean; timeSpent: number;
  onRetry: () => void; courseId: string;
}) {
  const [showReview, setShowReview] = useState(false);
  const correct = answers.filter((a) => {
    const q = questions.find((q) => q.id === a.question_id);
    return q && a.selected === q.correct_index;
  }).length;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center p-4">
      <div className="max-w-lg w-full">
        <div className={`rounded-3xl p-8 text-center mb-4 ${passed ? 'bg-gradient-to-br from-green-500 to-emerald-600' : 'bg-gradient-to-br from-red-500 to-rose-600'}`}>
          <div className="w-20 h-20 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
            {passed ? <Trophy className="h-10 w-10 text-white" /> : <XCircle className="h-10 w-10 text-white" />}
          </div>
          <h2 className="text-3xl font-bold text-white mb-1">{passed ? 'Xuất sắc! 🎉' : 'Chưa đạt 😅'}</h2>
          <p className="text-white/80 text-sm mb-6">
            {passed ? 'Bạn đã vượt qua bài kiểm tra' : `Cần đạt ${quiz.pass_score}% để qua`}
          </p>
          <div className="bg-white/20 rounded-2xl px-6 py-4 inline-block">
            <span className="text-5xl font-bold text-white">{score}%</span>
          </div>
          <div className="grid grid-cols-3 gap-3 mt-6">
            {[
              { label: 'Đúng', value: `${correct}/${questions.length}` },
              { label: 'Sai', value: `${questions.length - correct}` },
              { label: 'Thời gian', value: `${Math.floor(timeSpent / 60)}:${String(timeSpent % 60).padStart(2, '0')}` },
            ].map(({ label, value }) => (
              <div key={label} className="bg-white/10 rounded-xl p-3">
                <div className="text-xl font-bold text-white">{value}</div>
                <div className="text-xs text-white/70 mt-0.5">{label}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex gap-3 mb-4">
          <Button variant="outline" className="flex-1" onClick={onRetry}>
            <RotateCcw className="h-4 w-4" /> Làm lại
          </Button>
          <Link to={`/courses/${courseId}/learn`} className="flex-1">
            <Button className="w-full">Về khóa học</Button>
          </Link>
        </div>

        <button onClick={() => setShowReview(!showReview)}
          className="w-full text-center text-sm text-blue-600 dark:text-blue-400 hover:underline mb-4">
          {showReview ? 'Ẩn đáp án' : 'Xem lại đáp án'}
        </button>

        {showReview && (
          <div className="space-y-4">
            {questions.map((q, idx) => {
              const answer = answers.find((a) => a.question_id === q.id);
              const selected = answer?.selected ?? -1;
              const isCorrect = selected === q.correct_index;
              return (
                <div key={q.id} className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-4">
                  <div className="flex items-start gap-2 mb-3">
                    {isCorrect ? <CheckCircle className="h-5 w-5 text-green-500 shrink-0 mt-0.5" /> : <XCircle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />}
                    <p className="font-medium text-gray-900 dark:text-white text-sm">
                      <span className="text-blue-600 dark:text-blue-400 mr-1">Câu {idx + 1}.</span>{q.question}
                    </p>
                  </div>
                  <div className="space-y-1.5 ml-7">
                    {q.options.map((opt, i) => (
                      <div key={i} className={cn('text-xs px-3 py-2 rounded-lg flex items-center gap-2',
                        i === q.correct_index ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                        : i === selected && !isCorrect ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                        : 'bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-300')}>
                        <span className="font-bold">{LABELS[i]}.</span> {opt}
                        {i === q.correct_index && <span className="ml-auto">✓</span>}
                        {i === selected && !isCorrect && <span className="ml-auto">✗</span>}
                      </div>
                    ))}
                    {q.explanation && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 italic flex items-start gap-1">
                        <AlertCircle className="h-3 w-3 mt-0.5 shrink-0" />{q.explanation}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Main Quiz Page ───────────────────────────────────────────────────────────
export function QuizPage() {
  const { courseId, quizId } = useParams<{ courseId: string; quizId: string }>();
  const { user } = useAuthStore();
  const { fetchQuizById, fetchQuestions, submitAttempt, fetchAttempts, getBestAttempt, currentQuestions, attempts } = useQuizStore();
  const { toast } = useUIStore();

  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [pageLoading, setPageLoading] = useState(true);
  const [started, setStarted] = useState(false);
  const [done, setDone] = useState(false);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [currentIdx, setCurrentIdx] = useState(0);
  const [result, setResult] = useState<{ score: number; passed: boolean; answers: QuizAnswer[]; timeSpent: number } | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Timer state — only runs when started
  const [elapsed, setElapsed] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const submittingRef = useRef(false);

  // Use ref for questions to avoid stale closure in timer
  const questionsRef = useRef(currentQuestions);
  useEffect(() => { questionsRef.current = currentQuestions; }, [currentQuestions]);
  const answersRef = useRef(answers);
  useEffect(() => { answersRef.current = answers; }, [answers]);

  useEffect(() => {
    if (!quizId || !courseId || !user) return;
    (async () => {
      const [q] = await Promise.all([
        fetchQuizById(quizId),
        fetchAttempts(user.id, quizId),
      ]);
      setQuiz(q);
      setPageLoading(false);
    })();
  }, [quizId, courseId, user]);

  // Start timer when quiz starts
  useEffect(() => {
    if (!started || done) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }
    setElapsed(0);
    timerRef.current = setInterval(() => {
      setElapsed((prev) => {
        const next = prev + 1;
        // Check time limit
        if (quiz?.time_limit_minutes && next >= quiz.time_limit_minutes * 60) {
          clearInterval(timerRef.current!);
          if (!submittingRef.current) {
            toast.warning('Hết giờ! Tự động nộp bài.');
            doSubmit(next, true);
          }
        }
        return next;
      });
    }, 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [started, done]);

  const doSubmit = useCallback(async (timeSpent: number, auto = false) => {
    if (!user || !quiz || submittingRef.current) return;
    const currentQs = questionsRef.current;
    const currentAs = answersRef.current;

    if (!auto) {
      const unanswered = currentQs.filter((q) => currentAs[q.id] === undefined).length;
      if (unanswered > 0 && !confirm(`Bạn còn ${unanswered} câu chưa trả lời. Nộp bài?`)) return;
    }

    submittingRef.current = true;
    setSubmitting(true);
    if (timerRef.current) clearInterval(timerRef.current);

    try {
      const finalAnswers: QuizAnswer[] = currentQs.map((q) => ({
        question_id: q.id,
        selected: currentAs[q.id] ?? -1,
      }));
      const attempt = await submitAttempt(user.id, quiz.id, finalAnswers, currentQs, quiz.pass_score, timeSpent);
      await fetchAttempts(user.id, quiz.id);
      setResult({ score: attempt.score, passed: attempt.passed, answers: finalAnswers, timeSpent });
      setDone(true);
    } catch {
      toast.error('Có lỗi khi nộp bài');
    } finally {
      submittingRef.current = false;
      setSubmitting(false);
    }
  }, [user, quiz, submitAttempt, fetchAttempts, toast]);

  const handleStart = async () => {
    if (!quizId) return;
    await fetchQuestions(quizId);
    setAnswers({});
    setCurrentIdx(0);
    setDone(false);
    setResult(null);
    submittingRef.current = false;
    setStarted(true);
  };

  const handleRetry = async () => {
    setStarted(false);
    setDone(false);
    setResult(null);
    setAnswers({});
    setElapsed(0);
    await handleStart();
  };

  const questions = currentQuestions;
  const bestAttempt = quizId ? getBestAttempt(quizId) : undefined;
  const answeredCount = Object.keys(answers).length;
  const currentQuestion = questions[currentIdx];

  // Timer display
  const remaining = quiz?.time_limit_minutes ? quiz.time_limit_minutes * 60 - elapsed : null;
  const displayMinutes = remaining !== null ? Math.floor(remaining / 60) : Math.floor(elapsed / 60);
  const displaySeconds = remaining !== null ? remaining % 60 : elapsed % 60;
  const isWarning = remaining !== null && remaining <= 60;

  if (pageLoading) {
    return <div className="flex justify-center items-center min-h-screen"><Spinner size="lg" /></div>;
  }

  if (!quiz) {
    return (
      <div className="max-w-lg mx-auto px-4 py-12 text-center">
        <p className="text-gray-500 dark:text-gray-400">Không tìm thấy quiz</p>
        <Link to={`/courses/${courseId}/learn`}>
          <Button variant="outline" className="mt-4"><ArrowLeft className="h-4 w-4" /> Quay lại</Button>
        </Link>
      </div>
    );
  }

  // Result screen
  if (done && result) {
    return (
      <ResultScreen
        quiz={quiz} questions={questions}
        answers={result.answers} score={result.score}
        passed={result.passed} timeSpent={result.timeSpent}
        onRetry={handleRetry} courseId={courseId!}
      />
    );
  }

  // Start screen
  if (!started) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <Link to={`/courses/${courseId}/learn`}
            className="inline-flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 mb-6">
            <ArrowLeft className="h-4 w-4" /> Về khóa học
          </Link>

          <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-200 dark:border-gray-800 p-8 shadow-sm">
            <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center mb-5">
              <Flag className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{quiz.title}</h1>
            {quiz.description && (
              <p className="text-gray-500 dark:text-gray-400 mb-5 text-sm">{quiz.description}</p>
            )}

            <div className="space-y-3 mb-6">
              {[
                { icon: Flag, label: 'Số câu hỏi', value: `${quiz.questions_count || '?'} câu` },
                { icon: Target, label: 'Điểm qua', value: `${quiz.pass_score}%` },
                { icon: Clock, label: 'Thời gian', value: quiz.time_limit_minutes ? `${quiz.time_limit_minutes} phút` : 'Không giới hạn' },
              ].map(({ icon: Icon, label, value }) => (
                <div key={label} className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-800 last:border-0">
                  <span className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <Icon className="h-4 w-4" /> {label}
                  </span>
                  <span className="font-semibold text-gray-900 dark:text-white text-sm">{value}</span>
                </div>
              ))}
            </div>

            {bestAttempt && (
              <div className={`rounded-xl p-3 mb-4 text-sm ${bestAttempt.passed ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400' : 'bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-400'}`}>
                <span className="font-medium">Điểm cao nhất: {bestAttempt.score}%</span>{' · '}
                {bestAttempt.passed ? '✅ Đã qua' : '❌ Chưa qua'}
              </div>
            )}

            {attempts.length > 0 && (
              <div className="mb-6">
                <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2">
                  Lịch sử ({attempts.length} lần)
                </p>
                <div className="space-y-1.5 max-h-36 overflow-y-auto">
                  {attempts.map((a, idx) => (
                    <div key={a.id} className="flex items-center justify-between px-3 py-2 bg-gray-50 dark:bg-gray-800 rounded-lg text-xs">
                      <span className="text-gray-600 dark:text-gray-400">
                        Lần {attempts.length - idx} · {new Date(a.completed_at).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className={`font-bold ${a.passed ? 'text-green-600 dark:text-green-400' : 'text-red-500 dark:text-red-400'}`}>{a.score}%</span>
                        <span>{a.passed ? '✅' : '❌'}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <Button className="w-full" size="lg" onClick={handleStart}>
              {bestAttempt ? 'Làm lại' : 'Bắt đầu làm bài'}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Quiz screen
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col">
      {/* Top bar */}
      <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-4 py-3 sticky top-0 z-10">
        <div className="max-w-3xl mx-auto flex items-center gap-4">
          <div className="flex-1">
            <p className="font-semibold text-gray-900 dark:text-white text-sm truncate">{quiz.title}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">{answeredCount}/{questions.length} đã trả lời</p>
          </div>

          {quiz.time_limit_minutes && (
            <div className={cn('flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-semibold',
              isWarning ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 animate-pulse'
              : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300')}>
              <Clock className="h-4 w-4" />
              {String(displayMinutes).padStart(2, '0')}:{String(displaySeconds).padStart(2, '0')}
            </div>
          )}

          <Button size="sm" onClick={() => doSubmit(elapsed)} isLoading={submitting}>
            <Flag className="h-4 w-4" /> Nộp bài
          </Button>
        </div>
        <div className="max-w-3xl mx-auto mt-2">
          <Progress value={answeredCount} max={questions.length} color="blue" />
        </div>
      </div>

      {/* Question */}
      <div className="flex-1 max-w-3xl mx-auto w-full px-4 py-8">
        {currentQuestion ? (
          <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-200 dark:border-gray-800 p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-5">
              <span className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white font-bold text-sm shrink-0">
                {currentIdx + 1}
              </span>
              <p className="text-base font-semibold text-gray-900 dark:text-white leading-snug">
                {currentQuestion.question}
              </p>
            </div>

            <div className="space-y-3">
              {currentQuestion.options.map((opt, i) => {
                const selected = answers[currentQuestion.id] === i;
                return (
                  <button key={i} onClick={() => setAnswers((prev) => ({ ...prev, [currentQuestion.id]: i }))}
                    className={cn('w-full text-left px-4 py-3.5 rounded-xl border-2 transition-all flex items-center gap-3',
                      selected ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                      : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600')}>
                    <span className={cn('w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold shrink-0',
                      selected ? 'bg-blue-500 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400')}>
                      {LABELS[i]}
                    </span>
                    <span className="text-sm">{opt}</span>
                  </button>
                );
              })}
            </div>

            <div className="flex items-center justify-between mt-6 pt-5 border-t border-gray-100 dark:border-gray-800">
              <Button variant="outline" disabled={currentIdx === 0} onClick={() => setCurrentIdx(currentIdx - 1)}>
                <ChevronLeft className="h-4 w-4" /> Trước
              </Button>

              <div className="flex gap-1.5 flex-wrap justify-center max-w-xs">
                {questions.map((q, i) => (
                  <button key={q.id} onClick={() => setCurrentIdx(i)}
                    className={cn('w-7 h-7 rounded-lg text-xs font-medium transition-colors',
                      i === currentIdx ? 'bg-blue-600 text-white'
                      : answers[q.id] !== undefined ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700')}>
                    {i + 1}
                  </button>
                ))}
              </div>

              {currentIdx < questions.length - 1 ? (
                <Button onClick={() => setCurrentIdx(currentIdx + 1)}>
                  Tiếp <ChevronRight className="h-4 w-4" />
                </Button>
              ) : (
                <Button onClick={() => doSubmit(elapsed)} isLoading={submitting}>
                  <Flag className="h-4 w-4" /> Nộp bài
                </Button>
              )}
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <Spinner />
            <p className="text-gray-500 dark:text-gray-400 mt-3">Đang tải câu hỏi...</p>
          </div>
        )}
      </div>
    </div>
  );
}
