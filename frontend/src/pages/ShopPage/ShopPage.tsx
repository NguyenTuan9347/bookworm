import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  AllowedPageSize,
  SortByOptions,
  ListBooksParams,
  DiscountedBookProfileCardProp,
} from "@/shared/interfaces";
import { constVar, sortByOptions, allowedPageSizes } from "@/shared/constVar";
import { fetchListBooks } from "@/api/books";
import {
  fetchCategoriesRange,
  fetchAuthorsRange,
  fetchReviewsRange,
} from "@/api/filteBar";
import BookGrid from "@/components/BookGrid/BookGrid";
import FilterBar from "@/components/FilterBar/FilterBar";

const getSortDisplayText = (sortValue: SortByOptions): string => {
  const sortTextMap: Record<SortByOptions, string> = {
    on_sale: "On Sale",
    popularity: "Popularity",
    price_asc: "Price: Low to High",
    price_desc: "Price: High to Low",
  };
  return sortTextMap[sortValue];
};

const getGridSpec = (pageSize: number): [number, number] => {
  if (pageSize === 5) {
    return [1, 5];
  } else if (pageSize === 15) {
    return [3, 5];
  } else if (pageSize === 20) {
    return [4, 5];
  } else if (pageSize === 25) {
    return [5, 5];
  } else {
    return [1, pageSize];
  }
};

