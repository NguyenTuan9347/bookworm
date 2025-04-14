import NavBar from "./components/NavBar/NavBar";
import "./App.css";
import { constVar } from "./shared/constVar";
import { useCart } from "./hooks/Cart/useCart";
import Footer from "./components/Footer/Footer";

function App() {
  const [cart, setCartCount] = useCart();

  return (
    <>
      <NavBar
        links={constVar.links}
        signInMetadata={constVar.signInMetadata}
        cart={cart}
      />
      <Footer {...constVar.additionalInfo} />
    </>
  );
}

export default App;
