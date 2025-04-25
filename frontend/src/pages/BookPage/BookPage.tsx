import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { fetchBookById } from "@/api/books";
import { useQuery } from "@tanstack/react-query";
import { constVar } from "@/shared/constVar";
import { useCart } from "@/context/CartContext/cartContext";
import ReviewList from "@/components/ReviewList/ReviewList";
import QuantityInput from "@/components/QuantityInput/QuantityInput";
import ReviewForm from "@/components/ReviewForm/ReviewForm";

const BookPage = () => {
  const { id } = useParams();

  const useCartStore = useCart();
  const addBook = useCartStore((state) => state.addBook);
  const books = useCartStore((state) => state.books);

  const [quantity, setQuantity] = useState(1);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showFailure, setShowFailure] = useState(false);
  const [minMaxMessage, setMinMaxMessage] = useState<string | null>(null);

  const {
    data: book,
    isLoading: isLoadingBook,
    isError: isErrorBook,
    error: errorBook,
  } = useQuery({
    queryKey: [constVar.api_keys.book_detail, id],
    queryFn: () => fetchBookById({ id }),
    enabled: !!id,
    staleTime: 1000 * 60,
  });

  const handleAddToCart = () => {
    if (!book) return;

    const currentBookId = book.id.toString();

    const bookId = books.find((item) => item.id === currentBookId);
    let currentBookSize = 0;
    if (bookId) {
      currentBookSize = bookId.quantity;
    }

    const quantityToSet = quantity + currentBookSize;
    const totalQuantityCurrentlyInCart = books.length;

    const potentialNewTotalQuantity =
      totalQuantityCurrentlyInCart - quantityToSet;

    if (potentialNewTotalQuantity > 8) {
      setShowFailure(true);
      setTimeout(() => setShowFailure(false), 3000);
      return;
    }

    addBook({
      ...book,
      book_price: Number(book.book_price),
      discount_price: Number(book.discount_price),
      quantity: quantityToSet,
    });

    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  const handleMaxReached = () => {
    setMinMaxMessage("Maximum quantity (8) reached.");
    setTimeout(() => setMinMaxMessage(null), 2000);
  };

  const handleMinReached = () => {
    setMinMaxMessage("Minimum quantity (1) reached.");
    setTimeout(() => setMinMaxMessage(null), 2000);
  };

  useEffect(() => {
    setShowSuccess(false);
    setShowFailure(false);
    setMinMaxMessage(null);
    setQuantity(1);
  }, [id]);

  if (isErrorBook) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-6 text-center">
        <p className="text-lg font-medium text-red-600">
          Error: {errorBook?.message ?? "Failed to load book data."}
        </p>
      </div>
    );
  }

  if (isLoadingBook) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-6 text-center">
        <p className="text-lg font-medium text-gray-600">
          Loading book data...
        </p>
      </div>
    );
  }

  if (!book) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-6 text-center">
        <p className="text-lg font-medium text-red-600">
          Error: Invalid book ID or book not found.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800">
          {book.category_name}
        </h1>
        <hr className="mt-2 border-gray-200" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[8fr_fr] gap-6">
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col md:flex-row">
            <div className="md:w-2/5">
              <img
                src={book.book_cover_photo}
                alt={book.book_title}
                className="mx-auto mb-4 max-w-xs rounded-md shadow-sm"
              />
              <p className="text-sm text-gray-600">
                <span className="font-medium">By</span>{" "}
                <span className="font-semibold text-gray-800">
                  {book.author_name}
                </span>
              </p>
            </div>
            <div className="mt-4 border-t border-gray-200 pt-4 md:mt-0 md:w-3/5 md:border-l md:border-t-0 md:pl-6">
              <h2 className="mb-3 text-2xl font-semibold text-gray-800">
                {book.book_title}
              </h2>
              <h3 className="mb-2 text-lg font-medium text-gray-700">
                Book Description
              </h3>
              <p className="text-gray-600 leading-relaxed">
                {book.book_summary}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm h-fit">
          <div className="mb-4 rounded-md bg-gray-50 p-4">
            <div className="flex books-baseline gap-2">
              {book.discount_price !== book.book_price && (
                <span className="text-lg text-gray-500 line-through">
                  ${book.book_price}
                </span>
              )}
              <span className="text-2xl font-bold text-gray-800">
                ${book.discount_price}
              </span>
            </div>
          </div>

          <div className="mb-4">
            <label className="mb-1 block text-sm font-medium text-gray-700 text-left">
              Quantity
            </label>
            <QuantityInput
              min={1}
              max={8}
              value={quantity}
              onChange={setQuantity}
              onMaxReached={handleMaxReached}
              onMinReached={handleMinReached}
            />
            {minMaxMessage && (
              <p className="mt-1 text-center text-xs text-gray-500 h-4">
                {minMaxMessage}
              </p>
            )}
            {!minMaxMessage && <div className="mt-1 h-4"></div>}
          </div>

          <button
            onClick={handleAddToCart}
            className="w-full rounded-md bg-blue-600 py-2.5 text-white font-medium hover:bg-blue-700 transition"
          >
            Add to Cart
          </button>

          {showSuccess && (
            <p className="mt-3 text-center text-sm font-medium text-green-600">
              Added {quantity} {book.book_title} to cart!
            </p>
          )}
          {showFailure && (
            <p className="mt-3 text-center text-sm font-medium text-red-600">
              Failed: Number of books within an order cannot exceed 8 books!
            </p>
          )}
          {!showSuccess && !showFailure && <div className="mt-3 h-5"></div>}
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <ReviewList bookId={id} motherClassName="w-full" />
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <ReviewForm motherClassName="w-full" bookId={id} />
        </div>
      </div>
    </div>
  );
};

export default BookPage;
