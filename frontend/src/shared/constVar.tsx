export const constVar = {
  links: [
    { label: "Home", ref: "/" },
    { label: "Shop", ref: "/shop" },
    { label: "About", ref: "/about" },
  ],
  api_keys: {
    featured_books: "featured_books",
    recommended_books: "recommended_books",
    top_discounted_books: "top_discounted_books",
  },
  errorMessage: {
    API_default: "Something gone wrong when called API",
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
        pathTemplate: "/book/:book_id",
        method: "GET",
        paramsHint: ":book_id (path parameter, required)",
      },
      topDiscountAmount: {
        path: "/books/top-discounted",
        method: "GET",
        paramsHint: "top_k? (query, default 10, e.g., ?top_k=10)",
      },
      featured: {
        path: "/books/featured",
        method: "GET",
        paramsHint:
          "sort_by? (query: recommended|popular, default recommended), top_k? (query, default 8, e.g., ?sort_by=popular&top_k=5)",
      },
    },

    auth: {
      login: {
        path: "/auth/login",
        method: "POST",
        paramsHint: "username, password",
      },
    },
    cart: {
      get: { path: "/cart", method: "GET", paramsHint: "Requires auth" },
      add: {
        path: "/cart/item",
        method: "POST",
        paramsHint: "book_id, quantity, Requires auth",
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
