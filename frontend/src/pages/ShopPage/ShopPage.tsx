import React, { useState } from "react";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

import { AllowedPageSize, SortByOptions } from "@/shared/interfaces";
import { sortByOptions, allowedPageSizes } from "@/shared/constVar";
import { DiscountedBookProfiles } from "@/shared/mockData";
import BookGrid from "@/components/BookGrid/BookGrid";

const uniqueCategories = ["Fiction", "Science", "History", "Tech"];
const uniqueAuthors = ["Author A", "Author B", "Author C", "Author D"];
const ratingOptions = [5, 4, 3, 2, 1];

const getSortDisplayText = (sortValue: SortByOptions): string => {
  switch (sortValue) {
    case "on_sale":
      return "On Sale";
    case "popularity":
      return "Popularity";
    case "price_asc":
      return "Price: Low to High";
    case "price_desc":
      return "Price: High to Low";
    default:
      return "Sort By";
  }
};

const ShopPage: React.FC = () => {
  const [filteredCategory, setCategory] = useState<string | null>(null);
  const [filteredAuthor, setAuthor] = useState<string | null>(null);
  const [filteredRating, setRating] = useState<number | null>(null);
  const [sortBy, setSortBy] = useState<SortByOptions>("on_sale");
  const [pageSize, setPageSize] = useState<AllowedPageSize>(5);
  const [currentPage, setCurrentPage] = useState(1);
  console.log(pageSize);

  const handleFilterChange = (
    setter: React.Dispatch<React.SetStateAction<any>>,
    value: any
  ) => {
    setter(value);
    setCurrentPage(1);
  };

  const handleSortChange = (newSortOption: SortByOptions) => {
    setSortBy(newSortOption);
    setCurrentPage(1);
  };

  const handlePageSizeChange = (newPageSize: string) => {
    const size = parseInt(newPageSize, 10) as AllowedPageSize;
    if (allowedPageSizes.includes(size)) {
      setPageSize(size);
      setCurrentPage(1);
    }
  };

  const handlePrevPage = () => {
    setCurrentPage((prev) => Math.max(1, prev - 1));
  };

  const handleNextPage = () => {
    setCurrentPage((prev) => prev + 1);
  };

  const clearAllFilters = () => {
    setCategory(null);
    setAuthor(null);
    setRating(null);
    setCurrentPage(1);
  };

  const resultsText = "Showing results...";

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex min-h-screen flex-col">
        <div className="header border-b border-gray-200 py-4 mb-6">
          <h1 className="text-2xl font-semibold text-gray-800">BOOKS</h1>
          {(filteredCategory || filteredAuthor || filteredRating !== null) && (
            <p className="text-sm text-gray-500 mt-1">
              Active filters:
              {filteredCategory && ` Category=${filteredCategory}`}
              {filteredAuthor && ` Author=${filteredAuthor}`}
              {filteredRating !== null && ` Rating=${filteredRating}+`}
            </p>
          )}
        </div>
        <div className="content flex flex-col md:flex-row flex-grow gap-6 lg:gap-8">
          <div className="filter-bar flex flex-col w-full md:w-64 lg:w-72 flex-shrink-0 p-4 rounded-lg mb-6 md:mb-0 h-fit space-y-6">
            <Accordion type="single" collapsible className="border-1 px-2 py-1">
              <AccordionItem value="item-1">
                <AccordionTrigger>All Category</AccordionTrigger>
                <AccordionContent>
                  {uniqueCategories.map((category) => (
                    <button
                      key={category}
                      onClick={() => handleFilterChange(setCategory, category)}
                      className={`block w-full text-left text-sm px-2 py-1 rounded ${
                        filteredCategory === category
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
            <Accordion type="single" collapsible className="border-1 px-2 py-1">
              <AccordionItem value="item-2">
                <AccordionTrigger>All Category</AccordionTrigger>
                <AccordionContent>
                  {uniqueAuthors.map((author) => (
                    <button
                      key={author}
                      onClick={() => handleFilterChange(setAuthor, author)}
                      className={`block w-full text-left text-sm px-2 py-1 rounded ${
                        filteredAuthor === author
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
            <Accordion type="single" collapsible className="border-1 px-2 py-1">
              <AccordionItem value="item-3">
                <AccordionTrigger>All Category</AccordionTrigger>
                <AccordionContent>
                  {ratingOptions.map((rating) => (
                    <button
                      key={rating}
                      onClick={() => handleFilterChange(setRating, rating)}
                      className={`block w-full text-left text-sm px-2 py-1 rounded ${
                        filteredRating === rating
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

            <button
              onClick={clearAllFilters}
              className="w-full mt-4 text-center text-sm text-blue-600 hover:text-blue-800 font-medium py-1 bg-gray-200"
            >
              Clear All Filters
            </button>
          </div>{" "}
          <div className="grid-books flex flex-col flex-grow">
            <div className="metadata-sort-options flex flex-col sm:flex-row justify-between items-center mb-4 gap-4">
              <p className="text-sm text-gray-600">{resultsText}</p>
              <div className="flex space-x-3">
                <select
                  value={sortBy}
                  onChange={(e) =>
                    handleSortChange(e.target.value as SortByOptions)
                  }
                  className="border border-gray-300 px-3 py-1 rounded text-sm text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
                  aria-label="Sort by"
                >
                  {sortByOptions.map((option) => (
                    <option key={option} value={option}>
                      {getSortDisplayText(option)}
                    </option>
                  ))}
                </select>

                {/* Page Size Dropdown */}
                <select
                  value={pageSize}
                  onChange={(e) => handlePageSizeChange(e.target.value)}
                  className="border border-gray-300 px-3 py-1 rounded text-sm text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
                  aria-label="Items per page"
                >
                  {allowedPageSizes.map((size) => (
                    <option key={size} value={size}>
                      {size} / page
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <BookGrid
              books={DiscountedBookProfiles}
              col_size={pageSize}
              row_size={pageSize}
            />

            <div className="footer mt-8 flex justify-center items-center space-x-2">
              <button
                onClick={handlePrevPage}
                disabled={currentPage === 1}
                className="px-3 py-1 border rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
              >
                Prev
              </button>
              <span className="text-sm text-gray-600">Page {currentPage}</span>
              <button
                onClick={handleNextPage}
                className="px-3 py-1 border rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
              >
                Next
              </button>
            </div>
          </div>{" "}
        </div>{" "}
      </div>{" "}
    </div>
  );
};

export default ShopPage;
