import React, { useState } from 'react';

const ContactUs = () => {
    const [formData, setFormData] = useState({ name: '', email: '', message: '' });
    const [status, setStatus] = useState('');

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleSubmit = (e) => {
        e.preventDefault();
        // In the future, you can connect this to an API or email service (like EmailJS)
        setStatus('Message sent successfully! Our support team will get back to you soon.');
        setFormData({ name: '', email: '', message: '' });
        
        // Clear success message after 5 seconds
        setTimeout(() => setStatus(''), 5000);
    };

    return (
        <div className="max-w-6xl mx-auto py-10 px-4">
            
            <div className="text-center mb-12">
                <h1 className="text-4xl md:text-5xl font-extrabold text-brand-dark mb-4">Get in Touch</h1>
                <p className="text-gray-500 font-medium text-lg max-w-2xl mx-auto">
                    Have a question, feedback, or need assistance with a ride? We are here to help. Reach out to the SakayIsla team!
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                
                {/* LEFT: Contact Information Card */}
                <div className="bg-brand-dark text-white p-10 rounded-3xl shadow-lg relative overflow-hidden">
                    {/* Decorative Background Element */}
                    <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-brand rounded-full blur-3xl opacity-50 z-0"></div>
                    
                    <div className="relative z-10">
                        <h2 className="text-2xl font-extrabold mb-8">Contact Information</h2>
                        
                        <div className="space-y-8 font-medium">
                            {/* Email */}
                            <a href="mailto:support@sakayisla.com" className="flex items-center gap-4 hover:text-brand-light transition group">
                                <div className="bg-white/10 p-4 rounded-2xl group-hover:bg-white/20 transition">
                                    <span className="text-2xl">📧</span>
                                </div>
                                <div>
                                    <p className="text-brand-light text-sm font-bold uppercase tracking-wider mb-1">Email Support</p>
                                    <p className="text-lg">support@sakayisla.com</p>
                                </div>
                            </a>

                            {/* Phone */}
                            <a href="tel:+639155181798" className="flex items-center gap-4 hover:text-brand-light transition group">
                                <div className="bg-white/10 p-4 rounded-2xl group-hover:bg-white/20 transition">
                                    <span className="text-2xl">📞</span>
                                </div>
                                <div>
                                    <p className="text-brand-light text-sm font-bold uppercase tracking-wider mb-1">Call / Text Us</p>
                                    <p className="text-lg">+63 915 518 1798</p>
                                </div>
                            </a>

                            {/* Facebook */}
                            <a href="https://fb.com/sakayisla" target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 hover:text-brand-light transition group">
                                <div className="bg-white/10 p-4 rounded-2xl group-hover:bg-white/20 transition">
                                    <span className="text-2xl">📘</span>
                                </div>
                                <div>
                                    <p className="text-brand-light text-sm font-bold uppercase tracking-wider mb-1">Facebook</p>
                                    <p className="text-lg">fb.com/sakayisla</p>
                                </div>
                            </a>

                            {/* Instagram */}
                            <a href="https://ig.com/sakayisla" target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 hover:text-brand-light transition group">
                                <div className="bg-white/10 p-4 rounded-2xl group-hover:bg-white/20 transition">
                                    <span className="text-2xl">📸</span>
                                </div>
                                <div>
                                    <p className="text-brand-light text-sm font-bold uppercase tracking-wider mb-1">Instagram</p>
                                    <p className="text-lg">ig.com/sakayisla</p>
                                </div>
                            </a>
                        </div>
                    </div>
                </div>

                {/* RIGHT: Contact Form */}
                <div className="bg-white p-8 md:p-10 rounded-3xl shadow-sm border border-gray-100">
                    <h2 className="text-2xl font-extrabold text-brand-dark mb-6">Send us a Message</h2>
                    
                    {status && (
                        <div className="bg-green-50 text-green-700 p-4 rounded-xl font-bold mb-6 text-sm border border-green-100">
                            ✅ {status}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1.5">Full Name</label>
                            <input type="text" name="name" value={formData.name} onChange={handleChange} required placeholder="Juan Dela Cruz"
                                   className="w-full p-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand transition" />
                        </div>
                        
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1.5">Email Address</label>
                            <input type="email" name="email" value={formData.email} onChange={handleChange} required placeholder="juan@example.com"
                                   className="w-full p-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand transition" />
                        </div>
                        
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1.5">Message</label>
                            <textarea name="message" value={formData.message} onChange={handleChange} required placeholder="How can we help you?" rows="5"
                                      className="w-full p-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand transition resize-none"></textarea>
                        </div>

                        <button type="submit" className="w-full bg-brand hover:bg-brand-dark text-white font-extrabold py-4 rounded-xl mt-2 shadow-md transition duration-200">
                            Send Message
                        </button>
                    </form>
                </div>

            </div>
        </div>
    );
};

export default ContactUs;