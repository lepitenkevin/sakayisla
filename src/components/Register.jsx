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

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setStatusMsg({ type: '', text: '' });

        try {
            const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}register.php`, {
                method: 'POST', 
                body: JSON.stringify(formData), 
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

                {/* Status Messages */}
                {statusMsg.text && (
                    <div className={`p-4 rounded-xl mb-6 text-sm font-bold text-center ${statusMsg.type === 'success' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                        {statusMsg.text}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                    
                    {/* Modern Role Selector (Toggle) */}
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

                    {/* Standard Fields */}
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1.5">Full Name</label>
                        <input type="text" name="name" placeholder="Juan Dela Cruz" required onChange={handleChange} 
                               className="w-full p-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent transition" />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1.5">Email Address</label>
                            <input type="email" name="email" placeholder="juan@example.com" required onChange={handleChange} 
                                   className="w-full p-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent transition" />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1.5">Mobile Number</label>
                            <input type="tel" name="contact_number" placeholder="0912 345 6789" required onChange={handleChange} 
                                   className="w-full p-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent transition" />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1.5">Password</label>
                        <input type="password" name="password" placeholder="Create a strong password" required onChange={handleChange} 
                               className="w-full p-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent transition" />
                    </div>

                    {/* Conditional Rider Fields */}
                    {formData.role === 'rider' && (
                        <div className="bg-brand-light/30 p-5 rounded-2xl border border-brand/20 mt-2 space-y-5 animate-fade-in">
                            <h3 className="font-extrabold text-brand-dark text-sm uppercase tracking-wider">Vehicle Details</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1.5">Motorcycle Model</label>
                                    <input type="text" name="motorcycle_model" placeholder="e.g., Honda Click 125i" required onChange={handleChange} 
                                           className="w-full p-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent transition" />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1.5">Plate Number</label>
                                    <input type="text" name="plate_number" placeholder="ABC 1234" required onChange={handleChange} 
                                           className="w-full p-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent transition uppercase" />
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