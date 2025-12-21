"use client";

import React from "react";
import { useEffect, useState, useRef } from "react";
import { Albert_Sans } from "next/font/google";
import Navbar from "../../../src/components/header";
import Footer from "../../../src/components/footer";
import { useAuth, db } from "../../../src/context/authProvider";
import AddressModal from "@/src/components/forms/addressModal";
import EditProfileModal from "@/src/components/forms/editDetailsModal";
import { AddressFormData } from "@/src/server/models/address.model";
import {
	doc,
	getDoc,
	updateDoc,
	setDoc,
	serverTimestamp
} from "firebase/firestore";
import Link from "next/link";

const albertSans = Albert_Sans({
	subsets: ["latin"],
	weight: ["400", "500", "700"],
});

type Section = "personal" | "address";

export default function ProfilePage() {
	const { user, loading } = useAuth();
	const [activeSection, setActiveSection] = useState<Section | null>(null);
	const [isMounted, setIsMounted] = useState(false);
	const [addresses, setAddresses] = useState<AddressFormData[]>([]);
	const [fetchingAddresses, setFetchingAddresses] = useState(false);
	const [showAddressModal, setShowAddressModal] = useState(false);
	const [showProfileModal, setShowProfileModal] = useState(false);
	const [editingIndex, setEditingIndex] = useState<number | null>(null);
	const [isInitialLoad, setIsInitialLoad] = useState(true);
	const hasSetInitialSection = useRef(false);

	const [profileData, setProfileData] = useState({
		displayName: "",
		email: "",
		phoneNumber: "",
	});

	useEffect(() => {
		setIsMounted(true);

		// Set default section to "personal" on large screens
		const handleResize = () => {
			if (window.innerWidth >= 768 && activeSection === null) {
				setActiveSection("personal");
			}
		};

		// Check on mount
		if (!hasSetInitialSection.current) {
			handleResize();
			hasSetInitialSection.current = true;
		}

		// Listen for resize events
		window.addEventListener('resize', handleResize);
		return () => window.removeEventListener('resize', handleResize);
	}, [activeSection]);

	useEffect(() => {
		if (user) {
			setProfileData({
				displayName: user.displayName || "",
				email: user.email || "",
				phoneNumber: user.phoneNumber || "",
			});
		}
	}, [user]);

	// Load addresses from Firebase (initial load only)
	useEffect(() => {
		if (user && isInitialLoad) {
			fetchAddresses();
		}
	}, [user, isInitialLoad]);

	const fetchAddresses = async () => {
		if (!user) return;

		setFetchingAddresses(true);
		try {
			const userDoc = await getDoc(doc(db, 'users', user.uid));
			if (userDoc.exists()) {
				const userData = userDoc.data();
				if (userData.addresses && Array.isArray(userData.addresses)) {
					setAddresses(userData.addresses);
				}
				// Load phone number if it exists
				if (userData.phoneNumber) {
					setProfileData(prev => ({
						...prev,
						phoneNumber: userData.phoneNumber
					}));
				}
				// Load name if it exists
				if (userData.name) {
					setProfileData(prev => ({
						...prev,
						displayName: userData.name
					}));
				}
			} else {
				// Create user document if it doesn't exist
				await setDoc(doc(db, 'users', user.uid), {
					uid: user.uid,
					email: user.email,
					name: user.displayName || user.email,
					phoneNumber: user.phoneNumber || '',
					addresses: [],
					createdAt: serverTimestamp(),
					updatedAt: serverTimestamp()
				});
			}
			setIsInitialLoad(false);
		} catch (err) {
			console.error("Error fetching addresses:", err);
			setIsInitialLoad(false);
		} finally {
			setFetchingAddresses(false);
		}
	};

	// Save addresses to Firebase whenever they change (after initial load)
	useEffect(() => {
		if (user && !isInitialLoad && addresses.length >= 0) {
			saveAddresses();
		}
	}, [addresses, user, isInitialLoad]);

	const saveAddresses = async () => {
		if (!user) return;

		try {
			const userRef = doc(db, 'users', user.uid);
			await updateDoc(userRef, {
				addresses: addresses,
				updatedAt: serverTimestamp()
			});
			console.log('✅ Addresses saved to Firebase');
		} catch (error) {
			console.error('❌ Error saving addresses:', error);
		}
	};

	const handleSaveAddress = (address: AddressFormData) => {
		if (editingIndex !== null) {
			// Update existing address
			const updated = [...addresses];
			updated[editingIndex] = address;
			setAddresses(updated);
			setEditingIndex(null);
		} else {
			// Add new address
			setAddresses([...addresses, address]);
		}
		setShowAddressModal(false);
	};

	const handleSaveProfile = async (profile: { displayName: string; email: string; phoneNumber: string }) => {
		if (!user) return;

		try {
			// Update user document in Firestore
			const userRef = doc(db, 'users', user.uid);

			// Check if document exists
			const userDoc = await getDoc(userRef);

			if (userDoc.exists()) {
				// Update existing document
				await updateDoc(userRef, {
					name: profile.displayName,
					phoneNumber: profile.phoneNumber,
					updatedAt: serverTimestamp()
				});
			} else {
				// Create new document if it doesn't exist
				await setDoc(userRef, {
					uid: user.uid,
					email: user.email,
					name: profile.displayName,
					phoneNumber: profile.phoneNumber,
					addresses: [],
					createdAt: serverTimestamp(),
					updatedAt: serverTimestamp()
				});
			}

			// Update local state
			setProfileData(profile);
			setShowProfileModal(false);

			alert('Profile updated successfully!');
		} catch (error) {
			console.error('Error updating profile:', error);
			alert('Failed to update profile. Please try again.');
		}
	};

	const handleEditAddress = (index: number) => {
		setEditingIndex(index);
		setShowAddressModal(true);
	};

	const handleRemoveAddress = async (index: number) => {
		if (!confirm("Are you sure you want to delete this address?")) return;

		const updated = addresses.filter((_, i) => i !== index);
		setAddresses(updated);
	};

	const openAddModal = () => {
		setEditingIndex(null);
		setShowAddressModal(true);
	};

	const remainingSlots = Math.max(0, 5 - addresses.length);

	return (
		<>
			<Navbar />
			<main className={`min-h-screen bg-white ${albertSans.className}`}>
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-30 pb-10">
					{/* Header */}
					<div className="flex flex-col md:flex-row justify-between items-center w-full pb-14">
						<h1 className="text-3xl md:text-4xl font-semibold leading-tight mb-2 md:mb-0">
							My Profile
						</h1>
						<p className="text-base md:text-lg text-gray-700 text-center md:w-[300px] md:text-right">
							Keep your personal info, contact details, and shipping addresses up to date for smoother checkouts and faster deliveries.
						</p>
					</div>

					<div className="flex flex-col md:flex-row gap-8 md:items-start">
						{/* Sidebar */}
						<div className="flex flex-col gap-8">
							<aside className={`w-full md:w-64 bg-gray-50 p-6 space-y-2 h-auto md:h-[200px] ${activeSection ? 'hidden md:block' : 'block'
								}`}>
								<h2 className="text-sm font-bold uppercase mb-4 text-gray-700">
									ACCOUNT OVERVIEW
								</h2>

								<button
									onClick={() => setActiveSection("personal")}
									className={`w-full text-left px-4 py-3 cursor-pointer flex items-center justify-between hover:bg-gray-100 transition ${activeSection === "personal" ? "bg-white border-l-4 border-black font-medium" : ""
										}`}
								>
									<span>Personal Information</span>
									<span>›</span>
								</button>

								<button
									onClick={() => setActiveSection("address")}
									className={`w-full text-left px-4 py-3 cursor-pointer flex items-center justify-between hover:bg-gray-100 transition ${activeSection === "address" ? "bg-white border-l-4 border-black font-medium" : ""
										}`}
								>
									<span>Address Book</span>
									<span>›</span>
								</button>
							</aside>

							<aside className="w-full hidden md:block md:w-64 bg-gray-50 p-6 space-y-2 h-auto">
								<h2 className="text-sm font-bold uppercase mb-4 text-gray-700">
									Help & Policies
								</h2>

								<Link
									href="/policies/shipping"
									className="w-full text-left px-4 py-3 cursor-pointer flex items-center justify-between hover:bg-gray-100 transition"
								>
									<span>Shipping Policy</span>
								</Link>

								<Link
									href="/policies/return-and-refund"
									className="w-full text-left px-4 py-3 cursor-pointer flex items-center justify-between hover:bg-gray-100 transition"
								>
									<span>Return & Refund Policy</span>
								</Link>

								<Link
									href="/policies/privacy-policy"
									className="w-full text-left px-4 py-3 cursor-pointer flex items-center justify-between hover:bg-gray-100 transition"
								>
									<span>Privacy Policy</span>
								</Link>

								<Link
									href="/policies/terms-and-conditions"
									className="w-full text-left px-4 py-3 cursor-pointer flex items-center justify-between hover:bg-gray-100 transition"
								>
									<span>Terms & Conditions</span>
								</Link>
							</aside>
						</div>

						{/* Main Content */}
						<div className={`flex-1 ${activeSection ? 'block' : 'hidden md:block'}`}>
							{loading && <p>Checking authentication...</p>}
							{!loading && !user && <p>Please log in to view your profile.</p>}

							{user && (
								<>
									{/* Personal Information Section */}
									{activeSection === "personal" && (
										<section>
											<button
												onClick={() => setActiveSection(null)}
												className="flex items-center gap-2 mb-6 md:hidden hover:text-gray-600"
											>
												<span>←</span>
												<span>Back</span>
											</button>

											<h2 className="text-2xl md:text-3xl font-bold mb-4">MY DETAILS</h2>
											<p className="text-gray-600 mb-8">
												Feel free to edit any of your details below so your account is up to date.
											</p>

											<div className="bg-gray-50 p-6 rounded space-y-4">
												<h3 className="text-xl font-bold mb-4">DETAILS</h3>
												<div className="space-y-2">
													<p className="text-gray-800">{profileData.displayName || "Not provided"}</p>
													<p className="text-gray-800">{profileData.email || "Not provided"}</p>
													<p className="text-gray-800">{profileData.phoneNumber || "Not provided"}</p>
												</div>
												<button
													onClick={() => setShowProfileModal(true)}
													className="underline text-sm cursor-pointer font-medium mt-4 hover:text-gray-600"
												>
													EDIT
												</button>
											</div>
										</section>
									)}

									{/* Address Book Section */}
									{activeSection === "address" && (
										<section>
											<button
												onClick={() => setActiveSection(null)}
												className="flex items-center gap-2 mb-6 md:hidden hover:text-gray-600"
											>
												<span>←</span>
												<span>Back</span>
											</button>

											<h2 className="text-2xl md:text-3xl font-bold mb-4">ADDRESS BOOK</h2>
											<p className="text-gray-600 mb-8">
												You have <span className="font-semibold">{remainingSlots}/5 address slots</span> remaining.
											</p>

											{fetchingAddresses && <p>Loading addresses...</p>}

											<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
												{/* New Address Card */}
												{remainingSlots > 0 && (
													<div
														onClick={openAddModal}
														className="border-2 border-dashed border-gray-300 p-8 flex items-center justify-center hover:border-gray-400 cursor-pointer transition"
													>
														<div className="text-center">
															<div className="text-4xl mb-2">+</div>
															<div className="font-medium">New Address</div>
														</div>
													</div>
												)}

												{/* Address Cards */}
												{addresses.map((address, index) => (
													<div key={index} className="border border-gray-300 p-6 relative">
														<h4 className="font-bold mb-2">
															{address.firstName} {address.lastName}
														</h4>
														<p className="text-sm text-gray-700 mb-4">
															{address.streetAddress}
															{address.landmark && `, ${address.landmark}`}
															<br />
															{address.city}, {address.state}, {address.pincode}
															<br />
															{address.mobileNumber}
														</p>
														<div className="flex gap-4 text-sm">
															<button
																onClick={() => handleEditAddress(index)}
																className="underline cursor-pointer hover:text-gray-600"
															>
																Edit
															</button>
															<button
																onClick={() => handleRemoveAddress(index)}
																className="underline cursor-pointer hover:text-gray-600"
															>
																Remove
															</button>
														</div>
													</div>
												))}

												{!fetchingAddresses && addresses.length === 0 && remainingSlots === 5 && (
													<div className="col-span-full text-center py-8">
														<p className="text-gray-500 mb-4">No addresses added yet.</p>
													</div>
												)}
											</div>
										</section>
									)}
								</>
							)}
						</div>
						<aside className="w-full md:hidden md:w-64 bg-gray-50 p-6 space-y-2 h-auto">
							<h2 className="text-sm font-bold uppercase mb-4 text-gray-700">
								Help & Policies
							</h2>

							<Link
								href="/policies/shipping"
								className="w-full text-left px-4 py-3 cursor-pointer flex items-center justify-between hover:bg-gray-100 transition"
							>
								<span>Shipping Policy</span>
							</Link>

							<Link
								href="/policies/return-and-refund"
								className="w-full text-left px-4 py-3 cursor-pointer flex items-center justify-between hover:bg-gray-100 transition"
							>
								<span>Return & Refund Policy</span>
							</Link>

							<Link
								href="/policies/privacy-policy"
								className="w-full text-left px-4 py-3 cursor-pointer flex items-center justify-between hover:bg-gray-100 transition"
							>
								<span>Privacy Policy</span>
							</Link>

							<Link
								href="/policies/terms-and-conditions"
								className="w-full text-left px-4 py-3 cursor-pointer flex items-center justify-between hover:bg-gray-100 transition"
							>
								<span>Terms & Conditions</span>
							</Link>
						</aside>
					</div>
				</div>

				{/* Address Modal */}
				<AddressModal
					isOpen={showAddressModal}
					onClose={() => {
						setShowAddressModal(false);
						setEditingIndex(null);
					}}
					onSave={handleSaveAddress}
					initialData={editingIndex !== null ? addresses[editingIndex] : undefined}
				/>

				{/* Edit Profile Modal */}
				<EditProfileModal
					isOpen={showProfileModal}
					onClose={() => setShowProfileModal(false)}
					onSave={handleSaveProfile}
					initialData={profileData}
				/>
			</main>
			<Footer />
		</>
	);
}