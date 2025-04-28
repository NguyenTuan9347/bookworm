import { BookProfileCardProps } from "../../shared/interfaces";
import { useNavigate } from "react-router-dom";
import { constVar } from "@/shared/constVar";

const safeParseFloat = (value: string | number | undefined | null): number => {
  if (value === undefined || value === null) return 0;
  const parsed = parseFloat(String(value));
  return isNaN(parsed) ? 0 : parsed;
};

const BookProfileCard = ({ index, book }: BookProfileCardProps) => {
  const navigate = useNavigate();

  const handleOnClickCard = () => {
    if (book.id) {
      navigate(constVar.api_routes.books.detail.pathTemplate(book.id));
    } else {
      console.log("Something wrong should be book_id here");
    }
  };

  return (
    <div
      className="flex flex-col rounded-xl overflow-hidden border border-gray-300 shadow-sm hover:shadow-lg hover:border-blue-400 hover:ring-2 hover:ring-blue-100 transition-all duration-200 bg-white cursor-pointer h-full w-full"
      key={index}
      onClick={handleOnClickCard}
    >
      <div className="w-full aspect-[3/4] overflow-hidden bg-gray-100">
        <img
          src={book.book_cover_photo || "https://placehold.co/300x400"}
          alt={`Book cover ${book.book_title}`}
          className="w-full h-full object-cover"
        />
      </div>
      <div className="p-3 border-b border-gray-200 flex-grow min-h-0">
        <div className="text-base font-semibold line-clamp-2">
          {book.book_title}
        </div>
        <div className="text-xs text-gray-500 mt-1">{book.author_name}</div>
      </div>
      <div className="p-3 bg-gray-50">
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
