import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

const ForgotPassword = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    
    const [statusMsg, setStatusMsg] = useState({ type: '', text: '' });
    const [isLoading, setIsLoading] = useState(false);

    const apiHeaders = {
        'Content-Type': 'application/json',
        'x-api-key': import.meta.env.VITE_API_ACCESS_KEY,
        'x-api-secret': import.meta.env.VITE_API_SECRET_KEY
    };

    const handleSendOtp = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setStatusMsg({ type: '', text: '' });

        try {
            const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}forgot_password.php`, {
                method: 'POST',
                body: JSON.stringify({ email }),
                headers: apiHeaders
            });
            const data = await res.json();

            if (data.status === 'success') {
                setStatusMsg({ type: 'success', text: data.message });
                setStep(2); // Move to OTP verification step
            } else {
                setStatusMsg({ type: 'error', text: data.message });
            }
        } catch (err) {
            setStatusMsg({ type: 'error', text: 'Failed to connect to the server.' });
        } finally {
            setIsLoading(false);
        }
    };

    const handleResetPassword = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setStatusMsg({ type: '', text: '' });

        try {
            const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}reset_password.php`, {
                method: 'POST',
                body: JSON.stringify({ email, otp, new_password: newPassword }),
                headers: apiHeaders
            });
            const data = await res.json();

            if (data.status === 'success') {
                setStatusMsg({ type: 'success', text: data.message + ' Redirecting to login...' });
                setTimeout(() => navigate('/login'), 2500);
            } else {
                setStatusMsg({ type: 'error', text: data.message });
            }
        } catch (err) {
            setStatusMsg({ type: 'error', text: 'Failed to connect to the server.' });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center my-10 px-4 h-[70vh]">
            <div className="bg-white p-8 rounded-3xl shadow-lg w-full max-w-md border border-gray-100">
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-brand-light rounded-full flex items-center justify-center mx-auto mb-4 text-2xl border-4 border-white shadow-sm ring-2 ring-brand/20">
                        🔐
                    </div>
                    <h2 className="text-3xl font-extrabold text-brand-dark mb-2">Recover Password</h2>
                    <p className="text-gray-500 text-sm">
                        {step === 1 ? "Enter your email to receive a recovery code." : "Enter your recovery code and new password."}
                    </p>
                </div>

                {statusMsg.text && (
                    <div className={`p-4 rounded-xl mb-6 text-sm font-bold text-center ${statusMsg.type === 'success' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                        {statusMsg.text}
                    </div>
                )}

                {step === 1 ? (
                    <form onSubmit={handleSendOtp} className="flex flex-col gap-5">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1.5">Email Address</label>
                            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="juan@example.com" required 
                                   className="w-full p-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand transition" />
                        </div>
                        <button type="submit" disabled={isLoading} className={`w-full text-white font-extrabold py-4 rounded-xl shadow-md transition duration-200 ${isLoading ? 'bg-gray-400 cursor-not-allowed' : 'bg-brand hover:bg-brand-dark'}`}>
                            {isLoading ? 'Sending Code...' : 'Send Recovery Code'}
                        </button>
                    </form>
                ) : (
                    <form onSubmit={handleResetPassword} className="flex flex-col gap-5 animate-fade-in">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1.5">6-Digit Recovery Code</label>
                            <input type="text" maxLength="6" value={otp} onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))} placeholder="000000" required 
                                   className="w-full p-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand transition text-center tracking-widest font-extrabold text-lg" />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1.5">New Password</label>
                            <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Create a new strong password" required 
                                   className="w-full p-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand transition" />
                        </div>
                        <button type="submit" disabled={isLoading} className={`w-full text-white font-extrabold py-4 rounded-xl shadow-md transition duration-200 ${isLoading ? 'bg-gray-400 cursor-not-allowed' : 'bg-brand hover:bg-brand-dark'}`}>
                            {isLoading ? 'Resetting...' : 'Reset Password'}
                        </button>
                    </form>
                )}

                <p className="text-center mt-8 text-sm text-gray-500">
                    Remember your password? <Link to="/login" className="text-brand font-bold hover:underline">Log in</Link>
                </p>
            </div>
        </div>
    );
};

export default ForgotPassword;