import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

const App: React.FC = () => {
  return (
    <Router>
      <Navbar />
      <h1>Hello World</h1>
      <Footer />
    </Router>
  );
};

export default App;
