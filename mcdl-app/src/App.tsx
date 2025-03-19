import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Home from "./components/Home";
import Register from "./components/Register.tsx";
import Login from "./components/Login.tsx";
import "./App.css";
import ChatUI from "./components/ChatUI.tsx";
import LandingPage from "./components/LandingPage.tsx";
import ProSubscriptionPage from "./components/ProSubscriptionPage.tsx";
import Dashboard from "./components/Dashboard.tsx";
import MyEditor from "./components/MyEditor.tsx";

const App: React.FC = () => {
	return (
		<div className="app-container shadow p-3 mb-5 bg-body-tertiary rounded">
			<Router>
				<Navbar />
				<Routes>
					<Route path="/" element={<LandingPage />} />
					<Route path="/home" element={<Home />} />
					<Route path="/register" element={<Register />} />
					<Route path="/login" element={<Login />} />
					<Route path="/chat" element={<ChatUI />} />
					<Route
						path="/subscribe"
						element={<ProSubscriptionPage />}
					/>
					<Route path="/dashboard" element={<Dashboard />} />
					<Route path="/editor" element={<MyEditor />} />
				</Routes>

				<Footer />
			</Router>
		</div>
	);
};

export default App;
