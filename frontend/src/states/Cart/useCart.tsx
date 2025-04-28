import { create } from "zustand";
import { persist, PersistStorage, StorageValue } from "zustand/middleware";
import { CartState, BookCartProps } from "@/shared/interfaces";

import { MAX_BOOK_QUANTITY, constVar } from "@/shared/constVar";
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
            return constVar.errorMessage.invalidItem;
          }

          const cartBooks = get().books;
          const existingBook = cartBooks.find((book) => book.id === newBook.id);

          let updatedBooks: BookCartProps[];
          let isExceedQuantity = false;
          if (existingBook) {
            if (existingBook.quantity + newBook.quantity > MAX_BOOK_QUANTITY) {
              isExceedQuantity = true;
            }

            updatedBooks = cartBooks.map((book) =>
              book.id === newBook.id
                ? {
                    ...book,
                    quantity: Math.min(
                      book.quantity + newBook.quantity,
                      MAX_BOOK_QUANTITY
                    ),
                  }
                : book
            );
          } else {
            if (newBook.quantity > MAX_BOOK_QUANTITY) {
              isExceedQuantity = true;
            }

            updatedBooks = [...cartBooks, newBook];
          }

          set({ books: updatedBooks });
          return isExceedQuantity
            ? constVar.errorMessage.quantityExceed
            : constVar.successMessage.default;
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

        formatToOrder: (user_id: number) => {
          const cartBooks = get().books;

          const items = cartBooks.map((book) => ({
            book_id: book.id,
            quantity: book.quantity,
            price: book.discount_price,
          }));

          return {
            user_id: user_id,
            items,
          };
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
