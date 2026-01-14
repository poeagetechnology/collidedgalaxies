'use client';

import Link from 'next/link';
import PolicyLayout from '../../../../src/components/layouts/policyLayout';
import ContactInfo from '@/src/components/contactInfo';

export default function TermsConditionsPage() {
    return (
        <PolicyLayout>
            <div className="prose prose-gray max-w-none">

                {/* HEADER */}
                <div className="flex flex-col md:flex-row justify-between items-center w-full py-6 mb-10">
                    <h1 className="text-3xl md:text-4xl font-semibold text-center md:text-left md:w-[500px] leading-tight mb-2 md:mb-0">
                        Terms & Conditions
                    </h1>
                    <p className="text-base md:text-lg text-gray-700 text-center md:w-[350px] md:text-right">
                        By placing an order with Collided Galaxies, you agree to our Terms & Conditions designed for a smooth and transparent shopping experience.
                    </p>
                </div>

                {/* 1. GENERAL */}
                <section className="mb-12">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">1. General</h2>

                    <ul className="list-disc pl-6 space-y-3 text-gray-700">
                        <li>
                            By placing an order with Collided Galaxies, you agree to all Terms & Conditions mentioned on this page.
                        </li>
                        <li>
                            Product details, sizing, and descriptions are provided accurately, but slight variations may occur.
                        </li>
                        <li>
                            Prices, offers, designs, and policies may be updated or changed without prior notice.
                        </li>
                    </ul>
                </section>

                {/* 2. PRODUCTS */}
                <section className="mb-12">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">2. Products</h2>

                    <ul className="list-disc pl-6 space-y-3 text-gray-700">
                        <li>All product details, colours, fabrics, and sizing information are provided as accurately as possible.</li>
                        <li>Slight colour or fabric variations may occur due to lighting and individual screen differences.</li>
                        <li>Such variations are normal and not considered defects.</li>
                    </ul>
                </section>

                {/* 3. ORDERS & PAYMENTS */}
                <section className="mb-12">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">3. Orders & Payments</h2>

                    <ul className="list-disc pl-6 space-y-3 text-gray-700">
                        <li>Orders are confirmed only after successful payment.</li>
                        <li>We use trusted and secure payment gateways to process all transactions.</li>
                        <li>Collided Galaxies does not store or have access to your card, UPI, or banking details.</li>
                        <li>Prices and offers may change at any time without notice.</li>
                    </ul>
                </section>

                {/* 4. SHIPPING */}
                <section className="mb-12">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">4. Shipping</h2>

                    <ul className="list-disc pl-6 space-y-3 text-gray-700">
                        <li>We ship using reliable courier partners across India.</li>
                        <li>Delivery timelines may vary depending on your location.</li>
                        <li>We are not responsible for delays caused by couriers or logistical issues.</li>
                    </ul>
                </section>

                {/* 5. RETURNS & REFUNDS */}
                <section className="mb-12">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">5. Returns & Refunds</h2>

                    <p className="text-gray-700 mb-4">
                        All returns and exchanges follow our official Refund & Return Policy.  
                        Returns are accepted only for damaged, defective, incorrect, or wrong-size (as per size chart) products.
                    </p>

                    <p className="text-gray-700">
                        SALE ITEMS, CUSTOM PRINTS, AND LIMITED EDITION DROPS are not eligible for returns.
                    </p>
                </section>

                {/* 6. INTELLECTUAL PROPERTY */}
                <section className="mb-12">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">6. Intellectual Property</h2>

                    <ul className="list-disc pl-6 space-y-3 text-gray-700">
                        <li>
                            All designs, graphics, artwork, and digital content are the exclusive intellectual property of Collided Galaxies.
                        </li>
                        <li>
                            Copying, reproducing, or distributing any design or content is strictly prohibited.
                        </li>
                        <li>
                            Legal action may be taken against unauthorized use of our brand assets.
                        </li>
                    </ul>
                </section>

                {/* 7. LIMITATION OF LIABILITY */}
                <section className="mb-12">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">7. Limitation of Liability</h2>

                    <ul className="list-disc pl-6 space-y-3 text-gray-700">
                        <li>
                            Our liability is limited strictly to the product purchase value.
                        </li>
                        <li>
                            We are not responsible for courier delays, incorrect addresses, or failed delivery attempts.
                        </li>
                        <li>
                            Collided Galaxies is not responsible for indirect damages such as loss of profit or emotional distress.
                        </li>
                    </ul>
                </section>

                {/* CONTACT */}
                <section className="bg-gray-50 p-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">Contact Us</h2>

                    <p className="text-gray-700 mb-3">
                        For any queries regarding these Terms & Conditions, contact our Support Team:
                    </p>

                    <ContactInfo />

                    <p className="text-gray-600 mt-4 text-sm">
                        Our team typically responds within 24 hours.
                    </p>
                </section>
            </div>
        </PolicyLayout>
    );
}
