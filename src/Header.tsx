import React from "react";

import "./App.css";

const Header: React.FC = () => {
  return (
    <div className="homepageHeaderDiv">
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

export default Header;
