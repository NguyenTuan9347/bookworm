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
    <div className="w-full md:w-64 lg:w-72 flex-shrink-0 rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
      <Accordion type="single" collapsible className="mb-4">
        <AccordionItem value="item-1">
          <AccordionTrigger className="text-lg font-semibold text-gray-800">
            Category
          </AccordionTrigger>
          <AccordionContent className="max-h-48 overflow-y-auto">
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
                className={`block w-full rounded-md px-3 py-2 text-left text-sm text-gray-600 hover:bg-gray-100 ${
                  selectedCategory === category
                    ? "bg-blue-50 font-semibold text-blue-600"
                    : ""
                }`}
              >
                {category}
              </button>
            ))}
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      <Accordion type="single" collapsible className="mb-4">
        <AccordionItem value="item-2">
          <AccordionTrigger className="text-lg font-semibold text-gray-800">
            Author
          </AccordionTrigger>
          <AccordionContent className="max-h-48 overflow-y-auto">
            {authors.map((author) => (
              <button
                key={author}
                onClick={() =>
                  handleFilterClick(selectedAuthor, author, onAuthorChange)
                }
                className={`block w-full rounded-md px-3 py-2 text-left text-sm text-gray-600 hover:bg-gray-100 ${
                  selectedAuthor === author
                    ? "bg-blue-50 font-semibold text-blue-600"
                    : ""
                }`}
              >
                {author}
              </button>
            ))}
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      <Accordion type="single" collapsible>
        <AccordionItem value="item-3">
          <AccordionTrigger className="text-lg font-semibold text-gray-800">
            Rating Review
          </AccordionTrigger>
          <AccordionContent className="max-h-48 overflow-y-auto">
            {ratings.map((rating) => (
              <button
                key={rating}
                onClick={() =>
                  handleFilterClick(selectedRating, rating, onRatingChange)
                }
                className={`block w-full rounded-md px-3 py-2 text-left text-sm text-gray-600 hover:bg-gray-100 ${
                  selectedRating === rating
                    ? "bg-blue-50 font-semibold text-blue-600"
                    : ""
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
