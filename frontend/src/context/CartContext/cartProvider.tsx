import React, { useMemo, useEffect } from "react";

import { CartContext } from "./cartContext";

import { useAuth } from "@/context/Authentication/authContext";

import { createCartStore } from "@/states/Cart/useCart";

interface CartProviderProps {
  children: React.ReactNode;
}

export const CartProvider = ({ children }: CartProviderProps) => {
  const { uid, prevUid } = useAuth();

  const guestCartStore = createCartStore(null);

  const guestBooks = guestCartStore((state) => state.books);

  const guestClearCart = guestCartStore((state) => state.clearCart);

  const userCartStore = useMemo(() => {
    const currentUid = uid ?? null;

    console.log(
      `CART_PROVIDER: Creating/getting store instance for UID: ${currentUid}`
    );

    return createCartStore(currentUid);
  }, [uid]);

  const userAddBook = userCartStore((state) => state.addBook);

  useEffect(() => {
    const currentUid = uid ?? null;

    console.log(`${prevUid} ${currentUid}`);
    if (prevUid === null && currentUid !== null) {
      console.log(
        `CART_PROVIDER: Login detected (UID ${currentUid}). Checking for guest cart.`
      );

      if (guestBooks && guestBooks.length > 0) {
        console.log(`CART_PROVIDER: Found guest cart data.`);

        guestBooks.forEach((book) => {
          userAddBook(book);
        });

        guestClearCart();

        console.log(`CART_PROVIDER: Guest cart clean.`);
      } else {
        console.log(`CART_PROVIDER: No guest cart data found in localStorage.`);
      }
    }
  }, [uid, prevUid, userCartStore, guestBooks, userAddBook, guestClearCart]);

  return (
    <CartContext.Provider value={userCartStore}>
      {children}
    </CartContext.Provider>
  );
};
