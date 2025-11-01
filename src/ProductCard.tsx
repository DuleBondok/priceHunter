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

const ProductCard: React.FC<Props> = ({ product, quantity, onPlus, onMinus, onAddToList }) => {
  const prices = product.products
    .map((p) => parseFloat(p.price))
    .filter((p) => !isNaN(p));

  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);

  return (
    <div className="productCardDiv">
      <img src={product.image ?? ""} alt="Product Image" className="productImage" />
      <h3 className="productName">{product.brand} {product.name}</h3>

      <div className="storeLogosDiv">
        {product.products
          .slice()
          .sort((a, b) => storeOrder.indexOf(a.store) - storeOrder.indexOf(b.store))
          .map((p, index) => (
            <img key={index} src={storeLogos[p.store]} alt={p.store} title={p.store} className="storeLogoImg" />
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
        <button className={`changeQuantityBtn ${quantity === 1 ? "disabled" : ""}`} onClick={onMinus} disabled={quantity === 1}>-</button>
        <p>{quantity}</p>
        <button className="changeQuantityBtn" onClick={onPlus}>+</button>
      </div>

      <button className="addToListBtn" onClick={onAddToList}>Dodaj</button>
    </div>
  );
};

export default ProductCard;