export interface Link {
  ref: string;
  label: string;
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

export interface BookProfile {
  book_title: string;
  book_cover_photo?: string;
  author_id?: string;
  book_price: number;
}

export interface DiscountedBookProfileCard extends BookProfile {
  discount_price: number;
}

export interface CarouselDiscountedBookProps {
  books?: DiscountedBookProfileCard[];
}

export interface BookProfileCardProps {
  book: DiscountedBookProfileCard;
  index: number;
}
export interface BookGridProps {
  books?: DiscountedBookProfileCard[];
  col_size: number;
  row_size: number;
  className?: string;
}

export type AllowedPageSize = 5 | 15 | 20 | 25;

export type SortByOptions =
  | "default"
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

export interface ListBooksParams {
  page?: number;
  page_size?: AllowedPageSize;
  sort_by?: SortByOptions;
  category?: string;
  author?: string;
  min_rating?: number;
}
