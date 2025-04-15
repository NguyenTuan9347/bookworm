import BookProfileCard from "../BookCardProfile/BookCardProfile";
import { CarouselDiscountedBookProps } from "@/shared/interfaces";

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

const CarouselDiscountedBook = ({ books }: CarouselDiscountedBookProps) => {
  if (!books || books.length === 0) {
    return <p>No books to display.</p>;
  }
  return (
    <Carousel
      orientation="horizontal"
      className="w-full px-4 border-2 border-gray-200 shadow-md"
      opts={{
        align: "start",
        loop: false,
      }}
    >
      <div className="px-10">
        <CarouselContent className="-ml-4">
          {books.map((book, index) => (
            <CarouselItem className="pl-4 md:basis-1/4 lg:1/8" key={index}>
              <BookProfileCard book={book} index={index} />
            </CarouselItem>
          ))}
        </CarouselContent>
      </div>
      <CarouselPrevious />
      <CarouselNext />
    </Carousel>
  );
};

export default CarouselDiscountedBook;
