import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMapEvents, Circle, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

const iconShadow = 'leaflet/dist/images/marker-shadow.png';
const availableRiderIcon = new L.Icon({ iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png', shadowUrl: iconShadow, iconSize: [25, 41], iconAnchor: [12, 41] });
const liveRiderIcon = new L.Icon({ iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png', shadowUrl: iconShadow, iconSize: [25, 41], iconAnchor: [12, 41] });
const pickupIcon = new L.Icon({ iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png', shadowUrl: iconShadow, iconSize: [25, 41], iconAnchor: [12, 41] });
const dropoffIcon = new L.Icon({ iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-orange.png', shadowUrl: iconShadow, iconSize: [25, 41], iconAnchor: [12, 41] });

const MapLegend = ({ role }) => (
    <div 
        onClick={(e) => e.stopPropagation()} 
        className="absolute bottom-6 left-3 md:left-6 z-[1000] bg-white/95 backdrop-blur-md p-4 rounded-2xl shadow-lg border border-gray-100 text-xs font-extrabold text-gray-700 flex flex-col gap-3"
    >
        <div className="flex items-center gap-3"><img src="https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png" className="w-4 h-6 drop-shadow-sm" alt="Pickup" /> Pickup Point</div>
        <div className="flex items-center gap-3"><img src="https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-orange.png" className="w-4 h-6 drop-shadow-sm" alt="Dropoff" /> Drop-off Point</div>
        {role === 'passenger' && (
            <div className="flex items-center gap-3"><img src="https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png" className="w-4 h-6 drop-shadow-sm" alt="Available Rider" /> Available Rider</div>
        )}
        <div className="flex items-center gap-3"><img src="https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png" className="w-4 h-6 drop-shadow-sm" alt="Live Location" /> Live Location</div>
    </div>
);

const MapClickHandler = ({ setPickupLocation, setDropoffLocation, activePinMode, isDisabled }) => {
    useMapEvents({
        click(e) {
            if (isDisabled) return;
            if (activePinMode === 'pickup') setPickupLocation({ lat: e.latlng.lat, lng: e.latlng.lng });
            else if (activePinMode === 'dropoff') setDropoffLocation({ lat: e.latlng.lat, lng: e.latlng.lng });
        },
    });
    return null;
};

const MapController = ({ center }) => {
    const map = useMap();
    useEffect(() => {
        if (center && center.lat && center.lng) {
            map.flyTo([center.lat, center.lng], 15, { animate: true, duration: 1.5 });
        }
    }, [center, map]);
    return null;
};

const PassengerDashboard = () => {
    const [remarks, setRemarks] = useState('');
    const [riders, setRiders] = useState([]); 
    const [activeBooking, setActiveBooking] = useState(null); 
    const [myLocation, setMyLocation] = useState({ lat: null, lng: null });
    const [pickupLocation, setPickupLocation] = useState({ lat: null, lng: null });
    const [dropoffLocation, setDropoffLocation] = useState({ lat: null, lng: null });
    const [activePinMode, setActivePinMode] = useState('pickup'); 
    const [hasDestination, setHasDestination] = useState(false); 
    
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const [mapCenter, setMapCenter] = useState({ lat: 11.1965, lng: 123.7745 });
    
    const [showThankYou, setShowThankYou] = useState(false);
    const prevBookingRef = useRef(null);
    
    const user = JSON.parse(localStorage.getItem('user'));

    const apiHeaders = {
        'Content-Type': 'application/json',
        'x-api-key': import.meta.env.VITE_API_ACCESS_KEY,
        'x-api-secret': import.meta.env.VITE_API_SECRET_KEY
    };

    useEffect(() => {
        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition((pos) => {
                const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
                setMyLocation(loc); 
                setPickupLocation(loc); 
                setMapCenter(loc);
            });
        }

        const fetchStatusAndRiders = () => {
            if (!user) return;
            
            fetch(`${import.meta.env.VITE_API_BASE_URL}passenger_booking.php?passenger_id=${user.id}`, { headers: apiHeaders })
                .then(res => res.json())
                .then(data => {
                    if (data.status === 'success' && data.has_booking) {
                        setActiveBooking(data.data);
                        prevBookingRef.current = data.data; 
                        setRiders([]); 
                    } else {
                        setActiveBooking(null);
                        
                        if (prevBookingRef.current && prevBookingRef.current.status === 'accepted') {
                            setShowThankYou(true);
                            setTimeout(() => setShowThankYou(false), 8000);
                        }
                        prevBookingRef.current = null; 
                        
                        fetch(`${import.meta.env.VITE_API_BASE_URL}get_riders.php`, { headers: apiHeaders })
                            .then(res => res.json())
                            .then(rData => { if(rData.status === 'success') setRiders(rData.data); })
                            .catch(err => console.error("Error fetching riders:", err));
                    }
                })
                .catch(err => console.error("Error fetching booking status:", err));
        };

        fetchStatusAndRiders();
        const interval = setInterval(fetchStatusAndRiders, 5000); 
        return () => clearInterval(interval);
    }, []);

    const handleSearch = async (e) => {
        const query = e.target.value;
        setSearchQuery(query);
        
        if (query.length > 2) {
            setIsSearching(true);
            try {
                const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&countrycodes=ph&limit=5`);
                const data = await res.json();
                setSearchResults(data);
            } catch (err) {
                console.error("Search failed:", err);
            } finally {
                setIsSearching(false);
            }
        } else {
            setSearchResults([]);
        }
    };

    const handleSelectSearchResult = (result) => {
        const lat = parseFloat(result.lat);
        const lng = parseFloat(result.lon);
        
        if (activePinMode === 'pickup') {
            setPickupLocation({ lat, lng });
        } else {
            setDropoffLocation({ lat, lng });
            setHasDestination(true); 
        }
        
        setMapCenter({ lat, lng }); 
        setSearchQuery(''); 
        setSearchResults([]);
    };

    const handleBook = async (riderId) => {
        if (!pickupLocation.lat) return alert("Please set a pickup point.");
        if (hasDestination && !dropoffLocation.lat) return alert("Please set a destination.");

        const payload = { 
            passenger_id: user.id, 
            rider_id: riderId || null, // null triggers the broadcast
            pickup_lat: pickupLocation.lat, pickup_lng: pickupLocation.lng,
            dropoff_lat: hasDestination ? dropoffLocation.lat : null, dropoff_lng: hasDestination ? dropoffLocation.lng : null,
            remarks: remarks
        };

        try {
            const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}book.php`, {
                method: 'POST', body: JSON.stringify(payload), headers: apiHeaders 
            });
            const data = await res.json();
            alert(data.message); 
            setRemarks('');
        } catch (error) {
            alert("Failed to process booking.");
        }
    };

    const updateBookingStatus = async (newStatus) => {
        const bookingId = activeBooking.id || activeBooking.booking_id;
        if (!bookingId) return alert("System Error: Cannot find Booking ID.");

        try {
            await fetch(`${import.meta.env.VITE_API_BASE_URL}update_booking.php`, {
                method: 'POST', body: JSON.stringify({ booking_id: bookingId, status: newStatus }), headers: apiHeaders
            });
            
            fetch(`${import.meta.env.VITE_API_BASE_URL}passenger_booking.php?passenger_id=${user.id}`, { headers: apiHeaders })
                .then(res => res.json())
                .then(data => { if (data.status === 'success') setActiveBooking(data.has_booking ? data.data : null); });
        } catch (error) {
            alert("Failed to connect to server.");
        }
    };

    if (!user) return null;

    return (
        <div className="flex flex-col lg:flex-row h-[80vh] gap-6 relative">
            
            {showThankYou && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[9999] p-4 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white rounded-3xl p-8 md:p-12 text-center max-w-md w-full shadow-2xl">
                        <div className="w-24 h-24 bg-brand-light rounded-full flex items-center justify-center mx-auto mb-6">
                            <span className="text-5xl">🎉</span>
                        </div>
                        <h2 className="text-3xl font-extrabold text-brand-dark mb-2">Ride Completed!</h2>
                        <p className="text-gray-500 font-medium mb-8">
                            Thank you for booking with SakayIsla. Please pay the exact fare directly to your rider. Stay safe!
                        </p>
                        <button onClick={() => setShowThankYou(false)} className="w-full bg-brand hover:bg-brand-dark text-white font-extrabold py-4 rounded-xl transition shadow-md">
                            Done
                        </button>
                    </div>
                </div>
            )}

            <div className="w-full lg:w-[400px] flex flex-col gap-4">
                <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex-1 overflow-y-auto">
                    <h2 className="text-2xl font-extrabold text-brand-dark mb-6">Where to?</h2>
                    
                    {activeBooking ? (
                        <div className="flex flex-col gap-4">
                            {activeBooking.status === 'pending' && (
                                <div className="bg-orange-50 rounded-2xl p-6 border border-orange-100 text-center animate-pulse shadow-sm">
                                    <span className="text-5xl block mb-4">📡</span>
                                    <h3 className="font-black text-orange-800 text-xl mb-1">Broadcasting Request</h3>
                                    <p className="text-orange-600 text-sm font-medium">Waiting for a rider to accept and send you a fare offer.</p>
                                    <button onClick={() => updateBookingStatus('cancelled')} className="mt-5 w-full bg-white text-red-600 border border-gray-200 hover:bg-red-50 font-bold py-3 rounded-xl transition">
                                        Cancel Request
                                    </button>
                                </div>
                            )}

                            {activeBooking.status === 'rider_offered' && (
                                <div className="bg-white rounded-2xl p-5 shadow-lg border-2 border-brand animate-fade-in">
                                    <div className="flex justify-between items-start mb-4 border-b border-gray-100 pb-4">
                                        <div>
                                            <h3 className="font-black text-brand-dark text-xl">Rider's Offer</h3>
                                            <p className="text-gray-500 font-medium text-sm mt-1">{activeBooking.rider_name}</p>
                                        </div>
                                        <div className="text-right bg-green-50 px-4 py-2 rounded-xl border border-green-100">
                                            <p className="text-[10px] font-bold text-green-700 uppercase tracking-wider mb-0.5">Asking Fare</p>
                                            <p className="text-3xl font-black text-green-600">₱{activeBooking.fare}</p>
                                        </div>
                                    </div>
                                    <p className="text-xs text-gray-600 font-bold flex items-center gap-2 mb-5 bg-gray-50 p-3 rounded-xl border border-gray-100">
                                        <span className="text-lg">💡</span> Too high? Call the rider to negotiate the price before accepting!
                                    </p>
                                    <a href={`tel:${activeBooking.rider_contact}`} className="flex items-center justify-center w-full bg-gray-100 hover:bg-gray-200 text-brand-dark font-extrabold py-3.5 rounded-xl transition mb-3">📞 Call to Negotiate</a>
                                    <div className="flex gap-2">
                                        <button onClick={() => updateBookingStatus('cancelled')} className="flex-1 bg-red-50 text-red-600 font-bold py-3.5 rounded-xl hover:bg-red-100 transition">Decline</button>
                                        <button onClick={() => updateBookingStatus('accepted')} className="flex-[2] bg-brand text-white font-black py-3.5 rounded-xl shadow-md hover:bg-brand-dark transition">Accept ₱{activeBooking.fare}</button>
                                    </div>
                                </div>
                            )}

                            {activeBooking.status === 'accepted' && (
                                <div className="bg-brand-light border border-brand/20 rounded-2xl p-5">
                                    <div className="flex items-center gap-3 mb-4">
                                        <span className="flex h-3 w-3 relative"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand opacity-75"></span><span className="relative inline-flex rounded-full h-3 w-3 bg-brand-dark"></span></span>
                                        <h3 className="font-extrabold text-brand-dark text-lg uppercase tracking-wide">Ride Accepted</h3>
                                    </div>
                                    <div className="bg-white rounded-xl p-4 shadow-sm mb-4 border-l-4 border-brand">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <p className="font-extrabold text-gray-800 text-xl">{activeBooking.rider_name}</p>
                                                <p className="text-gray-500 text-sm font-medium">{activeBooking.motorcycle_model} • <span className="uppercase">{activeBooking.plate_number}</span></p>
                                            </div>
                                            <div className="text-right bg-green-50 px-3 py-1.5 rounded-lg border border-green-100">
                                                <p className="text-[10px] font-bold text-green-700 uppercase tracking-wider mb-0.5">Agreed Fare</p>
                                                <p className="text-xl font-black text-green-600">₱{activeBooking.fare}</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <button onClick={() => updateBookingStatus('cancelled')} className="bg-red-50 text-red-600 hover:bg-red-100 font-bold py-3.5 px-4 rounded-xl transition">Cancel</button>
                                        <a href={`tel:${activeBooking.rider_contact}`} className="flex-1 flex items-center justify-center bg-brand hover:bg-brand-dark text-white font-extrabold tracking-wide py-3.5 rounded-xl transition shadow-sm">📞 Call Rider</a>
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="flex flex-col gap-6">
                            
                            <div className="relative">
                                <label className={`block text-xs font-bold uppercase tracking-wider mb-2 transition-colors ${activePinMode === 'pickup' ? 'text-red-600' : 'text-orange-600'}`}>
                                    Search {activePinMode === 'pickup' ? 'Pickup' : 'Drop-off'} Location
                                </label>
                                <div className="relative">
                                    <input 
                                        type="text" 
                                        value={searchQuery}
                                        onChange={handleSearch}
                                        placeholder="E.g. Santa Fe Port..."
                                        className={`w-full p-3.5 bg-gray-50 border-2 rounded-xl focus:outline-none transition ${activePinMode === 'pickup' ? 'border-gray-200 focus:border-red-400' : 'border-gray-200 focus:border-orange-400'}`}
                                    />
                                    <span className="absolute right-4 top-3.5 text-gray-400">{isSearching ? '⏳' : '🔍'}</span>
                                </div>
                                
                                {searchResults.length > 0 && (
                                    <ul className="absolute z-[100] w-full bg-white mt-2 border border-gray-200 rounded-xl shadow-2xl max-h-60 overflow-y-auto">
                                        {searchResults.map((res, index) => (
                                            <li 
                                                key={index} 
                                                onClick={() => handleSelectSearchResult(res)}
                                                className="p-3.5 border-b border-gray-100 hover:bg-brand-light cursor-pointer text-sm font-medium text-gray-700 transition"
                                            >
                                                {res.display_name}
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>

                            <div className="relative pl-6 border-l-2 border-dashed border-gray-200 ml-3 space-y-5">
                                <div className="relative">
                                    <div className="absolute -left-[33px] top-4 w-4 h-4 rounded-full bg-red-500 border-4 border-white shadow"></div>
                                    <button onClick={() => setActivePinMode('pickup')} 
                                            className={`w-full text-left p-4 rounded-2xl border transition ${activePinMode === 'pickup' ? 'border-red-500 bg-red-50 shadow-sm' : 'border-gray-100 bg-gray-50 hover:bg-gray-100'}`}>
                                        <span className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Pickup Location</span>
                                        <span className="font-medium text-gray-800">{pickupLocation.lat ? '📍 Pinned on map' : 'Tap map or search above'}</span>
                                    </button>
                                </div>

                                <div className="relative">
                                    <div className="absolute -left-[33px] top-4 w-4 h-4 rounded-full bg-orange-500 border-4 border-white shadow"></div>
                                    <label className="flex items-center gap-2 mb-2 cursor-pointer ml-1">
                                        <input type="checkbox" checked={hasDestination} onChange={(e) => { setHasDestination(e.target.checked); if(e.target.checked) setActivePinMode('dropoff'); }} className="rounded text-brand focus:ring-brand accent-brand w-4 h-4" />
                                        <span className="text-sm font-bold text-gray-700">Add Destination</span>
                                    </label>
                                    
                                    {hasDestination && (
                                        <button onClick={() => setActivePinMode('dropoff')} 
                                                className={`w-full text-left p-4 rounded-2xl border transition ${activePinMode === 'dropoff' ? 'border-orange-500 bg-orange-50 shadow-sm' : 'border-gray-100 bg-gray-50 hover:bg-gray-100'}`}>
                                            <span className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Drop-off Location</span>
                                            <span className="font-medium text-gray-800">{dropoffLocation.lat ? '🏁 Pinned on map' : 'Tap map or search above'}</span>
                                        </button>
                                    )}
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1.5">Note to Rider</label>
                                <input type="text" placeholder="E.g., wearing a red cap..." value={remarks} onChange={(e) => setRemarks(e.target.value)}
                                       className="w-full p-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand transition" />
                            </div>

                            {/* --- NEW: Broadcast Action Buttons --- */}
                            <div className="flex flex-col gap-3 mt-2">
                                <button 
                                    onClick={() => handleBook(null)} 
                                    className="w-full bg-brand hover:bg-brand-dark text-white font-extrabold py-4 rounded-xl transition shadow-md flex items-center justify-center gap-2"
                                >
                                    <span className="text-xl">📡</span> Broadcast to All Riders
                                </button>
                                <p className="text-center text-xs font-bold text-gray-500 uppercase tracking-wider">OR</p>
                                <div className="bg-gray-50 text-gray-600 p-4 rounded-xl text-sm font-bold flex items-center gap-3 border border-gray-200">
                                    <span className="text-xl">📍</span>
                                    Tap a blue rider pin on the map to request a specific driver.
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <div className="w-full lg:w-2/3 bg-gray-200 rounded-2xl overflow-hidden shadow-inner relative border border-gray-200 min-h-[50vh] lg:min-h-0">
                <MapLegend role="passenger" />
                
                <MapContainer center={[mapCenter.lat, mapCenter.lng]} zoom={14} className="h-full w-full z-0">
                    <TileLayer url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png" />
                    
                    <MapController center={mapCenter} />
                    <MapClickHandler setPickupLocation={setPickupLocation} setDropoffLocation={setDropoffLocation} activePinMode={activePinMode} isDisabled={activeBooking !== null} />
                    
                    {myLocation.lat && <Circle center={[myLocation.lat, myLocation.lng]} radius={100} pathOptions={{ color: '#2FA084', fillColor: '#2FA084', fillOpacity: 0.2 }} />}

                    {activeBooking ? (
                        <>
                            <Marker position={[activeBooking.pickup_lat, activeBooking.pickup_lng]} icon={pickupIcon} />
                            {activeBooking.dropoff_lat && <Marker position={[activeBooking.dropoff_lat, activeBooking.dropoff_lng]} icon={dropoffIcon} />}
                            {activeBooking.status === 'accepted' && <Marker position={[activeBooking.live_lat, activeBooking.live_lng]} icon={liveRiderIcon} />}
                            {activeBooking.status === 'accepted' && <Polyline positions={[[activeBooking.live_lat, activeBooking.live_lng], [activeBooking.pickup_lat, activeBooking.pickup_lng]]} color="#1F6F5F" dashArray="8, 8" weight={4} />}
                        </>
                    ) : (
                        <>
                            {pickupLocation.lat && <Marker position={[pickupLocation.lat, pickupLocation.lng]} icon={pickupIcon} />}
                            {hasDestination && dropoffLocation.lat && <Marker position={[dropoffLocation.lat, dropoffLocation.lng]} icon={dropoffIcon} />}
                            
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

                                            <button onClick={() => handleBook(rider.id)} className="w-full bg-brand hover:bg-brand-dark text-white font-extrabold py-3 px-4 rounded-xl transition shadow-md">Request Specific Rider</button>
                                        </div>
                                    </Popup>
                                </Marker>
                            ))}
                        </>
                    )}
                </MapContainer>
            </div>
        </div>
    );
};

export default PassengerDashboard;