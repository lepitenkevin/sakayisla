import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

const Register = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: '', email: '', contact_number: '', password: '', role: 'passenger', motorcycle_model: '', plate_number: ''
    });
    const [statusMsg, setStatusMsg] = useState({ type: '', text: '' });
    const [isLoading, setIsLoading] = useState(false);

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    // --- Strict Mobile Number Formatter ---
    const handlePhoneChange = (e) => {
        // Strip out any non-numeric characters (letters, spaces, symbols)
        const onlyNumbers = e.target.value.replace(/\D/g, '');
        // Limit to exactly 10 digits (since +63 is handled separately)
        if (onlyNumbers.length <= 10) {
            setFormData({ ...formData, contact_number: onlyNumbers });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setStatusMsg({ type: '', text: '' });

        // --- Pre-flight validation for exact 10-digit requirement ---
        if (formData.contact_number.length !== 10) {
            setStatusMsg({ type: 'error', text: 'Mobile number must be exactly 10 digits (e.g. 915 518 1798).' });
            setIsLoading(false);
            return;
        }

        // Stitch the +63 prefix onto the number before sending to PHP
        const finalPayload = {
            ...formData,
            contact_number: `+63${formData.contact_number}`
        };

        try {
            const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}register.php`, {
                method: 'POST', 
                body: JSON.stringify(finalPayload), 
                headers: { 'Content-Type': 'application/json', 'x-api-key': import.meta.env.VITE_API_ACCESS_KEY, 'x-api-secret': import.meta.env.VITE_API_SECRET_KEY }
            });
            const data = await res.json();
            
            if (data.status === 'success') {
                setStatusMsg({ type: 'success', text: 'Account created successfully! Redirecting...' });
                setTimeout(() => navigate('/login'), 1500);
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
                        
                        {/* --- DISABLED RIDER BUTTON --- */}
                        <button 
                            type="button" 
                            disabled
                            className="flex-1 py-2.5 rounded-xl text-sm font-bold transition-all bg-transparent text-gray-400 cursor-not-allowed opacity-70"
                        >
                            🛵 Rider (Paused)
                        </button>
                    </div>

                    {/* --- NEW: RIDER PAUSE NOTIFICATION BANNER --- */}
                    <div className="bg-orange-50 border border-orange-100 text-orange-800 p-3.5 rounded-xl text-xs font-bold mb-1 flex items-start gap-3">
                        <span className="text-lg leading-none">🚧</span>
                        <p>
                            <strong>Rider Registration is temporarily paused.</strong><br/> 
                            We are currently implementing new driver requirements to keep our island safe. Passenger registration remains open!
                        </p>
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
                                    type="tel" 
                                    name="contact_number" 
                                    placeholder="915 518 1798" 
                                    required 
                                    value={formData.contact_number}
                                    onChange={handlePhoneChange} 
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

                    {/* Left safely in the code for when you re-enable Riders later! */}
                    {formData.role === 'rider' && (
                        <div className="bg-brand-light/30 p-5 rounded-2xl border border-brand/20 mt-2 space-y-5 animate-fade-in">
                            <h3 className="font-extrabold text-brand-dark text-sm uppercase tracking-wider">Vehicle Details</h3>
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
                        </div>
                    )}

                    <button 
                        type="submit" 
                        disabled={isLoading}
                        className={`w-full text-white font-extrabold py-4 rounded-xl mt-4 shadow-md transition duration-200 ${isLoading ? 'bg-gray-400 cursor-not-allowed' : 'bg-brand hover:bg-brand-dark'}`}
                    >
                        {isLoading ? 'Creating Account...' : 'Create Account'}
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