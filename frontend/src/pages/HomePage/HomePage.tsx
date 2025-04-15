import CarouselDiscountedBook from "../../components/Carousel/Carousel";
import BookGrid from "@/components/BookGrid/BookGrid";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";

import { fetchMostDiscountedBooks, fetchFeaturedBooks } from "@/api/books";

import { constVar } from "@/shared/constVar";

const HomePage = () => {
  const [activeTab, setActiveTab] = useState<"recommended" | "popular">(
    "recommended"
  );

  const {
    data: discountedBooks,
    isLoading: isLoadingDiscounted,
    isError: isErrorDiscounted,
    error: errorDiscounted,
  } = useQuery({
    queryKey: [constVar.api_keys.top_discounted_books, { top_k: 10 }],
    queryFn: () => fetchMostDiscountedBooks({ top_k: 10 }),
    staleTime: 1000 * 60,
  });

  const {
    data: featuredBooks,
    isLoading: isLoadingFeatured,
    isError: isErrorFeatured,
    error: errorFeatured,
  } = useQuery({
    queryKey: [
      constVar.api_keys.featured_books,
      { sort_by: activeTab, top_k: 8 },
    ],
    queryFn: () => fetchFeaturedBooks({ sort_by: activeTab, top_k: 8 }),
    staleTime: 1000 * 60,
  });

  const isLoading = isLoadingDiscounted || isLoadingFeatured;
  const isError = isErrorDiscounted || isErrorFeatured;

  if (isLoading) {
    return <div className="max-w-6xl mx-auto p-4">Loading books...</div>;
  }

  if (isError) {
    console.error("Discounted Error:", errorDiscounted);
    console.error("Featured Error:", errorFeatured);
    return (
      <div className="max-w-6xl mx-auto p-4 text-red-600">
        Error loading books. Please try again later.
      </div>
    );
  }

  return (
    <>
      <div className="home-page-container max-w-6xl mx-auto p-4 space-y-8">
        <div className="sale">
          <div className="header flex flex-row text-center justify-between mb-2 items-center ">
            <h1 className="text-xl font-bold">On Sale</h1>{" "}
            <button className="bg-gray-700 hover:bg-gray-600 text-white text-xs font-medium rounded-md px-3 py-1 items-center flex gap-1 transition-colors duration-150">
              View All
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                className="size-4 inline"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="m8.25 4.5 7.5 7.5-7.5 7.5"
                />
              </svg>
            </button>
          </div>
          <CarouselDiscountedBook books={discountedBooks} />
        </div>
        <div className="show-case flex flex-col">
          <div className="options flex flex-row mb-4 justify-center">
            <button
              onClick={() => setActiveTab("recommended")}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors duration-150 border ${
                activeTab === "recommended"
                  ? "border-blue-600 text-blue-600 bg-blue-50" // Active: Blue border, text, light bg
                  : "border-transparent text-gray-600 hover:text-blue-600 hover:bg-gray-100"
              }`}
            >
              Recommended
            </button>
            <button
              onClick={() => setActiveTab("popular")}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors duration-150 border ml-2 ${
                activeTab === "popular"
                  ? "border-blue-600 text-blue-600 bg-blue-50"
                  : "border-transparent text-gray-600 hover:text-blue-600 hover:bg-gray-100"
              }`}
            >
              Popularity
            </button>
          </div>
          <div className="books-grid-container">
            <BookGrid books={featuredBooks} row_size={2} col_size={4} />
          </div>
        </div>
      </div>
    </>
  );
};

export default HomePage;
