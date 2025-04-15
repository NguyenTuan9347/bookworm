import { NavBarProps } from "../../shared/interfaces";
import { useCartStore } from "../../states/Cart/useCart";
import "./NavBar.css";

const NavBar = ({ links, signInMetadata }: NavBarProps) => {
  const currentPath = window.location.pathname;
  const cart = useCartStore((state) => state);

  const getLinkClass = (href: string) => {
    const base =
      "text-gray-700 text-xs px-3 py-1 rounded-md hover:text-blue-500 hover:bg-gray-200 transition duration-150 ease-in-out";
    const active = "underline decoration-blue-500 font-semibold";
    console.log(currentPath === href);
    return currentPath === href ? `${base} ${active}` : `${base}`;
  };

  return (
    <nav className="fixed z-50 flex top-0 left-0 bg-gray-300 w-full justify-between items-center px-2 py-2 shadow-md">
      <div className="home flex items-center space-x-3">
        <img
          src="https://placehold.co/32x32"
          alt="Bookworm Logo"
          className="h-8 w-8 rounded-2xl"
        />
        <h2 className="text-base font-bold">BOOKWORM</h2>
      </div>

      <ul className="links flex space-x-6">
        {links.map((link) => (
          <li key={link.ref} className={getLinkClass(link.ref)}>
            <a href={link.ref}>{link.label}</a>
          </li>
        ))}

        <li key={cart.ref} className={getLinkClass(cart.ref)}>
          <a href={cart.ref}>
            {cart.label} <span>({cart.countItem})</span>
          </a>
        </li>

        <li
          key={signInMetadata.ref}
          className={getLinkClass(signInMetadata.ref)}
        >
          <a href={signInMetadata.ref}>{signInMetadata.label}</a>
        </li>
      </ul>
    </nav>
  );
};

export default NavBar;
