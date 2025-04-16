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

export interface BookProfileProp {
  book_title: string;
  book_cover_photo?: string;
  author_name?: string;
  book_price: number;
}

export interface DiscountedBookProfileCardProp extends BookProfileProp {
  discount_price: number;
}

export interface CarouselDiscountedBookProps {
  books?: DiscountedBookProfileCardProp[];
}

export interface BookProfileCardProps {
  book: DiscountedBookProfileCardProp;
  index: number;
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
