import { useCart } from "@/context/CartContext/cartContext";
import BookSheet from "@/components/BookSheet/BookSheet";
import { useMemo, useState } from "react";
import LoginPopUp from "@/components/LoginPopUp/LoginPopUp";
import { useAuth } from "@/context/Authentication/authContext";

const CartPage = () => {
  const useCartStore = useCart();

  const books = useCartStore((state) => state.books);
  const removeBook = useCartStore((state) => state.removeBook);
  const replaceBook = useCartStore((state) => state.replaceBook);
  const clearCart = useCartStore((state) => state.clearCart);

  const { isAuthenticated } = useAuth();

  const [isLoginDialogOpen, setIsLoginDialogOpen] = useState(false);

  const totalPrice = useMemo(() => {
    return books.reduce(
      (total, book) => total + book.discount_price * book.quantity,
      0
    );
  }, [books]);

  const totalBooks = useMemo(() => {
    return books.reduce((total, book) => total + book.quantity, 0);
  }, [books]);

  const placeActualOrder = () => {
    console.log("User is authenticated. Placing order with:", books);
    alert(
      `Order Placed!\nItems: ${totalBooks}\nTotal: $${totalPrice.toFixed(2)}`
    );
    clearCart();
  };

  const handleCheckoutAttempt = () => {
    if (isAuthenticated) {
      placeActualOrder();
    } else {
      console.log("User not authenticated. Opening login dialog.");
      setIsLoginDialogOpen(true);
    }
  };

  const handleLoginSuccess = () => {
    console.log("Login successful from CartPage.");
    setIsLoginDialogOpen(false);
    placeActualOrder();
  };

  const handleLoginFailed = () => {
    console.log("Login failed from CartPage.");
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
                ${totalPrice.toFixed(2)}
              </p>
            </div>
            <button
              className="bg-blue-600 text-white px-6 py-3 rounded hover:bg-blue-700 transition w-full max-w-xs disabled:opacity-50 disabled:cursor-not-allowed" // Added disabled styles
              onClick={handleCheckoutAttempt}
              disabled={books.length === 0}
            >
              Place Order
            </button>
          </div>
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
