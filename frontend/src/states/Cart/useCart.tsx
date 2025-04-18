import { create } from "zustand";
import { persist, PersistStorage, StorageValue } from "zustand/middleware";
import { CartState, BookCartProps } from "@/shared/interfaces";

type PersistedCartState = {
  items: BookCartProps[];
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
        items: [],
        addItem: (newItem: BookCartProps) => {
          if (!newItem.id || !newItem.quantity || !newItem.discount_price) {
            console.error("Invalid item provided to addItem");
            return;
          }

          const cartItems = get().items;
          const existingItem = cartItems.find((item) => item.id === newItem.id);

          let updatedItems: BookCartProps[];
          if (existingItem) {
            updatedItems = cartItems.map((item) =>
              item.id === newItem.id
                ? { ...item, quantity: item.quantity + newItem.quantity }
                : item
            );
          } else {
            updatedItems = [...cartItems, newItem];
          }
          set({ items: updatedItems });

          console.log("State after set:", get().items);
        },

        removeItem: (bookIdToRemove: string) => {
          const cartItems = get().items;
          const itemToRemove = cartItems.find(
            (item) => item.id === bookIdToRemove
          );
          if (!itemToRemove) return;

          const updatedItems = cartItems.filter(
            (item) => item.id !== bookIdToRemove
          );
          set({ items: updatedItems });
        },

        clearCart: () => set({ items: [] }),

        getTotalPrice: (): number => {
          return get().items.reduce(
            (total, item) => total + item.discount_price * item.quantity,
            0
          );
        },
      }),
      {
        name: "user-cart",
        storage: userScopedStorage,
        partialize: (state: CartState): PersistedCartState => ({
          items: state.items,
        }),
      }
    )
  );
};
