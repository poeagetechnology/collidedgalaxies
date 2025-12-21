'use client';

import PolicyLayout from '../../../../src/components/layouts/policyLayout';
import ContactInfo from '@/src/components/contactInfo';

export default function PrivacyPolicyPage() {
    return (
        <PolicyLayout>
            <div className="prose prose-gray max-w-none">

                {/* HEADER */}
                <div className="flex flex-col md:flex-row justify-between items-center w-full py-6 mb-10">
                    <h1 className="text-3xl md:text-4xl font-semibold text-center md:text-left md:w-[500px] leading-tight mb-2 md:mb-0">
                        Privacy Policy
                    </h1>
                    <p className="text-base md:text-lg text-gray-700 text-center md:w-[350px] md:text-right">
                        Your privacy matters to us. We only collect the basic details needed to process your orders and keep your shopping experience smooth and secure.
                    </p>
                </div>

                {/* INTRO */}
                <section className="mb-12">
                    <p className="text-gray-700">
                        We collect only the essential information needed to deliver your orders safely and improve your experience. We never sell or misuse your data.
                    </p>
                </section>

                {/* 1. INFORMATION WE COLLECT */}
                <section className="mb-12">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">
                        1. Information We Collect
                    </h2>

                    <ul className="list-disc pl-6 space-y-3 text-gray-700">
                        <li><strong>Personal Details:</strong> Name, contact details, and delivery address.</li>
                        <li><strong>Order Information:</strong> Measurements (if provided) and order history.</li>
                        <li><strong>Payment Information:</strong> Processed securely through encrypted payment gateways (we do <strong>not</strong> store your UPI, card, or banking details).</li>
                        <li><strong>Technical Details:</strong> Device information, IP address, and basic analytics used to improve your shopping experience.</li>
                    </ul>
                </section>

                {/* 2. HOW WE USE YOUR DATA */}
                <section className="mb-12">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">
                        2. How We Use Your Data
                    </h2>

                    <ul className="list-disc pl-6 space-y-3 text-gray-700">
                        <li>To process, confirm, and deliver your orders efficiently.</li>
                        <li>To provide customer support when needed.</li>
                        <li>To send updates about orders, launches, and offers.</li>
                        <li>To improve product quality and website performance.</li>
                        <li>To ensure payment safety and prevent fraud.</li>
                    </ul>
                </section>

                {/* 3. DATA PROTECTION */}
                <section className="mb-12">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">
                        3. Data Protection
                    </h2>

                    <p className="text-gray-700 mb-4">
                        We store your information securely using:
                    </p>

                    <ul className="list-disc pl-6 space-y-3 text-gray-700">
                        <li>Secure systems and encrypted servers</li>
                        <li>Encrypted payment gateways</li>
                        <li>Strict internal data protection protocols</li>
                    </ul>
                </section>

                {/* 4. WHEN WE SHARE DATA */}
                <section className="mb-12">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">
                        4. When We Share Your Data
                    </h2>

                    <p className="text-gray-700 mb-4">
                        We share your data only with trusted partners essential for processing your orders:
                    </p>

                    <ul className="list-disc pl-6 space-y-3 text-gray-700">
                        <li><strong>Courier partners</strong> for safe order delivery.</li>
                        <li><strong>Payment gateways</strong> for secure online transactions.</li>
                    </ul>

                    <p className="text-gray-700 mt-4">
                        We <strong>never</strong> sell or share your data with advertisers or any third parties for marketing.
                    </p>
                </section>

                {/* 5. YOUR RIGHTS */}
                <section className="mb-12">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">
                        5. Your Rights
                    </h2>

                    <p className="text-gray-700 mb-4">
                        You have complete control over your personal information. You may:
                    </p>

                    <ul className="list-disc pl-6 space-y-3 text-gray-700">
                        <li>Request a copy of the data we store.</li>
                        <li>Update or correct your personal details.</li>
                        <li>Request deletion of your information.</li>
                        <li>Opt out of promotional messages anytime.</li>
                    </ul>
                </section>

                {/* CONTACT */}
                <section className="bg-gray-50 p-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">
                        Contact Us
                    </h2>

                    <p className="text-gray-700 mb-3">
                        For privacy concerns, data requests, or questions regarding this policy, you can contact our Support Team:
                    </p>

                    <ContactInfo />
                    
                    <p className="text-gray-600 mt-4 text-sm">
                        We typically respond within 24 hours.
                    </p>
                </section>
            </div>
        </PolicyLayout>
    );
}