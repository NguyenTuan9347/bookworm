import { createCartStore } from "@/states/Cart/useCart";
import { useMemo } from "react";
import { useAuth } from "@/context/Authentication/authContext";
import { CartContext } from "./cartContext";

interface CartProviderProps {
  children: React.ReactNode;
}

export const CartProvider = ({ children }: CartProviderProps) => {
  const { uid } = useAuth();

  const useCartStoreInstance = useMemo(() => {
    console.log(`CART_CONTEXT: Creating/getting store hook for UID: ${uid}`);
    return createCartStore(uid);
  }, [uid]);

  return (
    <CartContext.Provider value={useCartStoreInstance}>
      {children}
    </CartContext.Provider>
  );
};
