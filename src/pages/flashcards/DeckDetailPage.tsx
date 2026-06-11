import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';import { Plus, Edit2, Trash2, Play, ArrowLeft, Brain, Globe, Lock } from 'lucide-react';
import { useFlashcardStore } from '@/store/flashcardStore';
import { useAuthStore } from '@/store/authStore';
import { useUIStore } from '@/store/uiStore';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Textarea } from '@/components/ui/Textarea';
import { Badge } from '@/components/ui/Badge';
import { Card, CardContent } from '@/components/ui/Card';
import { Spinner } from '@/components/ui/Spinner';
import type { FlashcardDeck, Flashcard } from '@/types';

interface CardForm { front: string; back: string; }
const defaultForm: CardForm = { front: '', back: '' };

export function DeckDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuthStore();
  const {
    fetchDeckById, fetchDeckCards, addCard, updateCard, deleteCard,
    currentDeckCards, getDueCards, fetchCardReviews
  } = useFlashcardStore();
  const { toast } = useUIStore();

  const [deck, setDeck] = useState<FlashcardDeck | null>(null);
  const [pageLoading, setPageLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCard, setEditingCard] = useState<Flashcard | null>(null);
  const [form, setForm] = useState<CardForm>(defaultForm);
  const [saving, setSaving] = useState(false);
  const [flippedCards, setFlippedCards] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!id) return;
    (async () => {
      setPageLoading(true);
      const deckData = await fetchDeckById(id);
      setDeck(deckData);
      await fetchDeckCards(id);
      if (user) await fetchCardReviews(user.id, id);
      setPageLoading(false);
    })();
  }, [id, user]);

  const dueCards = id ? getDueCards(id) : [];
  const isOwner = deck?.user_id === user?.id;

  const openCreate = () => {
    setEditingCard(null);
    setForm(defaultForm);
    setShowModal(true);
  };

  const openEdit = (card: Flashcard, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingCard(card);
    setForm({ front: card.front, back: card.back });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!id || !form.front.trim() || !form.back.trim()) {
      toast.error('Vui lòng nhập đầy đủ mặt trước và mặt sau');
      return;
    }
    setSaving(true);
    try {
      if (editingCard) {
        await updateCard(editingCard.id, form);
        toast.success('Cập nhật thẻ thành công!');
      } else {
        await addCard({
          deck_id: id,
          front: form.front,
          back: form.back,
          order_index: currentDeckCards.length,
        });
        toast.success('Thêm thẻ thành công!');
      }
      setShowModal(false);
    } catch {
      toast.error('Có lỗi xảy ra');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (cardId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Xóa thẻ này?')) return;
    try {
      await deleteCard(cardId);
      toast.success('Đã xóa thẻ');
    } catch {
      toast.error('Có lỗi xảy ra');
    }
  };

  const toggleFlip = (cardId: string) => {
    setFlippedCards((prev) => {
      const next = new Set(prev);
      if (next.has(cardId)) next.delete(cardId);
      else next.add(cardId);
      return next;
    });
  };

  if (pageLoading) {
    return (
      <div className="flex justify-center items-center min-h-96"><Spinner size="lg" /></div>
    );
  }

  if (!deck) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 text-center">
        <p className="text-gray-500 dark:text-gray-400">Không tìm thấy bộ thẻ</p>
        <Link to="/flashcards" className="mt-4 inline-block">
          <Button variant="outline"><ArrowLeft className="h-4 w-4" /> Quay lại</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Back */}
      <Link to="/flashcards" className="inline-flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 mb-6">
        <ArrowLeft className="h-4 w-4" /> Tất cả bộ thẻ
      </Link>

      {/* Deck Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-xl flex items-center justify-center">
            <Brain className="h-6 w-6 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">{deck.title}</h1>
              {deck.is_public ? (
                <Globe className="h-4 w-4 text-green-500" />
              ) : (
                <Lock className="h-4 w-4 text-gray-400" />
              )}
            </div>
            <div className="flex items-center gap-2 mt-1">
              <Badge>{deck.category}</Badge>
              <span className="text-sm text-gray-500 dark:text-gray-400">{currentDeckCards.length} thẻ</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {dueCards.length > 0 && (
            <Link to={`/flashcards/${id}/study`}>
              <Button>
                <Play className="h-4 w-4" />
                Ôn tập ({dueCards.length})
              </Button>
            </Link>
          )}
          {currentDeckCards.length > 0 && dueCards.length === 0 && (
            <Link to={`/flashcards/${id}/study?all=true`}>
              <Button variant="outline">
                <Play className="h-4 w-4" /> Ôn tập tất cả
              </Button>
            </Link>
          )}
          {isOwner && (
            <Button variant="outline" onClick={openCreate}>
              <Plus className="h-4 w-4" /> Thêm thẻ
            </Button>
          )}
        </div>
      </div>

      {/* Due cards banner */}
      {dueCards.length > 0 && (
        <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-xl p-4 mb-6 flex items-center justify-between">
          <p className="text-orange-800 dark:text-orange-300 text-sm font-medium">
            Bạn có {dueCards.length} thẻ cần ôn tập hôm nay!
          </p>
          <Link to={`/flashcards/${id}/study`}>
            <Button size="sm" className="bg-orange-600 hover:bg-orange-700">
              Ôn tập ngay
            </Button>
          </Link>
        </div>
      )}

      {/* Cards Grid */}
      {currentDeckCards.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <Brain className="h-16 w-16 text-gray-200 dark:text-gray-700 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">Chưa có thẻ nào</h3>
            {isOwner && (
              <Button className="mt-4" onClick={openCreate}>
                <Plus className="h-4 w-4" /> Thêm thẻ đầu tiên
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {currentDeckCards.map((card) => {
            const isFlipped = flippedCards.has(card.id);
            return (
              <div
                key={card.id}
                className="flashcard-container h-44 cursor-pointer"
                onClick={() => toggleFlip(card.id)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && toggleFlip(card.id)}
                aria-label={`Thẻ: ${card.front}`}
              >
                <div className={`flashcard ${isFlipped ? 'flipped' : ''}`}>
                  {/* Front */}
                  <div className="flashcard-front bg-white dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-700 rounded-2xl p-5 flex flex-col">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-medium text-blue-600 bg-blue-50 dark:bg-blue-900/30 px-2 py-0.5 rounded-full">
                        Mặt trước
                      </span>
                      {isOwner && (
                        <div className="flex gap-1">
                          <button
                            onClick={(e) => openEdit(card, e)}
                            className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={(e) => handleDelete(card.id, e)}
                            className="p-1.5 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg text-gray-400 hover:text-red-500"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      )}
                    </div>
                    <div className="flex-1 flex items-center justify-center">
                      <p className="text-gray-900 dark:text-white font-medium text-center leading-relaxed">{card.front}</p>
                    </div>
                    <p className="text-xs text-gray-400 dark:text-gray-500 text-center mt-2">Click để lật</p>
                  </div>

                  {/* Back */}
                  <div className="flashcard-back bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl p-5 flex flex-col">
                    <div className="mb-2">
                      <span className="text-xs font-medium text-blue-200 bg-white/10 px-2 py-0.5 rounded-full">
                        Mặt sau
                      </span>
                    </div>
                    <div className="flex-1 flex items-center justify-center">
                      <p className="text-white font-medium text-center leading-relaxed">{card.back}</p>
                    </div>
                    <p className="text-xs text-blue-200 text-center mt-2">Click để lật lại</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editingCard ? 'Sửa thẻ' : 'Thêm thẻ mới'}
        size="md"
      >
        <div className="space-y-4">
          <Textarea
            label="Mặt trước"
            value={form.front}
            onChange={(e) => setForm({ ...form, front: e.target.value })}
            placeholder="Từ vựng, câu hỏi, khái niệm..."
            rows={3}
            required
          />
          <Textarea
            label="Mặt sau"
            value={form.back}
            onChange={(e) => setForm({ ...form, back: e.target.value })}
            placeholder="Nghĩa, câu trả lời, giải thích..."
            rows={3}
            required
          />
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" onClick={() => setShowModal(false)}>Hủy</Button>
            <Button onClick={handleSave} isLoading={saving}>
              {editingCard ? 'Cập nhật' : 'Thêm thẻ'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
