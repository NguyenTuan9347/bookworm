import { constVar } from "@/shared/constVar";
import { fetchApi } from "../api/core";

import {
  ListBooksParams,
  PaginatedResponse,
  DiscountedBookProfileCardProp,
  ListMostDiscountedBooksParams,
  ListFeaturedBooksParams,
} from "@/shared/interfaces";

export function fetchListBooks(
  params: ListBooksParams = {}
): Promise<PaginatedResponse<DiscountedBookProfileCardProp>> {
  const apiParams = { ...params };

  return fetchApi<PaginatedResponse<DiscountedBookProfileCardProp>>("/books", {
    method: "GET",
    params: apiParams,
  });
}

export function fetchMostDiscountedBooks(
  params: ListMostDiscountedBooksParams = {}
): Promise<DiscountedBookProfileCardProp[]> {
  const apiParams = { top_k: params.top_k };

  return fetchApi<DiscountedBookProfileCardProp[]>(
    constVar.api_routes.books.topDiscountAmount.path,
    {
      method: "GET",
      params: apiParams,
    }
  );
}

export function fetchFeaturedBooks(
  params: ListFeaturedBooksParams = {}
): Promise<DiscountedBookProfileCardProp[]> {
  const apiParams = { ...params };

  return fetchApi<DiscountedBookProfileCardProp[]>(
    constVar.api_routes.books.featured.path,
    {
      method: "GET",
      params: apiParams,
    }
  );
}
