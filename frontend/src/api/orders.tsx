import {
  OrderCreate,
  AuthRequireAPIFetch,
  ResponseFlag,
} from "@/shared/interfaces";
import { constVar } from "@/shared/constVar";

export const createOrder = async (
  authRequireAPIFetch: AuthRequireAPIFetch,
  order: OrderCreate
) => {
  console.log(order);
  const response = await authRequireAPIFetch<ResponseFlag>(
    constVar.api_routes.order.create.path,
    {
      method: constVar.api_routes.order.create.method,
      body: JSON.stringify(order),
    }
  );
  console.log(response);

  return response.status_code === 201;
};
