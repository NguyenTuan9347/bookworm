import { create } from "zustand";
import { persist, PersistStorage, StorageValue } from "zustand/middleware";
import { CartState, BookCartProps } from "@/shared/interfaces";

type PersistedCartState = {
  books: BookCartProps[];
};

export const createCartStore = (uid: string | number | null | undefined) => {
  const storageKey = !uid ? "null" : uid.toString();
  const userScopedStorage: PersistStorage<PersistedCartState> = {
    getItem: (name) => {
      const storedValue = localStorage.getItem(`${name}-${storageKey}`);
      if (storedValue === null) return null;
      try {
        const parsedValue: StorageValue<PersistedCartState> =
          JSON.parse(storedValue);
        return parsedValue;
      } catch (error) {
        console.error("Error parsing stored cart state:", error);
        return null;
      }
    },
    setItem: (name, value: StorageValue<PersistedCartState>) => {
      try {
        const serializedValue = JSON.stringify(value);
        localStorage.setItem(`${name}-${storageKey}`, serializedValue);
      } catch (error) {
        console.error("Error serializing cart state:", error);
      }
    },
    removeItem: (name) => {
      localStorage.removeItem(`${name}-${storageKey}`);
    },
  };

  return create<CartState>()(
    persist(
      (set, get) => ({
        books: [],

        addBook: (newBook: BookCartProps) => {
          if (!newBook.id || !newBook.quantity || !newBook.discount_price) {
            console.error("Invalid book provided to addBook");
            return;
          }

          const cartBooks = get().books;
          const existingBook = cartBooks.find((book) => book.id === newBook.id);

          let updatedBooks: BookCartProps[];
          if (existingBook) {
            updatedBooks = cartBooks.map((book) =>
              book.id === newBook.id
                ? {
                    ...book,
                    quantity: Math.max(book.quantity + newBook.quantity, 8),
                  }
                : book
            );
          } else {
            updatedBooks = [...cartBooks, newBook];
          }

          set({ books: updatedBooks });
        },

        replaceBook: (updatedBook: BookCartProps) => {
          const cartBooks = get().books;
          const bookExists = cartBooks.some(
            (book) => book.id === updatedBook.id
          );

          const updatedBooks = bookExists
            ? cartBooks.map((book) =>
                book.id === updatedBook.id ? updatedBook : book
              )
            : [...cartBooks, updatedBook];

          set({ books: updatedBooks });
        },

        removeBook: (bookIdToRemove: string) => {
          const updatedBooks = get().books.filter(
            (book) => book.id !== bookIdToRemove
          );
          set({ books: updatedBooks });
        },

        clearCart: () => set({ books: [] }),
      }),
      {
        name: "user-cart",
        storage: userScopedStorage,
        partialize: (state: CartState): PersistedCartState => ({
          books: state.books,
        }),
      }
    )
  );
};
