import React from "react";

const Homepage = () => {
  return (
    <>
      <div className="mainHomepageDiv">
        <div className="homepageHeaderDiv">
          <div className="headerFirstDiv">
            <img
              src="./images/pricleyLogoTransparent.png"
              className="homepageLogo"
            ></img>
            <img src="./images/locationIcon.png" className="headerLocationIcon"></img>
          </div>
          <div className="roleDiv">
            <a href="/admin" className="roleHref">
              <img src="./images/administrator.png" className="adminImg"></img>
              Admin role
            </a>
          </div>
          <div className="headerSecondDiv">
            <button className="headerLogInBtn">
              Prijava
            </button>
            <button className="headerSignUpBtn">
              Registracija
            </button>

          </div>
        </div>
        <div className="homepageDisplayDiv">
          <div className="categoriesListDiv">
            <div className="categoryDiv">

            </div>
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
