import { useEffect, useState } from "react";
import { DropdownProps, NavBarProps } from "../../shared/interfaces";
import { useCart } from "@/context/CartContext/cartContext";
import { useAuth } from "@/context/Authentication/authContext";
import LoginPopUp from "../LoginPopUp/LoginPopUp";
import { constVar } from "@/shared/constVar";
import { getUserName } from "@/api/users";
import Dropdown from "@/components/Dropdown/Dropdown";
import { useLocation } from "react-router-dom";

const NavBar = ({ links, signInMetadata }: NavBarProps) => {
  const location = useLocation();
  const currentPath = location.pathname;

  const { isAuthenticated, authRequireAPIFetch, logout } = useAuth();
  const useCartStore = useCart();
  const books = useCartStore((state) => state.books);
  const [userFullName, setUserFullName] = useState<string | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = () => {
    logout()
      .then(() => {
        console.log("Logout successful");
      })
      .catch((error) => {
        console.error("Logout failed:", error);
      });
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const dropdownEles: DropdownProps = {
    trigger: (
      <span className="flex justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-200 cursor-pointer">
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
      "text-gray-700 text-xs md:text-sm px-3 py-1 rounded-md hover:text-blue-500 hover:bg-gray-200 transition duration-150 ease-in-out";
    const active = "underline decoration-gray-500 font-semibold";
    return currentPath === href ? `${base} ${active} ` : `${base}`;
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
    <nav className="fixed z-50 flex top-0 left-0 bg-gray-300 w-full justify-between px-2 py-2 shadow-md items-center">
      <div className="home flex items-center space-x-3">
        <img
          src="https://placehold.co/32x32"
          alt="Bookworm Logo"
          className="h-8 w-8 rounded-xl"
        />
        <h1 className="text-base font-bold">BOOKWORM</h1>
      </div>

      <button
        className="md:hidden text-gray-700 focus:outline-none"
        onClick={toggleMenu}
        aria-label="Toggle menu"
      >
        {isMenuOpen ? (
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        ) : (
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        )}
      </button>

      <ul className="hidden md:flex space-x-6 items-center">
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
            <LoginPopUp
              onSuccess={() => console.log("login")}
              onFailed={() => console.log("failed")}
            />
          )}
        </li>
      </ul>

      {isMenuOpen && (
        <div className="absolute top-full left-0 right-0 bg-gray-300 shadow-lg md:hidden z-50">
          <ul className="flex flex-col w-full">
            {links.map((link) => (
              <li key={link.ref} className="border-b border-gray-400 py-2">
                <a
                  href={link.ref}
                  className={`${getLinkClass(link.ref)} block px-4`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {link.label}
                </a>
              </li>
            ))}
            <li
              key={constVar.api_routes.cart.get.path}
              className="border-b border-gray-400 py-2"
            >
              <a
                href={constVar.api_routes.cart.get.path}
                className={`${getLinkClass(
                  constVar.api_routes.cart.get.path
                )} block px-4`}
                onClick={() => setIsMenuOpen(false)}
              >
                {constVar.api_routes.cart.get.label}{" "}
                <span>({books.length})</span>
              </a>
            </li>
            <li key={signInMetadata.ref} className="py-2 px-4">
              {isAuthenticated ? (
                <div className="py-2">
                  <span className="block mb-2 font-medium text-sm">
                    {userFullName}
                  </span>
                  <button
                    onClick={() => {
                      handleLogout();
                      setIsMenuOpen(false);
                    }}
                    className="block w-full text-left text-sm font-medium text-gray-700 hover:bg-gray-200 px-3 py-2 rounded"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <div onClick={() => setIsMenuOpen(false)}>
                  <LoginPopUp
                    onSuccess={() => console.log("login")}
                    onFailed={() => console.log("failed")}
                  />
                </div>
              )}
            </li>
          </ul>
        </div>
      )}
    </nav>
  );
};

export default NavBar;
