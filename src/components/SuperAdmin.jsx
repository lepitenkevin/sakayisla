import React, { useState, useEffect } from 'react';

const SuperAdmin = () => {
    const [activeTab, setActiveTab] = useState('users');
    
    const [users, setUsers] = useState([]);
    const [editingUser, setEditingUser] = useState(null);
    
    const [editFiles, setEditFiles] = useState({ license_image: null, license_back_image: null, or_image: null, cr_image: null });
    
    const [viewingUser, setViewingUser] = useState(null); 
    
    const [roleFilter, setRoleFilter] = useState('rider'); 
    const [riderStatusFilter, setRiderStatusFilter] = useState('pending'); 
    
    const [searchQuery, setSearchQuery] = useState('');
    const [sortOption, setSortOption] = useState('name-asc'); 

    const [bookings, setBookings] = useState([]);

    const apiHeaders = {
        'Content-Type': 'application/json',
        'x-api-key': import.meta.env.VITE_API_ACCESS_KEY,
        'x-api-secret': import.meta.env.VITE_API_SECRET_KEY
    };

    const fetchUsers = () => {
        fetch(`${import.meta.env.VITE_API_BASE_URL}admin_users.php`, { headers: apiHeaders })
            .then(res => res.json())
            .then(data => { if (data.status === 'success') setUsers(data.data); })
            .catch(err => console.error("Error fetching users:", err));
    };

    const fetchBookings = () => {
        fetch(`${import.meta.env.VITE_API_BASE_URL}admin_bookings.php`, { headers: apiHeaders })
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

    const openEditModal = (user) => {
        setEditingUser(user);
        setEditFiles({ license_image: null, license_back_image: null, or_image: null, cr_image: null });
    };

    const handleUpdateUser = async (e) => {
        e.preventDefault();

        const formData = new FormData();
        formData.append('_method', 'PUT'); 
        formData.append('id', editingUser.id);
        formData.append('name', editingUser.name);
        formData.append('email', editingUser.email);
        formData.append('contact_number', editingUser.contact_number);
        formData.append('role', editingUser.role);

        if (editingUser.role === 'rider') {
            formData.append('motorcycle_model', editingUser.motorcycle_model || '');
            formData.append('plate_number', editingUser.plate_number || '');
            if (editFiles.license_image) formData.append('license_image', editFiles.license_image);
            if (editFiles.license_back_image) formData.append('license_back_image', editFiles.license_back_image);
            if (editFiles.or_image) formData.append('or_image', editFiles.or_image);
            if (editFiles.cr_image) formData.append('cr_image', editFiles.cr_image);
        }

        try {
            const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}admin_users.php`, { 
                method: 'POST', 
                body: formData,
                headers: { 
                    'x-api-key': import.meta.env.VITE_API_ACCESS_KEY,
                    'x-api-secret': import.meta.env.VITE_API_SECRET_KEY
                }
            });
            
            const data = await res.json();
            
            if (data.status !== 'success') {
                alert("Error saving updates: " + data.message);
                return; 
            }
            
            setEditingUser(null);
            fetchUsers();
        } catch (error) {
            alert("Failed to connect to the server.");
        }
    };

    const handleApproveRider = async (id) => {
        if (window.confirm("Approve this rider's documents? They will now be able to accept rides.")) {
            await fetch(`${import.meta.env.VITE_API_BASE_URL}admin_users.php`, { 
                method: 'PUT', 
                body: JSON.stringify({ id, account_status: 'approved' }),
                headers: apiHeaders
            });
            setViewingUser(null);
            fetchUsers();
        }
    };

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

    const processedUsers = users
        .filter(user => user.role === roleFilter)
        .filter(user => {
            if (roleFilter === 'rider') {
                const status = user.account_status || 'approved'; 
                return status === riderStatusFilter;
            }
            return true; 
        })
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
                
                <div className="flex bg-gray-100 p-1 rounded-xl">
                    <button onClick={() => setActiveTab('users')} className={`px-6 py-2 rounded-lg font-bold transition ${activeTab === 'users' ? 'bg-white shadow text-brand-dark' : 'text-gray-500'}`}>Users</button>
                    <button onClick={() => setActiveTab('bookings')} className={`px-6 py-2 rounded-lg font-bold transition ${activeTab === 'bookings' ? 'bg-white shadow text-brand-dark' : 'text-gray-500'}`}>Active Bookings</button>
                </div>
            </div>

            {/* TAB: USERS */}
            {activeTab === 'users' && (
                <div>
                    <div className="flex flex-col lg:flex-row justify-between gap-4 mb-6">
                        
                        <div className="flex flex-col gap-3">
                            <div className="flex gap-2 overflow-x-auto pb-2 lg:pb-0">
                                <button onClick={() => setRoleFilter('rider')} className={`px-5 py-2 rounded-full text-sm font-bold transition whitespace-nowrap ${roleFilter === 'rider' ? 'bg-brand text-white shadow-md' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'}`}>🛵 Riders</button>
                                <button onClick={() => setRoleFilter('passenger')} className={`px-5 py-2 rounded-full text-sm font-bold transition whitespace-nowrap ${roleFilter === 'passenger' ? 'bg-brand text-white shadow-md' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'}`}>🚶‍♂️ Passengers</button>
                            </div>

                            {roleFilter === 'rider' && (
                                <div className="flex gap-2 border-l-2 border-brand pl-3 ml-2">
                                    <button onClick={() => setRiderStatusFilter('pending')} className={`px-4 py-1.5 rounded-lg text-xs font-extrabold uppercase tracking-wider transition ${riderStatusFilter === 'pending' ? 'bg-orange-100 text-orange-800 border border-orange-200' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}>
                                        Pending Review
                                    </button>
                                    <button onClick={() => setRiderStatusFilter('approved')} className={`px-4 py-1.5 rounded-lg text-xs font-extrabold uppercase tracking-wider transition ${riderStatusFilter === 'approved' ? 'bg-green-100 text-green-800 border border-green-200' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}>
                                        Approved Active
                                    </button>
                                </div>
                            )}
                        </div>

                        <div className="flex flex-col sm:flex-row gap-3 items-start lg:items-center">
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
                                                <button onClick={() => setViewingUser(user)} className="text-brand-dark font-extrabold mr-4 hover:underline">
                                                    {user.role === 'rider' && user.account_status === 'pending' ? '🚨 Review Docs' : 'View'}
                                                </button>
                                                
                                                <button onClick={() => openEditModal(user)} className="text-brand font-bold mr-4 hover:underline">Edit</button>
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
                            
                            {/* --- FIX: Added timeZone: 'Asia/Manila' to lock it to Philippines Time --- */}
                            <p className="text-sm text-gray-500 font-medium mb-3 flex items-center gap-2">
                                📅 {b.created_at ? new Date(b.created_at).toLocaleString('en-PH', { timeZone: 'Asia/Manila', dateStyle: 'medium', timeStyle: 'short' }) : 'Unknown Date'}
                            </p>

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

            {/* SINGLE VIEW / REVIEW MODAL */}
            {viewingUser && (
                <div className="fixed inset-0 bg-black/70 flex items-start justify-center z-[100] p-4 overflow-y-auto backdrop-blur-sm">
                    <div className="bg-white rounded-3xl shadow-2xl max-w-3xl w-full my-8 overflow-hidden animate-fade-in">
                        
                        <div className="bg-brand-dark p-6 flex justify-between items-center text-white">
                            <div>
                                <h3 className="text-2xl font-extrabold">{viewingUser.name}</h3>
                                <p className="text-brand-light font-medium">{viewingUser.role.toUpperCase()} PROFILE</p>
                            </div>
                            <button onClick={() => setViewingUser(null)} className="text-white hover:text-gray-300 font-bold text-xl">✕</button>
                        </div>

                        <div className="p-6 md:p-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                                <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Email</p>
                                    <p className="font-extrabold text-gray-800">{viewingUser.email}</p>
                                </div>
                                <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Contact</p>
                                    <p className="font-extrabold text-gray-800">{viewingUser.contact_number}</p>
                                </div>
                            </div>

                            {viewingUser.role === 'rider' && (
                                <div className="border-t border-gray-200 pt-8">
                                    <h4 className="text-xl font-extrabold text-gray-800 mb-6">Vehicle & Documents</h4>
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                        <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                                            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Motorcycle</p>
                                            <p className="font-extrabold text-gray-800">{viewingUser.motorcycle_model || 'N/A'}</p>
                                        </div>
                                        <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                                            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Plate Number</p>
                                            <p className="font-extrabold text-gray-800 uppercase">{viewingUser.plate_number || 'N/A'}</p>
                                        </div>
                                    </div>

                                    <div className="space-y-6">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <p className="text-sm font-bold text-gray-700 mb-2">Driver's License (Front)</p>
                                                {viewingUser.license_image ? (
                                                    <img src={`${import.meta.env.VITE_API_BASE_URL}${viewingUser.license_image}`} alt="License Front" className="w-full h-auto max-h-[300px] object-contain rounded-xl border-2 border-gray-200 bg-gray-50" />
                                                ) : <p className="text-gray-400 italic">No image uploaded</p>}
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-gray-700 mb-2">Driver's License (Back)</p>
                                                {viewingUser.license_back_image ? (
                                                    <img src={`${import.meta.env.VITE_API_BASE_URL}${viewingUser.license_back_image}`} alt="License Back" className="w-full h-auto max-h-[300px] object-contain rounded-xl border-2 border-gray-200 bg-gray-50" />
                                                ) : <p className="text-gray-400 italic">No image uploaded</p>}
                                            </div>
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-gray-700 mb-2">Official Receipt (OR)</p>
                                            {viewingUser.or_image ? (
                                                <img src={`${import.meta.env.VITE_API_BASE_URL}${viewingUser.or_image}`} alt="OR" className="w-full h-auto max-h-[400px] object-contain rounded-xl border-2 border-gray-200 bg-gray-50" />
                                            ) : <p className="text-gray-400 italic">No image uploaded</p>}
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-gray-700 mb-2">Certificate of Registration (CR)</p>
                                            {viewingUser.cr_image ? (
                                                <img src={`${import.meta.env.VITE_API_BASE_URL}${viewingUser.cr_image}`} alt="CR" className="w-full h-auto max-h-[400px] object-contain rounded-xl border-2 border-gray-200 bg-gray-50" />
                                            ) : <p className="text-gray-400 italic">No image uploaded</p>}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="bg-gray-50 p-6 flex justify-end gap-3 border-t border-gray-200">
                            <button onClick={() => setViewingUser(null)} className="px-6 py-3 bg-white border border-gray-200 hover:bg-gray-100 text-gray-800 font-bold rounded-xl transition">
                                Close
                            </button>
                            
                            {viewingUser.role === 'rider' && viewingUser.account_status === 'pending' && (
                                <button onClick={() => handleApproveRider(viewingUser.id)} className="px-8 py-3 bg-brand hover:bg-brand-dark text-white font-extrabold rounded-xl shadow-md transition">
                                    Approve Rider
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* EDIT USER MODAL */}
            {editingUser && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[110] p-4 overflow-y-auto">
                    <div className="bg-white p-8 rounded-3xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
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

                            {editingUser.role === 'rider' && (
                                <div className="border-t border-gray-200 mt-2 pt-4 space-y-4">
                                    <h4 className="font-extrabold text-brand-dark uppercase tracking-wide text-xs">Rider Documents</h4>
                                    <div>
                                        <label className="text-sm font-bold text-gray-700">Motorcycle Model</label>
                                        <input type="text" value={editingUser.motorcycle_model || ''} onChange={e => setEditingUser({...editingUser, motorcycle_model: e.target.value})} className="w-full p-3 border rounded-xl mt-1" />
                                    </div>
                                    <div>
                                        <label className="text-sm font-bold text-gray-700">Plate Number</label>
                                        <input type="text" value={editingUser.plate_number || ''} onChange={e => setEditingUser({...editingUser, plate_number: e.target.value})} className="w-full p-3 border rounded-xl mt-1 uppercase" />
                                    </div>
                                    
                                    <div>
                                        <label className="text-xs font-bold text-gray-500 block mb-1">Update Driver's License (Front)</label>
                                        <input type="file" onChange={e => setEditFiles({...editFiles, license_image: e.target.files[0]})} className="text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:bg-brand-light file:text-brand-dark file:font-bold w-full" accept="image/*" />
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-gray-500 block mb-1">Update Driver's License (Back)</label>
                                        <input type="file" onChange={e => setEditFiles({...editFiles, license_back_image: e.target.files[0]})} className="text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:bg-brand-light file:text-brand-dark file:font-bold w-full" accept="image/*" />
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-gray-500 block mb-1">Update Official Receipt (OR)</label>
                                        <input type="file" onChange={e => setEditFiles({...editFiles, or_image: e.target.files[0]})} className="text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:bg-brand-light file:text-brand-dark file:font-bold w-full" accept="image/*" />
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-gray-500 block mb-1">Update Certificate of Reg. (CR)</label>
                                        <input type="file" onChange={e => setEditFiles({...editFiles, cr_image: e.target.files[0]})} className="text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:bg-brand-light file:text-brand-dark file:font-bold w-full" accept="image/*" />
                                    </div>
                                </div>
                            )}

                            <div className="flex gap-2 mt-4 border-t border-gray-100 pt-4">
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