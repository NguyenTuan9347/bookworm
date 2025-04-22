// src/services/filtersApi.ts
import { constVar } from "@/shared/constVar";
import { fetchApi } from "../api/core";
import { ListPayload } from "@/shared/interfaces";

export function fetchCategoriesRange(): Promise<ListPayload<string>> {
  const endpoint = constVar.api_routes.categories.range.path;
  return fetchApi<ListPayload<string>>(endpoint, { method: "GET" });
}

export function fetchAuthorsRange(): Promise<ListPayload<string>> {
  const endpoint = constVar.api_routes.authors.range.path;
  return fetchApi<ListPayload<string>>(endpoint, { method: "GET" });
}

export function fetchReviewsRange(): Promise<ListPayload<string>> {
  const endpoint = constVar.api_routes.reviews.range.path;
  return fetchApi<ListPayload<string>>(endpoint, { method: "GET" });
}
