import React, { useState, useEffect } from 'react';

const SuperAdmin = () => {
    const [activeTab, setActiveTab] = useState('users');
    
    // Users State
    const [users, setUsers] = useState([]);
    const [editingUser, setEditingUser] = useState(null);
    
    // Advanced Filters & Sorting
    const [roleFilter, setRoleFilter] = useState('rider'); 
    const [searchQuery, setSearchQuery] = useState('');
    const [sortOption, setSortOption] = useState('name-asc'); 

    // Bookings State
    const [bookings, setBookings] = useState([]);

    // --- HELPER FOR HEADERS ---
    const apiHeaders = {
        'Content-Type': 'application/json',
        'x-api-key': import.meta.env.VITE_API_ACCESS_KEY,
        'x-api-secret': import.meta.env.VITE_API_SECRET_KEY
    };

    const fetchUsers = () => {
        fetch(`${import.meta.env.VITE_API_BASE_URL}admin_users.php`, {
            headers: { 
                'x-api-key': import.meta.env.VITE_API_ACCESS_KEY, 
                'x-api-secret': import.meta.env.VITE_API_SECRET_KEY 
            }
        })
            .then(res => res.json())
            .then(data => { if (data.status === 'success') setUsers(data.data); })
            .catch(err => console.error("Error fetching users:", err));
    };

    const fetchBookings = () => {
        fetch(`${import.meta.env.VITE_API_BASE_URL}admin_bookings.php`, {
            headers: { 
                'x-api-key': import.meta.env.VITE_API_ACCESS_KEY, 
                'x-api-secret': import.meta.env.VITE_API_SECRET_KEY 
            }
        })
            .then(res => res.json())
            .then(data => { if (data.status === 'success') setBookings(data.data); })
            .catch(err => console.error("Error fetching bookings:", err));
    };

    useEffect(() => { 
        fetchUsers(); 
        fetchBookings();
        const interval = setInterval(() => { fetchUsers(); fetchBookings(); }, 5000); 
        return () => clearInterval(interval);
    }, []);

    // --- USERS CRUD ---
    const handleDeleteUser = async (id) => {
        if (window.confirm("Permanently delete this user?")) {
            await fetch(`${import.meta.env.VITE_API_BASE_URL}admin_users.php`, { 
                method: 'DELETE', 
                body: JSON.stringify({ id }),
                headers: apiHeaders
            });
            fetchUsers();
        }
    };

    const handleUpdateUser = async (e) => {
        e.preventDefault();
        await fetch(`${import.meta.env.VITE_API_BASE_URL}admin_users.php`, { 
            method: 'PUT', 
            body: JSON.stringify(editingUser),
            headers: apiHeaders
        });
        setEditingUser(null);
        fetchUsers();
    };

    // --- BOOKINGS CRUD ---
    const handleUpdateBooking = async (id, newStatus) => {
        await fetch(`${import.meta.env.VITE_API_BASE_URL}admin_bookings.php`, { 
            method: 'PUT', 
            body: JSON.stringify({ id, status: newStatus }),
            headers: apiHeaders
        });
        fetchBookings();
    };

    const handleDeleteBooking = async (id) => {
        if (window.confirm("Permanently delete this booking record?")) {
            await fetch(`${import.meta.env.VITE_API_BASE_URL}admin_bookings.php`, { 
                method: 'DELETE', 
                body: JSON.stringify({ id }),
                headers: apiHeaders
            });
            fetchBookings();
        }
    };

    // --- FILTER & SORT LOGIC ---
    const processedUsers = users
        .filter(user => user.role === roleFilter)
        .filter(user => {
            if (!searchQuery) return true;
            const lowerQuery = searchQuery.toLowerCase();
            return user.name.toLowerCase().includes(lowerQuery) || user.email.toLowerCase().includes(lowerQuery);
        })
        .sort((a, b) => {
            if (sortOption === 'name-asc') return a.name.localeCompare(b.name);
            if (sortOption === 'name-desc') return b.name.localeCompare(a.name);
            if (sortOption === 'online') return Number(b.is_online) - Number(a.is_online);
            return 0;
        });

    return (
        <div className="max-w-7xl mx-auto py-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
                <div>
                    <h2 className="text-3xl font-extrabold text-brand-dark">Super Admin</h2>
                    <p className="text-gray-500 font-medium">Manage SakayIsla ecosystem.</p>
                </div>
                
                {/* Main Tabs */}
                <div className="flex bg-gray-100 p-1 rounded-xl">
                    <button onClick={() => setActiveTab('users')} className={`px-6 py-2 rounded-lg font-bold transition ${activeTab === 'users' ? 'bg-white shadow text-brand-dark' : 'text-gray-500'}`}>Users</button>
                    <button onClick={() => setActiveTab('bookings')} className={`px-6 py-2 rounded-lg font-bold transition ${activeTab === 'bookings' ? 'bg-white shadow text-brand-dark' : 'text-gray-500'}`}>Active Bookings</button>
                </div>
            </div>

            {/* TAB: USERS */}
            {activeTab === 'users' && (
                <div>
                    <div className="flex flex-col lg:flex-row justify-between gap-4 mb-6">
                        <div className="flex gap-2 overflow-x-auto pb-2 lg:pb-0">
                            <button onClick={() => setRoleFilter('rider')} className={`px-5 py-2 rounded-full text-sm font-bold transition whitespace-nowrap ${roleFilter === 'rider' ? 'bg-brand text-white shadow-md' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'}`}>🛵 Riders</button>
                            <button onClick={() => setRoleFilter('passenger')} className={`px-5 py-2 rounded-full text-sm font-bold transition whitespace-nowrap ${roleFilter === 'passenger' ? 'bg-brand text-white shadow-md' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'}`}>🚶‍♂️ Passengers</button>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-3">
                            <input 
                                type="text" 
                                placeholder="Search name or email..." 
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand text-sm min-w-[250px]"
                            />
                            <select 
                                value={sortOption} 
                                onChange={(e) => setSortOption(e.target.value)}
                                className="px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand text-sm bg-white cursor-pointer"
                            >
                                <option value="name-asc">Sort: Name (A-Z)</option>
                                <option value="name-desc">Sort: Name (Z-A)</option>
                                <option value="online">Sort: Online First</option>
                            </select>
                        </div>
                    </div>

                    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-extrabold text-gray-500 uppercase">Status</th>
                                    <th className="px-6 py-4 text-left text-xs font-extrabold text-gray-500 uppercase">Name & Contact</th>
                                    <th className="px-6 py-4 text-left text-xs font-extrabold text-gray-500 uppercase">Role</th>
                                    <th className="px-6 py-4 text-right text-xs font-extrabold text-gray-500 uppercase">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {processedUsers.length === 0 ? (
                                    <tr>
                                        <td colSpan="4" className="px-6 py-10 text-center text-gray-500 font-medium">
                                            {searchQuery ? "No users match your search." : `No ${roleFilter}s found.`}
                                        </td>
                                    </tr>
                                ) : (
                                    processedUsers.map(user => (
                                        <tr key={user.id} className="hover:bg-gray-50 transition">
                                            <td className="px-6 py-4">
                                                <span className={`flex items-center gap-2 text-sm font-bold ${Number(user.is_online) === 1 ? 'text-green-600' : 'text-gray-400'}`}>
                                                    <span className={`w-2.5 h-2.5 rounded-full ${Number(user.is_online) === 1 ? 'bg-green-500 animate-pulse' : 'bg-gray-300'}`}></span>
                                                    {Number(user.is_online) === 1 ? 'Online' : 'Offline'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="font-extrabold text-gray-900">{user.name}</div>
                                                <div className="text-sm text-gray-500">{user.email} • {user.contact_number}</div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-3 py-1 text-xs font-extrabold rounded-lg uppercase ${
                                                    user.role === 'rider' ? 'bg-orange-100 text-orange-800' : 'bg-blue-100 text-blue-800'
                                                }`}>
                                                    {user.role}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <button onClick={() => setEditingUser(user)} className="text-brand font-bold mr-4 hover:underline">Edit</button>
                                                {user.role !== 'superadmin' && (
                                                    <button onClick={() => handleDeleteUser(user.id)} className="text-red-600 font-bold hover:underline">Delete</button>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* TAB: BOOKINGS */}
            {activeTab === 'bookings' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {bookings.length === 0 ? <p className="text-gray-500 font-medium">No bookings found.</p> : bookings.map(b => (
                        <div key={b.id} className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                            <div className="flex justify-between items-center mb-4">
                                <span className="font-extrabold text-gray-500">Ride #{b.id}</span>
                                <span className="px-3 py-1 bg-orange-100 text-orange-800 text-xs font-extrabold rounded-lg uppercase">{b.status}</span>
                            </div>
                            <p><strong>Passenger:</strong> {b.passenger_name}</p>
                            <p><strong>Rider:</strong> {b.rider_name || 'Unassigned'}</p>
                            <p className="text-sm text-gray-500 mt-2 bg-gray-50 p-2 rounded">Remarks: {b.remarks || 'None'}</p>
                            
                            <div className="flex gap-2 mt-4 border-t pt-4">
                                <button onClick={() => handleUpdateBooking(b.id, 'cancelled')} className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold py-2 rounded-xl transition">Cancel Ride</button>
                                <button onClick={() => handleDeleteBooking(b.id)} className="flex-1 bg-red-50 hover:bg-red-100 text-red-600 font-bold py-2 rounded-xl transition">Delete</button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* EDIT USER MODAL */}
            {editingUser && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white p-8 rounded-3xl shadow-xl max-w-md w-full">
                        <h3 className="text-2xl font-extrabold mb-4">Edit Profile</h3>
                        <form onSubmit={handleUpdateUser} className="flex flex-col gap-4">
                            <div>
                                <label className="text-sm font-bold text-gray-700">Name</label>
                                <input type="text" value={editingUser.name} onChange={e => setEditingUser({...editingUser, name: e.target.value})} className="w-full p-3 border rounded-xl mt-1" required />
                            </div>
                            <div>
                                <label className="text-sm font-bold text-gray-700">Email</label>
                                <input type="email" value={editingUser.email} onChange={e => setEditingUser({...editingUser, email: e.target.value})} className="w-full p-3 border rounded-xl mt-1" required />
                            </div>
                            <div>
                                <label className="text-sm font-bold text-gray-700">Contact Number</label>
                                <input type="text" value={editingUser.contact_number} onChange={e => setEditingUser({...editingUser, contact_number: e.target.value})} className="w-full p-3 border rounded-xl mt-1" required />
                            </div>
                            <div>
                                <label className="text-sm font-bold text-gray-700">Role</label>
                                <select value={editingUser.role} onChange={e => setEditingUser({...editingUser, role: e.target.value})} className="w-full p-3 border rounded-xl mt-1">
                                    <option value="passenger">Passenger</option>
                                    <option value="rider">Rider</option>
                                    <option value="superadmin">Superadmin</option>
                                </select>
                            </div>
                            <div className="flex gap-2 mt-6">
                                <button type="button" onClick={() => setEditingUser(null)} className="flex-1 p-3 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold rounded-xl transition">Cancel</button>
                                <button type="submit" className="flex-1 p-3 bg-brand hover:bg-brand-dark text-white font-bold rounded-xl transition">Save Changes</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SuperAdmin;