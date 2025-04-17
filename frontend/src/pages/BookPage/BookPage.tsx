import { useParams } from "react-router-dom";
import { fetchBookById } from "@/api/books";
import { useQuery } from "@tanstack/react-query";
import { constVar } from "@/shared/constVar";

const BookPage = () => {
  const { id } = useParams();

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

  if (!book || isErrorBook) {
    return (
      <div className="container mx-auto p-4 max-w-6xl text-center">
        <p className="text-red-500">
          Error: {errorBook?.message ?? "Invalid book ID"}
        </p>
      </div>
    );
  }

  if (isLoadingBook) {
    return (
      <div className="container mx-auto p-4 max-w-6xl text-center">
        <p className="text-gray-600">Loading book data...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 max-w-6xl">
      <div className="header mb-6">
        <h1 className="text-3xl font-bold text-gray-800">
          {book.category_name}
        </h1>
        <hr className="border border-gray-200" />
      </div>

      <div className="book-section flex flex-col lg:flex-row gap-6">
        <div className="book-card lg:w-7/10 bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
          <div className="flex flex-col md:flex-row">
            <div className="intro p-4 md:p-6 md:w-2/5">
              <img
                src={book.book_cover_photo}
                alt={book.book_title}
                className="rounded-md w-full max-w-xs mx-auto mb-4 shadow-md"
              />
              <p className="text-sm text-gray-600">
                <span className="font-s">By (author)</span>{" "}
                <span className="font-medium text-gray-800">
                  {book.author_name}
                </span>
              </p>
            </div>
            <div className="book-detail p-4 md:p-6 md:w-3/5 border-t md:border-t-0 md:border-l border-gray-100 wrap-break-word">
              <h2 className="text-xl font-semibold text-gray-800 mb-3">
                {book.book_title}
              </h2>
              <h5 className="text-lg font-medium text-gray-700 mb-2">
                Book description
              </h5>
              <p className="text-gray-600 whitespace-pre-line">
                {book.book_summary}
              </p>
            </div>
          </div>
        </div>

        <div className="checkout lg:w-3/10 p-5 bg-white rounded-lg shadow-sm border border-gray-100 h-fit sticky top-4">
          <div className="flex items-baseline mb-4">
            {book.discount_price !== book.book_price && (
              <span className="ml-2 text-gray-500 line-through px-2">
                $ {book.book_price}
              </span>
            )}
            <span className="text-2xl font-bold text-gray-800">
              ${book.discount_price}
            </span>
          </div>
          <div className="mb-4">
            <label
              htmlFor="quantity"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Quantity
            </label>
            <input
              type="number"
              id="quantity"
              name="quantity"
              min="1"
              defaultValue="1"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <button className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md transition duration-150">
            Add to Cart
          </button>
        </div>
      </div>

      <div className="reviews-section mt-8 bg-white rounded-lg shadow-sm border border-gray-100 p-5">
        <h2 className="text-xl font-semibold text-gray-800 mb-3">Reviews</h2>
        <div className="border border-dashed border-gray-200 rounded-lg p-4 text-center">
          <p className="text-gray-500">No reviews yet.</p>
        </div>
      </div>
    </div>
  );
};

export default BookPage;
