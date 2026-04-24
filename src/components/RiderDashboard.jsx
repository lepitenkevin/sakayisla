import React, { useState, useEffect, useRef } from 'react'; // --- UPGRADED: Added useRef ---
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMapEvents, useMap } from 'react-leaflet';
import { useNavigate } from 'react-router-dom'; 
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

import useIdleLogout from '../hooks/useIdleLogout';

const iconShadow = 'leaflet/dist/images/marker-shadow.png';
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

const LocationMarker = ({ position, setPosition, sendLocationToDatabase }) => {
    useMapEvents({
        click(e) {
            setPosition({ lat: e.latlng.lat, lng: e.latlng.lng });
            sendLocationToDatabase(e.latlng.lat, e.latlng.lng);
        },
    });
    return position.lat !== null ? <Marker position={[position.lat, position.lng]} icon={liveRiderIcon}></Marker> : null;
};

const AutoPan = ({ position }) => {
    const map = useMap();
    useEffect(() => {
        if (position.lat && position.lng) {
            map.flyTo([position.lat, position.lng], map.getZoom(), { animate: true, duration: 1 });
        }
    }, [position, map]);
    return null;
};

const RiderDashboard = () => {
    const navigate = useNavigate(); 
    
    useIdleLogout(60);
    
    const [bookings, setBookings] = useState([]);
    const [selectedBookingForMap, setSelectedBookingForMap] = useState(null);
    const [currentLocation, setCurrentLocation] = useState({ lat: 11.1965, lng: 123.7745 });
    const [isAutoGps, setIsAutoGps] = useState(true); 
    
    const [showProfile, setShowProfile] = useState(false);
    
    const [acceptingId, setAcceptingId] = useState(null);
    const [askingFare, setAskingFare] = useState("");
    const [editingFareId, setEditingFareId] = useState(null);
    const [editFareValue, setEditFareValue] = useState("");

    const user = JSON.parse(localStorage.getItem('user'));
    
    // --- NEW: Ref to track previous bookings so we don't spam notifications ---
    const prevBookingIds = useRef(new Set());

    const apiHeaders = {
        'Content-Type': 'application/json',
        'x-api-key': import.meta.env.VITE_API_ACCESS_KEY,
        'x-api-secret': import.meta.env.VITE_API_SECRET_KEY
    };

    // --- NEW: Ask for Notification Permission when Dashboard loads ---
    useEffect(() => {
        if ("Notification" in window && Notification.permission !== "granted" && Notification.permission !== "denied") {
            Notification.requestPermission();
        }
    }, []);

    // --- NEW: The Notification Trigger Function ---
    const triggerNewRideAlert = (passengerName) => {
        if ("Notification" in window && Notification.permission === "granted") {
            // Triggers a native push notification on Android/PC
            new Notification("New Ride Request! 🛵", {
                body: `${passengerName} is looking for a ride nearby. Tap to view!`,
                vibrate: [200, 100, 200, 100, 200] // Vibrates Android phones
            });
        }
    };

    const fetchBookings = () => {
        if (!user || user.account_status === 'pending') return; 
        fetch(`${import.meta.env.VITE_API_BASE_URL}rider_bookings.php?rider_id=${user.id}`, { headers: apiHeaders })
            .then(res => res.json())
            .then(data => { 
                if(data.status === 'success') {
                    const incomingBookings = data.data;
                    setBookings(incomingBookings);

                    // --- NEW: Notification Logic Check ---
                    const currentIds = new Set(incomingBookings.map(b => b.id || b.booking_id));

                    // Make sure this isn't the very first time the page loads
                    if (prevBookingIds.current.size > 0) {
                        incomingBookings.forEach(b => {
                            const bId = b.id || b.booking_id;
                            // If this is a PENDING ride, and we haven't seen this ID before -> FIRE ALERT
                            if (b.status === 'pending' && !prevBookingIds.current.has(bId)) {
                                triggerNewRideAlert(b.passenger_name);
                            }
                        });
                    }

                    // Save current list for the next 5-second check
                    prevBookingIds.current = currentIds;
                } 
            })
            .catch(err => console.error("Failed to fetch bookings:", err));
    };

    useEffect(() => {
        if (!user || user.account_status === 'pending') return; 
        fetchBookings();
        const interval = setInterval(fetchBookings, 5000);
        return () => clearInterval(interval);
    }, [user]);

    const sendLocationToDatabase = (lat, lng) => {
        if (!user || user.account_status === 'pending') return;
        fetch(`${import.meta.env.VITE_API_BASE_URL}update_location.php`, {
            method: 'POST', body: JSON.stringify({ rider_id: user.id, lat, lng }), headers: apiHeaders
        }).catch(err => console.error("Failed to update location:", err));
    };

    useEffect(() => {
        if (!user || !isAutoGps || user.account_status === 'pending') return; 
        const watchId = navigator.geolocation.watchPosition(
            (pos) => {
                setCurrentLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
                sendLocationToDatabase(pos.coords.latitude, pos.coords.longitude);
            },
            () => setIsAutoGps(false),
            { enableHighAccuracy: true, maximumAge: 10000, timeout: 5000 }
        );
        return () => navigator.geolocation.clearWatch(watchId);
    }, [isAutoGps, user]);

    const updateStatus = async (bookingId, newStatus, fare = null) => {
        if (!bookingId) return alert("System Error: Booking ID is missing!");

        const payload = { booking_id: bookingId, status: newStatus, rider_id: user.id };
        if (fare) payload.fare = fare; 

        try {
            const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}update_booking.php`, {
                method: 'POST', body: JSON.stringify(payload), headers: apiHeaders
            });
            const data = await res.json();

            if (data.status !== 'success') {
                return alert("Error saving fare: " + data.message);
            }

            if (newStatus === 'completed' || newStatus === 'cancelled') {
                setSelectedBookingForMap(null);
            }
            
            setAcceptingId(null);
            setAskingFare("");
            setEditingFareId(null);
            fetchBookings();
        } catch (error) {
            alert("Failed to connect to the server.");
        }
    };

    useEffect(() => {
        if (!user || user.account_status === undefined) {
            localStorage.removeItem('user'); 
            navigate('/login'); 
        }
    }, [navigate, user]);

    if (!user || user.account_status === undefined) return null;

    if (user.account_status === 'pending') {
        return (
            <div className="flex items-center justify-center h-[80vh] px-4">
                <div className="bg-white p-8 md:p-12 rounded-3xl shadow-lg max-w-lg w-full text-center border border-gray-100">
                    <div className="w-24 h-24 bg-orange-50 text-orange-500 rounded-full flex items-center justify-center mx-auto mb-6 text-5xl border-4 border-orange-100">
                        ⏳
                    </div>
                    <h2 className="text-2xl md:text-3xl font-extrabold text-brand-dark mb-4">Account Under Review</h2>
                    <p className="text-gray-500 font-medium mb-8 leading-relaxed">
                        Thank you for registering as a rider! Your submitted documents are currently being reviewed by our admin team. We will send you an email as soon as you are approved to start accepting rides.
                    </p>
                    <button 
                        onClick={() => {
                            localStorage.removeItem('user');
                            navigate('/login');
                        }} 
                        className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 font-extrabold py-4 rounded-xl transition shadow-sm"
                    >
                        Log Out for Now
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col lg:flex-row h-[80vh] gap-6 relative">
            
            {showProfile && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[9999] p-4 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white rounded-3xl p-6 md:p-8 max-w-sm w-full shadow-2xl relative">
                        <button onClick={() => setShowProfile(false)} className="absolute top-4 right-5 text-gray-400 hover:text-gray-800 text-2xl font-bold transition">✕</button>
                        
                        <div className="text-center mb-6">
                            <div className="w-20 h-20 bg-brand-light rounded-full flex items-center justify-center text-4xl mx-auto mb-3 border-4 border-white shadow-sm ring-2 ring-brand/20">👨‍🚀</div>
                            <h2 className="text-2xl font-extrabold text-brand-dark">{user.name}</h2>
                            <p className="text-sm font-bold text-gray-500 uppercase tracking-wider mt-1">{user.role}</p>
                        </div>

                        <div className="space-y-4">
                            <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Contact Information</p>
                                <p className="font-bold text-gray-800 flex items-center gap-2"><span className="text-lg">📧</span> {user.email}</p>
                                <p className="font-bold text-gray-800 flex items-center gap-2 mt-2"><span className="text-lg">📞</span> {user.contact_number}</p>
                            </div>
                            
                            <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Vehicle Details</p>
                                <p className="font-bold text-gray-800 flex items-center gap-2"><span className="text-lg">🛵</span> {user.motorcycle_model || 'Not Provided'}</p>
                                <p className="font-bold text-gray-800 flex items-center gap-2 mt-2 uppercase"><span className="text-lg">🏷️</span> {user.plate_number || 'Not Provided'}</p>
                            </div>

                            <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 flex justify-between items-center">
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Account Status</p>
                                <span className={`px-3 py-1 text-xs font-black uppercase tracking-wider rounded-lg ${user.account_status === 'pending' ? 'bg-orange-100 text-orange-800 border border-orange-200' : 'bg-green-100 text-green-800 border border-green-200'}`}>
                                    {user.account_status || 'Active'}
                                </span>
                            </div>
                        </div>

                        <button onClick={() => setShowProfile(false)} className="w-full mt-6 bg-brand hover:bg-brand-dark text-white font-extrabold py-3.5 rounded-xl transition shadow-md">
                            Close Profile
                        </button>
                    </div>
                </div>
            )}

            <div className="w-full lg:w-[450px] flex flex-col gap-4">
                
                <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-brand-light rounded-full flex items-center justify-center text-xl border-2 border-white shadow-sm">👨‍🚀</div>
                        <div>
                            <h3 className="font-extrabold text-brand-dark text-lg leading-tight">{user.name}</h3>
                            <button onClick={() => setShowProfile(true)} className="text-xs font-bold text-brand hover:underline mt-0.5 inline-block">View Full Profile</button>
                        </div>
                    </div>
                    <span className={`px-2 py-1 text-[10px] font-black uppercase tracking-wider rounded-md border ${user.account_status === 'pending' ? 'bg-orange-50 text-orange-700 border-orange-200' : 'bg-green-50 text-green-700 border-green-200'}`}>
                        {user.account_status || 'Active'}
                    </span>
                </div>

                <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex justify-between items-center">
                    <span className="font-extrabold text-brand-dark">Location Mode</span>
                    <div className="flex bg-gray-100 rounded-xl p-1">
                        <button onClick={() => { setIsAutoGps(true); setSelectedBookingForMap(null); }} className={`px-4 py-2 rounded-lg text-sm font-bold transition ${isAutoGps ? 'bg-white shadow text-brand' : 'text-gray-500 hover:text-gray-700'}`}>Auto GPS</button>
                        <button onClick={() => { setIsAutoGps(false); setSelectedBookingForMap(null); }} className={`px-4 py-2 rounded-lg text-sm font-bold transition ${!isAutoGps ? 'bg-white shadow text-brand' : 'text-gray-500 hover:text-gray-700'}`}>Manual Pin</button>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto space-y-4 pb-10">
                    {bookings.length === 0 ? (
                        <div className="bg-brand-light/50 p-8 rounded-3xl border-2 border-dashed border-gray-300 text-center flex flex-col items-center justify-center h-48 mt-4">
                            <span className="text-4xl mb-3 opacity-50">📡</span>
                            <p className="text-gray-500 font-bold">Waiting for passengers...</p>
                        </div>
                    ) : (
                        bookings.map(b => (
                            <div key={b.id || b.booking_id} className={`bg-white p-6 rounded-3xl shadow-sm border-l-4 transition-all duration-200 ${b.status === 'accepted' ? 'border-brand' : 'border-orange-400'} ${selectedBookingForMap?.booking_id === (b.id || b.booking_id) ? 'ring-2 ring-brand ring-offset-2' : ''}`}>
                                
                                <div className="flex justify-between items-start mb-4">
                                    <h4 className="font-extrabold text-xl text-brand-dark flex flex-col gap-1">
                                        {b.passenger_name}
                                        {b.rider_id === null && (
                                            <span className="bg-red-50 text-red-600 text-[10px] px-2 py-0.5 rounded uppercase tracking-wider font-black border border-red-200 w-max">
                                                🚨 Open Request
                                            </span>
                                        )}
                                    </h4>
                                    <span className={`px-3 py-1.5 rounded-lg text-xs font-extrabold uppercase tracking-wider ${b.status === 'accepted' ? 'bg-brand-light text-brand-dark' : 'bg-orange-100 text-orange-800'}`}>
                                        {b.status.replace('_', ' ')}
                                    </span>
                                </div>
                                
                                <a href={`tel:${b.passenger_contact}`} className="inline-flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-lg text-brand font-bold mb-4 hover:bg-gray-100 transition text-sm">
                                    📞 {b.passenger_contact || "No contact info"}
                                </a>

                                <div className="space-y-3 text-sm mb-5">
                                    <div className="flex gap-2 items-start">
                                        <span className="text-gray-400">📝</span>
                                        <p><strong className="text-gray-700">Remarks:</strong> <span className="text-gray-600">{b.remarks || "None"}</span></p>
                                    </div>
                                    <div className="flex gap-2 items-start">
                                        <span className="text-gray-400">🏁</span>
                                        <p><strong className="text-gray-700">Drop-off:</strong> <span className="text-gray-600">{b.dropoff_lat ? 'Pinned on map' : 'Pickup Only'}</span></p>
                                    </div>
                                    
                                    {b.fare && b.status !== 'pending' && (
                                        <div className="bg-green-50 p-3 rounded-xl border border-green-100 flex items-center justify-between mt-2">
                                            <div className="flex gap-2 items-center text-green-800">
                                                <span className="text-xl">💰</span>
                                                <p className="font-medium">
                                                    <strong>{b.status === 'rider_offered' ? "Your Offer:" : "Agreed Fare:"}</strong> ₱<span className="font-black text-lg">{b.fare}</span>
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                                
                                <div className="flex flex-col gap-3 border-t pt-4">
                                    <button onClick={() => setSelectedBookingForMap(b)} className="w-full bg-gray-100 hover:bg-gray-200 text-brand-dark font-extrabold py-3.5 rounded-xl transition">
                                        🗺️ View Map
                                    </button>

                                    {b.status === 'pending' ? (
                                        acceptingId === (b.id || b.booking_id) ? (
                                            <div className="bg-brand-light/50 p-4 rounded-xl border border-brand/20 animate-fade-in flex flex-col gap-3">
                                                <label className="text-xs font-bold text-brand-dark uppercase tracking-wide">Enter Fare Offer (₱)</label>
                                                <input 
                                                    type="number" placeholder="e.g. 50" value={askingFare} onChange={e => setAskingFare(e.target.value)}
                                                    className="w-full p-3 rounded-lg border border-brand/30 focus:outline-none focus:ring-2 focus:ring-brand font-bold text-lg"
                                                />
                                                <div className="flex gap-2 mt-1">
                                                    <button onClick={() => setAcceptingId(null)} className="flex-1 bg-white border border-gray-200 text-gray-600 font-bold py-2.5 rounded-lg hover:bg-gray-50">Cancel</button>
                                                    <button onClick={() => { if(!askingFare) return alert("Enter amount."); updateStatus((b.id || b.booking_id), 'rider_offered', askingFare); }} className="flex-1 bg-brand text-white font-bold py-2.5 rounded-lg hover:bg-brand-dark">
                                                        Send Offer
                                                    </button>
                                                </div>
                                            </div>
                                        ) : (
                                            <button onClick={() => { setAcceptingId(b.id || b.booking_id); setAskingFare(""); }} className={`w-full text-white font-extrabold py-3.5 rounded-xl transition shadow-sm ${b.rider_id === null ? 'bg-red-500 hover:bg-red-600' : 'bg-brand hover:bg-brand-dark'}`}>
                                                {b.rider_id === null ? "Claim & Make Offer" : "Make an Offer"}
                                            </button>
                                        )
                                    ) : b.status === 'rider_offered' ? (
                                        editingFareId === (b.id || b.booking_id) ? (
                                            <div className="bg-orange-50 p-4 rounded-xl border border-orange-100 flex flex-col gap-3 animate-fade-in">
                                                <label className="text-xs font-bold text-orange-800 uppercase tracking-wide">Update Offer (₱)</label>
                                                <input type="number" value={editFareValue} onChange={e => setEditFareValue(e.target.value)} className="w-full p-3 rounded-lg border-orange-200 focus:outline-none focus:ring-2 focus:ring-orange-500 font-bold text-lg" />
                                                <div className="flex gap-2">
                                                    <button onClick={() => setEditingFareId(null)} className="flex-1 bg-white border border-gray-200 text-gray-600 font-bold py-2.5 rounded-lg">Cancel</button>
                                                    <button onClick={() => { if(editFareValue) updateStatus((b.id || b.booking_id), 'rider_offered', editFareValue); }} className="flex-1 bg-orange-500 text-white font-bold py-2.5 rounded-lg hover:bg-orange-600">Update Fare</button>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="flex flex-col gap-2 text-center">
                                                <div className="bg-orange-50 text-orange-800 font-bold p-3 rounded-xl border border-orange-100 animate-pulse">
                                                    ⏳ Waiting for Passenger to accept ₱{b.fare}
                                                </div>
                                                <button onClick={() => { setEditFareValue(b.fare); setEditingFareId(b.id || b.booking_id); }} className="text-sm font-bold text-orange-600 hover:underline">
                                                    Negotiate / Update Fare
                                                </button>
                                                <button onClick={() => { if(window.confirm("Are you sure you want to withdraw this offer?")) updateStatus((b.id || b.booking_id), 'cancelled'); }} className="text-xs font-bold text-red-500 hover:underline mt-1">
                                                    Cancel Offer
                                                </button>
                                            </div>
                                        )
                                    ) : (
                                        <div className="flex gap-2">
                                            <button 
                                                onClick={() => {
                                                    if(window.confirm("Cancel this ride? Do this only if you cannot contact the passenger.")) {
                                                        updateStatus((b.id || b.booking_id), 'cancelled');
                                                    }
                                                }} 
                                                className="flex-1 bg-red-50 hover:bg-red-100 text-red-600 font-bold py-3.5 rounded-xl transition"
                                            >
                                                Cancel Ride
                                            </button>
                                            <button 
                                                onClick={() => updateStatus((b.id || b.booking_id), 'completed')} 
                                                className="flex-[2] bg-brand-dark hover:bg-black text-white font-extrabold py-3.5 rounded-xl transition shadow-sm"
                                            >
                                                Finish Ride
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            <div className="w-full lg:flex-1 bg-gray-200 rounded-3xl overflow-hidden shadow-sm relative border border-gray-200 min-h-[50vh] lg:min-h-0">
                <MapLegend role="rider" />
                
                {selectedBookingForMap ? (
                    <>
                        <button onClick={() => setSelectedBookingForMap(null)} className="absolute top-4 right-4 z-[1000] bg-white text-gray-800 font-bold px-4 py-2 rounded-xl shadow-md hover:bg-gray-100 border border-gray-100 transition">
                            ✕ Close Map
                        </button>
                        <MapContainer center={[selectedBookingForMap.pickup_lat, selectedBookingForMap.pickup_lng]} zoom={14} className="h-full w-full z-0">
                            <TileLayer url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png" />
                            <Marker position={[currentLocation.lat, currentLocation.lng]} icon={liveRiderIcon} />
                            <Marker position={[selectedBookingForMap.pickup_lat, selectedBookingForMap.pickup_lng]} icon={pickupIcon} />
                            {selectedBookingForMap.dropoff_lat && <Marker position={[selectedBookingForMap.dropoff_lat, selectedBookingForMap.dropoff_lng]} icon={dropoffIcon} />}
                            <Polyline positions={[[currentLocation.lat, currentLocation.lng], [selectedBookingForMap.pickup_lat, selectedBookingForMap.pickup_lng], selectedBookingForMap.dropoff_lat ? [selectedBookingForMap.dropoff_lat, selectedBookingForMap.dropoff_lng] : null].filter(Boolean)} color="#1F6F5F" dashArray="8, 8" weight={4} />
                        </MapContainer>
                    </>
                ) : !isAutoGps ? (
                    <>
                        <div className="absolute top-6 left-1/2 transform -translate-x-1/2 z-[1000] bg-brand-dark text-white px-6 py-3 rounded-2xl shadow-lg font-bold text-sm">
                            Tap map to drop manual pin
                        </div>
                        <MapContainer center={currentLocation.lat ? [currentLocation.lat, currentLocation.lng] : [11.1965, 123.7745]} zoom={15} className="h-full w-full z-0">
                            <TileLayer url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png" />
                            <LocationMarker position={currentLocation} setPosition={setCurrentLocation} sendLocationToDatabase={sendLocationToDatabase} />
                        </MapContainer>
                    </>
                ) : (
                    <MapContainer center={currentLocation.lat ? [currentLocation.lat, currentLocation.lng] : [11.1965, 123.7745]} zoom={15} className="h-full w-full z-0">
                        <TileLayer url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png" />
                        <AutoPan position={currentLocation} />
                        
                        {currentLocation.lat && (
                            <Marker position={[currentLocation.lat, currentLocation.lng]} icon={liveRiderIcon}>
                                <Popup className="rounded-xl overflow-hidden shadow-xl border-0 p-0 m-0">
                                    <div className="p-4 text-center bg-white min-w-[160px]">
                                        <div className="text-2xl mb-1">📍</div>
                                        <strong className="block text-brand-dark font-extrabold text-sm mb-1">You are here</strong>
                                        <span className="text-[10px] text-green-600 font-black uppercase tracking-wider bg-green-50 px-2 py-1 rounded-md">
                                            Auto GPS Active
                                        </span>
                                    </div>
                                </Popup>
                            </Marker>
                        )}
                    </MapContainer>
                )}
            </div>
        </div>
    );
};

export default RiderDashboard;