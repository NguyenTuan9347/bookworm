import { AllowedPageSize, SortByOptions } from "./interfaces";
export const allowedPageSizes: AllowedPageSize[] = [5, 15, 20, 25];
export const sortByOptions: SortByOptions[] = [
  "on_sale",
  "popularity",
  "price_asc",
  "price_desc",
];

export const constVar = {
  links: [
    { label: "Home", ref: "/" },
    { label: "Shop", ref: "/shop" },
    { label: "About", ref: "/about" },
  ],
  api_keys: {
    reviews_list: "reviews_list",
    review_metadata: "review_metadata",
    book_detail: "book_by_id",
    filtered_and_sorted_books: "filtered_and_sort_books",
    featured_books: "featured_books",
    recommended_books: "recommended_books",
    top_discounted_books: "top_discounted_books",
    categories_range: "categories_range",
    authors_range: "authors_range",
    reviews_range: "reviews_range",
  },
  errorMessage: {
    loginOnly: "Cannot perform this action without a valid user ID.",
    failedOnCreateOrder: "On order creation there some thing gone wrong",
    invalidItem: "Invalid item provided to addItem",
    invalidEmailOrPass: "Invalid email or password was given",
    missingBookID: "Book ID is required to fetch book details.",
    APIDefault: "Something gone wrong when called API",
  },
  api_routes: {
    base: "/api",

    books: {
      list: {
        path: "/books",
        method: "GET",
        paramsHint:
          "page?, page_size?, sort_by? (default|popularity|price_asc|price_desc), category?, author?, min_rating?",
      },
      detail: {
        pathTemplate: (book_id: string) => `/book/${book_id}`,
        method: "GET",
        paramsHint: ":book_id (path parameter, required)",
      },
      topDiscountAmount: {
        path: "/books/top-discounted",
        method: "GET",
        paramsHint: "top_k? (query, default 10, e.g., ?top_k=10)",
      },
      recommended: {
        path: "/books/recommended",
        method: "GET",
        paramsHint: "top_k? (query, default 8, e.g., ?top_k=5)",
      },
      popular: {
        path: "/books/popular",
        method: "GET",
        paramsHint: "top_k? (query, default 8, e.g., ?top_k=5)",
      },
    },
    order: {
      create: {
        path: "/order",
        method: "POST",
      },
    },
    auth: {
      login: {
        path: "/login",
        method: "POST",
        paramsHint: "username, password",
      },
      refresh: {
        method: "POST",
        path: "/refresh",
      },
      logout: {
        path: "/logout",
        method: "POST",
      },
    },
    cart: {
      get: {
        path: "/cart",
        method: "GET",
        paramsHint: "Requires auth",
        label: "Cart",
      },
      add: {
        path: "/cart/item",
        method: "POST",
        paramsHint: "book_id, quantity, Requires auth",
      },
    },
    categories: {
      range: {
        path: "/categories/range",
      },
    },
    authors: {
      range: {
        path: "/authors/range",
      },
    },
    reviews: {
      create: {
        path: "/review",
        method: "POST",
      },
      range: {
        path: "/reviews/range",
      },
      list: {
        path: "/reviews",
        method: "GET",
        paramsHint:
          "page?, page_size?, sort_by? (oldest|newest), filter_rating?",
      },
      metadata: {
        path: "/reviews/metadata",
        method: "GET",
      },
    },
    user: {
      me: { path: "/users/me", method: "GET", paramsHint: "Requires auth" },
    },
  },
  cartMetadata: {
    label: "Cart",
    ref: "/cart",
    countItem: 0,
  },
  signInMetadata: {
    label: "Sign In",
    ref: "/signin",
  },
  LOCAL_STORAGE_KEY: "cartCount",
  additionalInfo: {
    companyName: "TechNova Inc.",
    applicationName: "BOOKWORM",
    address: "123 Innovation Drive, Silicon Valley, CA 94043",
    phoneNumber: "(123) 456-7890",
  },
};
