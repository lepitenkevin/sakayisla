import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

const iconShadow = 'leaflet/dist/images/marker-shadow.png';
const availableRiderIcon = new L.Icon({ 
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png', 
    shadowUrl: iconShadow, 
    iconSize: [25, 41], 
    iconAnchor: [12, 41] 
});

const Home = () => {
    const [riders, setRiders] = useState([]);
    
    // --- NEW: State to control the APK guide popup ---
    const [showInstallGuide, setShowInstallGuide] = useState(false);

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

        fetchRiders(); 
        const interval = setInterval(fetchRiders, 8000); 
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="flex flex-col gap-12 py-8 relative">
            
            {/* --- NEW: APK Installation Guide Modal --- */}
            {showInstallGuide && (
                <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[9999] p-4 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl relative">
                        <button onClick={() => setShowInstallGuide(false)} className="absolute top-4 right-5 text-gray-400 hover:text-gray-800 text-2xl font-bold transition">✕</button>
                        
                        <div className="text-center mb-6">
                            <div className="w-16 h-16 bg-brand-light rounded-full flex items-center justify-center text-3xl mx-auto mb-3 border-4 border-white shadow-sm ring-2 ring-brand/20">⚙️</div>
                            <h3 className="text-2xl font-extrabold text-brand-dark">How to Install</h3>
                        </div>
                        
                        <ol className="space-y-4 text-gray-600 font-medium text-sm">
                            <li className="flex gap-3 items-start">
                                <span className="bg-brand text-white w-6 h-6 rounded-full flex items-center justify-center font-bold shrink-0 text-xs mt-0.5">1</span> 
                                <p>Download the APK file.</p>
                            </li>
                            <li className="flex gap-3 items-start">
                                <span className="bg-brand text-white w-6 h-6 rounded-full flex items-center justify-center font-bold shrink-0 text-xs mt-0.5">2</span> 
                                <p>Open the file. If Android shows a security warning, tap <strong>Settings</strong>.</p>
                            </li>
                            <li className="flex gap-3 items-start">
                                <span className="bg-brand text-white w-6 h-6 rounded-full flex items-center justify-center font-bold shrink-0 text-xs mt-0.5">3</span> 
                                <p>Toggle on <strong>"Allow from this source"</strong> (or "Unknown Sources").</p>
                            </li>
                            <li className="flex gap-3 items-start">
                                <span className="bg-brand text-white w-6 h-6 rounded-full flex items-center justify-center font-bold shrink-0 text-xs mt-0.5">4</span> 
                                <p>Go back, tap <strong>Install</strong>, and open the app!</p>
                            </li>
                        </ol>

                        <button onClick={() => setShowInstallGuide(false)} className="w-full mt-8 bg-brand hover:bg-brand-dark text-white font-extrabold py-3.5 rounded-xl transition shadow-md">
                            Got it!
                        </button>
                    </div>
                </div>
            )}

            {/* Hero Section */}
            <div className="bg-brand-dark rounded-3xl p-10 md:p-16 text-white shadow-xl relative overflow-hidden">
                <div className="relative z-10 max-w-2xl">
                    <h1 className="text-4xl md:text-6xl font-extrabold mb-4 leading-tight">Your Island, <br/><span className="text-brand-light">Your Ride.</span></h1>
                    <p className="text-lg md:text-xl text-gray-200 mb-8 font-medium">Fast, reliable, and authentic Habal-Habal rides and padala services across Bantayan Island. Book local riders instantly.</p>
                    
                    <div className="flex flex-col sm:flex-row gap-4 mb-6">
                        <Link to="/register" className="bg-white text-brand-dark px-8 py-4 rounded-xl font-extrabold text-center hover:bg-gray-100 transition shadow-lg">Get Started</Link>
                        <Link to="/login" className="bg-brand hover:bg-brand/80 text-white px-8 py-4 rounded-xl font-extrabold text-center transition">Log In</Link>
                    </div>

                    <div className="flex flex-col items-center sm:items-start mt-2">
                        <a 
                            href="https://sakayisla.156-67-214-49.sslip.io/download/sakay-isla-androiddemo.apk" 
                            className="flex items-center justify-center sm:justify-start gap-3 bg-white/10 hover:bg-white/20 border border-white/20 px-6 py-3 rounded-xl transition text-white w-full sm:w-max backdrop-blur-sm"
                        >
                            <span className="text-3xl drop-shadow-md">🤖</span>
                            <div className="text-left">
                                <span className="block text-[10px] font-bold uppercase tracking-wider opacity-80">Get the Demo App</span>
                                <span className="block text-sm font-extrabold tracking-wide">Download for Android</span>
                            </div>
                        </a>
                        
                        {/* --- NEW: Trigger for the popup --- */}
                        <button 
                            onClick={() => setShowInstallGuide(true)} 
                            className="text-white/60 hover:text-white text-xs font-medium mt-3 underline transition-colors"
                        >
                            Need help installing the APK?
                        </button>
                    </div>
                </div>
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
                    <div className="absolute bottom-6 left-4 z-[1000] bg-white/95 backdrop-blur-md p-4 rounded-2xl shadow-lg border border-gray-100 text-xs font-extrabold text-gray-700 flex flex-col gap-3">
                        <div className="flex items-center gap-3">
                            <img src="https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png" className="w-4 h-6 drop-shadow-sm" alt="Available Rider" /> 
                            Available Rider
                        </div>
                    </div>

                    <MapContainer center={[11.2185, 123.7445]} zoom={12} className="h-full w-full z-0" scrollWheelZoom={false}>
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