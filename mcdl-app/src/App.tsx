import React, { useEffect } from "react";
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
import DocumentsPage from "./components/DocumentsPage.tsx";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./config/firebase.ts";
import { useState } from "react";
import SimplifiedView from "./components/Simplified_View.tsx";
const App: React.FC = () => {
	const [user, setUser] = useState<null>();
	useEffect(() => {
		const unsubscribe = onAuthStateChanged(auth, (user) => {
			if (user !== null) {
				setUser(user);
			} else {
				setUser(null);
			}
		});
		// Cleanup the listener on component unmount
		return () => unsubscribe();
	}, []); // run only once on mount

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
					<Route
						path="/documents/:folderId"
						element={<DocumentsPage user={user} />}
					/>
					<Route path="/simplified_view" element={<SimplifiedView />} />
				</Routes>

				<Footer />
			</Router>
		</div>
	);
};

export default App;
