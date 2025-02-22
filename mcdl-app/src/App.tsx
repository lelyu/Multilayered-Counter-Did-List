import React from "react";
import {BrowserRouter as Router, Route, Routes} from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Home from "./components/Home"
import Auth from "./components/Auth";
import './App.css';

const App: React.FC = () => {
    return (
        <div className="app-container shadow p-3 mb-5 bg-body-tertiary rounded">
            <Router>
                <Navbar/>

                <Routes>
                    <Route path="/" element={<Home/>}/>
                    <Route path="/auth" element={<Auth/>}/>
                </Routes>


                <Footer/>
            </Router>
        </div>
    );
};

export default App;
