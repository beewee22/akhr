import { browser } from '$app/env';
import type { CardPositionClass } from './types';

const STORAGE_PREFIX = '__akhr__store__';

export type StoredCardPosition = CardPositionClass[];

export class CardPositionStore {
	static PREFIX = 'cards';

	static getStorageKey = () => `${STORAGE_PREFIX}${CardPositionStore.PREFIX}`;

	static add(cardPosition: CardPositionClass) {
		CardPositionStore.addMany([cardPosition]);
	}

	static addMany(cardPositions: CardPositionClass[]) {
		if (!browser) {
			throw new Error('store is only available in browser');
		}
    const key = CardPositionStore.getStorageKey();
    const cards = CardPositionStore.getAll();
    const merged = CardPositionStore.mergeCards(cards, cardPositions);

    localStorage.setItem(key, JSON.stringify(merged));
	}

	static getAll(): StoredCardPosition {
		if (!browser) {
			throw new Error('store is only available in browser');
		}
		const key = CardPositionStore.getStorageKey();
		const currentString = localStorage.getItem(key);
		const current: StoredCardPosition = currentString ? JSON.parse(currentString) : [];
		return current;
	}

	static getBySrc(src: string): CardPositionClass | undefined {
		const all = CardPositionStore.getAll();
		return all.find((cardPosition) => cardPosition.originSrc === src);
	}

  static mergeCards(origin: CardPositionClass[], target: CardPositionClass[]): CardPositionClass[] {
    // merge by src, rowIndex, columnIndex
    return [...target, ...origin].reduce((acc, cardPosition) => {
      const existing = acc.find((existingCardPosition) => {
        return (
          existingCardPosition.originSrc === cardPosition.originSrc &&
          existingCardPosition.rowIndex === cardPosition.rowIndex &&
          existingCardPosition.columnIndex === cardPosition.columnIndex
        );
      });
      if (!existing) {
        acc = [ ...acc, cardPosition ];
      }
      return acc;
    }, [] as CardPositionClass[]);
  }
}
