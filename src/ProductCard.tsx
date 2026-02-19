import React from "react";
import { StandardizedProduct } from "./useSearch";

const storeLogos: Record<string, string> = {
  Idea: "./images/Idea.png",
  Maxi: "./images/Maxi.png",
  DIS: "./images/DIS.png",
};

const storeOrder = ["Idea", "Maxi", "DIS"];

type Props = {
  product: StandardizedProduct;
  quantity: number;
  onPlus: () => void;
  onMinus: () => void;
  onAddToList: () => void;
};

const ProductCard: React.FC<Props> = ({
  product,
  quantity,
  onPlus,
  onMinus,
  onAddToList,
}) => {
  const prices = product.products
    .map((p) => parseFloat(p.price))
    .filter((p) => !isNaN(p));

  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);

  return (
    <div className="productCardOuter">
      <div className="productCardDiv">
        <img
          src={product.image ?? ""}
          alt="Product Image"
          className="productImage"
        />

        <h3 className="productName">
          {product.brand} {product.name}
        </h3>
        <div className="productWeightDiv">
          <img src="./images/scaleIcon.png" className="scaleIcon"></img>
          <p className="productWeightParagraph">{product.volume}</p>
        </div>
        <div className="priceInformationOuterDiv">
          {product.products
            .slice()
            .filter((p) => p.price != null)
            .sort(
              (a, b) =>
                Number(a.price ?? Infinity) - Number(b.price ?? Infinity),
            )
            .map((p, index) => {
              const isBestPrice = index === 0;

              return (
                <div
                  className={`priceInformationDiv ${
                    isBestPrice ? "bestPriceDiv" : ""
                  }`}
                  key={p.store ?? index}
                >
                  {isBestPrice && (
                    <p className="bestPriceLabel">NAJBOLJA CENA</p>
                  )}

                  {/* Row content */}
                  <div
                    className={`priceRow ${isBestPrice ? "bestPriceRow" : ""}`}
                  >
                    <div className="storeLogosDiv">
                      <img
                        src={storeLogos[p.store]}
                        alt={p.store}
                        title={p.store}
                        className="storeLogoImg"
                      />
                    </div>

                    <p
                      className={`priceParagraph ${
                        isBestPrice ? "bestPriceParagraph" : ""
                      }`}
                    >
                      <span
                        style={{
                          color: p.hasDiscount
                            ? "red"
                            : isBestPrice
                              ? "green"
                              : "black",
                        }}
                      >
                        {p.price}
                      </span>
                    </p>

                    {p.hasDiscount && p.discountPercent != null && (
                      <>
                        <p
                          className={`discountText ${
                            isBestPrice ? "bestDiscountText" : ""
                          }`}
                        >
                          -{p.discountPercent}%
                        </p>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
        </div>

        <div className="productQuantityDiv">
          <button
            className={`changeQuantityBtn ${quantity === 1 ? "disabled" : ""}`}
            onClick={onMinus}
            disabled={quantity === 1}
          >
            <img src="./images/minusIcon.png" className="minusIcon"></img>
          </button>
          <p className="quantityNumberParagraph">{quantity}</p>
          <button className="changeQuantityBtn" onClick={onPlus}>
            <img src="./images/plusIcon.png" className="minusIcon"></img>
          </button>
        </div>

        <button className="addToListBtn" onClick={onAddToList}>
          <img
            className="shoppingCartWhiteIcon"
            src="./images/shoppingCartIcon.png"
          ></img>
          KUPI
        </button>
      </div>
    </div>
  );
};

export default ProductCard;
