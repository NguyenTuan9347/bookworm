import { createContext, useContext } from "react";
import { createCartStore } from "@/states/Cart/useCart";

type CartContextType = ReturnType<typeof createCartStore> | null;

export const CartContext = createContext<CartContextType>(null);

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === null) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};
