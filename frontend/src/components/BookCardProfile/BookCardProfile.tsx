import { BookProfileCardProps } from "../../shared/interfaces";

const safeParseFloat = (value: string | number | undefined | null): number => {
  if (value === undefined || value === null) {
    return 0;
  }
  const parsed = parseFloat(String(value));
  return isNaN(parsed) ? 0 : parsed;
};

const BookProfileCard = ({ index, book }: BookProfileCardProps) => {
  return (
    <div
      className="rounded-lg shadow-md overflow-hidden border border-gray-200 flex flex-col h-full bg-white"
      key={index}
    >
      <div className="border-b border-gray-200">
        <img
          src={book.book_cover_photo ? book.book_cover_photo : ""}
          alt={`Book cover ${book.book_title}`}
          className="w-full h-64 object-cover "
        />
      </div>

      <div className="p-3 border-b border-gray-200">
        <div className="text-sm font-semibold mb-1 line-clamp-2">
          {book.book_title}
        </div>
        <div className="text-xs text-gray-500">{book.author_id}</div>
      </div>

      <div className="p-3 bg-gray-100 mt-auto">
        {book.discount_price ? (
          <>
            <span className="text-gray-400 line-through text-sm mr-1">
              ${safeParseFloat(book.discount_price).toFixed(2)}
            </span>
            <span className="text-red-500 font-bold">
              ${safeParseFloat(book.discount_price).toFixed(2)}
            </span>
          </>
        ) : (
          <span className="text-gray-800 font-semibold">
            ${safeParseFloat(book.discount_price).toFixed(2)}
          </span>
        )}
      </div>
    </div>
  );
};

export default BookProfileCard;
