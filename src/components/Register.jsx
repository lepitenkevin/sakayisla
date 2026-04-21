import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

const Register = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: '', email: '', contact_number: '', password: '', role: 'passenger', motorcycle_model: '', plate_number: ''
    });
    
    // --- NEW: State to hold uploaded files ---
    const [files, setFiles] = useState({ license_image: null, or_image: null, cr_image: null });
    
    const [statusMsg, setStatusMsg] = useState({ type: '', text: '' });
    const [isLoading, setIsLoading] = useState(false);

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
    
    const handleFileChange = (e) => {
        setFiles({ ...files, [e.target.name]: e.target.files[0] });
    };

    const handlePhoneChange = (e) => {
        const onlyNumbers = e.target.value.replace(/\D/g, '');
        if (onlyNumbers.length <= 10) setFormData({ ...formData, contact_number: onlyNumbers });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setStatusMsg({ type: '', text: '' });

        if (formData.contact_number.length !== 10) {
            setStatusMsg({ type: 'error', text: 'Mobile number must be exactly 10 digits (e.g. 915 518 1798).' });
            setIsLoading(false);
            return;
        }
        
        if (formData.role === 'rider') {
            if (!files.license_image || !files.or_image || !files.cr_image) {
                setStatusMsg({ type: 'error', text: 'Please upload all required documents (License, OR, and CR).' });
                setIsLoading(false);
                return;
            }
        }

        // --- NEW: Switch from JSON to FormData to support Image Uploads ---
        const submitData = new FormData();
        submitData.append('name', formData.name);
        submitData.append('email', formData.email);
        submitData.append('contact_number', `+63${formData.contact_number}`);
        submitData.append('password', formData.password);
        submitData.append('role', formData.role);

        if (formData.role === 'rider') {
            submitData.append('motorcycle_model', formData.motorcycle_model);
            submitData.append('plate_number', formData.plate_number);
            submitData.append('license_image', files.license_image);
            submitData.append('or_image', files.or_image);
            submitData.append('cr_image', files.cr_image);
        }

        try {
            const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}register.php`, {
                method: 'POST', 
                body: submitData, // Sending the raw FormData
                headers: { 
                    // Note: When using FormData, NEVER set 'Content-Type' manually. The browser does it automatically!
                    'x-api-key': import.meta.env.VITE_API_ACCESS_KEY, 
                    'x-api-secret': import.meta.env.VITE_API_SECRET_KEY 
                }
            });
            const data = await res.json();
            
            if (data.status === 'success') {
                setStatusMsg({ type: 'success', text: data.message + ' Redirecting...' });
                setTimeout(() => navigate('/login'), 2500);
            } else {
                setStatusMsg({ type: 'error', text: data.message || 'Registration failed.' });
            }
        } catch (err) {
            setStatusMsg({ type: 'error', text: 'Failed to connect to the server.' });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center my-10 px-4">
            <div className="bg-white p-8 rounded-3xl shadow-lg w-full max-w-lg border border-gray-100">
                
                <div className="text-center mb-8">
                    <h2 className="text-3xl font-extrabold text-brand-dark mb-2">Join SakayIsla</h2>
                    <p className="text-gray-500 text-sm">Create an account to get started.</p>
                </div>

                {statusMsg.text && (
                    <div className={`p-4 rounded-xl mb-6 text-sm font-bold text-center ${statusMsg.type === 'success' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                        {statusMsg.text}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                    
                    <div className="bg-gray-100 p-1.5 rounded-2xl flex mb-2">
                        <button 
                            type="button" 
                            onClick={() => setFormData({...formData, role: 'passenger'})}
                            className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all ${formData.role === 'passenger' ? 'bg-white shadow text-brand-dark' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            🚶‍♂️ Passenger
                        </button>
                        
                        <button 
                            type="button" 
                            onClick={() => setFormData({...formData, role: 'rider'})}
                            className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all ${formData.role === 'rider' ? 'bg-white shadow text-brand-dark' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            🛵 Rider
                        </button>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1.5">Full Name</label>
                        <input type="text" name="name" placeholder="Juan Dela Cruz" required onChange={handleChange} 
                               className="w-full p-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand transition" />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1.5">Email Address</label>
                            <input type="email" name="email" placeholder="juan@example.com" required onChange={handleChange} 
                                   className="w-full p-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand transition" />
                        </div>
                        
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1.5">Mobile Number</label>
                            <div className="flex items-center bg-gray-50 border border-gray-200 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-brand transition">
                                <div className="px-3.5 py-3.5 bg-gray-100 border-r border-gray-200 text-gray-600 font-extrabold select-none">
                                    +63
                                </div>
                                <input 
                                    type="tel" name="contact_number" placeholder="915 518 1798" required 
                                    value={formData.contact_number} onChange={handlePhoneChange} 
                                    className="w-full p-3.5 bg-transparent border-none focus:outline-none focus:ring-0 font-medium tracking-wide" 
                                />
                            </div>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1.5">Password</label>
                        <input type="password" name="password" placeholder="Create a strong password" required onChange={handleChange} 
                               className="w-full p-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand transition" />
                    </div>

                    {/* --- UPGRADED RIDER FIELDS (DOCUMENTS & PHOTOS) --- */}
                    {formData.role === 'rider' && (
                        <div className="bg-brand-light/30 p-5 rounded-2xl border border-brand/20 mt-2 space-y-5 animate-fade-in">
                            <h3 className="font-extrabold text-brand-dark text-sm uppercase tracking-wider flex items-center justify-between">
                                <span>Vehicle & Documents</span>
                                <span className="text-[10px] bg-orange-100 text-orange-800 px-2 py-1 rounded-md">Pending Approval</span>
                            </h3>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1.5">Motorcycle Model</label>
                                    <input type="text" name="motorcycle_model" placeholder="e.g., Honda Click 125i" required onChange={handleChange} 
                                           className="w-full p-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand transition" />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1.5">Plate Number</label>
                                    <input type="text" name="plate_number" placeholder="ABC 1234" required onChange={handleChange} 
                                           className="w-full p-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand transition uppercase" />
                                </div>
                            </div>

                            <div className="space-y-4 pt-2 border-t border-brand/10">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1.5">Driver's License Photo</label>
                                    <input type="file" name="license_image" accept="image/*" capture="environment" required onChange={handleFileChange}
                                           className="w-full text-sm text-gray-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-bold file:bg-brand file:text-white hover:file:bg-brand-dark transition cursor-pointer" />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1.5">Official Receipt (OR) Photo</label>
                                    <input type="file" name="or_image" accept="image/*" capture="environment" required onChange={handleFileChange}
                                           className="w-full text-sm text-gray-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-bold file:bg-brand file:text-white hover:file:bg-brand-dark transition cursor-pointer" />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1.5">Certificate of Registration (CR)</label>
                                    <input type="file" name="cr_image" accept="image/*" capture="environment" required onChange={handleFileChange}
                                           className="w-full text-sm text-gray-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-bold file:bg-brand file:text-white hover:file:bg-brand-dark transition cursor-pointer" />
                                </div>
                            </div>
                            <p className="text-xs text-gray-500 font-medium italic mt-2">
                                Note: You can tap "Choose File" on mobile to open your camera and take a picture directly.
                            </p>
                        </div>
                    )}

                    <button 
                        type="submit" 
                        disabled={isLoading}
                        className={`w-full text-white font-extrabold py-4 rounded-xl mt-4 shadow-md transition duration-200 ${isLoading ? 'bg-gray-400 cursor-not-allowed' : 'bg-brand hover:bg-brand-dark'}`}
                    >
                        {isLoading ? 'Processing Registration...' : 'Create Account'}
                    </button>
                </form>

                <p className="text-center mt-8 text-sm text-gray-500">
                    Already have an account? <Link to="/login" className="text-brand font-bold hover:underline">Log in</Link>
                </p>
            </div>
        </div>
    );
};

export default Register;