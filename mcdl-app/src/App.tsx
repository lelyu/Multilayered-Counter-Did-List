import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Home from "./components/Home";
import Register from "./components/Register.tsx";
import Login from "./components/Login.tsx";
import "./App.css";
import FolderCard from "./components/FolderCard.tsx";
import Carousel from "./components/Carousel.tsx";
import Scrollspy from "./components/Scrollspy";

const App: React.FC = () => {
	return (
		<div className="app-container shadow p-3 mb-5 bg-body-tertiary rounded">
			<Router>
				<Navbar />

				<Carousel />
				<br />

				<Scrollspy />

				<br />
				<Routes>
					<Route path="/" element={<Home />} />
					<Route path="/register" element={<Register />} />
					<Route path="/login" element={<Login />} />
					<Route path="/card" element={<FolderCard />} />
				</Routes>

				<Footer />
			</Router>
		</div>
	);
};

export default App;
