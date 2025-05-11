import React from "react";
import { useState } from "react";


function UserPage() {
    const [showSearch, setShowSearch] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    return (
        <>
        <h2 className="userPageHeader">Make a shopping list</h2>
        <button className="addItemToListBtn" onClick={() => setShowSearch(true)}>Add item to list</button>

        {showSearch && (
            <div className="searchSectionMainDiv">
                <div className="searchSection">
                <input className="itemNameInput" type="text" placeholder="Search for a product..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}/>
                <button className="searchItemBtn">Search</button>
                </div>
                <div className="searchResultsDiv">
                    <div className="productCardDiv">
                        <h3>Moja kravica 1l</h3>
                        <p>Od 120rsd do 150rsd</p>
                        <button className="addToListBtn">Add to list</button>
                    </div>

                </div>
            </div>
        )}
        </>
    )
}

export default UserPage;