import { useState } from "react";
import { StandardizedProduct } from "./useSearch";

type ShoppingListItem = {
  product: StandardizedProduct;
  quantity: number;
};

type OptimizedShoppingListItem = ShoppingListItem & {
  cheapestStore: string;
  cheapestPrice: number;
  assignedStore: string;
  assignedPrice: number;
};

export const useShoppingList = () => {
  const [quantities, setQuantities] = useState<{ [productId: string]: number }>({});
  const [shoppingList, setShoppingList] = useState<ShoppingListItem[]>([]);
  const [showShoppingList, setShowShoppingList] = useState(false);

  // NEW: Shopping strategy state
  const [shoppingStrategy, setShoppingStrategy] = useState<"money" | "time" | null>(null);

  // NEW: Optimized shopping list for money-saving strategy
  const [optimizedList, setOptimizedList] = useState<OptimizedShoppingListItem[]>([]);

  // NEW: State to toggle between original and optimized list view
  const [showOptimizedList, setShowOptimizedList] = useState(false);

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

  // NEW: Handle strategy selection
  const handleStrategyChange = (strategy: "money" | "time") => {
    setShoppingStrategy(strategy);
  };

  // NEW: Optimize shopping list for money-saving
  const optimizeForMoney = () => {
    const optimized: OptimizedShoppingListItem[] = shoppingList.map((item) => {
      // Find the cheapest price and store for this product
      const cheapestProduct = item.product.products.reduce((cheapest, current) => {
        const currentPrice = parseFloat(current.price);
        const cheapestPrice = parseFloat(cheapest.price);
        return currentPrice < cheapestPrice ? current : cheapest;
      });

      return {
        ...item,
        cheapestStore: cheapestProduct.store,
        cheapestPrice: parseFloat(cheapestProduct.price),
        assignedStore: cheapestProduct.store, // Initially assign to cheapest
        assignedPrice: parseFloat(cheapestProduct.price),
      };
    });

    // Calculate total cost per store
    const storeTotals: { [store: string]: number } = {};
    optimized.forEach((item) => {
      if (!storeTotals[item.assignedStore]) {
        storeTotals[item.assignedStore] = 0;
      }
      storeTotals[item.assignedStore] += item.assignedPrice * item.quantity;
    });

    // Find the store with the lowest total cost
    const mainStore = Object.keys(storeTotals).reduce((a, b) =>
      storeTotals[a] < storeTotals[b] ? a : b
    );

    // Reassign products: buy as many as possible from main store, others from next cheapest
    const finalOptimized = optimized.map((item) => {
      const mainStoreProduct = item.product.products.find(p => p.store === mainStore);
      if (mainStoreProduct) {
        return {
          ...item,
          assignedStore: mainStore,
          assignedPrice: parseFloat(mainStoreProduct.price),
        };
      } else {
        // Keep the cheapest assignment if main store doesn't have it
        return item;
      }
    });

    setOptimizedList(finalOptimized);
  };

  // NEW: Start shopping with selected strategy
  const startShopping = () => {
    if (!shoppingStrategy) {
      alert("Molimo izaberite strategiju kupovine!");
      return;
    }

    if (shoppingStrategy === "money") {
      optimizeForMoney();
      setShowOptimizedList(true); // Show optimized list overlay
      console.log("Optimized for money:", optimizedList);
    } else {
      // TODO: Find nearest store with all items
      console.log("Finding nearest store with all items:", shoppingList);
      alert("Tražim najbližu prodavnicu...");
    }
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
    shoppingStrategy,
    handleStrategyChange,
    startShopping,
    optimizedList,
    showOptimizedList,
    setShowOptimizedList,
  };
};