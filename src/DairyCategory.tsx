import React, { useState, useEffect } from "react";
import CategoryHeader from "./CategoryHeader";
import "./Category.css";
import ProductCard from "./ProductCard";
import { motion, AnimatePresence } from "framer-motion";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import Modal from "./DisplayModal";

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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [selectedMidCategory, setSelectedMidCategory] = useState<string | null>(
    null
  );
  const [selectedSubCategory, setSelectedSubCategory] = useState<string | null>(
    null
  );

  const [isModalOpen, setIsModalOpen] = useState(false);
  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true); // Start loader before fetching
      try {
        const category = "Mlecni proizvodi i jaja";
        let query = `/${encodeURIComponent(category)}`;
        if (selectedMidCategory)
          query += `/${encodeURIComponent(selectedMidCategory)}`;
        if (selectedSubCategory)
          query += `/${encodeURIComponent(selectedSubCategory)}`;

        const res = await fetch(`http://localhost:5000/api/products${query}`);

        if (!res.ok) {
          const errData = await res.json();
          setError(errData.message || "Failed to fetch products");
          setProducts([]); // Clear previous products if error
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
        setError(""); // Clear error on success
      } catch (err) {
        console.error("Failed to load products", err);
        setError("Network error");
        setProducts([]); // Clear products on error
      } finally {
        setLoading(false); // Stop loader after fetch (success or error)
      }
    };

    fetchProducts();
  }, [selectedMidCategory, selectedSubCategory]);

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
    // Add to cart or list logic can be implemented here
  };

  const categories = [
    {
      name: "Mleko",
      icon: "./images/milkIcon.png",
      subCategories: [
        { name: "Dugotrajno mleko", icon: "./images/mojaKravica.png" },
        { name: "Sveze mleko", icon: "./images/freshMilk.png" },
        { name: "Biljna Mleka", icon: "./images/veganMilk.png" },
        { name: "Cokoladno mleko", icon: "./images/chocolateMilk.png" },
        { name: "Napici i milksejkovi", icon: "./images/milkShake.png" },
      ],
    },
    {
      name: "Jaja",
      icon: "./images/eggIcon.png",
      subCategories: [
        { name: "Kokosija jaja", icon: "./images/chickenIcon.png" },
        { name: "Prepelicja jaja", icon: "./images/quailIcon.png" },
      ],
    },
    {
      name: "Kiselo-mlecni proizvodi",
      icon: "./images/yogurtIcon.png",
      subCategories: [
        { name: "Jogurt", icon: "./images/jogurt.png" },
        { name: "Pavlaka", icon: "./images/pavlaka.png" },
        { name: "Kiselo mleko", icon: "./images/kiseloMleko.png" },
        { name: "Kefir", icon: "./images/kefir.png" },
        { name: "Grcki jogurt", icon: "./images/greekYogurt.png" },
        { name: "Surutka", icon: "./images/surutka.png" },
        { name: "Vocni jogurt", icon: "./images/fruitYogurt.png" },
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
      subCategories: [],
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
        { name: "Sutlijas", icon: "./images/sutlijas.png" },
        { name: "Mlecni deserti", icon: "./images/chocolateBar.png" },
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
          {selectedSubCategory && (
            <p className="dairySubCategoryParagraph">
              &gt; {selectedSubCategory}
            </p>
          )}
        </div>
        <h1 className="dairyHeader">
          {selectedSubCategory ||
            selectedMidCategory ||
            "Mlečni proizvodi i jaja"}
        </h1>

        {/* Categories List */}
        <div className="dairyMidCategoriesListDiv">
          {/* Show mid categories when none selected */}
          {!selectedMidCategory && (
            <motion.div
              className="midCategoriesContainer"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              layout
              style={{ display: "flex", flexWrap: "nowrap", gap: "3vw" }}
            >
              {categories.map((cat) => (
                <motion.div
                  key={cat.name}
                  className={`dairyMidCategoryDiv ${
                    selectedMidCategory === cat.name ? "active" : ""
                  }`}
                  onClick={() => {
                    setSelectedMidCategory(cat.name);
                    setSelectedSubCategory(null);
                  }}
                  whileTap={{ scale: 0.95 }}
                  whileHover={{ scale: 1.05 }}
                  layout
                >
                  <img
                    className="midCategoryIcon"
                    src={cat.icon}
                    alt={cat.name}
                  />
                  <p className="midCategoryName">{cat.name}</p>
                </motion.div>
              ))}
            </motion.div>
          )}

          {/* Show selected mid category and its subcategories */}
          <AnimatePresence mode="wait">
            {selectedMidCategory && (
              <motion.div
                key="selectedMidCategorySection"
                className="selectedMidCategorySection"
                initial={{ opacity: 0, x: 30, scale: 0.95 }}
                animate={{
                  opacity: 1,
                  x: 0,
                  scale: 1,
                  transition: { type: "spring", stiffness: 300, damping: 30 },
                }}
                exit={{
                  opacity: 0,
                  x: 30,
                  scale: 0.8,
                  transition: { duration: 0.3 },
                }}
                layout
              >
                <motion.div
                  className="dairyMidCategoryDiv active"
                  onClick={() => {
                    setSelectedMidCategory(null);
                    setSelectedSubCategory(null);
                  }}
                  whileTap={{ scale: 0.95 }}
                  layout
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
                </motion.div>

                <motion.div
                  className="dairySubCategoriesListDiv"
                  initial="hidden"
                  animate="visible"
                  exit={{
                    opacity: 0,
                    y: 10,
                    transition: {
                      staggerChildren: 0.05,
                      staggerDirection: -1,
                    },
                  }}
                  variants={{
                    hidden: { opacity: 0, y: 20 },
                    visible: {
                      opacity: 1,
                      y: 0,
                      transition: {
                        staggerChildren: 0.1,
                        when: "beforeChildren",
                      },
                    },
                  }}
                  layout
                >
                  {categories
                    .find((cat) => cat.name === selectedMidCategory)
                    ?.subCategories.map((sub) => (
                      <motion.div
                        key={sub.name}
                        className={`dairySubCategoryDiv ${
                          selectedSubCategory === sub.name ? "active" : ""
                        }`}
                        onClick={() =>
                          setSelectedSubCategory(
                            selectedSubCategory === sub.name ? null : sub.name
                          )
                        }
                        variants={{
                          hidden: { opacity: 0, y: 10 },
                          visible: { opacity: 1, y: 0 },
                        }}
                        whileTap={{ scale: 0.95 }}
                        whileHover={{ scale: 1.05 }}
                        layout
                      >
                        <img
                          className="subCategoryIcon"
                          src={sub.icon}
                          alt={sub.name}
                        />
                        <p className="subCategoryName">{sub.name}</p>
                      </motion.div>
                    ))}
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="listSettingsDiv">
          <button className="sortByBtn" onClick={openModal}>
            Sortiraj po{" "}
            <img src="./images/downArrowIcon.png" className="downArrowIcon" />
          </button>
          
            <Modal isOpen={isModalOpen} onClose={closeModal}>
              <div className="sortModal">
                <div className="sortHeaderDiv">
                    <h3 className="sortingHeader">Sortiraj po</h3>
                    <button className="closeSortBtn" onClick={closeModal}>x</button>
                </div>
                
                <div className="sortSecondHeader">
                  <div className="sortByPriceDiv">
                    <img src="./images/downSort.png" className="sortImg"></img>
                    <p className="sortByParagraph">Cena (prvo najjeftinije)</p>
                    <label className="checkBoxLabel">
                      <input name="dummy" type="checkbox"></input>
                      <span className="checkBoxSpan"></span>
                    </label>
                  </div>

                  <div className="sortByPriceDiv">
                    <img src="./images/upSort.png" className="sortImg"></img>
                    <p className="sortByParagraph">Cena (prvo najskuplje)</p>
                    <label className="checkBoxLabel">
                      <input name="dummy" type="checkbox"></input>
                      <span className="checkBoxSpan"></span>
                    </label>
                  </div>
                  <div className="sortByPriceDiv">
                    <img src="./images/discountIcon.png" className="sortImg"></img>
                    <p className="sortByParagraph">Najveci popust</p>
                    <label className="checkBoxLabel">
                      <input name="dummy" type="checkbox"></input>
                      <span className="checkBoxSpan"></span>
                    </label>
                  </div>
                   <div className="sortByPriceDiv">
                    <img src="./images/starMedalIcon.png" className="sortImg"></img>
                    <p className="sortByParagraph">Najpovoljnije</p>
                    <label className="checkBoxLabel">
                      <input name="dummy" type="checkbox"></input>
                      <span className="checkBoxSpan"></span>
                    </label>
                  </div>
                   <div className="sortByPriceDiv">
                    <img src="./images/newIcon.png" className="sortImg"></img>
                    <p className="sortByParagraph">Novi proizvodi</p>
                    <label className="checkBoxLabel">
                      <input name="dummy" type="checkbox"></input>
                      <span className="checkBoxSpan"></span>
                    </label>
                  </div>
                   <div className="sortByPriceDiv">
                    <img src="./images/flameIcon.png" className="sortImg"></img>
                    <p className="sortByParagraph">Najpopulariniji proizvodi</p>
                    <label className="checkBoxLabel">
                      <input name="dummy" type="checkbox"></input>
                      <span className="checkBoxSpan"></span>
                    </label>
                  </div>
                </div>
              </div>
            </Modal>
          

          <button className="filtersBtn">
            Filteri
            <img src="./images/downArrowIcon.png" className="downArrowIcon" />
          </button>

          <button className="bestOfferBtn">
            <img src="./images/starMedalIcon.png" className="starMedalIcon" />
            Najpovoljnije
          </button>

          {selectedMidCategory && (
            <>
              <button
                className="backToMidCategoriesBtn"
                onClick={() => setSelectedMidCategory(null)}
              >
                {selectedMidCategory}
                <img
                  src="./images/close.png"
                  className="closeMidCategoryBtn"
                  alt="Close"
                />
              </button>

              {selectedSubCategory && (
                <button
                  className="backToMidCategoriesBtn"
                  onClick={() => setSelectedSubCategory(null)}
                >
                  {selectedSubCategory}
                  <img
                    src="./images/close.png"
                    className="closeMidCategoryBtn"
                    alt="Close"
                  />
                </button>
              )}
            </>
          )}
        </div>

        <h3 className="allDairyHeader">
          {loading ? (
            <Skeleton width={240} />
          ) : (
            `Svi proizvodi (${products.length})`
          )}
        </h3>

        <div className="productsDisplayDiv">
          {error && <p style={{ color: "red" }}>{error}</p>}

          {loading
            ? Array(6)
                .fill(0)
                .map((_, idx) => (
                  <div
                    key={idx}
                    className="productCardDiv"
                    style={{ pointerEvents: "none" }}
                  >
                    {/* Skeleton layout here as I detailed previously */}
                    <Skeleton
                      height="15vh"
                      width="12vw"
                      borderRadius="2vh"
                      style={{
                        marginTop: "1vh",
                        marginBottom: "1vh",
                        marginLeft: "auto",
                        marginRight: "auto",
                        backgroundColor: "#fff",
                      }}
                    />
                    <div
                      className="storeLogosDiv"
                      style={{
                        justifyContent: "flex-start",
                        gap: "1.2vw",
                        marginTop: "1.5vh",
                        width: "12.2vw",
                      }}
                    >
                      {[...Array(3)].map((__, i) => (
                        <Skeleton
                          key={i}
                          height="2vh"
                          width="2vw"
                          style={{ marginRight: "1vw", borderRadius: "1vh" }}
                        />
                      ))}
                    </div>
                    <Skeleton
                      width="12.3vw"
                      height="5vh"
                      style={{ marginTop: "1vh" }}
                    />
                    <div
                      className="productWeightDiv"
                      style={{ width: "12.8vw", marginTop: "0.5vh" }}
                    >
                      <Skeleton width="3vw" height="1.8vh" />
                      <Skeleton
                        width="7vw"
                        height="1.8vh"
                        style={{ marginLeft: "0.5vw" }}
                      />
                    </div>
                    <Skeleton
                      width="12.3vw"
                      height="2vh"
                      style={{ marginTop: "1vh" }}
                    />
                    <div
                      className="productQuantityDiv"
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        width: "12.3vw",
                        marginTop: "1vh",
                      }}
                    >
                      <Skeleton width="3vw" height="3vh" borderRadius="1vh" />
                      <Skeleton width="2vw" height="3vh" />
                      <Skeleton width="3vw" height="3vh" borderRadius="1vh" />
                    </div>
                    <Skeleton
                      width="12.3vw"
                      height="4vh"
                      borderRadius="2vh"
                      style={{ marginTop: "1vh" }}
                    />
                  </div>
                ))
            : products.map((product) => (
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
