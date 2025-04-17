import { ReactNode } from "react";
export interface Link {
  ref: string;
  label: string;
}

export interface User {
  first_name: string;
  last_name: string;
}

export interface ListFeaturedBooksParams {
  sort_by?: FeaturedSortOptions;
  top_k?: number;
}

export interface ListMostDiscountedBooksParams {
  top_k?: number;
}

export interface CartState extends Link {
  countItem: number;
  setCount: (newCount: number) => void;
}

export interface AdditionalInfo {
  companyName?: string;
  applicationName: string;
  address: string;
  phoneNumber: string;
}

export interface NavBarProps {
  links: Link[];
  signInMetadata: Link;
}

export interface BookProfileCardProp {
  id: string;
  book_title: string;
  book_cover_photo?: string;
  author_name?: string;
  book_price: number;
}

export interface DiscountedBookProfileCardProp extends BookProfileCardProp {
  discount_price: number;
}

export interface CarouselDiscountedBookProps {
  books?: DiscountedBookProfileCardProp[];
}

export interface BookProfileCardProps {
  book: DiscountedBookProfileCardProp;
  index: number;
}

export interface BookProfile {
  book_title: string;
  book_summary: string;
  book_price: string;
  book_cover_photo: string;
  id: number;
  author_name: string;
  discount_price: string;
  category_name: string;
}

export interface BookGridProps {
  books?: DiscountedBookProfileCardProp[];
  col_size: number;
  row_size: number;
  className?: string;
}

export type AllowedPageSize = 5 | 15 | 20 | 25;

export type SortByOptions =
  | "on_sale"
  | "popularity"
  | "price_asc"
  | "price_desc";

export type FeaturedSortOptions = "recommended" | "popular";

export interface PagingInfo {
  page: number;
  page_size: number;
  total_items: number;
  total_pages: number;
  has_next: boolean;
  has_prev: boolean;
}
export interface PaginatedResponse<T> {
  data: T[];
  paging: PagingInfo;
}

export interface ApiError {
  status?: number;
  message?: string;
}

export interface BookParams {
  id?: string;
}
export interface ListBooksParams {
  page?: number;
  page_size?: AllowedPageSize;
  sort_by?: SortByOptions;
  category?: string;
  author?: string;
  min_rating?: number;
}

export interface ListPayload<T = string | number> {
  data: T[];
  type: string;
}

export interface FilterBarProps {
  categories: string[];
  authors: string[];
  ratings: string[];
  selectedCategory: string | null;
  selectedAuthor: string | null;
  selectedRating: string | null;
  onCategoryChange: (category: string | null) => void;
  onAuthorChange: (author: string | null) => void;
  onRatingChange: (rating: string | null) => void;
}

export interface AuthProviderProps {
  children: ReactNode;
}

export interface JWTTokenResponse {
  access_token: string;
  type: string;
}

export interface DecodedToken {
  sub: string | number | null;
  exp: number;
}

export interface FetchOptions {
  method?: string;
  headers?: Record<string, string>;
  body?: string;
  credentials?: "include" | "omit" | "same-origin";
}
export interface DropdownProps {
  trigger: ReactNode;
  menu: ReactNode[];
}

export type AuthRequireAPIFetch = <T = unknown>(
  endpoint: string,
  options?: FetchOptions
) => Promise<T>;

export interface AuthContextValue {
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  authRequireAPIFetch: AuthRequireAPIFetch;
}
