import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Plus, Edit2, Trash2, ArrowLeft, Save, ClipboardList,
  ChevronDown, ChevronUp, Clock, Target
} from 'lucide-react';
import { useQuizStore } from '@/store/quizStore';
import { useCourseStore } from '@/store/courseStore';
import { useUIStore } from '@/store/uiStore';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Modal } from '@/components/ui/Modal';
import { Card, CardContent } from '@/components/ui/Card';
import { Spinner } from '@/components/ui/Spinner';
import type { Quiz, QuizQuestion } from '@/types';

// ─── Quiz Form ────────────────────────────────────────────────────────────────
interface QuizFormData {
  title: string;
  description: string;
  time_limit_minutes: string;
  pass_score: string;
}

const defaultQuizForm: QuizFormData = {
  title: '', description: '', time_limit_minutes: '', pass_score: '70',
};

// ─── Question Form ────────────────────────────────────────────────────────────
interface QuestionFormData {
  question: string;
  options: [string, string, string, string];
  correct_index: number;
  explanation: string;
}

const defaultQForm: QuestionFormData = {
  question: '',
  options: ['', '', '', ''],
  correct_index: 0,
  explanation: '',
};

// ─── Main Component ───────────────────────────────────────────────────────────
export function QuizManagePage() {
  const { id: courseId } = useParams<{ id: string }>();
  const { fetchCourseById } = useCourseStore();
  const {
    quizzes, currentQuestions,
    fetchQuizzesByCourse, fetchQuestions,
    createQuiz, updateQuiz, deleteQuiz,
    addQuestion, updateQuestion, deleteQuestion,
    isLoading,
  } = useQuizStore();
  const { toast } = useUIStore();

  const [courseName, setCourseName] = useState('');
  const [pageLoading, setPageLoading] = useState(true);

  // Quiz modal
  const [showQuizModal, setShowQuizModal] = useState(false);
  const [editingQuiz, setEditingQuiz] = useState<Quiz | null>(null);
  const [quizForm, setQuizForm] = useState<QuizFormData>(defaultQuizForm);
  const [savingQuiz, setSavingQuiz] = useState(false);

  // Expanded quiz (show questions)
  const [expandedQuizId, setExpandedQuizId] = useState<string | null>(null);

  // Question modal
  const [showQModal, setShowQModal] = useState(false);
  const [editingQ, setEditingQ] = useState<QuizQuestion | null>(null);
  const [qForm, setQForm] = useState<QuestionFormData>(defaultQForm);
  const [savingQ, setSavingQ] = useState(false);
  const [activeQuizId, setActiveQuizId] = useState<string | null>(null);

  useEffect(() => {
    if (!courseId) return;
    (async () => {
      const course = await fetchCourseById(courseId);
      setCourseName(course?.title || '');
      await fetchQuizzesByCourse(courseId);
      setPageLoading(false);
    })();
  }, [courseId]);

  // ── Quiz actions ──
  const openCreateQuiz = () => {
    setEditingQuiz(null);
    setQuizForm(defaultQuizForm);
    setShowQuizModal(true);
  };

  const openEditQuiz = (quiz: Quiz) => {
    setEditingQuiz(quiz);
    setQuizForm({
      title: quiz.title,
      description: quiz.description,
      time_limit_minutes: quiz.time_limit_minutes?.toString() || '',
      pass_score: quiz.pass_score.toString(),
    });
    setShowQuizModal(true);
  };

  const handleSaveQuiz = async () => {
    if (!courseId || !quizForm.title.trim()) {
      toast.error('Vui lòng nhập tiêu đề quiz');
      return;
    }
    setSavingQuiz(true);
    try {
      const payload = {
        course_id: courseId,
        title: quizForm.title,
        description: quizForm.description,
        time_limit_minutes: quizForm.time_limit_minutes ? parseInt(quizForm.time_limit_minutes) : null,
        pass_score: parseInt(quizForm.pass_score) || 70,
      };
      if (editingQuiz) {
        await updateQuiz(editingQuiz.id, payload);
        toast.success('Cập nhật quiz thành công!');
      } else {
        await createQuiz(payload);
        toast.success('Tạo quiz thành công!');
      }
      setShowQuizModal(false);
    } catch { toast.error('Có lỗi xảy ra'); }
    finally { setSavingQuiz(false); }
  };

  const handleDeleteQuiz = async (quizId: string) => {
    if (!confirm('Xóa quiz này? Tất cả câu hỏi sẽ bị xóa.')) return;
    try {
      await deleteQuiz(quizId);
      toast.success('Đã xóa quiz');
    } catch { toast.error('Có lỗi xảy ra'); }
  };

  // ── Expand/load questions ──
  const toggleExpand = async (quizId: string) => {
    if (expandedQuizId === quizId) {
      setExpandedQuizId(null);
    } else {
      setExpandedQuizId(quizId);
      await fetchQuestions(quizId);
    }
  };

  // ── Question actions ──
  const openAddQuestion = (quizId: string) => {
    setActiveQuizId(quizId);
    setEditingQ(null);
    setQForm(defaultQForm);
    setShowQModal(true);
  };

  const openEditQuestion = (q: QuizQuestion) => {
    setEditingQ(q);
    setQForm({
      question: q.question,
      options: [...q.options] as [string, string, string, string],
      correct_index: q.correct_index,
      explanation: q.explanation,
    });
    setShowQModal(true);
  };

  const handleSaveQuestion = async () => {
    if (!qForm.question.trim() || qForm.options.some((o) => !o.trim())) {
      toast.error('Vui lòng điền đầy đủ câu hỏi và 4 đáp án');
      return;
    }
    setSavingQ(true);
    try {
      if (editingQ) {
        await updateQuestion(editingQ.id, {
          question: qForm.question,
          options: qForm.options,
          correct_index: qForm.correct_index,
          explanation: qForm.explanation,
        });
        toast.success('Cập nhật câu hỏi thành công!');
      } else if (activeQuizId) {
        await addQuestion({
          quiz_id: activeQuizId,
          question: qForm.question,
          options: qForm.options,
          correct_index: qForm.correct_index,
          explanation: qForm.explanation,
          order_index: currentQuestions.length,
        });
        toast.success('Thêm câu hỏi thành công!');
      }
      setShowQModal(false);
    } catch { toast.error('Có lỗi xảy ra'); }
    finally { setSavingQ(false); }
  };

  const handleDeleteQuestion = async (qId: string) => {
    if (!confirm('Xóa câu hỏi này?')) return;
    try {
      await deleteQuestion(qId);
      toast.success('Đã xóa câu hỏi');
    } catch { toast.error('Có lỗi xảy ra'); }
  };

  const LABELS = ['A', 'B', 'C', 'D'];

  if (pageLoading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Back */}
      <Link to="/courses/manage"
        className="inline-flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 mb-6">
        <ArrowLeft className="h-4 w-4" /> Quản lý khóa học
      </Link>

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Quản lý Quiz</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">{courseName}</p>
        </div>
        <Button onClick={openCreateQuiz}>
          <Plus className="h-4 w-4" /> Tạo quiz mới
        </Button>
      </div>

      {/* Quiz List */}
      {isLoading ? (
        <div className="flex justify-center py-12"><Spinner /></div>
      ) : quizzes.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <ClipboardList className="h-16 w-16 text-gray-200 dark:text-gray-700 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">Chưa có quiz nào</h3>
            <p className="text-gray-500 dark:text-gray-400 mt-1 mb-4">Tạo quiz để kiểm tra kiến thức học viên</p>
            <Button onClick={openCreateQuiz}><Plus className="h-4 w-4" /> Tạo ngay</Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {quizzes.map((quiz) => {
            const expanded = expandedQuizId === quiz.id;
            return (
              <Card key={quiz.id}>
                <CardContent className="p-5">
                  {/* Quiz header row */}
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => toggleExpand(quiz.id)}
                      className="flex-1 flex items-center gap-3 text-left"
                    >
                      <div className="w-10 h-10 bg-blue-50 dark:bg-blue-900/30 rounded-xl flex items-center justify-center shrink-0">
                        <ClipboardList className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 dark:text-white">{quiz.title}</h3>
                        <div className="flex items-center gap-3 mt-1 text-xs text-gray-500 dark:text-gray-400">
                          <span className="flex items-center gap-1">
                            <ClipboardList className="h-3 w-3" />
                            {quiz.questions_count || 0} câu hỏi
                          </span>
                          <span className="flex items-center gap-1">
                            <Target className="h-3 w-3" />
                            Qua: {quiz.pass_score}%
                          </span>
                          {quiz.time_limit_minutes && (
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {quiz.time_limit_minutes} phút
                            </span>
                          )}
                        </div>
                      </div>
                      {expanded
                        ? <ChevronUp className="h-4 w-4 text-gray-400 shrink-0" />
                        : <ChevronDown className="h-4 w-4 text-gray-400 shrink-0" />}
                    </button>
                    <div className="flex items-center gap-1 shrink-0">
                      <Button variant="ghost" size="sm" onClick={() => openEditQuiz(quiz)}>
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm"
                        className="text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
                        onClick={() => handleDeleteQuiz(quiz.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Expanded questions */}
                  {expanded && (
                    <div className="mt-4 border-t border-gray-100 dark:border-gray-800 pt-4">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-medium text-gray-700 dark:text-gray-300 text-sm">
                          Câu hỏi ({currentQuestions.filter(q => q.quiz_id === quiz.id).length})
                        </h4>
                        <Button size="sm" variant="outline" onClick={() => openAddQuestion(quiz.id)}>
                          <Plus className="h-3.5 w-3.5" /> Thêm câu hỏi
                        </Button>
                      </div>

                      {currentQuestions.filter(q => q.quiz_id === quiz.id).length === 0 ? (
                        <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
                          Chưa có câu hỏi nào. Nhấn "Thêm câu hỏi" để bắt đầu.
                        </p>
                      ) : (
                        <div className="space-y-3">
                          {currentQuestions
                            .filter(q => q.quiz_id === quiz.id)
                            .map((q, idx) => (
                            <div key={q.id}
                              className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4">
                              <div className="flex items-start justify-between gap-3">
                                <div className="flex-1 min-w-0">
                                  <p className="font-medium text-gray-900 dark:text-white text-sm">
                                    <span className="text-blue-600 dark:text-blue-400 mr-2">
                                      Câu {idx + 1}.
                                    </span>
                                    {q.question}
                                  </p>
                                  <div className="grid grid-cols-2 gap-1.5 mt-2">
                                    {q.options.map((opt, i) => (
                                      <div key={i} className={`text-xs px-3 py-1.5 rounded-lg flex items-center gap-1.5 ${
                                        i === q.correct_index
                                          ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 font-medium'
                                          : 'bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                                      }`}>
                                        <span className="font-semibold">{LABELS[i]}.</span> {opt}
                                        {i === q.correct_index && ' ✓'}
                                      </div>
                                    ))}
                                  </div>
                                  {q.explanation && (
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 italic">
                                      💡 {q.explanation}
                                    </p>
                                  )}
                                </div>
                                <div className="flex gap-1 shrink-0">
                                  <button onClick={() => openEditQuestion(q)}
                                    className="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors text-gray-500 dark:text-gray-400">
                                    <Edit2 className="h-3.5 w-3.5" />
                                  </button>
                                  <button onClick={() => handleDeleteQuestion(q.id)}
                                    className="p-1.5 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors text-gray-500 dark:text-gray-400 hover:text-red-500">
                                    <Trash2 className="h-3.5 w-3.5" />
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* ── Quiz Modal ── */}
      <Modal isOpen={showQuizModal} onClose={() => setShowQuizModal(false)}
        title={editingQuiz ? 'Sửa quiz' : 'Tạo quiz mới'} size="md">
        <div className="space-y-4">
          <Input label="Tiêu đề quiz" value={quizForm.title}
            onChange={(e) => setQuizForm({ ...quizForm, title: e.target.value })}
            placeholder="VD: Kiểm tra chương 1" required />
          <Textarea label="Mô tả (tùy chọn)" value={quizForm.description}
            onChange={(e) => setQuizForm({ ...quizForm, description: e.target.value })}
            placeholder="Mô tả nội dung quiz..." rows={2} />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Giới hạn thời gian (phút)"
              type="number" min={1} value={quizForm.time_limit_minutes}
              onChange={(e) => setQuizForm({ ...quizForm, time_limit_minutes: e.target.value })}
              placeholder="Để trống = không giới hạn"
              helperText="Để trống nếu không giới hạn" />
            <Input label="Điểm qua (%)" type="number" min={1} max={100}
              value={quizForm.pass_score}
              onChange={(e) => setQuizForm({ ...quizForm, pass_score: e.target.value })}
              placeholder="70" />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" onClick={() => setShowQuizModal(false)}>Hủy</Button>
            <Button onClick={handleSaveQuiz} isLoading={savingQuiz}>
              <Save className="h-4 w-4" />
              {editingQuiz ? 'Cập nhật' : 'Tạo quiz'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* ── Question Modal ── */}
      <Modal isOpen={showQModal} onClose={() => setShowQModal(false)}
        title={editingQ ? 'Sửa câu hỏi' : 'Thêm câu hỏi'} size="lg">
        <div className="space-y-4">
          <Textarea label="Câu hỏi" value={qForm.question}
            onChange={(e) => setQForm({ ...qForm, question: e.target.value })}
            placeholder="Nhập câu hỏi..." rows={3} required />

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              4 đáp án <span className="text-red-500">*</span>
              <span className="text-xs text-gray-400 ml-2 font-normal">Click vào đáp án đúng để chọn</span>
            </label>
            <div className="space-y-2">
              {qForm.options.map((opt, i) => (
                <div key={i} className="flex items-center gap-3">
                  <button type="button" onClick={() => setQForm({ ...qForm, correct_index: i })}
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0 transition-colors ${
                      qForm.correct_index === i
                        ? 'bg-green-500 text-white'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                    aria-label={`Chọn ${LABELS[i]} là đáp án đúng`}>
                    {LABELS[i]}
                  </button>
                  <input
                    value={opt}
                    onChange={(e) => {
                      const newOpts = [...qForm.options] as [string, string, string, string];
                      newOpts[i] = e.target.value;
                      setQForm({ ...qForm, options: newOpts });
                    }}
                    placeholder={`Đáp án ${LABELS[i]}...`}
                    className={`flex-1 h-10 px-3 rounded-lg border text-sm transition-colors
                      bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100
                      placeholder:text-gray-400 dark:placeholder:text-gray-600
                      focus:outline-none focus:ring-2 focus:border-transparent
                      ${qForm.correct_index === i
                        ? 'border-green-400 focus:ring-green-400'
                        : 'border-gray-300 dark:border-gray-700 focus:ring-blue-500'}`}
                  />
                  {qForm.correct_index === i && (
                    <span className="text-xs text-green-600 dark:text-green-400 font-medium shrink-0">✓ Đúng</span>
                  )}
                </div>
              ))}
            </div>
          </div>

          <Textarea label="Giải thích đáp án (tùy chọn)" value={qForm.explanation}
            onChange={(e) => setQForm({ ...qForm, explanation: e.target.value })}
            placeholder="Giải thích tại sao đáp án đó đúng..." rows={2} />

          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" onClick={() => setShowQModal(false)}>Hủy</Button>
            <Button onClick={handleSaveQuestion} isLoading={savingQ}>
              <Save className="h-4 w-4" />
              {editingQ ? 'Cập nhật' : 'Thêm câu hỏi'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
