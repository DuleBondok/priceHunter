import React, { useState } from "react";

type Product = {
  id: string;
  name: string;
  brand: string;
  price: string; // price is string from backend (parseFloat later)
  store: string;
  image?: string | null;
};

type StandardizedProduct = {
  id: string;
  name: string;
  brand: string;
  image?: string | null;
  products: Product[];
};

const storeLogos: Record<string, string> = {
  Idea: "./images/Idea.png",
  Maxi: "./images/Maxi.png",
  DIS: "./images/DIS.png",
};

const storeOrder = ["Idea", "Maxi", "DIS"];

function UserPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<StandardizedProduct[]>([]);
  const [quantities, setQuantities] = useState<{ [productId: string]: number }>(
    {}
  );
  const [shoppingList, setShoppingList] = useState<
    { product: StandardizedProduct; quantity: number }[]
  >([]);

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

  const handleSearch = async () => {
    if (!searchTerm.trim()) return;

    try {
      const res = await fetch(
        `http://localhost:5000/api/search?query=${encodeURIComponent(
          searchTerm
        )}`
      );

      if (!res.ok) {
        console.error("API error", res.status, res.statusText);
        return;
      }

      const data = await res.json();
      setSearchResults(data);
    } catch (err) {
      console.error("Search failed", err);
    }
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


  return (
    <>
      <div className="searchSectionMainDiv">
        <div className="searchSection">
          <input
            className="itemNameInput"
            type="text"
            placeholder="Search for a product..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button className="searchItemBtn" onClick={handleSearch}>
            Search
          </button>
        </div>

        <div className="searchResultsDiv">
          {searchResults.length === 0 && <p>No results yet.</p>}
            {searchResults
    // ✅ Filter out products with invalid prices
    .filter((standardizedProduct) => {
      const prices = standardizedProduct.products.map((p) => parseFloat(p.price));
      // keep only if at least one price is a valid number
      return prices.some((price) => !isNaN(price));
    })
    .map((standardizedProduct) => {
      const prices = standardizedProduct.products
        .map((p) => parseFloat(p.price))
        .filter((p) => !isNaN(p)); // make sure no NaNs in calculation

      const minPrice = Math.min(...prices);
      const maxPrice = Math.max(...prices);
      const quantityValue = quantities[standardizedProduct.id] || 1;
            return (
              <div className="productCardDiv" key={standardizedProduct.id}>
                <img
                  src={standardizedProduct.image ?? ""}
                  alt="Product Image"
                  className="productImage"
                />
                <h3 className="productName">
                  {standardizedProduct.brand} {standardizedProduct.name}
                </h3>
                <div className="storeLogosDiv">
                  {standardizedProduct.products
                    .slice()
                    .sort(
                      (a, b) =>
                        storeOrder.indexOf(a.store) -
                        storeOrder.indexOf(b.store)
                    )

                    .map((product, index) => (
                      <img
                        key={index}
                        src={storeLogos[product.store]}
                        alt={product.store}
                        className="storeLogoImg"
                        title={product.store}
                      />
                    ))}
                </div>
                <p className="priceParagraph">
                  {prices.length > 0
                    ? minPrice === maxPrice
                      ? `${minPrice} dinara`
                      : `od ${minPrice} RSD do ${maxPrice} RSD`
                    : "No prices available"}
                </p>
                <div className="productQuantityDiv">
                  <button
                    className={`changeQuantityBtn ${
                      quantityValue === 1 ? "disabled" : ""
                    }`}
                    onClick={() => handleMinusClick(standardizedProduct.id)}
                  >
                    -
                  </button>
                  <p>{quantityValue}</p>
                  <button
                    className="changeQuantityBtn"
                    onClick={() => handlePlusClick(standardizedProduct.id)}
                  >
                    +
                  </button>
                </div>
                <button
                  className="addToListBtn"
                  onClick={() =>
                    handleAddToList(standardizedProduct, quantityValue)
                  }
                >
                  Dodaj
                </button>
              </div>
            );
          })}
        </div>
      </div>
      <div
        className="listIconDiv"
        onClick={() => {
          setShowShoppingList(true);
        }}
      >
        <button className="listIconBtn">
          <img src="./images/shoppingCart.png" className="shoppingCartImg" />
        </button>
        {shoppingList.length > 0 && (
            <p className="productListNumber">{shoppingList.length}</p>
        )

        }
      </div>
      {showShoppingList && (
        <div className="shoppingListDivBack">
          <div className="mainShoppingListDiv">
            <button className="shoppingListExitBtn" onClick={() => {setShowShoppingList(false)
            }}>X</button>
            <h1 className="itemListHeader">Lista za kupovinu</h1>
            {shoppingList.length === 0 ? (
              <p>Lista je prazna.</p>
            ) : (
              <ul className="shoppingListSection">
                {shoppingList.map((item) => (
                  <li className="shoppingListItem" key={item.product.id}>
                    <img
                      src={item.product.image ?? ""}
                      className="shoppingListItemImage"
                    />
                    <div className="shoppingListItemDetailsDiv">
                      <p className="shoppingListItemBrand">
                        {item.product.brand}
                      </p>
                      <p className="shoppingListItemName">
                        {item.product.name}
                      </p>
                    </div>
                    <div className="shoppingListItemQuantityDiv">
                      <button className={`shoppingListItemQuantityBtn ${
                      item.quantity === 1 ? "disabled" : ""
                    }`} onClick={() => decrementShoppingListItem(item.product.id)} disabled={item.quantity === 1}>-</button>
                      <p className="shoppingListItemQuantity">
                        {item.quantity}
                      </p>
                      <button className="shoppingListItemQuantityBtn" onClick={() => incrementShoppingListItem(item.product.id)}>+</button>
                    </div>
                    <button className="shoppingListItemDeleteBtn" onClick={() => handleRemoveFromList(item.product.id)}><img src="./images/delete.png" className="shoppingListItemDeleteIcon"/></button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </>
  );
}

export default UserPage;
