import { useState, useEffect, useCallback } from 'react';
import { useParams, useSearchParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, RotateCcw, Brain, Trophy } from 'lucide-react';
import { useFlashcardStore } from '@/store/flashcardStore';
import { useAuthStore } from '@/store/authStore';
import { useUIStore } from '@/store/uiStore';
import { Button } from '@/components/ui/Button';
import { Progress } from '@/components/ui/Progress';
import { Spinner } from '@/components/ui/Spinner';
import type { CardDifficulty, Flashcard, FlashcardDeck } from '@/types';

interface StudyResult {
  cardId: string;
  difficulty: CardDifficulty;
}

export function StudyPage() {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const {
    fetchDeckById, fetchDeckCards, fetchCardReviews,
    getDueCards, currentDeckCards, reviewCard
  } = useFlashcardStore();
  const { toast } = useUIStore();

  const [deck, setDeck] = useState<FlashcardDeck | null>(null);
  const [studyCards, setStudyCards] = useState<Flashcard[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [results, setResults] = useState<StudyResult[]>([]);
  const [isComplete, setIsComplete] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const studyAll = searchParams.get('all') === 'true';

  useEffect(() => {
    if (!id || !user) return;
    (async () => {
      setIsLoading(true);
      const [deckData] = await Promise.all([
        fetchDeckById(id),
        fetchDeckCards(id),
        fetchCardReviews(user.id, id),
      ]);
      setDeck(deckData);
      setIsLoading(false);
    })();
  }, [id, user]);

  // Set cards to study after loading
  useEffect(() => {
    if (isLoading) return;
    if (studyAll) {
      setStudyCards([...currentDeckCards].sort(() => Math.random() - 0.5));
    } else {
      const due = getDueCards(id!);
      if (due.length === 0) {
        // No due cards - redirect
        toast.info('Không có thẻ nào cần ôn tập hôm nay!');
        navigate(`/flashcards/${id}`);
        return;
      }
      setStudyCards([...due].sort(() => Math.random() - 0.5));
    }
  }, [isLoading, currentDeckCards]);

  const currentCard = studyCards[currentIndex];
  const progress = studyCards.length > 0 ? (currentIndex / studyCards.length) * 100 : 0;

  const handleFlip = () => setIsFlipped(!isFlipped);

  const handleRate = useCallback(async (difficulty: CardDifficulty) => {
    if (!currentCard || !user || !id || submitting) return;

    setSubmitting(true);
    try {
      await reviewCard(user.id, currentCard.id, id, difficulty);
      const newResult = { cardId: currentCard.id, difficulty };
      const newResults = [...results, newResult];
      setResults(newResults);

      if (currentIndex >= studyCards.length - 1) {
        setIsComplete(true);
      } else {
        setCurrentIndex(currentIndex + 1);
        setIsFlipped(false);
      }
    } finally {
      setSubmitting(false);
    }
  }, [currentCard, user, id, results, currentIndex, studyCards, submitting, reviewCard]);

  const handleRestart = () => {
    setCurrentIndex(0);
    setIsFlipped(false);
    setResults([]);
    setIsComplete(false);
    setStudyCards([...studyCards].sort(() => Math.random() - 0.5));
  };

  const easyCount = results.filter((r) => r.difficulty === 'easy').length;
  const mediumCount = results.filter((r) => r.difficulty === 'medium').length;
  const hardCount = results.filter((r) => r.difficulty === 'hard').length;

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Spinner size="lg" />
      </div>
    );
  }

  if (isComplete) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-950 dark:to-gray-900 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white dark:bg-gray-900 rounded-3xl shadow-2xl p-8 text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-yellow-400 to-orange-400 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Trophy className="h-10 w-10 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Hoàn thành!</h2>
          <p className="text-gray-500 dark:text-gray-400 mb-6">
            Bạn đã ôn tập xong {studyCards.length} thẻ
          </p>

          {/* Results */}
          <div className="grid grid-cols-3 gap-3 mb-6">
            <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-3">
              <div className="text-2xl font-bold text-green-600">{easyCount}</div>
              <div className="text-xs text-green-600 font-medium mt-0.5">Dễ</div>
            </div>
            <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-xl p-3">
              <div className="text-2xl font-bold text-yellow-600">{mediumCount}</div>
              <div className="text-xs text-yellow-600 font-medium mt-0.5">Trung bình</div>
            </div>
            <div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-3">
              <div className="text-2xl font-bold text-red-600">{hardCount}</div>
              <div className="text-xs text-red-600 font-medium mt-0.5">Khó</div>
            </div>
          </div>

          <div className="text-sm text-gray-500 dark:text-gray-400 mb-6">
            {easyCount > mediumCount + hardCount
              ? '🎉 Tuyệt vời! Bạn đang tiến bộ rất tốt!'
              : hardCount > easyCount
              ? '💪 Cần luyện tập thêm những thẻ khó!'
              : '📚 Tiếp tục cố gắng nhé!'}
          </div>

          <div className="flex gap-3">
            <Button variant="outline" className="flex-1" onClick={handleRestart}>
              <RotateCcw className="h-4 w-4" /> Học lại
            </Button>
            <Link to={`/flashcards/${id}`} className="flex-1">
              <Button className="w-full">Về bộ thẻ</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-950 dark:to-gray-900">
      {/* Header */}
      <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-800 px-4 py-3">
        <div className="max-w-2xl mx-auto flex items-center gap-4">
          <Link to={`/flashcards/${id}`} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
            <ArrowLeft className="h-5 w-5 text-gray-500 dark:text-gray-400" />
          </Link>
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-900 dark:text-white">{deck?.title}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {currentIndex + 1} / {studyCards.length}
            </p>
          </div>
          <Progress value={progress} className="w-24" color="blue" />
        </div>
      </div>

      {/* Study Area */}
      <div className="max-w-2xl mx-auto px-4 py-8">
        {currentCard ? (
          <>
            {/* Flashcard */}
            <div
              className="flashcard-container w-full h-72 mb-6 cursor-pointer"
              onClick={handleFlip}
            >
              <div className={`flashcard ${isFlipped ? 'flipped' : ''}`}>
                {/* Front */}
                <div className="flashcard-front bg-white dark:bg-gray-900 rounded-3xl shadow-lg border border-gray-200 dark:border-gray-700 p-8 flex flex-col">
                  <div className="mb-4">
                    <span className="text-xs font-medium text-blue-600 bg-blue-50 dark:bg-blue-900/30 px-3 py-1 rounded-full">
                      MẶT TRƯỚC
                    </span>
                  </div>
                  <div className="flex-1 flex items-center justify-center">
                    <p className="text-xl font-semibold text-gray-900 dark:text-white text-center leading-relaxed">
                      {currentCard.front}
                    </p>
                  </div>
                  <p className="text-sm text-gray-400 dark:text-gray-500 text-center">Tap để lật thẻ</p>
                </div>

                {/* Back */}
                <div className="flashcard-back bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl shadow-lg p-8 flex flex-col">
                  <div className="mb-4">
                    <span className="text-xs font-medium text-blue-200 bg-white/10 px-3 py-1 rounded-full">
                      MẶT SAU
                    </span>
                  </div>
                  <div className="flex-1 flex items-center justify-center">
                    <p className="text-xl font-semibold text-white text-center leading-relaxed">
                      {currentCard.back}
                    </p>
                  </div>
                  <p className="text-sm text-blue-200 text-center">Đánh giá mức độ nhớ</p>
                </div>
              </div>
            </div>

            {/* Rating Buttons */}
            {isFlipped && (
              <div className="space-y-3">
                <p className="text-center text-sm font-medium text-gray-600 dark:text-gray-400 mb-4">
                  Bạn nhớ thẻ này như thế nào?
                </p>
                <div className="grid grid-cols-3 gap-3">
                  <button
                    onClick={() => handleRate('hard')}
                    disabled={submitting}
                    className="flex flex-col items-center gap-2 p-4 bg-white dark:bg-gray-900 rounded-2xl border-2 border-red-200 dark:border-red-800 hover:border-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all disabled:opacity-50"
                  >
                    <span className="text-2xl">😰</span>
                    <span className="font-semibold text-red-600 text-sm">Khó</span>
                    <span className="text-xs text-gray-400 dark:text-gray-500">Ôn lại sớm</span>
                  </button>
                  <button
                    onClick={() => handleRate('medium')}
                    disabled={submitting}
                    className="flex flex-col items-center gap-2 p-4 bg-white dark:bg-gray-900 rounded-2xl border-2 border-yellow-200 dark:border-yellow-800 hover:border-yellow-400 hover:bg-yellow-50 dark:hover:bg-yellow-900/20 transition-all disabled:opacity-50"
                  >
                    <span className="text-2xl">🤔</span>
                    <span className="font-semibold text-yellow-600 text-sm">Trung bình</span>
                    <span className="text-xs text-gray-400 dark:text-gray-500">Vài ngày nữa</span>
                  </button>
                  <button
                    onClick={() => handleRate('easy')}
                    disabled={submitting}
                    className="flex flex-col items-center gap-2 p-4 bg-white dark:bg-gray-900 rounded-2xl border-2 border-green-200 dark:border-green-800 hover:border-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 transition-all disabled:opacity-50"
                  >
                    <span className="text-2xl">😊</span>
                    <span className="font-semibold text-green-600 text-sm">Dễ</span>
                    <span className="text-xs text-gray-400 dark:text-gray-500">Nhớ tốt</span>
                  </button>
                </div>
              </div>
            )}

            {!isFlipped && (
              <div className="text-center">
                <Button size="lg" onClick={handleFlip} className="px-10">
                  <Brain className="h-5 w-5" /> Lật thẻ
                </Button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-12">
            <Spinner />
          </div>
        )}
      </div>
    </div>
  );
}
