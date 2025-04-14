import { useState, useEffect } from "react";
import { Cart } from "../../shared/interfaces";
import { constVar } from "../../shared/constVar";

export function useCart(): [Cart, (newCount: number) => void] {
  const LOCAL_STORAGE_KEY = constVar.LOCAL_STORAGE_KEY;

  const [cart, setCart] = useState<Cart>(() => {
    const storedCount = localStorage.getItem(LOCAL_STORAGE_KEY);

    return {
      ...constVar.cartMetadata,
      countItem: storedCount ? parseInt(storedCount) : 0,
    };
  });

  const updateCount = (newCount: number) => {
    const updatedCart = { ...cart, countItem: newCount };
    setCart(updatedCart);
    localStorage.setItem(LOCAL_STORAGE_KEY, newCount.toString());
  };

  useEffect(() => {
    const handleStorage = () => {
      const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (stored) {
        setCart((prev) => ({ ...prev, countItem: parseInt(stored) }));
      }
    };

    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, [LOCAL_STORAGE_KEY]);

  return [cart, updateCount];
}
