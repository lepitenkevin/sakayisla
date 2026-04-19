import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';

const Login = () => {
    const [credentials, setCredentials] = useState({ email: '', password: '' });
    const [error, setError] = useState('');
    const navigate = useNavigate();

    // --- NEW: Redirect if already logged in ---
    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            const user = JSON.parse(storedUser);
            // Redirect them to their respective dashboard
            navigate(`/${user.role === 'superadmin' ? 'admin' : user.role}`, { replace: true });
        }
    }, [navigate]);

    const handleChange = (e) => setCredentials({ ...credentials, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}login.php`, {
                method: 'POST', 
                body: JSON.stringify(credentials), 
                headers: { 
                    'Content-Type': 'application/json', 
                    'x-api-key': import.meta.env.VITE_API_ACCESS_KEY, 
                    'x-api-secret': import.meta.env.VITE_API_SECRET_KEY 
                }
            });
            const data = await res.json();
            if (data.status === 'success') {
                localStorage.setItem('user', JSON.stringify(data.user));
                navigate(`/${data.user.role === 'superadmin' ? 'admin' : data.user.role}`);
            } else {
                setError(data.message);
            }
        } catch (err) { 
            setError('Failed to connect to the server.'); 
        }
    };

    return (
        <div className="flex items-center justify-center mt-10">
            <div className="bg-white p-8 rounded-3xl shadow-lg w-full max-w-md border border-gray-100">
                <div className="text-center mb-8">
                    <h2 className="text-3xl font-extrabold text-brand-dark mb-2">Welcome to SakayIsla</h2>
                    <p className="text-gray-500 text-sm">Enter your details to proceed.</p>
                </div>
                
                {error && <div className="bg-red-50 text-red-600 p-3 rounded-xl mb-4 text-sm text-center font-medium">{error}</div>}
                
                <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1.5">Email Address</label>
                        <input type="email" name="email" required onChange={handleChange} 
                               className="w-full p-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent transition" />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1.5">Password</label>
                        <input type="password" name="password" required onChange={handleChange} 
                               className="w-full p-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent transition" />
                    </div>
                    
                    <button type="submit" className="w-full bg-brand hover:bg-brand-dark text-white font-extrabold py-3.5 rounded-xl mt-4 shadow-md transition duration-200">
                        Log In
                    </button>
                </form>
                
                <p className="text-center mt-8 text-sm text-gray-500">
                    Don't have an account? <Link to="/register" className="text-brand font-bold hover:underline">Sign up</Link>
                </p>
            </div>
        </div>
    );
};

export default Login;