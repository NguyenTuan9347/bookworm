import { BookGridProps } from "@/shared/interfaces";
import BookProfileCard from "../BookCardProfile/BookCardProfile";

const getGridColsClass = (cols: number): string => {
  if (cols >= 1 && cols <= 12) {
    return `grid-cols-${cols}`;
  } else {
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
