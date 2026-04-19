import React from 'react';

const HelpCenter = () => {
    return (
        <div className="max-w-4xl mx-auto py-10 px-4">
            <div className="text-center mb-10">
                <h1 className="text-3xl md:text-5xl font-extrabold text-brand-dark mb-4">Help Center & Safety</h1>
                <p className="text-gray-500 font-medium text-lg max-w-2xl mx-auto">Frequently asked questions and safety guidelines for the SakayIsla community.</p>
            </div>

            <div className="space-y-6">
                
                {/* FAQ 1: Payments (Highlighted for safety) */}
                <div className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border-2 border-red-100 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-2 h-full bg-red-500"></div>
                    <h3 className="text-xl font-extrabold text-gray-900 mb-2">How do I pay for my ride or padala?</h3>
                    <p className="text-gray-700 leading-relaxed mb-4">All payments are made directly to your rider in cash. SakayIsla does not handle any money.</p>
                    <div className="bg-red-50 p-4 rounded-xl text-red-800 font-medium">
                        <strong>⚠️ SAFETY WARNING:</strong> Never pay in advance. Do not send money via GCash or transfer funds before the rider has arrived at your location. SakayIsla will never ask you for your credit card or online payment details.
                    </div>
                </div>

                {/* FAQ 2: Riders */}
                <div className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-gray-100">
                    <h3 className="text-xl font-extrabold text-gray-900 mb-2">I am a Rider. What should I do right after accepting a booking?</h3>
                    <p className="text-gray-700 leading-relaxed"><strong>Call the passenger immediately.</strong> Do not rely solely on the map pin. Calling verifies that the booking is legitimate, clarifies the exact pickup spot (using the passenger's remarks), and builds trust.</p>
                </div>

                {/* FAQ 3: Padala */}
                <div className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-gray-100">
                    <h3 className="text-xl font-extrabold text-gray-900 mb-2">Can I use SakayIsla for item delivery (Padala)?</h3>
                    <p className="text-gray-700 leading-relaxed">Yes! When booking, drop your pickup and destination pins, and use the <strong>"Note to Rider"</strong> box to explicitly state that it is an item delivery (e.g., "Padala: Small box of clothes to Madridejos"). Remember, negotiate the delivery fee with the rider upon arrival, but do not pay until the service is rendered.</p>
                </div>

                {/* FAQ 4: GPS */}
                <div className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-gray-100">
                    <h3 className="text-xl font-extrabold text-gray-900 mb-2">The map shows my location incorrectly. What do I do?</h3>
                    <p className="text-gray-700 leading-relaxed">Ensure your phone's GPS/Location Services are turned on and set to "High Accuracy." If the blue dot is still wrong, click the <strong>"Manual Pin"</strong> / <strong>"Set Pickup"</strong> button on your dashboard to manually drop the red marker exactly where you are standing.</p>
                </div>

                {/* FAQ 5: Reporting */}
                <div className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-gray-100">
                    <h3 className="text-xl font-extrabold text-gray-900 mb-2">How do I report a problem?</h3>
                    <p className="text-gray-700 leading-relaxed">If you experience an issue with a rider or passenger, please note their Name and Plate Number (if applicable) and contact our platform administrators via our official community page.</p>
                </div>

            </div>
        </div>
    );
};

export default HelpCenter;