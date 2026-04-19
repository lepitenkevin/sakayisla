import React from 'react';

const TermsOfService = () => {
    return (
        <div className="max-w-4xl mx-auto py-10 px-4">
            <div className="bg-white p-8 md:p-12 rounded-3xl shadow-sm border border-gray-100">
                <h1 className="text-3xl md:text-4xl font-extrabold text-brand-dark mb-4">Terms of Service</h1>
                <p className="text-gray-500 mb-10 font-medium text-lg">Welcome to SakayIsla. By using our platform, you agree to the following terms and conditions. Please read them carefully.</p>
                
                <div className="space-y-10 text-gray-700">
                    <section>
                        <h2 className="text-xl font-extrabold text-gray-900 mb-3">1. Nature of Service (Third-Party Platform)</h2>
                        <p className="leading-relaxed">SakayIsla operates strictly as a third-party technology platform. We provide a digital space to connect independent local riders with passengers seeking transportation or delivery services on Bantayan Island. SakayIsla is <strong>not</strong> a transportation provider, courier, or employer of the riders.</p>
                    </section>

                    <section>
                        <h2 className="text-xl font-extrabold text-gray-900 mb-4">2. Payments and Transactions (Strictly Direct)</h2>
                        <p className="mb-5 leading-relaxed">All financial transactions are strictly between the Passenger and the Rider. SakayIsla does not collect, hold, or process ride fares or delivery fees.</p>
                        
                        <div className="bg-red-50 border-2 border-red-100 p-6 rounded-2xl">
                            <h3 className="font-extrabold text-red-800 mb-3 flex items-center gap-2">
                                <span className="text-2xl">⚠️</span> Critical Payment Policy
                            </h3>
                            <ul className="space-y-4 text-red-800 font-medium">
                                <li className="flex gap-3">
                                    <span className="text-red-500 font-black">•</span>
                                    <span><strong>Passengers:</strong> Fares must be paid in cash directly to the rider upon completion of the trip or delivery. <strong>NEVER send money or pay in advance.</strong> If a rider asks for an initial payment or deposit before arriving at your location, please cancel the ride immediately and report the account.</span>
                                </li>
                                <li className="flex gap-3">
                                    <span className="text-red-500 font-black">•</span>
                                    <span><strong>Riders:</strong> You are responsible for collecting your own fare. Do not request advance payments via GCash or bank transfer before meeting the passenger.</span>
                                </li>
                            </ul>
                        </div>
                    </section>

                    <section>
                        <h2 className="text-xl font-extrabold text-gray-900 mb-3">3. Rider Responsibilities and Verification</h2>
                        <p className="leading-relaxed">Riders must possess a valid driver's license and ensure their motorcycle is properly registered and safe for transport. <strong className="text-brand-dark">Upon accepting a booking, the Rider MUST call the Passenger immediately</strong> to verify the pickup location, confirm the destination, and establish trust before proceeding.</p>
                    </section>

                    <section>
                        <h2 className="text-xl font-extrabold text-gray-900 mb-3">4. Passenger Responsibilities</h2>
                        <p className="leading-relaxed">Passengers must provide accurate pickup and drop-off pins. Please use the "Remarks" section to provide helpful details (e.g., clothing color, specific landmarks) to assist the rider.</p>
                    </section>

                    <section>
                        <h2 className="text-xl font-extrabold text-gray-900 mb-3">5. Liability</h2>
                        <p className="leading-relaxed">Because SakayIsla is solely a matching platform, we are not liable for any lost items, accidents, delays, or disputes over fares that occur during the trip. Users assume all risks associated with arranging and completing rides.</p>
                    </section>
                </div>
            </div>
        </div>
    );
};

export default TermsOfService;