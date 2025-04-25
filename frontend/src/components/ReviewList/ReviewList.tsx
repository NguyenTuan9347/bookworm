import { useState } from "react";
import { allowedPageSizes } from "@/shared/constVar";
import {
  PagingInfo,
  AllowedPageSize,
  ReviewListProps,
  Star,
  AllowedStarRating,
  SortReviewBy,
} from "@/shared/interfaces";

const ReviewList = ({ bookId }: ReviewListProps) => {
  const [filterRating, setFilterRating] = useState<AllowedStarRating>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<AllowedPageSize>(15);
  const [sortBy, setSortBy] = useState<SortReviewBy>("newest");

  const avgRating = 4.5;
  const totalReviews = 42;

  const stars: Star[] = [
    { id: 5, content: "5 Star", totalReviews: 25 },
    { id: 4, content: "4 Star", totalReviews: 10 },
    { id: 3, content: "3 Star", totalReviews: 5 },
    { id: 2, content: "2 Star", totalReviews: 2 },
    { id: 1, content: "1 Star", totalReviews: 0 },
  ];

  const pagingInfo: PagingInfo = {
    page: currentPage,
    page_size: pageSize,
    total_items: totalReviews,
    total_pages: Math.ceil(totalReviews / pageSize),
    has_next: currentPage < Math.ceil(totalReviews / pageSize),
    has_prev: currentPage > 1,
  };

  const maxPageButtons = 5;
  const pageRange: number[] = [];
  const startPage = Math.max(1, currentPage - Math.floor(maxPageButtons / 2));
  const endPage = Math.min(
    pagingInfo.total_pages,
    startPage + maxPageButtons - 1
  );

  for (let i = startPage; i <= endPage; i++) {
    pageRange.push(i);
  }

  const isLoading = false;

  const handlePrevPage = (): void => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = (): void => {
    if (pagingInfo.has_next) {
      setCurrentPage(currentPage + 1);
    }
  };

  const goToPage = (page: number): void => {
    setCurrentPage(page);
  };

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>): void => {
    const value = e.target.value as SortReviewBy;
    setSortBy(value);
  };

  const handlePageSizeChange = (
    e: React.ChangeEvent<HTMLSelectElement>
  ): void => {
    const value = Number(e.target.value) as AllowedPageSize;
    setPageSize(value);
    setCurrentPage(1);
  };

  const handleStarFilterClick = (rating: AllowedStarRating): void => {
    setFilterRating(rating);
    setCurrentPage(1);
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-5xl">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 border-b pb-4">
          Customer Reviews
          {filterRating > 0 && (
            <span className="ml-2 text-gray-600 text-lg">
              (Filtered by {filterRating} Star)
            </span>
          )}
        </h2>

        <div className="mb-8">
          <div className="flex items-center mb-4">
            <div className="flex items-baseline">
              <span className="text-3xl font-bold text-gray-900">
                {avgRating} Star
              </span>
            </div>
          </div>

          <div className="flex flex-wrap gap-3 mb-6">
            <button
              onClick={() => handleStarFilterClick(0)}
              className={`text-sm px-2 py-1 transition-colors border-b-2 ${
                filterRating === 0
                  ? "border-blue-500 text-blue-600 font-semibold"
                  : "border-transparent text-gray-600 hover:text-gray-800"
              }`}
            >
              All ({totalReviews})
            </button>
            {stars.map((star) => (
              <button
                key={star.id}
                onClick={() => handleStarFilterClick(star.id)}
                className={`text-sm px-2 py-1 transition-colors border-b-2 ${
                  filterRating === star.id
                    ? "border-blue-500 text-blue-600 font-semibold"
                    : "border-transparent text-gray-600 hover:text-gray-800"
                }`}
              >
                {star.content} ({star.totalReviews})
              </button>
            ))}
          </div>
        </div>

        <div className="border-t border-gray-200 pt-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
            <div className="text-gray-600 mb-4 sm:mb-0">
              Showing {(currentPage - 1) * pageSize + 1}-
              {Math.min(currentPage * pageSize, totalReviews)} of {totalReviews}{" "}
              reviews
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex items-center">
                <label
                  htmlFor="sortBy"
                  className="text-gray-600 mr-2 whitespace-nowrap"
                >
                  Sort by:
                </label>
                <select
                  name="sortBy"
                  id="sortBy"
                  value={sortBy}
                  onChange={handleSortChange}
                  className="border border-gray-300 rounded-md px-3 py-1.5 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="newest">Newest to oldest</option>
                  <option value="oldest">Oldest to newest</option>
                </select>
              </div>
              <div className="flex items-center">
                <label
                  htmlFor="pageSize"
                  className="text-gray-600 mr-2 whitespace-nowrap"
                >
                  Show:
                </label>
                <select
                  name="pageSize"
                  id="pageSize"
                  value={pageSize}
                  onChange={handlePageSizeChange}
                  className="border border-gray-300 rounded-md px-3 py-1.5 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {allowedPageSizes.map((size) => (
                    <option key={size} value={size}>
                      {size}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="space-y-6 mb-8">
            <div className="border-b border-gray-200 pb-6">
              <div className="flex justify-between mb-2 review-header">
                <div className="ml-2 font-medium">Great book! | 5 Star</div>
              </div>

              <div className="mt-2 review-content">
                This was an excellent read. The characters were well-developed
                and the plot kept me engaged throughout. Highly recommend to
                anyone who enjoys this genre.
              </div>
              <div className="mt-2 text-sm text-gray-500">April 15, 2025</div>
            </div>

            <div className="text-center text-gray-500 italic py-4">
              Additional reviews would be loaded here
            </div>
          </div>
        </div>

        <div className="flex justify-center items-center">
          <nav className="flex items-center space-x-1">
            <button
              onClick={handlePrevPage}
              disabled={isLoading || currentPage === 1 || !pagingInfo.has_prev}
              className="px-3 py-2 rounded-md border border-gray-300 bg-white text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
              aria-label="Previous page"
            >
              <span>&laquo; Prev</span>
            </button>

            {pageRange.map((page) => (
              <button
                key={page}
                onClick={() => goToPage(page)}
                className={`px-3 py-2 rounded-md border ${
                  page === currentPage
                    ? "bg-blue-500 text-white border-blue-500"
                    : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                } transition-colors`}
                disabled={isLoading}
                aria-current={page === currentPage ? "page" : undefined}
              >
                {page}
              </button>
            ))}

            <button
              onClick={handleNextPage}
              disabled={isLoading || !pagingInfo.has_next}
              className="px-3 py-2 rounded-md border border-gray-300 bg-white text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
              aria-label="Next page"
            >
              <span>Next &raquo;</span>
            </button>
          </nav>
        </div>
      </div>
    </div>
  );
};

export default ReviewList;
