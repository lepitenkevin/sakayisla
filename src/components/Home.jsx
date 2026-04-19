import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
    return (
        <div className="flex flex-col gap-12 py-8">
            {/* Hero Section */}
            <div className="bg-brand-dark rounded-3xl p-10 md:p-16 text-white shadow-xl relative overflow-hidden">
                <div className="relative z-10 max-w-2xl">
                    <h1 className="text-4xl md:text-6xl font-extrabold mb-4 leading-tight">Your Island, <br/><span className="text-brand-light">Your Ride.</span></h1>
                    <p className="text-lg md:text-xl text-gray-200 mb-8 font-medium">Fast, reliable, and authentic Habal-Habal rides and padala services across Bantayan Island. Book local riders instantly.</p>
                    <div className="flex gap-4">
                        <Link to="/register" className="bg-white text-brand-dark px-8 py-4 rounded-xl font-extrabold hover:bg-gray-100 transition shadow-lg">Get Started</Link>
                        <Link to="/login" className="bg-brand hover:bg-brand/80 text-white px-8 py-4 rounded-xl font-extrabold transition">Log In</Link>
                    </div>
                </div>
                {/* Decorative Shape */}
                <div className="absolute -right-20 -bottom-20 w-96 h-96 bg-brand rounded-full blur-3xl opacity-50 z-0"></div>
            </div>

            {/* Services Section */}
            <div>
                <h2 className="text-3xl font-extrabold text-brand-dark text-center mb-8">Our Services</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 hover:border-brand transition">
                        <div className="text-4xl mb-4">🛵</div>
                        <h3 className="text-xl font-extrabold text-gray-800 mb-2">Habal-Habal Rides</h3>
                        <p className="text-gray-500 font-medium">Quick and safe transport around Santa Fe, Bantayan, and Madridejos. Pinned right to your exact location.</p>
                    </div>
                    <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 hover:border-brand transition">
                        <div className="text-4xl mb-4">📦</div>
                        <h3 className="text-xl font-extrabold text-gray-800 mb-2">Padala & Delivery</h3>
                        <p className="text-gray-500 font-medium">Need something dropped off? Use our remarks feature to have riders deliver food or items across the island.</p>
                    </div>
                    <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 hover:border-brand transition">
                        <div className="text-4xl mb-4">🗺️</div>
                        <h3 className="text-xl font-extrabold text-gray-800 mb-2">Live Tracking</h3>
                        <p className="text-gray-500 font-medium">No more guessing. Watch your assigned rider approach your pickup point in real-time on our interactive map.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Home;