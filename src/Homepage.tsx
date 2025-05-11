import React from "react";

const Homepage = () => {
  return (
    <>
      <h1 className="homepageHeader">Welcome to PriceHunter!</h1>
      <a href="/admin">Admin Page</a>
      <br />
      <br />
      <a href="/user">User Page</a>
    </>
  );
};

export default Homepage;