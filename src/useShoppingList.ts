import { useState } from "react";
import { StandardizedProduct } from "./useSearch";

type ShoppingListItem = {
  product: StandardizedProduct;
  quantity: number;
};

export const useShoppingList = () => {
  const [quantities, setQuantities] = useState<{ [productId: string]: number }>({});
  const [shoppingList, setShoppingList] = useState<ShoppingListItem[]>([]);
  const [showShoppingList, setShowShoppingList] = useState(false);

  const handlePlusClick = (productId: string) => {
    setQuantities((prev) => ({
      ...prev,
      [productId]: (prev[productId] || 1) + 1,
    }));
  };

  const handleMinusClick = (productId: string) => {
    setQuantities((prev) => ({
      ...prev,
      [productId]: Math.max((prev[productId] || 1) - 1, 1),
    }));
  };

  const handleAddToList = (product: StandardizedProduct, quantity: number) => {
    setShoppingList((prevList) => {
      const existingItem = prevList.find((item) => item.product.id === product.id);

      if (existingItem) {
        return prevList.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }

      return [...prevList, { product, quantity }];
    });
  };

  const handleRemoveFromList = (productId: string) => {
    setShoppingList((prevList) =>
      prevList.filter((item) => item.product.id !== productId)
    );
  };

  const incrementShoppingListItem = (productId: string) => {
    setShoppingList((prev) =>
      prev.map((item) =>
        item.product.id === productId
          ? { ...item, quantity: item.quantity + 1 }
          : item
      )
    );
  };

  const decrementShoppingListItem = (productId: string) => {
    setShoppingList((prev) =>
      prev.map((item) =>
        item.product.id === productId
          ? { ...item, quantity: Math.max(item.quantity - 1, 1) }
          : item
      )
    );
  };

  return {
    quantities,
    shoppingList,
    showShoppingList,
    setShowShoppingList,
    handlePlusClick,
    handleMinusClick,
    handleAddToList,
    handleRemoveFromList,
    incrementShoppingListItem,
    decrementShoppingListItem,
  };
};