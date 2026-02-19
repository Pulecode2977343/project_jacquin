import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './components/Home';
import Login from './components/Login';
import Register from './components/Register';
import CookieBanner from './components/CookieBanner';

function App() {
    return (
        <Router>
            <div className="App">
                <Header />
                <main className="jam-main-content">
                    <Routes>
                        <Route path="/" element={<Home />} />
                        <Route path="/login" element={<Login />} />
                        <Route path="/registro" element={<Register />} />
                        {/* Rutas adicionales aquí */}
                    </Routes>
                </main>
                <Footer />
                <CookieBanner />
            </div>
        </Router>
    );
}

export default App;
