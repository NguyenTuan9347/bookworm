import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  AllowedPageSize,
  SortReviewBy,
  AllowedStarRating,
  ReviewListProps,
  ListReviewsParams,
  ReviewCard,
  Star,
  ReviewMetadata,
  PaginatedResponse,
} from "@/shared/interfaces";
import { allowedPageSizes, constVar } from "@/shared/constVar";
import { fetchListReviews, fetchReviewMetadata } from "@/api/reviews";

const formatDate = (dateString: string | Date): string => {
  if (!dateString) return "";
  try {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch (error) {
    console.error("Error formatting date:", error);
    return "Invalid Date";
  }
};

const ReviewList = ({ bookId, motherClassName }: ReviewListProps) => {
  const [filterRating, setFilterRating] = useState<AllowedStarRating>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<AllowedPageSize>(
    allowedPageSizes[1] ?? 15
  );
  const [sortBy, setSortBy] = useState<SortReviewBy>("newest");
  const [numericBookId, setNumericBookId] = useState<number>(1);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    let parsedBookId: number;
    if (!bookId) {
      parsedBookId = 1;
    } else {
      parsedBookId = typeof bookId === "string" ? parseInt(bookId, 10) : bookId;
      if (isNaN(parsedBookId)) {
        setErrorMsg("Error: Invalid Book ID format");
        parsedBookId = 1;
      } else {
        setErrorMsg(null);
      }
    }
    setNumericBookId(parsedBookId);
  }, [bookId]);

  const metadataQuery = useQuery<ReviewMetadata, Error>({
    queryKey: [constVar.api_keys.review_metadata, numericBookId],
    queryFn: () => fetchReviewMetadata({ book_id: numericBookId }),
    enabled: true,
    staleTime: 1000 * 60 * 5,
  });

  const listReviewsParams: ListReviewsParams = {
    book_id: numericBookId,
    page: currentPage,
    page_size: pageSize,
    sort_by: sortBy,
    ...(filterRating > 0 && { filter_rating: filterRating }),
  };

  const reviewsQuery = useQuery<PaginatedResponse<ReviewCard>, Error>({
    queryKey: [constVar.api_keys.reviews_list, listReviewsParams],
    queryFn: () => fetchListReviews(listReviewsParams),
    enabled: true,
    staleTime: 1000 * 30 * 5,
  });

  const metadata = metadataQuery.data;
  const reviewsData = reviewsQuery.data?.data ?? [];
  const pagingInfo = reviewsQuery.data?.paging;

  const isLoading = metadataQuery.isLoading || reviewsQuery.isFetching;
  const isError = metadataQuery.isError || reviewsQuery.isError;
  const error = metadataQuery.error || reviewsQuery.error;

  const totalReviews = metadata?.total_reviews ?? 0;
  const avgRating = metadata?.average_rating ?? 0;

  const stars: Star[] = metadata?.star_counts
    ? Object.entries(metadata.star_counts)
        .sort(([a], [b]) => parseInt(b) - parseInt(a))
        .map(([rating, count]) => ({
          id: parseInt(rating) as AllowedStarRating,
          content: `${rating} Star`,
          totalReviews: count,
        }))
    : [];

  const totalPages = pagingInfo?.total_pages ?? 1;
  const maxPageButtons = 5;
  const pageRange: number[] = [];
  if (totalPages > 1) {
    let startPage = Math.max(1, currentPage - Math.floor(maxPageButtons / 2));
    const endPage = Math.min(totalPages, startPage + maxPageButtons - 1);

    if (endPage - startPage + 1 < maxPageButtons) {
      startPage = Math.max(1, endPage - maxPageButtons + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pageRange.push(i);
    }
  }

  const handlePrevPage = (): void => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = (): void => {
    if (pagingInfo?.has_next) {
      setCurrentPage(currentPage + 1);
    }
  };

  const goToPage = (page: number): void => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>): void => {
    const value = e.target.value as SortReviewBy;
    setSortBy(value);
    setCurrentPage(1);
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

  if (errorMsg) {
    return (
      <div className="container mx-auto py-8 px-4 max-w-5xl text-center text-red-600">
        {errorMsg}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="container mx-auto py-8 px-4 max-w-5xl text-center text-red-600">
        Error loading reviews: {error?.message || "Unknown error"}
      </div>
    );
  }

  return (
    <div className={motherClassName}>
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
          {metadataQuery.isLoading ? (
            <div className="animate-pulse h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          ) : (
            <div className="flex items-center mb-4">
              <div className="flex items-baseline">
                <span className="text-3xl font-bold text-gray-900">
                  {avgRating.toFixed(1)} Star
                </span>
                <span className="ml-2 text-gray-600">
                  ({totalReviews} Reviews)
                </span>
              </div>
            </div>
          )}

          {metadataQuery.isLoading ? (
            <div className="flex flex-wrap gap-3 mb-6">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="animate-pulse h-6 bg-gray-200 rounded w-20"
                ></div>
              ))}
            </div>
          ) : (
            <div className="flex flex-wrap gap-3 mb-6">
              <button
                onClick={() => handleStarFilterClick(0)}
                disabled={isLoading}
                className={`text-sm px-2 py-1 transition-colors border-b-2 ${
                  filterRating === 0
                    ? "border-blue-500 text-blue-600 font-semibold"
                    : "border-transparent text-gray-600 hover:text-gray-800"
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                All ({totalReviews})
              </button>
              {stars.map((star) => (
                <button
                  key={star.id}
                  onClick={() => handleStarFilterClick(star.id)}
                  disabled={isLoading}
                  className={`text-sm px-2 py-1 transition-colors border-b-2 ${
                    filterRating === star.id
                      ? "border-blue-500 text-blue-600 font-semibold"
                      : "border-transparent text-gray-600 hover:text-gray-800"
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {star.content} ({star.totalReviews})
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="border-t border-gray-200 pt-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
            <div className="text-gray-600 mb-4 sm:mb-0">
              {pagingInfo && totalReviews > 0 ? (
                `Showing ${
                  (pagingInfo.page - 1) * pagingInfo.page_size + 1
                }-${Math.min(
                  pagingInfo.page * pagingInfo.page_size,
                  pagingInfo.total_items
                )} of ${pagingInfo.total_items} reviews`
              ) : totalReviews === 0 && !isLoading ? (
                "No reviews found"
              ) : (
                <span className="animate-pulse h-5 bg-gray-200 rounded w-32 inline-block"></span>
              )}
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
                  disabled={isLoading}
                  className="border border-gray-300 rounded-md px-3 py-1.5 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:bg-gray-100"
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
                  disabled={isLoading}
                  className="border border-gray-300 rounded-md px-3 py-1.5 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:bg-gray-100"
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
            {isLoading && reviewsData.length === 0 && (
              <>
                {[...Array(3)].map((_, i) => (
                  <div
                    key={i}
                    className="border-b border-gray-200 pb-6 animate-pulse"
                  >
                    <div className="h-5 bg-gray-200 rounded w-3/4 mb-3"></div>
                    <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-5/6 mb-3"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                  </div>
                ))}
              </>
            )}

            {!isLoading && reviewsData.length === 0 && (
              <div className="text-center text-gray-500 italic py-4">
                No reviews match the current filters.
              </div>
            )}

            {reviewsData.map((review: ReviewCard) => (
              <div key={review.id} className="border-b border-gray-200 pb-6">
                <div className="flex justify-between mb-2 review-header">
                  <div className="ml-2 font-medium">
                    {review.review_title} | {review.rating_start} Star
                  </div>
                </div>

                <div className="mt-2 review-content text-gray-700">
                  {review.review_details}
                </div>

                <div className="mt-2 text-sm text-gray-500">
                  {formatDate(review.review_date)}
                </div>
              </div>
            ))}
          </div>
        </div>

        {totalPages > 1 && (
          <div className="flex justify-center items-center">
            <nav className="flex items-center space-x-1">
              <button
                onClick={handlePrevPage}
                disabled={isLoading || currentPage === 1}
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
                      ? "bg-blue-500 text-white border-blue-500 font-semibold"
                      : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                  } transition-colors disabled:opacity-50 disabled:cursor-not-allowed`}
                  disabled={isLoading}
                  aria-current={page === currentPage ? "page" : undefined}
                >
                  {page}
                </button>
              ))}

              <button
                onClick={handleNextPage}
                disabled={isLoading || !(pagingInfo?.has_next ?? false)}
                className="px-3 py-2 rounded-md border border-gray-300 bg-white text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                aria-label="Next page"
              >
                <span>Next &raquo;</span>
              </button>
            </nav>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReviewList;
