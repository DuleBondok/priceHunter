import React from "react";
import { useLocation } from "react-router-dom";
import { useSearch } from "./useSearch";
import { useShoppingList } from "./useShoppingList";
import ProductCard from "./ProductCard";

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

function SearchResults() {
  const query = useQuery().get("query") || "";
  const { results: searchResults, loading, error } = useSearch(query);

  const {
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
  } = useShoppingList();

  return (
    <>
      <h1>Search results for "{query}"</h1>
      {loading && <p>Loading...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}
      {!loading && searchResults.length === 0 && <p>No results found.</p>}

      <div className="searchResultsDiv">
        {searchResults
          .filter((p) => p.products.some((prod) => !isNaN(parseFloat(prod.price))))
          .map((p) => (
            <ProductCard
              key={p.id}
              product={p}
              quantity={quantities[p.id] || 1}
              onPlus={() => handlePlusClick(p.id)}
              onMinus={() => handleMinusClick(p.id)}
              onAddToList={() => handleAddToList(p, quantities[p.id] || 1)}
            />
          ))}
      </div>
       <div className="listIconDiv" onClick={() => setShowShoppingList(true)}>
    <button className="listIconBtn">
      <img src="./images/shoppingCart.png" className="shoppingCartImg" />
    </button>
    {shoppingList.length > 0 && (
      <p className="productListNumber">{shoppingList.length}</p>
    )}
  </div>

      {/* Shopping list modal */}
      {showShoppingList && (
        <div className="shoppingListDivBack">
          <div className="mainShoppingListDiv">
            <button className="shoppingListExitBtn" onClick={() => setShowShoppingList(false)}>X</button>
            <h1 className="itemListHeader">Lista za kupovinu</h1>

            {shoppingList.length === 0 ? (
              <p>Lista je prazna.</p>
            ) : (
              <ul className="shoppingListSection">
                {shoppingList.map((item) => (
                  <li className="shoppingListItem" key={item.product.id}>
                    <img src={item.product.image ?? ""} className="shoppingListItemImage" />
                    <div className="shoppingListItemDetailsDiv">
                      <p className="shoppingListItemBrand">{item.product.brand}</p>
                      <p className="shoppingListItemName">{item.product.name}</p>
                    </div>
                    <div className="shoppingListItemQuantityDiv">
                      <button
                        className={`shoppingListItemQuantityBtn ${item.quantity === 1 ? "disabled" : ""}`}
                        onClick={() => decrementShoppingListItem(item.product.id)}
                        disabled={item.quantity === 1}
                      >-</button>
                      <p className="shoppingListItemQuantity">{item.quantity}</p>
                      <button className="shoppingListItemQuantityBtn" onClick={() => incrementShoppingListItem(item.product.id)}>+</button>
                    </div>
                    <button className="shoppingListItemDeleteBtn" onClick={() => handleRemoveFromList(item.product.id)}>
                      <img src="./images/delete.png" className="shoppingListItemDeleteIcon" />
                    </button>
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

export default SearchResults;