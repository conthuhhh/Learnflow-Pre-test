import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Brain, Globe, Lock, Trash2, Edit2, Play, BookOpen } from 'lucide-react';
import { useFlashcardStore } from '@/store/flashcardStore';
import { useAuthStore } from '@/store/authStore';
import { useUIStore } from '@/store/uiStore';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Badge } from '@/components/ui/Badge';
import { Spinner } from '@/components/ui/Spinner';
import { formatRelativeTime } from '@/lib/utils';

const CATEGORIES = ['Chung', 'Tiếng Anh', 'Toán học', 'Lập trình', 'Khoa học', 'Lịch sử', 'Địa lý', 'Khác'];

interface DeckForm {
  title: string;
  description: string;
  category: string;
  is_public: boolean;
}

const defaultForm: DeckForm = { title: '', description: '', category: 'Chung', is_public: false };

export function FlashcardsPage() {
  const { user } = useAuthStore();
  const {
    decks, publicDecks, fetchDecks, fetchPublicDecks,
    createDeck, updateDeck, deleteDeck, getDueCards, isLoading
  } = useFlashcardStore();
  const { toast } = useUIStore();

  const [activeTab, setActiveTab] = useState<'my' | 'public'>('my');
  const [showModal, setShowModal] = useState(false);
  const [editingDeck, setEditingDeck] = useState<import('@/types').FlashcardDeck | null>(null);
  const [form, setForm] = useState<DeckForm>(defaultForm);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) {
      fetchDecks(user.id);
    }
    fetchPublicDecks();
  }, [user]);

  const openCreate = () => {
    setEditingDeck(null);
    setForm(defaultForm);
    setShowModal(true);
  };

  const openEdit = (deck: import('@/types').FlashcardDeck, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setEditingDeck(deck);
    setForm({
      title: deck.title,
      description: deck.description,
      category: deck.category,
      is_public: deck.is_public,
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!user || !form.title.trim()) {
      toast.error('Vui lòng nhập tên bộ thẻ');
      return;
    }
    setSaving(true);
    try {
      if (editingDeck) {
        await updateDeck(editingDeck.id, form);
        toast.success('Cập nhật bộ thẻ thành công!');
      } else {
        await createDeck({ ...form, user_id: user.id });
        toast.success('Tạo bộ thẻ thành công!');
      }
      setShowModal(false);
    } catch {
      toast.error('Có lỗi xảy ra');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (deckId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!confirm('Bạn có chắc muốn xóa bộ thẻ này? Tất cả thẻ sẽ bị xóa.')) return;
    try {
      await deleteDeck(deckId);
      toast.success('Đã xóa bộ thẻ');
    } catch {
      toast.error('Có lỗi xảy ra');
    }
  };

  const displayDecks = activeTab === 'my' ? decks : publicDecks;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Flashcard</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Học với thẻ nhớ thông minh</p>
        </div>
        {user && (
          <Button onClick={openCreate}>
            <Plus className="h-4 w-4" /> Tạo bộ thẻ
          </Button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-xl w-fit mb-6">
        {[
          { key: 'my', label: `Của tôi (${decks.length})` },
          { key: 'public', label: `Cộng đồng (${publicDecks.length})` },
        ].map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key as 'my' | 'public')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === key
                ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12"><Spinner size="lg" /></div>
      ) : displayDecks.length === 0 ? (
        <div className="text-center py-16">
          <Brain className="h-16 w-16 text-gray-200 dark:text-gray-700 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            {activeTab === 'my' ? 'Chưa có bộ thẻ nào' : 'Chưa có bộ thẻ công khai'}
          </h3>
          {activeTab === 'my' && user && (
            <Button className="mt-4" onClick={openCreate}>
              <Plus className="h-4 w-4" /> Tạo bộ thẻ đầu tiên
            </Button>
          )}
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {displayDecks.map((deck) => {
            const dueCount = user ? getDueCards(deck.id).length : 0;
            const isOwner = deck.user_id === user?.id;

            return (
              <Link key={deck.id} to={`/flashcards/${deck.id}`}>
                <Card hover className="h-full flex flex-col">
                  <CardContent className="p-5 flex-1 flex flex-col">
                    {/* Header */}
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-xl flex items-center justify-center shrink-0">
                        <Brain className="h-5 w-5 text-white" />
                      </div>
                      <div className="flex items-center gap-1">
                        {deck.is_public ? (
                          <Globe className="h-4 w-4 text-green-500" />
                        ) : (
                          <Lock className="h-4 w-4 text-gray-400" />
                        )}
                        {isOwner && (
                          <>
                            <button
                              onClick={(e) => openEdit(deck, e)}
                              className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                            >
                              <Edit2 className="h-3.5 w-3.5" />
                            </button>
                            <button
                              onClick={(e) => handleDelete(deck.id, e)}
                              className="p-1 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors text-gray-400 hover:text-red-500"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-1 leading-snug">{deck.title}</h3>
                      {deck.description && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 mb-2">{deck.description}</p>
                      )}
                      <div className="flex items-center gap-2">
                        <Badge variant="default">{deck.category}</Badge>
                        <span className="text-xs text-gray-400 dark:text-gray-500">{deck.cards_count || 0} thẻ</span>
                      </div>
                    </div>

                    {/* Footer */}
                    <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
                      <span className="text-xs text-gray-400 dark:text-gray-500">
                        {formatRelativeTime(deck.updated_at)}
                      </span>
                      {dueCount > 0 ? (
                        <Link
                          to={`/flashcards/${deck.id}/study`}
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Button size="sm" className="text-xs px-3 py-1 h-7">
                            <Play className="h-3 w-3" />
                            {dueCount} thẻ
                          </Button>
                        </Link>
                      ) : (
                        <span className="text-xs text-green-600 font-medium flex items-center gap-1">
                          <BookOpen className="h-3 w-3" />
                          Đã ôn xong
                        </span>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      )}

      {/* Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editingDeck ? 'Sửa bộ thẻ' : 'Tạo bộ thẻ mới'}
        size="md"
      >
        <div className="space-y-4">
          <Input
            label="Tên bộ thẻ"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            placeholder="Nhập tên bộ thẻ..."
            required
          />
          <Textarea
            label="Mô tả (tùy chọn)"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            placeholder="Mô tả bộ thẻ..."
            rows={3}
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Danh mục</label>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setForm({ ...form, category: cat })}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    form.category === cat
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
            <input
              type="checkbox"
              id="is_public"
              checked={form.is_public}
              onChange={(e) => setForm({ ...form, is_public: e.target.checked })}
              className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <label htmlFor="is_public" className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 cursor-pointer">
              <Globe className="h-4 w-4 text-gray-400" />
              Chia sẻ công khai với cộng đồng
            </label>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" onClick={() => setShowModal(false)}>Hủy</Button>
            <Button onClick={handleSave} isLoading={saving}>
              {editingDeck ? 'Cập nhật' : 'Tạo bộ thẻ'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
