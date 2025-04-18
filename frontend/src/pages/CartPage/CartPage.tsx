import { useCart } from "@/context/CartContext/cartContext";
import BookSheet from "@/components/BookSheet/BookSheet";
const CartPage = () => {
  const useCartStore = useCart();

  const items = useCartStore((state) => state.items);
  const removeItem = useCartStore((state) => state.removeItem);
  const addItem = useCartStore((state) => state.addItem);
  console.log(items);
  return (
    <>
      <div className="container">
        <div className="books-detail">
          <BookSheet
            books={items}
            onRemove={removeItem}
            onQuantityChange={addItem}
          />
        </div>
      </div>
    </>
  );
};

export default CartPage;
