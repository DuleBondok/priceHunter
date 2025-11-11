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
  shoppingStrategy,
  handleStrategyChange,
  startShopping,
  optimizedList,
  showOptimizedList,
  setShowOptimizedList,
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
            ) : showOptimizedList ? (
              // Optimized List View
              <div>
                <button className="optimizedExitBtn" onClick={() => setShowOptimizedList(false)}>X</button>
                <h2 className="optimizedHeader">Optimizovana lista za uštedu novca</h2>
                <ul className="shoppingListSection">
                  {optimizedList.map((item) => (
                    <li className="shoppingListItem" key={item.product.id}>
                      <img src={item.product.image ?? ""} className="shoppingListItemImage" />
                      <div className="shoppingListItemDetailsDiv">
                        <p className="shoppingListItemBrand">{item.product.brand}</p>
                        <p className="shoppingListItemName">{item.product.name}</p>
                        <p className="shoppingListItemStore">Prodavnica: {item.assignedStore}</p>
                        <p className="shoppingListItemPrice">Cena: {item.assignedPrice.toFixed(2)} RSD</p>
                      </div>
                      <div className="shoppingListItemQuantityDiv">
                        <p className="shoppingListItemQuantity">Količina: {item.quantity}</p>
                      </div>
                    </li>
                  ))}
                </ul>
                <p className="totalSavings">
                  Ukupna ušteda: {(() => {
                    // Original total: sum of prices from the first store for each item (baseline)
                    const originalTotal = shoppingList.reduce((sum, item) =>
                      sum + parseFloat(item.product.products[0].price) * item.quantity, 0);
                    // Optimized total: sum of assigned prices (cheapest or from main store)
                    const optimizedTotal = optimizedList.reduce((sum, item) => sum + item.assignedPrice * item.quantity, 0);
                    return (originalTotal - optimizedTotal).toFixed(2);
                  })()} RSD
                </p>
              </div>
            ) : (
              // Original Shopping List View
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
                     {/* Shopping Strategy UI */}
            <div className="shoppingStrategySection">
              <h3 className="strategyHeader">Izaberite strategiju kupovine</h3>

              <div className="strategyOptionsDiv">
                <label className="strategyOption">
                  <input
                    type="checkbox"
                    className="strategyCheckbox"
                    checked={shoppingStrategy === "money"}
                    onChange={() => handleStrategyChange("money")}
                  />
                  <div className="strategyLabelContent">
                    <span className="strategyText">Najbolje cene</span>
                  </div>
                </label>

                <label className="strategyOption">
                  <input
                    type="checkbox"
                    className="strategyCheckbox"
                    checked={shoppingStrategy === "time"}
                    onChange={() => handleStrategyChange("time")}
                  />
                  <div className="strategyLabelContent">
                    <span className="strategyText">Najkraće vreme</span>
                  </div>
                </label>
              </div>

              <button className="startShoppingBtn" onClick={startShopping}>
                Kreni u kupovinu
              </button>

              
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default SearchResults;