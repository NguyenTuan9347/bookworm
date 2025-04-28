import { BookProfileCardProps } from "../../shared/interfaces";
import { useNavigate } from "react-router-dom";
import { constVar } from "@/shared/constVar";
import { safeParseFloat } from "@/shared/utils";
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
          alt={`Book cover {book.price_symbol}{book.book_title}`}
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
              {book.price_symbol}
              {safeParseFloat(book.localize_price).toFixed(2)}
            </span>
            <span className="text-red-500 font-bold">
              {book.price_symbol}
              {safeParseFloat(book.localize_discount_price).toFixed(2)}
            </span>
          </>
        ) : (
          <span className="text-gray-800 font-semibold">
            {book.price_symbol}
            {safeParseFloat(book.localize_price).toFixed(2)}
          </span>
        )}
      </div>
    </div>
  );
};

export default BookProfileCard;
