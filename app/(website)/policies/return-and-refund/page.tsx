'use client';

import Link from 'next/link';
import PolicyLayout from '../../../../src/components/layouts/policyLayout';
import ContactInfo from '@/src/components/contactInfo';

export default function ReturnRefundPage() {
    return (
        <PolicyLayout>
            <div className="prose prose-gray max-w-none">
                
                {/* HEADER */}
                <div className="flex flex-col md:flex-row justify-between items-center w-full py-6 mb-10">
                    <h1 className="text-3xl md:text-4xl font-semibold text-center md:text-left md:w-[500px] leading-tight mb-2 md:mb-0">
                        Return & Refund Policy
                    </h1>
                    <p className="text-base md:text-lg text-gray-700 text-center md:w-[350px] md:text-right">
                        We accept returns and exchanges only for eligible cases to ensure a smooth and fair experience for our customers.
                    </p>
                </div>

                {/* 1. ELIGIBILITY */}
                <section className="mb-12">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">
                        Eligibility for Return/Exchange
                    </h2>

                    <p className="text-gray-700 mb-4">Returns or exchanges are accepted ONLY if:</p>

                    <ul className="list-disc pl-6 mb-6 space-y-2 text-gray-700">
                        <li>The product is damaged or defective.</li>
                        <li>An incorrect product or wrong size (as per size chart) was delivered.</li>
                        <li>The item is unused, unwashed, and has all original tags and packaging intact.</li>
                    </ul>

                    <p className="text-gray-700">
                        <strong>An unboxing video is mandatory</strong> if the parcel arrives damaged, opened, or tampered.
                    </p>
                </section>

                {/* 2. NON RETURNABLE */}
                <section className="mb-12">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">
                        Non-Returnable Items
                    </h2>
                    <ul className="list-disc pl-6 mb-6 space-y-2 text-gray-700">
                        <li>Used, washed, or customer-damaged items.</li>
                        <li>Items without tags or original packaging.</li>
                        <li>SALE items, custom prints, and limited-edition drops.</li>
                        <li>Returns due to wrong size chosen by the customer (extra shipping charges may apply).</li>
                    </ul>
                </section>

                {/* 3. TIME WINDOW */}
                <section className="mb-12">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">
                        Time Window
                    </h2>
                    <p className="text-gray-700 mb-4">
                        All return or exchange requests must be raised within <strong>7 days of delivery</strong> with clear photos or videos.
                    </p>
                </section>

                {/* 4. PROCESS */}
                <section className="mb-12">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">
                        Return/Exchange Process
                    </h2>

                    <ol className="list-decimal pl-6 mb-6 space-y-3 text-gray-700">
                        <li>Contact us via Instagram, WhatsApp, or Email within 7 days of delivery.</li>
                        <li>Share your <strong>Order ID</strong> along with clear photos/videos of the product.</li>
                        <li>Our team will verify the request and approve eligible cases.</li>
                        <li>A pickup will be arranged by our courier partner.</li>
                        <li>The item will undergo <strong>quality checking</strong> once received.</li>
                        <li>Exchange or refund will be processed after successful inspection.</li>
                    </ol>
                </section>

                {/* 5. REFUND METHOD */}
                <section className="mb-12">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">
                        Refund Method
                    </h2>

                    <ul className="list-disc pl-6 mb-6 space-y-2 text-gray-700">
                        <li>Refunds are issued to the original payment method or as store credit.</li>
                        <li>Refunds typically take <strong>5–7 business days</strong> after approval.</li>
                    </ul>
                </section>

                {/* 6. SHIPPING COST */}
                <section className="mb-12">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">
                        Shipping Charges
                    </h2>

                    <ul className="list-disc pl-6 mb-6 space-y-2 text-gray-700">
                        <li>If the issue is from our side → <strong>Free pickup & full refund/exchange.</strong></li>
                        <li>If the customer requests exchange for personal reasons → <strong>Return shipping charges may apply.</strong></li>
                    </ul>
                </section>

                {/* 7. CONTACT */}
                <section className="bg-gray-50 p-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">
                        Contact Us
                    </h2>

                    <p className="text-gray-700 mb-3">
                        For return or refund assistance, contact our Support Team:
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