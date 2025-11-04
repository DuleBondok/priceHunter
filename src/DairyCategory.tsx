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
  volume: string;
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
  const [selectedMidCategory, setSelectedMidCategory] = useState<string | null>(
    null
  );
  const [selectedSubCategory, setSelectedSubCategory] = useState<string | null>(
    null
  );

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const category = "Mlečni proizvodi i jaja";
        const query = selectedMidCategory
          ? `/${encodeURIComponent(category)}/${encodeURIComponent(
              selectedMidCategory
            )}`
          : `/${encodeURIComponent(category)}`;

        const res = await fetch(`http://localhost:5000/api/products${query}`);

        if (!res.ok) {
          const errData = await res.json();
          setError(errData.message || "Failed to fetch products");
          return;
        }

        const rawData = await res.json();

        const transformedData: StandardizedProduct[] = rawData.map(
          (product: any) => ({
            ...product,
            products: (product.products || []).map((p: any) => ({
              id: p.id ?? `${product.id}-${p.store}`,
              name: p.name ?? product.name,
              brand: p.brand ?? product.brand,
              price: String(p.price ?? "0"),
              store: p.store,
              image: p.image ?? product.image ?? null,
            })),
          })
        );

        setProducts(transformedData);
      } catch (err) {
        console.error("Failed to load products", err);
        setError("Network error");
      }
    };

    fetchProducts();
  }, [selectedMidCategory]);

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
    alert(
      `Dodato ${quantities[product.id]}x ${product.brand} ${
        product.name
      } u listu.`
    );
    // Here you can implement your add to cart or list logic
  };
  const categories = [
    {
      name: "Mleko",
      icon: "./images/milkIcon.png",
      subCategories: [
        { name: "Dugotrajno mleko", icon: "./images/mojaKravica.png" },
        { name: "Sveže mleko", icon: "./images/freshMilk.png" },
        { name: "Biljno Mleko", icon: "./images/veganMilk.png" },
        { name: "Čokoladno mleko", icon: "./images/chocolateMilk.png" },
        { name: "Napici i milkšejkovi", icon: "./images/milkShake.png" },
      ],
    },
    {
      name: "Jaja",
      icon: "./images/eggIcon.png",
      subCategories: [
        { name: "Kokošija jaja", icon: "./images/chickenIcon.png" },
        { name: "Prepeličja jaja", icon: "./images/quailIcon.png" },
      ],
    },
    {
      name: "Kiselo-mlečni proizvodi",
      icon: "./images/yogurtIcon.png",
      subCategories: [
        { name: "Jogurt", icon: "./images/jogurt.png" },
        { name: "Pavlaka", icon: "./images/pavlaka.png" },
        { name: "Kiselo mleko", icon: "./images/kiseloMleko.png" },
        { name: "Kefir", icon: "./images/kefir.png" },
        { name: "Grčki jogurt", icon: "./images/greekYogurt.png" },
        { name: "Surutka", icon: "./images/surutka.png" },
        { name: "Voćni jogurt", icon: "./images/fruitYogurt.png" },
      ],
    },
    {
      name: "Sir",
      icon: "./images/cheeseIcon.png",
      subCategories: [
        { name: "Tvrdi i polutvrdi sir", icon: "./images/cheeseBlock.png" },
        { name: "Beli sir", icon: "./images/fetaCheese.png" },
        { name: "Lisnati sir", icon: "./images/lisnatiSir.png" },
        { name: "Kajmak", icon: "./images/kajmak.png" },
        { name: "Rendani sir", icon: "./images/gratedCheese.png" },
        { name: "Sir sa plesnima", icon: "./images/blueCheese.png" },
      ],
    },
    {
      name: "Namazi",
      icon: "./images/toastIcon.png",
      subCategories: [
        { name: "Topljeni sir", icon: "./images/zdenka.png" },
        { name: "Sirni namazi", icon: "./images/kremSir.png" },
        { name: "Paprika u pavlaci", icon: "./images/paprikaPavlaka.png" },
      ],
    },
    {
      name: "Maslac",
      icon: "./images/butterIcon.png",
      subCategories: [
        
      ],
    },
    {
      name: "Margarin",
      icon: "./images/margarineIcon.png",
      subCategories: [
        { name: "Namazni margarin", icon: "./images/namazniMargarin.png" },
        { name: "Stoni margarin", icon: "./images/stoniMargarin.png" },
      ],
    },
    {
      name: "Slatke pavlake i pavlake za kuvanje",
      icon: "./images/cookingCreamIcon.png",
      subCategories: [
        { name: "Slatka pavlaka", icon: "./images/slatkaPavlaka.png" },
        { name: "Pavlaka za kuvanje", icon: "./images/pavlakaZaKuvanje.png" },
      ],
    },
    {
      name: "Deserti",
      icon: "./images/fruitYoghurtIcon.png",
      subCategories: [
        { name: "Puding", icon: "./images/pudding.png" },
        { name: "Protein puding", icon: "./images/proteinPuding.png" },
        { name: "Sutlijaš", icon: "./images/sutlijas.png" },
        { name: "Mlečni deserti", icon: "./images/chocolateBar.png" },
      ],
    },
  ];
  return (
    <>
      <CategoryHeader />
      <div className="mainDairyDiv">
        <div className="dairyYourLocationDiv">
          <p className="dairyYourLocationParagraph">Tvoja lokacija &gt;</p>
          <p className="dairyNameParagraph">Mlečni proizvodi i jaja</p>
          {selectedMidCategory && (
            <p className="dairyMidCategoryParagraph">
              &gt; {selectedMidCategory}
            </p>
          )}
        </div>
        <h1 className="dairyHeader">
          {selectedMidCategory || "Mlečni proizvodi i jaja"}
        </h1>
        <div className="dairyMidCatergoriesListDiv">
          {/* Show all midCategories if none selected */}
          {!selectedMidCategory &&
            categories.map((cat) => (
              <div
                key={cat.name}
                className={`dairyMidCategoryDiv ${
                  selectedMidCategory === cat.name ? "active" : ""
                }`}
                onClick={() => setSelectedMidCategory(cat.name)}
              >
                <img
                  className="midCategoryIcon"
                  src={cat.icon}
                  alt={cat.name}
                />
                <p className="midCategoryName">{cat.name}</p>
              </div>
            ))}

          {/* If midCategory is selected, show that category + its subcategories */}
          {selectedMidCategory && (
            <div className="selectedMidCategorySection">
              <div
                className="dairyMidCategoryDiv active"
                onClick={() => setSelectedMidCategory(null)}
              >
                <img
                  className="midCategoryIcon"
                  src={
                    categories.find((cat) => cat.name === selectedMidCategory)
                      ?.icon ?? "./images/defaultIcon.png"
                  }
                  alt={selectedMidCategory}
                />
                <p className="midCategoryName">{selectedMidCategory}</p>
              </div>

              <div className="dairySubCategoriesListDiv">
                {categories
                  .find((cat) => cat.name === selectedMidCategory)
                  ?.subCategories.map((sub) => (
                    <div
                      key={sub.name}
                      className={`dairySubCategoryDiv ${
                        selectedSubCategory === sub.name ? "active" : ""
                      }`}
                      onClick={() => setSelectedSubCategory(sub.name)}
                    >
                      <img
                        className="subCategoryIcon"
                        src={sub.icon}
                        alt={sub.name}
                      />
                      <p className="subCategoryName">{sub.name}</p>
                    </div>
                  ))}
              </div>
            </div>
          )}
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
          {selectedMidCategory && (
            <button
              className="backToMidCategoriesBtn"
              onClick={() => setSelectedMidCategory(null)}
            >
              {selectedMidCategory}
              <img
                src="./images/close.png"
                className="closeMidCategoryBtn"
              ></img>
            </button>
          )}
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
