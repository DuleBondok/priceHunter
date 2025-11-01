import React from "react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiSearch } from "react-icons/fi";

import "./App.css";

const CategoryHeader: React.FC = () => {
    const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  const handleSearch = () => {
    if (searchTerm.trim()) {
      navigate(`/search?query=${encodeURIComponent(searchTerm)}`);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleSearch();
  };
  return (
    <div className="categoryHeaderDiv">
      <div className="headerFirstDiv">
        <img
          src="./images/pricleyLogoTransparent.png"
          className="homepageLogo"
          alt="Pricley logo"
        />
        <img
          src="./images/locationIcon.png"
          className="headerLocationIcon"
          alt="Location icon"
        />
      </div>
      <div className="headerSearchInputDiv">
        <FiSearch className="searchIcon" />
        <input
        type="text"
        placeholder="Pretraži proizvode"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        onKeyPress={handleKeyPress}
        className="headerSearchInput"
      />
      <button onClick={handleSearch} className="headerSearchInputBtn">Pretraga</button>

      </div>

      <div className="roleDiv">
        <a href="/admin" className="roleHref">
          <img
            src="./images/administrator.png"
            className="adminImg"
            alt="Admin"
          />
          Admin role
        </a>
      </div>

      <div className="headerSecondDiv">
        <button className="headerLogInBtn">Prijava</button>
        <button className="headerSignUpBtn">Registracija</button>
      </div>
    </div>
  );
};

export default CategoryHeader;
