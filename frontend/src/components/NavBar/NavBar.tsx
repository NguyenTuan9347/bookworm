import { useEffect, useState } from "react";
import { DropdownProps, NavBarProps } from "../../shared/interfaces";
import { useCart } from "@/context/CartContext/cartContext";
import "./NavBar.css";
import { useAuth } from "@/context/Authentication/authContext";
import LoginPopUp from "../LoginPopUp/LoginPopUp";
import { constVar } from "@/shared/constVar";
import { getUserName } from "@/api/users";
import Dropdown from "@/components/Dropdown/Dropdown";

const NavBar = ({ links, signInMetadata }: NavBarProps) => {
  const currentPath = window.location.pathname;
  const { isAuthenticated, authRequireAPIFetch, logout, uid } = useAuth();
  const useCartStore = useCart();
  const books = useCartStore((state) => state.books);
  console.log(`Render ${books.length}`);

  const [userFullName, setUserFullName] = useState<string | null>(null);

  const handleLogout = async () => {
    await logout();
  };

  const dropdownEles: DropdownProps = {
    trigger: (
      <span className="flex books-center justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-200 cursor-pointer">
        {userFullName}
      </span>
    ),
    menu: [
      <button
        key="logout-action"
        onClick={handleLogout}
        className="block rounded w-full px-4 py-2 text-left text-sm font-medium text-gray-700 hover:bg-gray-300"
        role="menuitem"
      >
        Logout
      </button>,
    ],
  };

  const getLinkClass = (href: string) => {
    const base =
      "text-gray-700 text-xs px-3 py-1 rounded-md hover:text-blue-500 hover:bg-gray-200 transition duration-150 ease-in-out";
    const active = "underline decoration-blue-50 font-semibold";
    const disabled = !uid ? "opacity-50 cursor-not-allowed" : "";
    return currentPath === href
      ? `${base} ${active} ${disabled}`
      : `${base} ${disabled}`;
  };

  useEffect(() => {
    if (isAuthenticated) {
      const fetchUserName = async () => {
        try {
          const fullName = await getUserName(authRequireAPIFetch);
          setUserFullName(fullName);
        } catch (error) {
          console.error("Failed to fetch user name:", error);
          setUserFullName("User");
        }
      };

      fetchUserName();
    }
  }, [isAuthenticated, authRequireAPIFetch, books]);

  return (
    <nav className="fixed z-50 flex top-0 left-0 bg-gray-300 w-full justify-between books-center px-2 py-2 shadow-md">
      <div className="home flex books-center space-x-3">
        <img
          src="https://placehold.co/32x32"
          alt="Bookworm Logo"
          className="h-8 w-8 rounded-xl"
        />
        <h1 className="text-base font-bold">BOOKWORM</h1>
      </div>

      <ul className="links flex space-x-6 books-center">
        {links.map((link) => (
          <li key={link.ref}>
            <a href={link.ref} className={getLinkClass(link.ref)}>
              {link.label}
            </a>
          </li>
        ))}

        <li key={constVar.api_routes.cart.get.path}>
          <a
            href={constVar.api_routes.cart.get.path}
            className={getLinkClass(constVar.api_routes.cart.get.path)}
          >
            {constVar.api_routes.cart.get.label} <span>({books.length})</span>
          </a>
        </li>

        <li key={signInMetadata.ref}>
          {isAuthenticated ? (
            <Dropdown trigger={dropdownEles.trigger} menu={dropdownEles.menu} />
          ) : (
            <LoginPopUp />
          )}
        </li>
      </ul>
    </nav>
  );
};

export default NavBar;
