'use client';

import Link from 'next/link';
import PolicyLayout from '../../../../src/components/layouts/policyLayout';
import { Contact } from 'lucide-react';
import ContactInfo from '@/src/components/contactInfo';

export default function ShippingPage() {
    return (
        <PolicyLayout>
            <div className="prose prose-gray max-w-none">
                <div className="flex flex-col md:flex-row justify-between items-center w-full py-6 mb-10">
                    <h1 className="text-3xl md:text-4xl font-semibold text-center md:text-left md:w-[500px] leading-tight mb-2 md:mb-0">
                        Shipping Policy
                    </h1>
                    <p className="text-base md:text-lg text-gray-700 text-center md:w-[350px] md:text-right">
                        We process and deliver your orders using trusted courier partners to ensure safe, fast, and reliable delivery across India.
                    </p>
                </div>

                {/* 1. SHIPPING TIME */}
                <section className="mb-10">
                    <h2 className="text-2xl font-semibold text-gray-900 mb-4">Shipping Time</h2>
                    <ul className="list-disc pl-6 mb-6 space-y-2 text-gray-700">
                        <li>Orders are processed within <strong>1–2 business days</strong>.</li>
                        <li>Delivery takes <strong>3–7 business days</strong> depending on the location.</li>
                        <li>Processing for weekend and holiday orders begins on the next business day.</li>
                    </ul>
                </section>

                {/* 2. SHIPPING CHARGES */}
                <section className="mb-10">
                    <h2 className="text-2xl font-semibold text-gray-900 mb-4">Shipping Charges</h2>
                    <ul className="list-disc pl-6 mb-6 space-y-2 text-gray-700">
                        <li>Standard shipping charges are shown at checkout.</li>
                        <li><strong>Free shipping</strong> may be available during select launches or offers.</li>
                    </ul>
                </section>

                {/* 3. TRACKING */}
                <section className="mb-10">
                    <h2 className="text-2xl font-semibold text-gray-900 mb-4">Tracking</h2>
                    <p className="text-gray-700 mb-3">Once your order is dispatched, you will receive:</p>
                    <ul className="list-disc pl-6 mb-4 space-y-2 text-gray-700">
                        <li>A tracking link via SMS, Email, or WhatsApp.</li>
                    </ul>
                    <p className="text-gray-700 mb-6">
                        You may track your shipment through the courier’s website or the Shiprocket tracking portal.
                    </p>
                </section>

                {/* SHIPPING PARTNER */}
                <section className="mb-10 bg-blue-50 p-6">
                    <h2 className="text-2xl font-semibold text-gray-900 mb-4">Shipping Partner</h2>
                    <p className="text-gray-700">
                        We use{" "}
                        <Link href="https://www.shiprocket.in/">
                            <span className="text-blue-700 font-semibold underline">Shiprocket</span>
                        </Link>{" "}
                        to manage and deliver shipments reliably across India.
                    </p>
                </section>

                {/* 4. DELIVERY ATTEMPTS */}
                <section className="mb-10">
                    <h2 className="text-2xl font-semibold text-gray-900 mb-4">Delivery Attempts</h2>
                    <ul className="list-disc pl-6 mb-6 space-y-2 text-gray-700">
                        <li>The courier will attempt delivery <strong>twice</strong>.</li>
                        <li>Failed attempts may result in the order being returned to us.</li>
                        <li>Reshipping charges may apply for re-delivery.</li>
                    </ul>
                </section>

                {/* 5. ACCURATE ADDRESS REQUIREMENT */}
                <section className="mb-10">
                    <h2 className="text-2xl font-semibold text-gray-900 mb-4">Address & Contact Details</h2>
                    <ul className="list-disc pl-6 mb-6 space-y-2 text-gray-700">
                        <li>Customers must provide accurate address and phone number.</li>
                        <li>We are not responsible for delays caused by incorrect or incomplete details.</li>
                        <li>Address changes can be made only before dispatch.</li>
                    </ul>
                </section>

                {/* 6. DAMAGED PACKAGES */}
                <section className="mb-10">
                    <h2 className="text-2xl font-semibold text-gray-900 mb-4">Damaged or Tampered Packages</h2>
                    <p className="text-gray-700 mb-3">If your parcel arrives damaged, opened, or tampered:</p>
                    <ul className="list-disc pl-6 mb-4 space-y-2 text-gray-700">
                        <li>You must record an <strong>unboxing video</strong> from start to end.</li>
                        <li>Contact us immediately with the video.</li>
                        <li>Our team will assist you as per our return/exchange policy.</li>
                    </ul>
                </section>

                {/* CONTACT */}
                <section className="bg-gray-50 p-6">
                    <h2 className="text-2xl font-semibold text-gray-900 mb-4">Contact Us</h2>
                    <p className="text-gray-700 mb-3">For any shipping-related queries:</p>
                    <ContactInfo />
                    <p className="text-gray-700 mt-4">
                        We’re here to ensure your Collided Galaxies experience is smooth, safe, and reliable.
                    </p>
                </section>
            </div>
        </PolicyLayout>
    );
}