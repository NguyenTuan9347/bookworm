import { constVar } from "@/shared/constVar";
import { fetchApi } from "../api/core";

import {
  ListBooksParams,
  PaginatedResponse,
  DiscountedBookProfileCardProp,
  ListMostDiscountedBooksParams,
  ListFeaturedBooksParams,
  BookParams,
  BookProfile,
} from "@/shared/interfaces";

export function fetchListBooks(
  params: ListBooksParams = {}
): Promise<PaginatedResponse<DiscountedBookProfileCardProp>> {
  const apiParams = { ...params };

  return fetchApi<PaginatedResponse<DiscountedBookProfileCardProp>>(
    constVar.api_routes.books.list.path,
    {
      method: constVar.api_routes.books.list.method,
      params: apiParams,
    }
  );
}

export function fetchBookById(params: BookParams): Promise<BookProfile> {
  const apiParams = { ...params };
  if (!apiParams.id) {
    throw new Error(constVar.errorMessage.missingBookID);
  }
  return fetchApi<BookProfile>(
    constVar.api_routes.books.detail.pathTemplate(apiParams.id),
    {
      method: constVar.api_routes.books.detail.method,
      params: apiParams,
    }
  );
}

export function fetchMostDiscountedBooks(
  params: ListMostDiscountedBooksParams = {}
): Promise<DiscountedBookProfileCardProp[]> {
  const apiParams = { top_k: params.top_k };

  return fetchApi<DiscountedBookProfileCardProp[]>(
    constVar.api_routes.books.topDiscountAmount.path,
    {
      method: constVar.api_routes.books.topDiscountAmount.method,
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
      method: constVar.api_routes.books.featured.method,
      params: apiParams,
    }
  );
}
