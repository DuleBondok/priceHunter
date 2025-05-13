import React from "react";
import { useState } from "react";

type Product = {
    id: string;
    name: string;
    price: number;
    store: string;
    image?: string | null;
  };


function UserPage() {
    const [showSearch, setShowSearch] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [searchResults, setSearchResults] = useState<Product[]>([]);


    
    const handleSearch = async () => {
        if (!searchTerm.trim()) return;
    
        console.log("Searching for:", searchTerm);  // Log the search term
    
        try {
          const res = await fetch(`http://localhost:5000/api/search?query=${encodeURIComponent(searchTerm)}`);
          
          console.log("API Response:", res);  // Log the response object
          
          if (!res.ok) {
            console.error("API responded with an error:", res.status, res.statusText);  // Log the response error status
            return;
          }
    
          const data = await res.json();
          console.log("Data received from API:", data);  // Log the data received from the API
    
          setSearchResults(data);
        } catch (err) {
          console.error("Search failed", err);  // Log the error if fetching fails
        }
      };
    return (
        <>
        <h2 className="userPageHeader">Make a shopping list</h2>
        <button className="addItemToListBtn" onClick={() => setShowSearch(true)}>Add item to list</button>

        {showSearch && (
            <div className="searchSectionMainDiv">
                <div className="searchSection">
                <input className="itemNameInput" type="text" placeholder="Search for a product..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}/>
                <button className="searchItemBtn" onClick={handleSearch}>Search</button>
                </div>
                <div className="searchResultsDiv">
                        {searchResults.length === 0 && <p>No results yet.</p>}
                        {searchResults.map((product) => (
                            <div className="productCardDiv" key={product.id}>
                                <h3 className="productName">{product.name}</h3>
                                <p>{product.price} ({product.store})</p>
                                <button className="addToListBtn">Add to list</button>
                            </div>
                        ))}
                    </div>
            </div>
        )}
        </>
    )
}

export default UserPage;