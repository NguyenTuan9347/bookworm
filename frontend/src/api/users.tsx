import { User, AuthRequireAPIFetch } from "@/shared/interfaces";
import { constVar } from "@/shared/constVar";

export const getUserName = async (authRequireAPIFetch: AuthRequireAPIFetch) => {
  const user = await authRequireAPIFetch<User>(
    constVar.api_routes.user.me.path,
    {
      method: constVar.api_routes.user.me.method,
    }
  );
  return `${user.first_name} ${user.last_name}`;
};
