import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Use the blue SakayIsla rider icon instead of the default grey one
const iconShadow = 'leaflet/dist/images/marker-shadow.png';
const availableRiderIcon = new L.Icon({ 
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png', 
    shadowUrl: iconShadow, 
    iconSize: [25, 41], 
    iconAnchor: [12, 41] 
});

const PassengerMap = () => {
    const [riders, setRiders] = useState([]);
    const bantayanCenter = [11.1965, 123.7745]; // Centered on Bantayan Island
    
    // Get the dynamically logged-in user
    const user = JSON.parse(localStorage.getItem('user'));

    // --- CENTRALIZED API HEADERS ---
    const apiHeaders = {
        'Content-Type': 'application/json',
        'x-api-key': import.meta.env.VITE_API_ACCESS_KEY,
        'x-api-secret': import.meta.env.VITE_API_SECRET_KEY
    };

    useEffect(() => {
        // FIXED: Used backticks instead of single quotes, and added the API headers!
        fetch(`${import.meta.env.VITE_API_BASE_URL}get_riders.php`, {
            headers: apiHeaders
        })
            .then(res => res.json())
            .then(data => { if(data.status === 'success') setRiders(data.data); })
            .catch(err => console.error("Error fetching riders:", err));
    }, []);

    const handleBook = async (riderId) => {
        if (!user) return alert("Please log in to book a ride.");

        // FIXED: Removed hardcoded ID, now uses user.id
        const payload = { passenger_id: user.id, rider_id: riderId }; 
        
        try {
            const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}book.php`, {
                method: 'POST',
                body: JSON.stringify(payload),
                headers: apiHeaders
            });
            const data = await res.json();
            alert(data.message);
        } catch (error) {
            alert("Failed to connect to the server.");
        }
    };

    return (
        <div className="w-full bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden flex flex-col h-[600px] lg:h-[700px]">
            
            <div className="p-6 md:p-8 border-b border-gray-100 bg-brand-light/30">
                <h2 className="text-2xl md:text-3xl font-extrabold text-brand-dark">Available Riders</h2>
                <p className="text-gray-500 font-medium text-sm mt-1">Tap a blue marker on the map to book your habal-habal instantly.</p>
            </div>
            
            <div className="flex-1 w-full relative z-0">
                <MapContainer center={bantayanCenter} zoom={13} className="h-full w-full">
                    <TileLayer url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png" />
                    
                    {riders.map(rider => (
                        <Marker key={rider.id} position={[rider.current_lat, rider.current_lng]} icon={availableRiderIcon}>
                            <Popup className="rounded-xl overflow-hidden shadow-lg border-0">
                                <div className="p-2 min-w-[160px]">
                                    <strong className="text-lg block text-gray-800 font-extrabold">{rider.name}</strong>
                                    <span className="text-sm text-gray-500 block mb-4 font-medium">
                                        Motor: {rider.motorcycle_model} <br />
                                        Plate: <span className="uppercase">{rider.plate_number}</span>
                                    </span>
                                    <button 
                                        onClick={() => handleBook(rider.id)} 
                                        className="w-full bg-brand hover:bg-brand-dark text-white font-bold py-2.5 px-4 rounded-xl transition shadow-sm"
                                    >
                                        Book Rider
                                    </button>
                                </div>
                            </Popup>
                        </Marker>
                    ))}
                </MapContainer>
            </div>
            
        </div>
    );
};

export default PassengerMap;