import { constVar } from "../shared/constVar";

const API_BASE = constVar.api_routes.base;

interface FetchOptions extends RequestInit {
  params?: { [key: string]: string | number | boolean | undefined | null };
}
export async function fetchApi<T>(
  endpoint: string,
  options: FetchOptions = {}
): Promise<T> {
  const { params, body, headers: customHeaders, ...fetchOptions } = options;
  let url = `${API_BASE}${endpoint}`;

  if (params) {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        queryParams.append(key, String(value));
      }
    });
    const queryString = queryParams.toString();
    if (queryString) {
      url += `?${queryString}`;
    }
  }

  const defaultHeaders: HeadersInit = {
    Accept: "application/json",
    ...(body && { "Content-Type": "application/json" }),
  };

  try {
    const response = await fetch(url, {
      ...fetchOptions,
      method: fetchOptions.method || "GET",
      headers: {
        ...defaultHeaders,
        ...customHeaders,
      },
      body: body ? body : undefined,
    });

    if (!response.ok) {
      console.error(
        `API request failed for ${options.method || "GET"} ${url}:`,
        constVar.errorMessage.APIDefault
      );
      throw Error(constVar.errorMessage.APIDefault);
    }

    if (response.status === 204) {
      return undefined as T;
    }

    const data: T = await response.json();
    return data;
  } catch (error) {
    console.error(
      `API request failed for ${options.method || "GET"} ${url}:`,
      error
    );
    throw error;
  }
}
