import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { CartState } from "../../shared/interfaces";
import { constVar } from "../../shared/constVar";

const LOCAL_STORAGE_KEY = constVar.LOCAL_STORAGE_KEY;

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      ...constVar.cartMetadata,
      countItem: 0,
      setCount: (newCount: number) => {
        set({ countItem: newCount });
      },
    }),
    {
      name: LOCAL_STORAGE_KEY,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ countItem: state.countItem }),

      merge: (persistedState, currentState) => {
        return {
          ...currentState,
          ...(persistedState as Partial<CartState>),
        };
      },
    }
  )
);
