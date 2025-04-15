import { constVar } from "@/shared/constVar";
import { fetchApi } from "../api/core";

import {
  ListBooksParams,
  PaginatedResponse,
  DiscountedBookProfileCard,
  ListMostDiscountedBooksParams,
  ListFeaturedBooksParams,
} from "@/shared/interfaces";

export function fetchListBooks(
  params: ListBooksParams = {}
): Promise<PaginatedResponse<DiscountedBookProfileCard>> {
  const apiParams = { ...params };

  return fetchApi<PaginatedResponse<DiscountedBookProfileCard>>("/books", {
    method: "GET",
    params: apiParams,
  });
}

export function fetchMostDiscountedBooks(
  params: ListMostDiscountedBooksParams = {}
): Promise<DiscountedBookProfileCard[]> {
  const apiParams = { top_k: params.top_k };

  return fetchApi<DiscountedBookProfileCard[]>(
    constVar.api_routes.books.topDiscountAmount.path,
    {
      method: "GET",
      params: apiParams,
    }
  );
}

export function fetchFeaturedBooks(
  params: ListFeaturedBooksParams = {}
): Promise<DiscountedBookProfileCard[]> {
  const apiParams = { ...params };

  return fetchApi<DiscountedBookProfileCard[]>(
    constVar.api_routes.books.featured.path,
    {
      method: "GET",
      params: apiParams,
    }
  );
}
