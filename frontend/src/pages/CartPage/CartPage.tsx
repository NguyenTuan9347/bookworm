import { useCart } from "@/context/CartContext/cartContext";
import BookSheet from "@/components/BookSheet/BookSheet";
import { useEffect, useRef, useMemo, useState, useCallback } from "react";
import LoginPopUp from "@/components/LoginPopUp/LoginPopUp";
import { useAuth } from "@/context/Authentication/authContext";
import { createOrder } from "@/api/orders";
import { AlertPopup } from "@/components/Alert/AlertPopup";
import { useNavigate } from "react-router-dom";
import { constVar } from "@/shared/constVar";
import { safeParseFloat, formatWithSymbol } from "@/shared/utils";

const CartPage = () => {
  const useCartStore = useCart();
  const navigate = useNavigate();

  const books = useCartStore((state) => state.books);
  const formatToOrder = useCartStore((state) => state.formatToOrder);
  const removeBook = useCartStore((state) => state.removeBook);
  const replaceBook = useCartStore((state) => state.replaceBook);
  const clearCart = useCartStore((state) => state.clearCart);

  const { isAuthenticated, authRequireAPIFetch, uid } = useAuth();

  const [isLoginDialogOpen, setIsLoginDialogOpen] = useState(false);
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const [showErrorAlert, setShowErrorAlert] = useState(false);

  const successTimerRef = useRef<NodeJS.Timeout | null>(null);
  const errorTimerRef = useRef<NodeJS.Timeout | null>(null);

  const clearSuccessAlert = useCallback(() => {
    setShowSuccessAlert(false);
    clearCart();
    navigate(constVar.links[0].ref);
    if (successTimerRef.current) clearTimeout(successTimerRef.current);
  }, [setShowSuccessAlert, clearCart, navigate]);

  const clearErrorAlert = () => {
    setShowErrorAlert(false);
    if (errorTimerRef.current) clearTimeout(errorTimerRef.current);
  };

  useEffect(() => {
    const handlePageClick = () => {
      if (showSuccessAlert) {
        clearSuccessAlert();
      }
      if (showErrorAlert) {
        clearErrorAlert();
      }
    };

    window.addEventListener("click", handlePageClick);

    return () => {
      window.removeEventListener("click", handlePageClick);
      if (successTimerRef.current) clearTimeout(successTimerRef.current);
      if (errorTimerRef.current) clearTimeout(errorTimerRef.current);
    };
  }, [
    showSuccessAlert,
    showErrorAlert,
    navigate,
    clearCart,
    clearSuccessAlert,
  ]);

  const totalPrice = useMemo(() => {
    return books.reduce(
      (total, book) => total + book.localize_discount_price * book.quantity,
      0
    );
  }, [books]);

  const totalBooks = useMemo(() => {
    return books.reduce((total, book) => total + book.quantity, 0);
  }, [books]);

  const placeActualOrder = () => {
    if (uid) {
      createOrder(authRequireAPIFetch, formatToOrder(uid))
        .then(() => {
          setShowSuccessAlert(true);
          successTimerRef.current = setTimeout(clearSuccessAlert, 10_000);
        })
        .catch((error) => {
          console.error("Order failed:", error);
          setShowErrorAlert(true);

          if (error?.errors && Array.isArray(error.errors)) {
            error.errors.forEach((err: { book_id: number }) => {
              removeBook(err.book_id.toString());
            });
          }
          errorTimerRef.current = setTimeout(clearErrorAlert, 3_000);
        });
    }
  };

  const handleCheckoutAttempt = () => {
    if (isAuthenticated) {
      placeActualOrder();
    } else {
      setIsLoginDialogOpen(true);
    }
  };

  const handleLoginSuccess = () => {
    setIsLoginDialogOpen(false);
    placeActualOrder();
  };

  const handleLoginFailed = () => {
    alert("Login Failed. Please check your credentials.");
  };

  return (
    <div className="container mx-auto px-4 py-8 flex flex-col space-y-6">
      <div className="header">
        <h1 className="text-xl font-bold text-gray-800 mb-4">
          Your cart: {totalBooks} {totalBooks === 1 ? "item" : "items"}
        </h1>
      </div>

      {books.length === 0 ? (
        <p className="text-center text-gray-600">Your cart is empty.</p>
      ) : (
        <div className="invoice-detail flex flex-col lg:flex-row gap-6">
          <div className="flex-1">
            <BookSheet
              books={books}
              onRemove={removeBook}
              onQuantityChange={replaceBook}
            />
          </div>

          <div className="checkout w-full lg:w-1/3 flex flex-col items-center justify-start border border-gray-200 rounded-lg p-6 h-fit shadow-sm">
            <h2 className="text-lg font-semibold text-gray-800 border-b border-gray-300 w-full pb-2 mb-4 text-center">
              Cart Totals
            </h2>
            <div className="total mb-6 text-center">
              <p className="text-3xl font-bold text-gray-900">
                {formatWithSymbol(
                  safeParseFloat(totalPrice),
                  books[0].price_symbol
                )}
              </p>
            </div>
            <button
              className="bg-blue-600 text-white px-6 py-3 rounded hover:bg-blue-700 transition w-full max-w-xs disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={handleCheckoutAttempt}
              disabled={books.length === 0}
            >
              Place Order
            </button>
          </div>

          {showSuccessAlert && (
            <AlertPopup
              title="Success"
              description="Order placed successfully!"
            />
          )}

          {showErrorAlert && (
            <AlertPopup
              title="Error"
              description="Failed to place order. Please try again."
              className=""
            />
          )}
        </div>
      )}

      <LoginPopUp
        open={isLoginDialogOpen}
        onOpenChange={setIsLoginDialogOpen}
        onSuccess={handleLoginSuccess}
        onFailed={handleLoginFailed}
      />
    </div>
  );
};

export default CartPage;
