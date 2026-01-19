'use client';

import PolicyLayout from '../../../../src/components/layouts/policyLayout';
import React from 'react';
import { Shield, Lock, Users, Eye } from 'lucide-react';

export default function PrivacyPolicyPage() {
    return (
        <PolicyLayout>
            {/* Header Section */}
            <div className="mb-12">
                <div className="bg-linear-to-r from-blue-600 to-blue-800 rounded-lg p-8 md:p-12 text-white shadow-lg">
                    <div className="flex items-start gap-4 mb-6">
                        <Shield className="w-10 h-10 shrink-0" />
                        <div>
                            <h1 className="text-3xl md:text-4xl font-bold mb-2">Privacy Policy</h1>
                            <p className="text-blue-100">Last Updated: January 09, 2026</p>
                        </div>
                    </div>
                    <p className="text-base md:text-lg leading-relaxed">
                        At <span className="font-semibold">CollidedGalaxies (coga)</span>, your privacy is our top priority. We're committed to protecting your personal information and maintaining your trust. This policy explains what information we collect, why we collect it, and how we safeguard it.
                    </p>
                </div>

                {/* Quick Contact Card */}
                <div className="mt-6 bg-blue-50 border-l-4 border-blue-600 p-6 rounded">
                    <p className="text-gray-700">
                        <span className="font-semibold">Have questions?</span> We're here to help.
                    </p>
                    <a href="mailto:customercare@collidedgalaxies.com" className="inline-block mt-2 text-blue-600 hover:text-blue-800 font-medium hover:underline">
                        📧 customercare@collidedgalaxies.com
                    </a>
                </div>
            </div>

            {/* Content Sections */}
            <div className="space-y-12">
                {/* Section 1 */}
                <section className="bg-linear-to-r from-purple-50 to-transparent rounded-lg p-8">
                    <div className="flex items-start gap-3 mb-6">
                        <Eye className="w-6 h-6 text-purple-600 shrink-0 mt-1" />
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Information We Collect</h2>
                        </div>
                    </div>

                    <div className="space-y-6 ml-9">
                        <div>
                            <h3 className="text-lg font-semibold text-gray-800 mb-3">Information You Give Us</h3>
                            <p className="text-gray-700 leading-relaxed mb-4">
                                When you use our website, create an account, or contact us, you may share:
                            </p>
                            <ul className="space-y-2 ml-4">
                                <li className="text-gray-700 flex items-start gap-2">
                                    <span className="text-purple-600 font-bold mt-1">•</span>
                                    <span>Your name</span>
                                </li>
                                <li className="text-gray-700 flex items-start gap-2">
                                    <span className="text-purple-600 font-bold mt-1">•</span>
                                    <span>Email address</span>
                                </li>
                                <li className="text-gray-700 flex items-start gap-2">
                                    <span className="text-purple-600 font-bold mt-1">•</span>
                                    <span>Phone number</span>
                                </li>
                                <li className="text-gray-700 flex items-start gap-2">
                                    <span className="text-purple-600 font-bold mt-1">•</span>
                                    <span>Username and password</span>
                                </li>
                                <li className="text-gray-700 flex items-start gap-2">
                                    <span className="text-purple-600 font-bold mt-1">•</span>
                                    <span>Billing and delivery addresses</span>
                                </li>
                            </ul>
                        </div>

                        <div className="border-t pt-6">
                            <h3 className="text-lg font-semibold text-gray-800 mb-3">Payment Information</h3>
                            <p className="text-gray-700 leading-relaxed mb-3">
                                Payments are processed securely through <span className="font-medium text-gray-900">Cashfree</span>.
                            </p>
                            <div className="bg-green-50 border border-green-200 rounded p-3 mb-3">
                                <p className="text-green-800 text-sm flex items-start gap-2">
                                    <span className="text-green-600 font-bold">✓</span>
                                    <span><strong>We do not store your card or payment details</strong> on our servers.</span>
                                </p>
                            </div>
                            <p className="text-gray-700">
                                <a href="https://www.cashfree.com/privacypolicy/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 font-medium hover:underline">
                                    View Cashfree Privacy Policy →
                                </a>
                            </p>
                        </div>

                        <div className="border-t pt-6">
                            <h3 className="text-lg font-semibold text-gray-800 mb-3">Information Collected Automatically</h3>
                            <p className="text-gray-700 leading-relaxed mb-4">
                                When you visit our website, we automatically collect some basic information such as:
                            </p>
                            <ul className="space-y-2 ml-4">
                                <li className="text-gray-700 flex items-start gap-2">
                                    <span className="text-purple-600 font-bold mt-1">•</span>
                                    <span>IP address</span>
                                </li>
                                <li className="text-gray-700 flex items-start gap-2">
                                    <span className="text-purple-600 font-bold mt-1">•</span>
                                    <span>Browser and device type</span>
                                </li>
                                <li className="text-gray-700 flex items-start gap-2">
                                    <span className="text-purple-600 font-bold mt-1">•</span>
                                    <span>Pages visited and time spent on the site</span>
                                </li>
                                <li className="text-gray-700 flex items-start gap-2">
                                    <span className="text-purple-600 font-bold mt-1">•</span>
                                    <span>Approximate location</span>
                                </li>
                            </ul>
                            <p className="text-gray-700 mt-4">This helps us keep the website secure and improve your experience.</p>
                        </div>
                    </div>
                </section>

                {/* Section 2 */}
                <section>
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">2. How We Use Your Information</h2>
                    <p className="text-gray-700 leading-relaxed mb-4">We use your information for the following purposes:</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 ml-4">
                        <div className="flex items-start gap-3">
                            <span className="text-blue-600 font-bold">✓</span>
                            <span className="text-gray-700">Create and manage your account</span>
                        </div>
                        <div className="flex items-start gap-3">
                            <span className="text-blue-600 font-bold">✓</span>
                            <span className="text-gray-700">Process orders and payments</span>
                        </div>
                        <div className="flex items-start gap-3">
                            <span className="text-blue-600 font-bold">✓</span>
                            <span className="text-gray-700">Communicate with you</span>
                        </div>
                        <div className="flex items-start gap-3">
                            <span className="text-blue-600 font-bold">✓</span>
                            <span className="text-gray-700">Provide customer support</span>
                        </div>
                        <div className="flex items-start gap-3">
                            <span className="text-blue-600 font-bold">✓</span>
                            <span className="text-gray-700">Improve our website and services</span>
                        </div>
                        <div className="flex items-start gap-3">
                            <span className="text-blue-600 font-bold">✓</span>
                            <span className="text-gray-700">Send promotional messages (opt-out anytime)</span>
                        </div>
                        <div className="flex items-start gap-3">
                            <span className="text-blue-600 font-bold">✓</span>
                            <span className="text-gray-700">Prevent fraud and ensure security</span>
                        </div>
                        <div className="flex items-start gap-3">
                            <span className="text-blue-600 font-bold">✓</span>
                            <span className="text-gray-700">Follow legal requirements</span>
                        </div>
                    </div>
                </section>

                {/* Section 3 */}
                <section className="bg-linear-to-r from-red-50 to-transparent rounded-lg p-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">3. Sharing Your Information</h2>
                    <p className="text-gray-700 leading-relaxed mb-6">
                        We share your information only when necessary and with trusted partners:
                    </p>
                    <div className="space-y-3 ml-4">
                        <div className="flex items-start gap-3 text-gray-700">
                            <span className="text-red-600 font-bold">→</span>
                            <span>Payment partners</span>
                        </div>
                        <div className="flex items-start gap-3 text-gray-700">
                            <span className="text-red-600 font-bold">→</span>
                            <span>Marketing and analytics services</span>
                        </div>
                        <div className="flex items-start gap-3 text-gray-700">
                            <span className="text-red-600 font-bold">→</span>
                            <span>Social media platforms (if you use social login)</span>
                        </div>
                        <div className="flex items-start gap-3 text-gray-700">
                            <span className="text-red-600 font-bold">→</span>
                            <span>Government authorities (when required by law)</span>
                        </div>
                    </div>
                    <div className="bg-red-50 border border-red-200 rounded p-4 mt-6">
                        <p className="text-red-800 flex items-start gap-2">
                            <span className="text-red-600 font-bold">✗</span>
                            <span><strong>We never sell your personal data</strong> to anyone.</span>
                        </p>
                    </div>
                </section>

                {/* Section 4 */}
                <section>
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">4. Cookies and Tracking</h2>
                    <p className="text-gray-700 leading-relaxed mb-6">
                        We use cookies to enhance your experience:
                    </p>
                    <ul className="space-y-2 ml-4 mb-6">
                        <li className="text-gray-700 flex items-start gap-2">
                            <span className="text-indigo-600 font-bold">•</span>
                            <span>Make the website work properly</span>
                        </li>
                        <li className="text-gray-700 flex items-start gap-2">
                            <span className="text-indigo-600 font-bold">•</span>
                            <span>Remember your preferences</span>
                        </li>
                        <li className="text-gray-700 flex items-start gap-2">
                            <span className="text-indigo-600 font-bold">•</span>
                            <span>Understand how users use our site</span>
                        </li>
                        <li className="text-gray-700 flex items-start gap-2">
                            <span className="text-indigo-600 font-bold">•</span>
                            <span>Improve performance and content</span>
                        </li>
                    </ul>
                    <div className="bg-amber-50 border border-amber-200 rounded p-4 mb-8">
                        <p className="text-amber-800 text-sm">
                            💡 You can disable cookies in your browser settings, but some features may not work properly.
                        </p>
                    </div>

                    <div className="border-t pt-8">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">Google Analytics</h3>
                        <p className="text-gray-700 leading-relaxed mb-4">
                            We use Google Analytics to understand website traffic and user behavior.
                        </p>
                        <p className="text-gray-700 mb-2">
                            <strong>Learn more or opt out:</strong>
                        </p>
                        <ul className="space-y-2 ml-4">
                            <li>
                                <a href="https://tools.google.com/dlpage/gaoptout" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 font-medium hover:underline">
                                    Google Analytics Opt-Out →
                                </a>
                            </li>
                            <li>
                                <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 font-medium hover:underline">
                                    Google Privacy Policy →
                                </a>
                            </li>
                        </ul>
                    </div>
                </section>

                {/* Section 5 */}
                <section className="bg-linear-to-r from-green-50 to-transparent rounded-lg p-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">5. Social Media Logins</h2>
                    <p className="text-gray-700 leading-relaxed mb-4">
                        If you sign in using Google, Facebook, or other social media accounts, we receive basic profile information from them.
                    </p>
                    <p className="text-gray-700 leading-relaxed mb-4">
                        We use this information only to manage your account and provide you with a seamless login experience.
                    </p>
                    <div className="bg-blue-50 border border-blue-200 rounded p-4">
                        <p className="text-blue-800 text-sm">
                            ℹ️ We recommend checking the privacy policies of those social media platforms for more information about their data practices.
                        </p>
                    </div>
                </section>

                {/* Section 6 */}
                <section>
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">6. How Long We Keep Your Data</h2>
                    <p className="text-gray-700 leading-relaxed mb-4">
                        We keep your information <span className="font-semibold">only as long as needed</span> to provide our services or meet legal requirements.
                    </p>
                    <div className="bg-gray-50 border border-gray-200 rounded p-6">
                        <p className="text-gray-700">
                            Typically, your data is deleted within <span className="font-semibold text-gray-900">6 months after your account is closed</span>, unless applicable laws require us to retain it longer.
                        </p>
                    </div>
                </section>

                {/* Section 7 */}
                <section className="bg-linear-to-r from-blue-50 to-transparent rounded-lg p-8">
                    <div className="flex items-start gap-3 mb-6">
                        <Lock className="w-6 h-6 text-blue-600 shrink-0 mt-1" />
                        <h2 className="text-2xl font-bold text-gray-900">7. How We Protect Your Data</h2>
                    </div>
                    <p className="text-gray-700 leading-relaxed mb-4 ml-9">
                        We use industry-standard security measures to protect your information. However, no online system is 100% secure, so we cannot guarantee absolute security.
                    </p>
                    <div className="bg-yellow-50 border border-yellow-200 rounded p-4 ml-9">
                        <p className="text-yellow-800 text-sm">
                            🔒 Please use our services only from a secure device and network to help protect your account.
                        </p>
                    </div>
                </section>

                {/* Section 8 */}
                <section>
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">8. Children's Privacy</h2>
                    <div className="bg-purple-50 border-l-4 border-purple-600 p-6 rounded">
                        <p className="text-purple-900 font-semibold mb-2">Age Restriction</p>
                        <p className="text-purple-800">
                            Our services are <span className="font-semibold">not intended for users under 18 years old</span>.
                        </p>
                        <p className="text-purple-800 mt-3">
                            If we discover that we have collected data from a minor, we will delete it immediately.
                        </p>
                    </div>
                </section>

                {/* Section 9 */}
                <section className="bg-linear-to-r from-orange-50 to-transparent rounded-lg p-8">
                    <div className="flex items-start gap-3 mb-6">
                        <Users className="w-6 h-6 text-orange-600 shrink-0 mt-1" />
                        <h2 className="text-2xl font-bold text-gray-900">9. Your Privacy Rights</h2>
                    </div>
                    <p className="text-gray-700 leading-relaxed mb-6 ml-9">
                        Depending on your location, you may have the right to:
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 ml-9">
                        <div className="flex items-start gap-3">
                            <span className="text-orange-600 font-bold">●</span>
                            <span className="text-gray-700">View your personal data</span>
                        </div>
                        <div className="flex items-start gap-3">
                            <span className="text-orange-600 font-bold">●</span>
                            <span className="text-gray-700">Update or correct your information</span>
                        </div>
                        <div className="flex items-start gap-3">
                            <span className="text-orange-600 font-bold">●</span>
                            <span className="text-gray-700">Delete your account and data</span>
                        </div>
                        <div className="flex items-start gap-3">
                            <span className="text-orange-600 font-bold">●</span>
                            <span className="text-gray-700">Withdraw consent</span>
                        </div>
                        <div className="flex items-start gap-3">
                            <span className="text-orange-600 font-bold">●</span>
                            <span className="text-gray-700">Stop receiving promotional emails</span>
                        </div>
                    </div>
                    <div className="mt-8 ml-9">
                        <p className="text-gray-700 font-semibold mb-2">To exercise your rights, contact us:</p>
                        <a href="mailto:customercare@collidedgalaxies.com" className="inline-block text-blue-600 hover:text-blue-800 font-medium hover:underline">
                            📧 customercare@collidedgalaxies.com
                        </a>
                    </div>
                </section>

                {/* Section 10 */}
                <section>
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">10. Do Not Track (DNT)</h2>
                    <p className="text-gray-700 leading-relaxed mb-4">
                        Some browsers have a "Do Not Track" option.
                    </p>
                    <div className="bg-gray-50 border border-gray-200 rounded p-4">
                        <p className="text-gray-700">
                            Currently, we do not respond to these signals because there is no universal standard system in place for handling them. However, you can manage your privacy preferences through browser settings and our privacy tools.
                        </p>
                    </div>
                </section>

                {/* Section 11 */}
                <section className="bg-linear-to-r from-cyan-50 to-transparent rounded-lg p-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">11. International Users</h2>
                    <p className="text-gray-700 leading-relaxed">
                        If you are located outside India, your information may still be processed according to this privacy policy and applicable local laws in your jurisdiction.
                    </p>
                </section>

                    <hr />

                {/* Section 12 */}
                <section>
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">12. Policy Updates</h2>
                    <p className="text-gray-700 leading-relaxed mb-4">
                        We may update this Privacy Policy from time to time to reflect changes in our practices or legal requirements.
                    </p>
                    <div className="bg-blue-50 border border-blue-200 rounded p-4">
                        <p className="text-blue-800">
                            Any changes will be posted on this page with a new <span className="font-semibold">"Last Updated"</span> date. We recommend reviewing this policy periodically to stay informed about how we protect your privacy.
                        </p>
                    </div>
                </section>

                {/* Section 13 - Contact Footer */}
                <section className="bg-linear-to-r from-gray-900 to-gray-800 rounded-lg p-8 md:p-12 text-white">
                    <h2 className="text-2xl font-bold mb-6">Get In Touch</h2>
                    <div className="space-y-4">
                        <div>
                            <p className="text-gray-300 text-sm font-semibold mb-2">Company Address</p>
                            <p className="text-white leading-relaxed">
                                CollidedGalaxies<br />
                                2/224, Maruthi Nagar, First Cross<br />
                                Zuzuwadi, Hosur<br />
                                Tamil Nadu – 635126<br />
                                India
                            </p>
                        </div>
                        <div className="border-t border-gray-700 pt-4 mt-4">
                            <p className="text-gray-300 text-sm font-semibold mb-2">Contact Email</p>
                            <a href="mailto:customercare@collidedgalaxies.com" className="inline-block text-blue-300 hover:text-blue-200 font-medium hover:underline transition">
                                📧 customercare@collidedgalaxies.com
                            </a>
                        </div>
                    </div>
                </section>
            </div>
        </PolicyLayout>
    );
}