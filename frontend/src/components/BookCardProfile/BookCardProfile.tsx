import { BookProfileCardProps } from "../../shared/interfaces";

const safeParseFloat = (value: string | number | undefined | null): number => {
  if (value === undefined || value === null) return 0;
  const parsed = parseFloat(String(value));
  return isNaN(parsed) ? 0 : parsed;
};

const BookProfileCard = ({ index, book }: BookProfileCardProps) => {
  return (
    <div
      className="flex flex-col rounded-2xl overflow-hidden border border-gray-200 shadow hover:shadow-lg transition-shadow bg-white"
      key={index}
    >
      {/* Responsive Image */}
      <div className="w-full aspect-[3/4] overflow-hidden bg-gray-100">
        <img
          src={book.book_cover_photo || ""}
          alt={`Book cover ${book.book_title}`}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Title & Author */}
      <div className="p-3 border-b border-gray-200">
        <div className="text-base font-semibold line-clamp-2">
          {book.book_title}
        </div>
        <div className="text-xs text-gray-500 mt-1">{book.author_name}</div>
      </div>

      {/* Pricing */}
      <div className="p-3 mt-auto bg-gray-50">
        {book.discount_price ? (
          <>
            <span className="text-gray-400 line-through text-sm mr-1">
              ${safeParseFloat(book.book_price).toFixed(2)}
            </span>
            <span className="text-red-500 font-bold">
              ${safeParseFloat(book.discount_price).toFixed(2)}
            </span>
          </>
        ) : (
          <span className="text-gray-800 font-semibold">
            ${safeParseFloat(book.book_price).toFixed(2)}
          </span>
        )}
      </div>
    </div>
  );
};

export default BookProfileCard;
