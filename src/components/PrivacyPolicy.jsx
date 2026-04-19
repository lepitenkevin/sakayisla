import React from 'react';

const PrivacyPolicy = () => {
    return (
        <div className="max-w-4xl mx-auto py-10 px-4">
            <div className="bg-white p-8 md:p-12 rounded-3xl shadow-sm border border-gray-100">
                <h1 className="text-3xl md:text-4xl font-extrabold text-brand-dark mb-4">Privacy Policy</h1>
                <p className="text-gray-500 mb-10 font-medium text-lg">Your privacy and data security are highly important to SakayIsla.</p>
                
                <div className="space-y-10 text-gray-700">
                    <section>
                        <h2 className="text-xl font-extrabold text-gray-900 mb-3">1. Information We Collect</h2>
                        <p className="leading-relaxed">To facilitate reliable connections, SakayIsla collects basic personal information including your full name, mobile number, account password, and real-time GPS location data when using the map features.</p>
                    </section>

                    <section>
                        <h2 className="text-xl font-extrabold text-gray-900 mb-3">2. How We Use Your Data</h2>
                        <p className="leading-relaxed">Your location data is used exclusively to show available riders nearby, map your pickup and drop-off points, and provide live tracking during an active booking. We do not use your location data for targeted advertising.</p>
                    </section>

                    <section>
                        <h2 className="text-xl font-extrabold text-gray-900 mb-4">3. Information Sharing (Rider-Passenger Connection)</h2>
                        <p className="mb-4 leading-relaxed">We prioritize your privacy. Your specific contact number and exact location are kept private until a booking is accepted. Once a ride is matched:</p>
                        <div className="bg-brand-light/30 p-6 rounded-2xl border border-brand/20">
                            <ul className="space-y-3 font-medium text-brand-dark">
                                <li>🛵 The <strong>Rider</strong> will see the Passenger's name, contact number, and pinned locations to facilitate pickup.</li>
                                <li>🚶‍♂️ The <strong>Passenger</strong> will see the Rider's name, contact number, motorcycle model, plate number, and live GPS location.</li>
                            </ul>
                        </div>
                        <p className="mt-4 font-bold text-gray-500 text-sm">Note: Once the ride is marked as "Completed," live tracking stops immediately.</p>
                    </section>

                    <section>
                        <h2 className="text-xl font-extrabold text-gray-900 mb-3">4. Data Security</h2>
                        <p className="leading-relaxed">We do not sell, rent, or share your personal data with outside marketing agencies. Your data is stored securely and used only for the operational functions of the SakayIsla platform.</p>
                    </section>
                </div>
            </div>
        </div>
    );
};

export default PrivacyPolicy;