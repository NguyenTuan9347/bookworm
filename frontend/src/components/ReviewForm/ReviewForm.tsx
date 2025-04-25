import React, { useState } from "react";
import {
  AllowedStarRating,
  ReviewListProps,
  ReviewCreate,
} from "@/shared/interfaces";
import { createReview } from "@/api/reviews";

const ReviewForm = ({ motherClassName, bookId }: ReviewListProps) => {
  const numericBookId = bookId ? parseInt(bookId) : 1;
  const [rating, setRating] = useState<AllowedStarRating>(0);
  const [title, setTitle] = useState<string>("");
  const [details, setDetails] = useState<string>("");
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [message, setMessage] = useState<string>("");

  const starRatings: AllowedStarRating[] = [1, 2, 3, 4, 5];

  const handleRatingChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = parseInt(e.target.value, 10);
    if (!isNaN(value)) {
      setRating(value as AllowedStarRating);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");

    const data: ReviewCreate = {
      book_id: numericBookId,
      review_title: title,
      review_details: details,
      rating_start: rating,
    };

    try {
      await createReview(data);
      setStatus("success");
      setMessage("Review submitted successfully!");

      setTimeout(() => {
        setRating(0);
        setTitle("");
        setDetails("");
        setStatus("idle");
        setMessage("");
      }, 5000);
    } catch (error) {
      console.error("Failed to submit review:", error);
      setStatus("error");
      setMessage("Failed to submit review. Please try again.");

      setTimeout(() => {
        setStatus("idle");
        setMessage("");
      }, 5000);
    }
  };

  const isFormDisabled = status === "loading" || status === "success";

  return (
    <div className={motherClassName}>
      <div className="p-6 bg-gray-50 border-b border-gray-300">
        <h1 className="text-2xl font-bold text-gray-800 text-center">
          Write a Review
        </h1>
      </div>

      {(status === "success" || status === "error") && (
        <div
          className={`p-4 ${
            status === "success"
              ? "bg-green-100 text-green-800"
              : "bg-red-100 text-red-800"
          } rounded-md mx-6 mt-6`}
        >
          {message}
        </div>
      )}

      <form
        id="review-form"
        onSubmit={handleSubmit}
        className="space-y-6 p-6 border-b border-gray-300"
      >
        <div className="space-y-2">
          <label
            htmlFor="title"
            className="text-sm font-medium text-gray-700 flex items-center"
          >
            Add a title
          </label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="What's most important to know?"
            required
            disabled={isFormDisabled}
          />
        </div>

        <div className="space-y-2">
          <label
            htmlFor="details"
            className="block text-sm font-medium text-gray-700"
          >
            Details please! Your review helps other shoppers
          </label>
          <textarea
            id="details"
            value={details}
            onChange={(e) => setDetails(e.target.value)}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="What did you like or dislike? What did you use this product for?"
            disabled={isFormDisabled}
          />
        </div>

        <div className="space-y-2">
          <label
            htmlFor="rating"
            className="text-sm font-medium text-gray-700 flex items-center"
          >
            Rating
          </label>
          <select
            id="rating"
            value={rating}
            onChange={handleRatingChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
            disabled={isFormDisabled}
          >
            <option value={0} disabled>
              Select a rating
            </option>
            {starRatings.map((star) => (
              <option key={star} value={star}>
                {star} Star{star !== 1 ? "s" : ""}
              </option>
            ))}
          </select>
        </div>
      </form>

      <div className="p-6 bg-gray-50">
        <button
          type="submit"
          form="review-form"
          disabled={!title || rating === 0 || isFormDisabled}
          className={`w-full py-2 px-4 font-medium rounded-md shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 
            ${
              status === "loading"
                ? "bg-blue-400 text-white cursor-not-allowed"
                : status === "success"
                ? "bg-green-600 hover:bg-green-700 text-white"
                : status === "error"
                ? "bg-red-600 hover:bg-red-700 text-white"
                : "bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white"
            }`}
        >
          {status === "loading"
            ? "Submitting..."
            : status === "success"
            ? "Submitted Successfully!"
            : status === "error"
            ? "Try Again"
            : "Submit Review"}
        </button>
      </div>
    </div>
  );
};

export default ReviewForm;
