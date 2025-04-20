import { BookCartProps } from "@/shared/interfaces";
import { useState } from "react";
import QuantityInput from "../QuantityInput/QuantityInput";
import { useNavigate } from "react-router-dom";
import { constVar } from "@/shared/constVar";

const BookRow = ({
  book,
  onRemove,
  onQuantityChange,
}: {
  book: BookCartProps;
  onRemove: (id: string) => void;
  onQuantityChange: (updatedBook: BookCartProps) => void;
}) => {
  const [quantity, setQuantity] = useState(book.quantity);
  const navigate = useNavigate();

  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity === 0) {
      onRemove(book.id);
    } else {
      setQuantity(newQuantity);
      onQuantityChange({
        ...book,
        quantity: newQuantity,
      });
    }
  };

  const handleMinReached = () => {
    console.log(`Minimum quantity reached for book ${book.id}`);
  };

  const handleMaxReached = () => {
    console.log(`Maximum quantity reached for book ${book.id}`);
  };

  const handleOnClick = () => {
    navigate(constVar.api_routes.books.detail.pathTemplate(book.id));
  };

  // Function to prevent clicks in the quantity section from triggering row navigation
  const handleQuantitySectionClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  return (
    <div
      className="book-row flex flex-row items-center justify-between p-4 border border-gray-200 mb-2 rounded hover:bg-blue-50 hover:border-blue-500 cursor-pointer transition-all"
      onClick={handleOnClick}
    >
      <div className="product flex items-center space-x-4 w-2/6">
        <img
          src={book.book_cover_photo}
          alt={book.book_title}
          className="w-16 h-24 object-cover rounded"
        />
        <div className="descrip flex flex-col">
          <h1 className="font-medium text-gray-800">{book.book_title}</h1>
          <h2 className="text-sm text-gray-600">{book.author_name}</h2>
        </div>
      </div>
      <div className="price w-1/6 text-center">${book.discount_price}</div>
      <div
        className="quantity-controls w-2/6 flex justify-center"
        onClick={handleQuantitySectionClick}
      >
        <QuantityInput
          min={0}
          max={8}
          value={quantity}
          onChange={handleQuantityChange}
          onMinReached={handleMinReached}
          onMaxReached={handleMaxReached}
        />
      </div>
      <div className="book-total w-1/6 text-right font-medium">
        ${(book.discount_price * quantity).toFixed(2)}
      </div>
    </div>
  );
};

const BookSheet = ({
  books,
  onRemove,
  onQuantityChange,
}: {
  books: BookCartProps[];
  onRemove: (id: string) => void;
  onQuantityChange: (updatedBook: BookCartProps) => void;
}) => {
  const labels = ["Product", "Price", "Quantity", "Total"];

  return (
    <div className="container flex flex-col">
      <div className="labels flex flex-row justify-between p-4 border-b border-gray-200 bg-gray-50">
        <div className="font-medium text-gray-700 w-2/6 text-left">
          {labels[0]}
        </div>
        <div className="font-medium text-gray-700 w-1/6 text-center">
          {labels[1]}
        </div>
        <div className="font-medium text-gray-700 w-2/6 text-center">
          {labels[2]}
        </div>
        <div className="font-medium text-gray-700 w-1/6 text-right">
          {labels[3]}
        </div>
      </div>
      <div className="books">
        {books.map((book: BookCartProps) => (
          <BookRow
            key={book.id}
            book={book}
            onRemove={onRemove}
            onQuantityChange={onQuantityChange}
          />
        ))}
      </div>
    </div>
  );
};

export default BookSheet;
