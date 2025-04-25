import { constVar } from "@/shared/constVar";
import { fetchApi } from "../api/core";
import { ReviewCreate } from "@/shared/interfaces";

import {
  ListReviewsParams,
  PaginatedResponse,
  ReviewCard,
  ReviewMetadata,
  ReviewMetadataParams,
} from "@/shared/interfaces";

export function fetchListReviews(
  params: ListReviewsParams
): Promise<PaginatedResponse<ReviewCard>> {
  const apiParams = { ...params };

  return fetchApi<PaginatedResponse<ReviewCard>>(
    constVar.api_routes.reviews.list.path,
    {
      method: constVar.api_routes.reviews.list.method,
      params: apiParams,
    }
  );
}

export function fetchReviewMetadata(
  params: ReviewMetadataParams
): Promise<ReviewMetadata> {
  const apiParams = { ...params };
  return fetchApi<ReviewMetadata>(constVar.api_routes.reviews.metadata.path, {
    method: constVar.api_routes.reviews.metadata.method,
    params: apiParams,
  });
}

export function createReview(data: ReviewCreate) {
  console.log(data);
  return fetchApi(constVar.api_routes.reviews.create.path, {
    method: constVar.api_routes.reviews.create.method,
    body: JSON.stringify(data),
  });
}
