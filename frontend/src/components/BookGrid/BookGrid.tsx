import { BookGridProps } from "@/shared/interfaces";
import BookProfileCard from "../BookCardProfile/BookCardProfile";

const getGridColsClass = (cols: number): string => {
  switch (cols) {
    case 1:
      return "grid-cols-1";
    case 2:
      return "grid-cols-2";
    case 3:
      return "grid-cols-3";
    case 4:
      return "grid-cols-4";
    case 5:
      return "grid-cols-5";
    case 6:
      return "grid-cols-6";
    case 7:
      return "grid-cols-7";
    case 8:
      return "grid-cols-8";
    case 9:
      return "grid-cols-9";
    case 10:
      return "grid-cols-10";
    case 11:
      return "grid-cols-11";
    case 12:
      return "grid-cols-12";
    default:
      console.warn(`Unsupported col_size: ${cols}. Defaulting to grid-cols-1.`);
      return "grid-cols-1";
  }
};

const BookGrid = ({
  books,
  col_size,
  row_size,
  className = "",
}: BookGridProps) => {
  if (col_size <= 0 || row_size <= 0) {
    console.error("BookGrid: col_size and row_size must be positive numbers.");
    return null;
  }
  if (!books || books.length === 0) {
    return <p>No books to display.</p>;
  }

  const totalItemsToShow = row_size * col_size;

  const itemsToDisplay = books.slice(0, totalItemsToShow);

  const gridColsClassName = getGridColsClass(col_size);

  return (
    <div
      className={`grid ${gridColsClassName} gap-4 ${className} w-full h-full`}
    >
      {itemsToDisplay.map((book, index) => (
        <BookProfileCard book={book} index={index} />
      ))}
    </div>
  );
};

export default BookGrid;