const ShopPage = () => {
  const [filteredCategory, setCategory] = useState<string | null>(null);
  const [filteredAuthor, setAuthor] = useState<string | null>(null);
  const [filteredRating, setRating] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<SortByOptions>("on_sale");
  const [pageSize, setPageSize] = useState<AllowedPageSize>(
    allowedPageSizes[1]
  );

  const [currentPage, setCurrentPage] = useState(1);

  const filterQueries = {
    categories: useQuery({
      queryKey: [constVar.api_keys.categories_range],
      queryFn: fetchCategoriesRange,
      staleTime: 1000 * 60 * 5,
      select: (payload) => payload.data,
    }),
    authors: useQuery({
      queryKey: [constVar.api_keys.authors_range],
      queryFn: fetchAuthorsRange,
      staleTime: 1000 * 60 * 5,
      select: (payload) => payload.data,
    }),
    ratings: useQuery({
      queryKey: [constVar.api_keys.reviews_range],
      queryFn: fetchReviewsRange,
      staleTime: 1000 * 60 * 5,
      select: (payload) => payload.data,
    }),
  };

  const listBooksParams: ListBooksParams = {
    page: currentPage,
    page_size: pageSize,
    sort_by: sortBy,
    ...(filteredCategory && { category: filteredCategory }),
    ...(filteredAuthor && { author: filteredAuthor }),
    ...(filteredRating && { min_rating: parseInt(filteredRating, 10) }),
  };

  const booksQuery = useQuery({
    queryKey: [constVar.api_keys.filtered_and_sorted_books, listBooksParams],
    queryFn: () => fetchListBooks(listBooksParams),
    staleTime: 1000 * 30,
  });

  const books: DiscountedBookProfileCardProp[] = booksQuery.data?.data ?? [];

  const pagingInfo = booksQuery.data?.paging;
  const totalItems = pagingInfo?.total_items ?? 0;
  const totalPages = pagingInfo?.total_pages ?? 1;

  const itemsStart = totalItems > 0 ? (currentPage - 1) * pageSize + 1 : 0;
  const itemsEnd = Math.min(currentPage * pageSize, totalItems);
  const resultsText = `Showing ${itemsStart}-${itemsEnd} of ${totalItems} results`;

  const updateFilterAndResetPage =
    <T,>(setter: React.Dispatch<React.SetStateAction<T>>) =>
    (value: T) => {
      setter(value);
      setCurrentPage(1);
    };

  const handleCategoryChange = updateFilterAndResetPage(setCategory);
  const handleAuthorChange = updateFilterAndResetPage(setAuthor);
  const handleRatingChange = updateFilterAndResetPage(setRating);
  const handleSortChange = updateFilterAndResetPage(setSortBy);

  const handlePageSizeChange = (newPageSize: string) => {
    const size = parseInt(newPageSize, 10) as AllowedPageSize;
    if (allowedPageSizes.includes(size)) {
      setPageSize(size);
      setCurrentPage(1);
    }
  };
  const k = 1;
  let start = Math.max(1, currentPage - k);
  let end = Math.min(totalPages, currentPage + k);

  if (currentPage - k < 1) {
    end = Math.min(totalPages, end + (k - currentPage + 1));
  }

  if (currentPage + k > totalPages) {
    start = Math.max(1, start - (currentPage + k - totalPages));
  }

  const pageRange: number[] = [];
  for (let i = start; i <= end; i++) {
    pageRange.push(i);
  }

  const handlePrevPage = () => setCurrentPage((prev) => Math.max(1, prev - 1));
  const handleNextPage = () => {
    if (pagingInfo?.has_next) setCurrentPage((prev) => prev + 1);
  };

  const goToPage = (page: number) => {
    if (page !== currentPage && page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  if (Object.values(filterQueries).some((q) => q.isLoading)) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        Loading filter options...
      </div>
    );
  }

  const activeFilters = [
    filteredCategory && `Category=${filteredCategory}`,
    filteredAuthor && `Author=${filteredAuthor}`,
    filteredRating !== null && `Rating=${filteredRating}+`,
  ]
    .filter(Boolean)
    .join(", ");

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex min-h-screen flex-col">
        <div className="header border-b border-gray-200 py-4 mb-6">
          <h1 className="text-2xl font-semibold text-gray-800 align-center">
            BOOKS{" "}
            {activeFilters && (
              <span className="text-xs text-gray-400 mt-1">
                Filtered by: ({activeFilters})
              </span>
            )}
          </h1>
        </div>

        <div className="content flex flex-col md:flex-row flex-grow gap-6 lg:gap-8">
          <FilterBar
            categories={filterQueries.categories.data ?? []}
            authors={filterQueries.authors.data ?? []}
            ratings={filterQueries.ratings.data ?? []}
            selectedCategory={filteredCategory}
            selectedAuthor={filteredAuthor}
            selectedRating={filteredRating}
            onCategoryChange={handleCategoryChange}
            onAuthorChange={handleAuthorChange}
            onRatingChange={handleRatingChange}
          />

          <div className="grid-books flex flex-col flex-grow">
            <div className="metadata-sort-options flex flex-col sm:flex-row justify-between items-center mb-4 gap-4">
              <p className="text-sm text-gray-600">
                {booksQuery.isFetching ? "Loading results..." : resultsText}
              </p>

              <div className="flex space-x-3">
                <select
                  value={sortBy}
                  onChange={(e) =>
                    handleSortChange(e.target.value as SortByOptions)
                  }
                  className="border border-gray-300 px-3 py-1 rounded text-sm text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
                  aria-label="Sort by"
                  disabled={booksQuery.isFetching}
                >
                  {sortByOptions.map((option) => (
                    <option key={option} value={option}>
                      {getSortDisplayText(option)}
                    </option>
                  ))}
                </select>

                <select
                  value={pageSize}
                  onChange={(e) => handlePageSizeChange(e.target.value)}
                  className="border border-gray-300 px-3 py-1 rounded text-sm text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
                  aria-label="Items per page"
                  disabled={booksQuery.isFetching}
                >
                  {allowedPageSizes.map((size) => (
                    <option key={size} value={size}>
                      {size} / page
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex-grow overflow-auto flex-col">
              {booksQuery.isLoading && (
                <div className="text-center py-10">Loading books...</div>
              )}

              {booksQuery.isError && (
                <div className="text-center py-10 text-red-600">
                  Failed to load books:{" "}
                  {booksQuery.error instanceof Error
                    ? booksQuery.error.message
                    : "Unknown error"}
                </div>
              )}

              {!booksQuery.isLoading &&
                !booksQuery.isError &&
                (books.length > 0 ? (
                  <BookGrid
                    books={books}
                    col_size={getGridSpec(pageSize)[1]}
                    row_size={getGridSpec(pageSize)[0]}
                  />
                ) : (
                  <div className="text-center py-10 text-gray-500">
                    No books found matching your criteria.
                  </div>
                ))}
            </div>

            <div className="footer mt-8 flex justify-center items-center space-x-1 flex-wrap text-sm">
              <button
                onClick={handlePrevPage}
                disabled={
                  booksQuery.isFetching ||
                  currentPage === 1 ||
                  !(pagingInfo?.has_prev ?? true)
                }
                className="px-2 py-1 border rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
              >
                Prev
              </button>

              {pageRange.map((page) => (
                <button
                  key={page}
                  onClick={() => goToPage(page)}
                  className={`px-3 py-1 border rounded ${
                    page === currentPage
                      ? "bg-blue-500 text-white"
                      : "hover:bg-gray-100"
                  }`}
                  disabled={booksQuery.isFetching}
                >
                  {page}
                </button>
              ))}

              <button
                onClick={handleNextPage}
                disabled={
                  booksQuery.isFetching || !(pagingInfo?.has_next ?? false)
                }
                className="px-2 py-1 border rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShopPage;
