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
        <div className="storeLogosDiv">
          {product.products
            .slice()
            .sort(
              (a, b) =>
                storeOrder.indexOf(a.store) - storeOrder.indexOf(b.store)
            )
            .map((p, index) => (
              <img
                key={index}
                src={storeLogos[p.store]}
                alt={p.store}
                title={p.store}
                className="storeLogoImg"
              />
            ))}
        </div>
        <h3 className="productName">
          {product.brand} {product.name}
        </h3>
        <div className="productWeightDiv">
          <img src="./images/scaleIcon.png" className="scaleIcon"></img>
          <p className="productWeightParagraph">{product.volume}</p>

        </div>

        <p className="priceParagraph">
          {prices.length > 0 ? (
            minPrice === maxPrice ? (
              <span style={{ color: "green" }}>{minPrice} dinara</span>
            ) : (
              <>
                od <span style={{ color: "green" }}>{minPrice}</span> RSD do{" "}
                <span style={{ color: "red" }}>{maxPrice}</span> RSD
              </>
            )
          ) : (
            "No prices available"
          )}
        </p>

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
          <img className="shoppingCartWhiteIcon" src="./images/shoppingCartIcon.png"></img>
          KUPI
        </button>
      </div>
    </div>
  );
};

export default ProductCard;
