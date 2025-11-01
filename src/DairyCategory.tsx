import React, { useState } from "react";
import CategoryHeader from "./CategoryHeader";
import "./Category.css";
import { useEffect } from "react";
import ProductCard from "./ProductCard";

type StandardizedProduct = {
  id: string;
  name: string;
  brand: string;
  image?: string | null;
  mainCategory?: string;
  products: {
    id: string;
    name: string;
    brand: string;
    price: string;
    store: string;
    image?: string | null;
  }[];
};

function DairyCategory() {

  const [products, setProducts] = useState<StandardizedProduct[]>([]);
  const [error, setError] = useState<string>("");
  const [quantities, setQuantities] = useState<Record<string, number>>({});

useEffect(() => {
  const fetchProducts = async () => {
    try {
      const category = "Mle??ni proizvodi i jaja";
      const res = await fetch(
        `http://localhost:5000/api/products/${encodeURIComponent(category)}`
      );

      if (!res.ok) {
        const errData = await res.json();
        setError(errData.message || "Failed to fetch products");
        return;
      }

      const rawData = await res.json();

      // Transform raw data to fit the StandardizedProduct type expected by ProductCard
      const transformedData: StandardizedProduct[] = rawData.map((product: any) => ({
        ...product,
        products: (product.products || []).map((p: any) => ({
          id: p.id ?? `${product.id}-${p.store}`, // create id if missing
          name: p.name ?? product.name,
          brand: p.brand ?? product.brand,
          price: String(p.price ?? "0"),
          store: p.store,
          image: p.image ?? product.image ?? null,
        })),
      }));

      console.log("Transformed products:", transformedData);
      transformedData.forEach((prod) => {
  console.log(prod.name, prod.products.map(p => p.price));
});

      setProducts(transformedData);

      // Initialize quantities for each product
      const initialQuantities: Record<string, number> = {};
      transformedData.forEach((product) => {
        initialQuantities[product.id] = 1;
      });
      setQuantities(initialQuantities);

    } catch (err) {
      console.error("Failed to load products", err);
      setError("Network error");
    }
  };

  fetchProducts();
}, []);

  const onPlus = (id: string) => {
    setQuantities((prev) => ({
      ...prev,
      [id]: (prev[id] || 1) + 1,
    }));
  };

  const onMinus = (id: string) => {
    setQuantities((prev) => ({
      ...prev,
      [id]: prev[id] && prev[id] > 1 ? prev[id] - 1 : 1,
    }));
  };

  const onAddToList = (product: StandardizedProduct) => {
    alert(`Dodato ${quantities[product.id]}x ${product.brand} ${product.name} u listu.`);
    // Here you can implement your add to cart or list logic
  };  
  return (
    <>
      <CategoryHeader />
      <div className="mainDairyDiv">
        <div className="dairyYourLocationDiv">
          <p className="dairyYourLocationParagraph">Tvoja lokacija &gt;</p>
          <p className="dairyNameParagraph">Mlečni proizvodi i jaja</p>
        </div>
        <h1 className="dairyHeader">Mlečni proizvodi i jaja</h1>
        <div className="dairyMidCatergoriesListDiv">
          <div className="dairyMidCategoryDiv">
            <img className="midCategoryIcon" src="./images/milkIcon.png"></img>
            <p className="midCategoryName">Mleko</p>
          </div>
          <div className="dairyMidCategoryDiv">
            <img className="midCategoryIcon" src="./images/eggIcon.png"></img>
            <p className="midCategoryName">Jaja</p>
          </div>
          <div className="dairyMidCategoryDiv">
            <img
              className="midCategoryIcon"
              src="./images/yogurtIcon.png"
            ></img>
            <p className="midCategoryName">Kiselo-mlečni proizvodi</p>
          </div>
          <div className="dairyMidCategoryDiv">
            <img
              className="midCategoryIcon"
              src="./images/cheeseIcon.png"
            ></img>
            <p className="midCategoryName">Sir</p>
          </div>
          <div className="dairyMidCategoryDiv">
            <img className="midCategoryIcon" src="./images/toastIcon.png"></img>
            <p className="midCategoryName">Namazi</p>
          </div>
          <div className="dairyMidCategoryDiv">
            <img
              className="midCategoryIcon"
              src="./images/butterIcon.png"
            ></img>
            <p className="midCategoryName">Maslac</p>
          </div>
          <div className="dairyMidCategoryDiv">
            <img
              className="midCategoryIcon"
              src="./images/margarineIcon.png"
            ></img>
            <p className="midCategoryName">Margarin</p>
          </div>
          <div className="dairyMidCategoryDiv">
            <img
              className="midCategoryIcon"
              src="./images/cookingCreamIcon.png"
            ></img>
            <p className="midCategoryName">
              Slatke pavlake i pavlake za kuvanje
            </p>
          </div>
          <div className="dairyMidCategoryDiv">
            <img
              className="midCategoryIcon"
              src="./images/fruitYoghurtIcon.png"
            ></img>
            <p className="midCategoryName">Deserti</p>
          </div>
        </div>
        <div className="listSettingsDiv">
          <button className="sortByBtn">
            Sortiraj po{" "}
            <img
              src="./images/downArrowIcon.png"
              className="downArrowIcon"
            ></img>
          </button>

          <button className="filtersBtn">
            Filteri
            <img
              src="./images/downArrowIcon.png"
              className="downArrowIcon"
            ></img>
          </button>
          <button className="bestOfferBtn">
            <img
              src="./images/starMedalIcon.png"
              className="starMedalIcon"
            ></img>
            Najpovoljnije
            
          </button>
        </div>
        <h3 className="allDairyHeader">Svi proizvodi ({products.length})</h3>
        <div className="productsDisplayDiv">
          {error && <p style={{ color: "red" }}>{error}</p>}
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              quantity={quantities[product.id] || 1}
              onPlus={() => onPlus(product.id)}
              onMinus={() => onMinus(product.id)}
              onAddToList={() => onAddToList(product)}
            />
          ))}
        </div>
      </div>
    </>
  );
}

export default DairyCategory;
