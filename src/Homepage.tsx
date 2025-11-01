import React from "react";
import { FiSearch } from "react-icons/fi";
import Header from "./Header";
import { Link } from "react-router-dom";


const Homepage = () => {
  return (
    <>
      <div className="mainHomepageDiv">
        <Header />
        <div className="homepageDisplayDiv">

          <div className="categoriesListDiv">
            <div className="categoryDiv"  onClick={() => (window.location.href = "/dairyCategory")}>
              <img src="./images/blob1.png" className="blobImg"></img>
              <img src="./images/dairyImg.png" className="blobIcon"></img>
              <p className="categoryName">Mleko i jaja</p>
            </div>
            <div className="categoryDiv">
              <img src="./images/blob2.png" className="blobImg"></img>
              <img src="./images/vegetableImg.png" className="blobIcon"></img>
              <p className="categoryName">Voće i povrće</p>
            </div>
            <div className="categoryDiv">
              <img src="./images/blob3.png" className="blobImg"></img>
              <img src="./images/fishAndMeatImg.png" className="blobIcon"></img>
              <p className="categoryName">Meso i riba</p>
            </div>
            <div className="categoryDiv">
              <img src="./images/blob4.png" className="blobImg"></img>
              <img src="./images/drinkImg.png" className="blobIcon"></img>
              <p className="categoryName">Voda i sokovi</p>
            </div>
            <div className="categoryDiv">
              <img src="./images/blob5.png" className="blobImg"></img>
              <img src="./images/liquorImg.png" className="blobIcon"></img>
              <p className="categoryName">Alkoholna pića</p>
            </div>
            <div className="categoryDiv">
              <img src="./images/blob6.png" className="blobImg"></img>
              <img src="./images/rightArrowImg.png" className="blobIcon"></img>
              <p className="categoryName" style={{border:"2px solid #ffc107"}}>Sve kategorije</p>
            </div>
          </div>
          <div className="searchBarMainDiv">
            <FiSearch className="searchIcon" />
            <input type="text" className="searchInput" placeholder="Pretraži namirnice"></input>
            <button className="searchBtn">Pretraga</button>

          </div>

        </div>
        <div className="selectPageDiv">
        
          <div className="roleDiv">
            <a href="/user" className="roleHref">
              <img src="./images/user.png" className="userImg"></img>User role
            </a>
          </div>
        </div>
      </div>
    </>
  );
};

export default Homepage;
