import { create } from 'zustand';
import { supabase } from '@/lib/supabase';
import { calculateNextReview } from '@/lib/utils';
import type { FlashcardDeck, Flashcard, CardReview, CardDifficulty } from '@/types';

interface FlashcardState {
  decks: FlashcardDeck[];
  publicDecks: FlashcardDeck[];
  currentDeckCards: Flashcard[];
  cardReviews: CardReview[];
  isLoading: boolean;
  error: string | null;

  fetchDecks: (userId: string) => Promise<void>;
  fetchPublicDecks: () => Promise<void>;
  fetchDeckById: (id: string) => Promise<FlashcardDeck | null>;
  fetchDeckCards: (deckId: string) => Promise<void>;
  createDeck: (data: Omit<FlashcardDeck, 'id' | 'created_at' | 'updated_at'>) => Promise<FlashcardDeck>;
  updateDeck: (id: string, data: Partial<FlashcardDeck>) => Promise<void>;
  deleteDeck: (id: string) => Promise<void>;
  addCard: (data: Omit<Flashcard, 'id' | 'created_at'>) => Promise<Flashcard>;
  updateCard: (id: string, data: Partial<Flashcard>) => Promise<void>;
  deleteCard: (id: string) => Promise<void>;
  fetchCardReviews: (userId: string, deckId: string) => Promise<void>;
  reviewCard: (userId: string, cardId: string, deckId: string, difficulty: CardDifficulty) => Promise<void>;
  getDueCards: (deckId: string) => Flashcard[];
  getCardReview: (cardId: string) => CardReview | undefined;
}

export const useFlashcardStore = create<FlashcardState>((set, get) => ({
  decks: [],
  publicDecks: [],
  currentDeckCards: [],
  cardReviews: [],
  isLoading: false,
  error: null,

  fetchDecks: async (userId) => {
    set({ isLoading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('flashcard_decks')
        .select(`*, cards_count:flashcards(count)`)
        .eq('user_id', userId)
        .order('updated_at', { ascending: false });

      if (error) throw error;

      const decks = (data || []).map((d) => ({
        ...d,
        cards_count: d.cards_count?.[0]?.count || 0,
      }));
      set({ decks });
    } catch (err) {
      set({ error: err instanceof Error ? err.message : 'Lỗi tải bộ thẻ' });
    } finally {
      set({ isLoading: false });
    }
  },

  fetchPublicDecks: async () => {
    const { data } = await supabase
      .from('flashcard_decks')
      .select(`*, cards_count:flashcards(count)`)
      .eq('is_public', true)
      .order('created_at', { ascending: false })
      .limit(20);

    const publicDecks = (data || []).map((d) => ({
      ...d,
      cards_count: d.cards_count?.[0]?.count || 0,
    }));
    set({ publicDecks });
  },

  fetchDeckById: async (id) => {
    const { data } = await supabase
      .from('flashcard_decks')
      .select(`*, cards_count:flashcards(count)`)
      .eq('id', id)
      .single();

    return data ? { ...data, cards_count: data.cards_count?.[0]?.count || 0 } : null;
  },

  fetchDeckCards: async (deckId) => {
    set({ isLoading: true });
    const { data } = await supabase
      .from('flashcards')
      .select('*')
      .eq('deck_id', deckId)
      .order('order_index');
    set({ currentDeckCards: data || [], isLoading: false });
  },

  createDeck: async (deckData) => {
    const { data, error } = await supabase
      .from('flashcard_decks')
      .insert(deckData)
      .select()
      .single();

    if (error) throw error;

    const newDeck = { ...data, cards_count: 0 };
    set((state) => ({ decks: [newDeck, ...state.decks] }));
    return newDeck;
  },

  updateDeck: async (id, deckData) => {
    const { error } = await supabase
      .from('flashcard_decks')
      .update({ ...deckData, updated_at: new Date().toISOString() })
      .eq('id', id);

    if (error) throw error;

    set((state) => ({
      decks: state.decks.map((d) => (d.id === id ? { ...d, ...deckData } : d)),
    }));
  },

  deleteDeck: async (id) => {
    const { error } = await supabase.from('flashcard_decks').delete().eq('id', id);
    if (error) throw error;
    set((state) => ({ decks: state.decks.filter((d) => d.id !== id) }));
  },

  addCard: async (cardData) => {
    const { data, error } = await supabase
      .from('flashcards')
      .insert(cardData)
      .select()
      .single();

    if (error) throw error;

    set((state) => ({
      currentDeckCards: [...state.currentDeckCards, data],
      decks: state.decks.map((d) =>
        d.id === cardData.deck_id
          ? { ...d, cards_count: (d.cards_count || 0) + 1 }
          : d
      ),
    }));
    return data;
  },

  updateCard: async (id, cardData) => {
    const { error } = await supabase.from('flashcards').update(cardData).eq('id', id);
    if (error) throw error;

    set((state) => ({
      currentDeckCards: state.currentDeckCards.map((c) =>
        c.id === id ? { ...c, ...cardData } : c
      ),
    }));
  },

  deleteCard: async (id) => {
    const card = get().currentDeckCards.find((c) => c.id === id);
    const { error } = await supabase.from('flashcards').delete().eq('id', id);
    if (error) throw error;

    set((state) => ({
      currentDeckCards: state.currentDeckCards.filter((c) => c.id !== id),
      decks: state.decks.map((d) =>
        d.id === card?.deck_id
          ? { ...d, cards_count: Math.max(0, (d.cards_count || 0) - 1) }
          : d
      ),
    }));
  },

  fetchCardReviews: async (userId, deckId) => {
    const { data } = await supabase
      .from('card_reviews')
      .select('*')
      .eq('user_id', userId)
      .eq('deck_id', deckId);
    set({ cardReviews: data || [] });
  },

  reviewCard: async (userId, cardId, deckId, difficulty) => {
    const existingReview = get().cardReviews.find((r) => r.card_id === cardId);
    const currentInterval = existingReview?.interval_days || 0;
    const currentEaseFactor = existingReview?.ease_factor || 2.5;

    const { nextInterval, newEaseFactor } = calculateNextReview(
      difficulty,
      currentInterval,
      currentEaseFactor
    );

    const nextReviewAt = new Date();
    nextReviewAt.setDate(nextReviewAt.getDate() + nextInterval);

    const reviewData = {
      user_id: userId,
      card_id: cardId,
      deck_id: deckId,
      difficulty,
      next_review_at: nextReviewAt.toISOString(),
      interval_days: nextInterval,
      ease_factor: newEaseFactor,
      review_count: (existingReview?.review_count || 0) + 1,
      last_reviewed_at: new Date().toISOString(),
    };

    await supabase.from('card_reviews').upsert(reviewData);

    set((state) => {
      const existing = state.cardReviews.find((r) => r.card_id === cardId);
      if (existing) {
        return {
          cardReviews: state.cardReviews.map((r) =>
            r.card_id === cardId ? { ...r, ...reviewData } as CardReview : r
          ),
        };
      }
      return {
        cardReviews: [
          ...state.cardReviews,
          { id: cardId, ...reviewData } as CardReview,
        ],
      };
    });
  },

  getDueCards: (_deckId) => {
    const { currentDeckCards, cardReviews } = get();
    const now = new Date();

    return currentDeckCards.filter((card) => {
      const review = cardReviews.find((r) => r.card_id === card.id);
      if (!review) return true; // Never reviewed = due
      return new Date(review.next_review_at) <= now;
    });
  },

  getCardReview: (cardId) => {
    return get().cardReviews.find((r) => r.card_id === cardId);
  },
}));
