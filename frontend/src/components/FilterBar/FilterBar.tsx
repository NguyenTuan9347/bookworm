import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { FilterBarProps } from "@/shared/interfaces";

const FilterBar = ({
  categories,
  authors,
  ratings,
  selectedCategory,
  selectedAuthor,
  selectedRating,
  onCategoryChange,
  onAuthorChange,
  onRatingChange,
}: FilterBarProps) => {
  const handleFilterClick = (
    currentValue: string | null,
    newValue: string,
    setterCallback: (value: string | null) => void
  ) => {
    if (currentValue === newValue) {
      setterCallback(null);
    } else {
      setterCallback(newValue);
    }
  };

  return (
    <div className="filter-bar flex flex-col w-full md:w-64 lg:w-72 flex-shrink-0 p-4 rounded-lg mb-6 md:mb-0 h-fit space-y-6 flex-wrap scroll-mx-0-auto">
      <Accordion
        type="single"
        collapsible
        className="max-h-[33vh] overflow-y-auto pr-2 border px-1 py-1"
      >
        <AccordionItem value="item-1">
          <AccordionTrigger className="font-bold">Category</AccordionTrigger>
          <AccordionContent>
            {categories.map((category) => (
              <button
                key={category}
                onClick={() =>
                  handleFilterClick(
                    selectedCategory,
                    category,
                    onCategoryChange
                  )
                }
                className={`block w-full text-left text-sm px-2 py-1 rounded ${
                  selectedCategory === category
                    ? "bg-blue-100 font-semibold"
                    : "hover:bg-gray-200"
                }`}
              >
                {category}
              </button>
            ))}
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      <Accordion
        type="single"
        collapsible
        className="max-h-[33vh] overflow-y-auto pr-2 border px-1 py-1"
      >
        <AccordionItem value="item-2">
          <AccordionTrigger className="font-bold">Author</AccordionTrigger>
          <AccordionContent>
            {authors.map((author) => (
              <button
                key={author}
                onClick={() =>
                  handleFilterClick(selectedAuthor, author, onAuthorChange)
                }
                className={`block w-full text-left text-sm px-2 py-1 rounded ${
                  selectedAuthor === author
                    ? "bg-blue-100 font-semibold"
                    : "hover:bg-gray-200"
                }`}
              >
                {author}
              </button>
            ))}
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      <Accordion
        type="single"
        collapsible
        className="max-h-[33vh] overflow-y-auto pr-2 border px-1 py-1"
      >
        <AccordionItem value="item-3">
          <AccordionTrigger className="font-bold">
            Rating Review
          </AccordionTrigger>
          <AccordionContent>
            {ratings.map((rating) => (
              <button
                key={rating}
                onClick={() =>
                  handleFilterClick(selectedRating, rating, onRatingChange)
                }
                className={`block w-full text-left text-sm px-2 py-1 rounded ${
                  selectedRating === rating
                    ? "bg-blue-100 font-semibold"
                    : "hover:bg-gray-200"
                }`}
              >
                {rating} Stars
              </button>
            ))}
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
};

export default FilterBar;
