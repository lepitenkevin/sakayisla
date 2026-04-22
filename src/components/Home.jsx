import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Setup the custom Leaflet icon for available riders
const iconShadow = 'leaflet/dist/images/marker-shadow.png';
const availableRiderIcon = new L.Icon({ 
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png', 
    shadowUrl: iconShadow, 
    iconSize: [25, 41], 
    iconAnchor: [12, 41] 
});

const Home = () => {
    const [riders, setRiders] = useState([]);

    // Fetch active riders to display on the public map
    useEffect(() => {
        const fetchRiders = () => {
            fetch(`${import.meta.env.VITE_API_BASE_URL}get_riders.php`, {
                headers: {
                    'Content-Type': 'application/json',
                    'x-api-key': import.meta.env.VITE_API_ACCESS_KEY,
                    'x-api-secret': import.meta.env.VITE_API_SECRET_KEY
                }
            })
            .then(res => res.json())
            .then(data => {
                if(data.status === 'success') {
                    setRiders(data.data);
                }
            })
            .catch(err => console.error("Error fetching live riders:", err));
        };

        fetchRiders(); // Initial fetch
        const interval = setInterval(fetchRiders, 8000); // Poll every 8 seconds
        return () => clearInterval(interval);
    }, []);

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

            {/* Live Public Map Section */}
            <div>
                <div className="flex justify-between items-end mb-6">
                    <div>
                        <h2 className="text-3xl font-extrabold text-brand-dark">Live Riders</h2>
                        <p className="text-gray-500 font-medium">See active riders currently exploring the island.</p>
                    </div>
                    <div className="hidden md:flex items-center gap-2 bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-100">
                        <span className="relative flex h-3 w-3">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
                        </span>
                        <span className="text-xs font-bold text-blue-700 uppercase tracking-wider">{riders.filter(r => r.current_lat).length} Online</span>
                    </div>
                </div>

                <div className="h-[400px] md:h-[500px] w-full rounded-3xl overflow-hidden shadow-sm border border-gray-200 relative z-0">
                    
                    {/* Map Legend for Visitors */}
                    <div className="absolute bottom-6 left-4 z-[1000] bg-white/95 backdrop-blur-md p-4 rounded-2xl shadow-lg border border-gray-100 text-xs font-extrabold text-gray-700 flex flex-col gap-3">
                        <div className="flex items-center gap-3">
                            <img src="https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png" className="w-4 h-6 drop-shadow-sm" alt="Available Rider" /> 
                            Available Rider
                        </div>
                    </div>

                    {/* Locked to Bantayan Island coordinates */}
                    <MapContainer center={[11.1965, 123.7745]} zoom={13} className="h-full w-full z-0" scrollWheelZoom={false}>
                        <TileLayer url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png" />

                        {riders.filter(r => r.current_lat && r.current_lng).map(rider => (
                            <Marker key={rider.id} position={[parseFloat(rider.current_lat), parseFloat(rider.current_lng)]} icon={availableRiderIcon}>
                                <Popup className="rounded-2xl overflow-hidden shadow-2xl border-0 p-0 m-0">
                                    <div className="p-5 min-w-[220px] text-center bg-white">
                                        <div className="w-16 h-16 bg-brand-light rounded-full mx-auto mb-3 flex items-center justify-center text-3xl border-4 border-white shadow-sm ring-2 ring-brand/20">👨‍🚀</div>
                                        <strong className="text-xl block text-gray-800 font-extrabold mb-1">{rider.name}</strong>
                                        
                                        <div className="bg-gray-50 rounded-xl p-3 mb-4 mt-2 border border-gray-100">
                                            <p className="text-sm text-gray-600 font-medium mb-1 flex items-center justify-center gap-1.5"><span>🛵</span> {rider.motorcycle_model}</p>
                                            <p className="text-sm uppercase font-extrabold text-gray-800 tracking-wider">{rider.plate_number}</p>
                                        </div>

                                        <Link to="/login" className="block w-full bg-brand hover:bg-brand-dark !text-white font-extrabold py-3 px-4 rounded-xl transition shadow-md ">Log in to Book</Link>
                                    </div>
                                </Popup>
                            </Marker>
                        ))}
                    </MapContainer>
                </div>
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