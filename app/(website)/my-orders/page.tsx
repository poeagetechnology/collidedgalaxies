"use client";

import React from "react";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Navbar from "../../../src/components/header";
import Footer from "../../../src/components/footer";
import { useAuth, db } from "../../../src/context/authProvider";
import { collection, query, where, orderBy, onSnapshot } from "firebase/firestore";
import TrackOrderModal from "@/src/components/modals/trackOrderModal";
import GuestAccessModal from "@/src/components/modals/guestAccessModal";
import { useRouter } from "next/navigation";
import Image from "next/image";

// Order status configuration
const ORDER_STATUSES = {
	pending: { label: "Pending", color: "bg-yellow-100 text-yellow-800" },
	processing: { label: "Processing", color: "bg-blue-100 text-blue-800" },
	shipped: { label: "Shipped", color: "bg-purple-100 text-purple-800" },
	delivered: { label: "Delivered", color: "bg-green-100 text-green-800" },
	cancelled: { label: "Cancelled", color: "bg-red-100 text-red-800" },
};

export default function OrdersPage() {
	const { user, loading } = useAuth();
	const [orders, setOrders] = useState<any[]>([]);
	const [fetching, setFetching] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [activeTab, setActiveTab] = useState<"current" | "previous">("current");
	const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
	const [showTrackModal, setShowTrackModal] = useState(false);
	const [guestUID, setGuestUID] = useState<string | null>(null);
	const [guestName, setGuestName] = useState<string | null>(null);
	const [showGuestAccessModal, setShowGuestAccessModal] = useState(false);
	const [isGuestAccess, setIsGuestAccess] = useState(false);
	const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);
	const router = useRouter();

	// Load guest UID from localStorage and show modal if needed
	useEffect(() => {
		// Only initialize on client side
		if (typeof window === 'undefined') return;

		const storedUID = localStorage.getItem('guestUID');
		const storedName = localStorage.getItem('guestName');

		if (storedUID) {
			setGuestUID(storedUID);
			if (storedName) setGuestName(storedName);
			setIsGuestAccess(true);
		} else {
			setShowGuestAccessModal(false);
		}
	}, []);

	// Real-time listener for orders
	useEffect(() => {
		// Determine which ID to use (logged in user or guest)
		const userIdToUse = user?.uid || guestUID;

		if (!userIdToUse) {
			setOrders([]);
			return;
		}

		setFetching(true);
		setError(null);

		try {
			const ordersRef = collection(db, "orders");
			const q = query(
				ordersRef,
				where("userId", "==", userIdToUse),
				orderBy("createdAt", "desc")
			);

			// Set up real-time listener
			const unsubscribe = onSnapshot(
				q,
				(snapshot) => {
					const data = snapshot.docs.map((d) => {
						const raw = d.data() as any;

						return {
							id: d.id,
							...raw,
							paymentStatus: raw.paymentStatus || (raw.paymentMode === "online" ? "paid" : "pending"),
						};
					});
					setOrders(data);
					setFetching(false);
				},
				(err) => {

					setError("Unable to load orders. Try again later.");
					setFetching(false);
				}
			);

			// Cleanup listener on unmount
			return () => unsubscribe();
		} catch (err) {
			setError("Unable to load orders. Try again later.");
			setFetching(false);
		}
	}, [user, guestUID]);

	const currentOrders = orders.filter(
		(order) => !order.status || ["pending", "processing", "shipped"].includes(order.status)
	);
	const previousOrders = orders.filter(
		(order) => order.status && ["delivered", "cancelled"].includes(order.status)
	);

	const displayedOrders = activeTab === "current" ? currentOrders : previousOrders;

	const getStatusInfo = (status: string) => {
		return ORDER_STATUSES[status as keyof typeof ORDER_STATUSES] || {
			label: status || "Unknown",
			color: "bg-gray-100 text-gray-800"
		};
	};

	const handleTrackOrder = (order: any) => {
		setSelectedOrder(order);
		setShowTrackModal(true);
	};

	const handleGuestAccessSuccess = (guestUID: string, guestName: string | null) => {
		setGuestUID(guestUID);
		if (guestName) setGuestName(guestName);
		setIsGuestAccess(true);
		setShowGuestAccessModal(false);
	};

	const handleSignUpClick = (phone: string) => {
		// Store phone in sessionStorage so signup form can access it
		if (phone) {
			sessionStorage.setItem('guestPhone', phone);
		}
		router.push('/signin?mode=signup');
	};

	const handleLogout = () => {
		localStorage.removeItem('guestUID');
		localStorage.removeItem('guestName');
		localStorage.removeItem('guestPhoneNumber');
		setGuestUID(null);
		setGuestName(null);
		setIsGuestAccess(false);
		setOrders([]);
	};

	return (
		<>
			<Navbar />
			<motion.main 
				className="min-h-screen bg-white"
				initial={{ opacity: 0 }}
				animate={{ opacity: 1 }}
				transition={{ duration: 0.5 }}
			>
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-12 md:pt-30 pb-14">
					{/* Header */}
					<motion.div 
						className="flex flex-col md:flex-row justify-between items-center w-full pb-14"
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.5 }}
					>
						<motion.h1 
							className="text-3xl md:text-4xl font-semibold leading-tight mb-2 md:mb-0"
							initial={{ opacity: 0, x: -20 }}
							animate={{ opacity: 1, x: 0 }}
							transition={{ duration: 0.5, delay: 0.1 }}
						>
							My Orders
						</motion.h1>
						<motion.p 
							className="text-base md:text-lg text-gray-700 text-center md:w-75 md:text-right"
							initial={{ opacity: 0, x: 20 }}
							animate={{ opacity: 1, x: 0 }}
							transition={{ duration: 0.5, delay: 0.2 }}
						>
							Stay informed about your purchases with detailed order timelines and status updates.
						</motion.p>
					</motion.div>

					<motion.div 
						className="mb-4 p-3 bg-orange-50 border border-orange-200 text-sm text-orange-800"
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						transition={{ duration: 0.5, delay: 0.3 }}
					>
						<strong>Need to cancel your order?</strong> {" "}
						Please reach out to us via Instagram DM, phone, or the Contact Us page.
						Cancellations cannot be made directly through the website.
					</motion.div>


					{loading && <p>Checking authentication...</p>}
					{!loading && !user && !guestUID && (
						<GuestAccessModal
							onSuccess={handleGuestAccessSuccess}
							onSignUpClick={handleSignUpClick}
						/>
					)}

					{(user || guestUID) && (
						<motion.section
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							transition={{ duration: 0.5, delay: 0.4 }}
						>
							{/* Guest Access Info Header */}
							{isGuestAccess && !user && (
								<motion.div
									className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded flex justify-between items-center"
									initial={{ opacity: 0 }}
									animate={{ opacity: 1 }}
								>
									<div>
										<p className="text-sm text-blue-800">
											<strong>Guest Access</strong> - Viewing as {guestName || 'Guest'}
										</p>
										<p className="text-xs text-blue-700 mt-1">
											Create an account to save your profile and checkout faster
										</p>
									</div>
									<div className="flex gap-2">
										<button
											onClick={() => handleSignUpClick(localStorage.getItem('guestPhoneNumber') || '')}
											className="px-3 py-1 bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 rounded transition"
										>
											Sign Up
										</button>
										<button
											onClick={handleLogout}
											className="px-3 py-1 bg-gray-300 text-gray-800 text-sm font-medium hover:bg-gray-400 rounded transition"
										>
											Logout
										</button>
									</div>
								</motion.div>
							)}

							{/* Tabs */}
							<motion.div 
								className="flex border-b mb-6"
								initial={{ opacity: 0 }}
								animate={{ opacity: 1 }}
								transition={{ duration: 0.5 }}
							>
								<motion.button
									onClick={() => setActiveTab("current")}
									className={`px-6 py-3 font-medium cursor-pointer ${activeTab === "current"
										? "border-b-2 border-black text-black"
										: "text-gray-500 hover:text-gray-700"
										}`}
									whileHover={{ scale: 1.05 }}
									whileTap={{ scale: 0.95 }}
								>
									Current Orders ({currentOrders.length})
								</motion.button>
								<motion.button
									onClick={() => setActiveTab("previous")}
									className={`px-6 py-3 font-medium cursor-pointer ${activeTab === "previous"
										? "border-b-2 border-black text-black"
										: "text-gray-500 hover:text-gray-700"
										}`}
									whileHover={{ scale: 1.05 }}
									whileTap={{ scale: 0.95 }}
								>
									Previous Orders ({previousOrders.length})
								</motion.button>
							</motion.div>

							{fetching && <p>Loading orders...</p>}
							{error && <p className="text-red-600">{error}</p>}

							{!fetching && displayedOrders.length === 0 && (
								<div className="flex flex-col items-center justify-center py-16 px-4">
									<div className="mb-6">
										<Image
											src="/cartIcon.svg"        // <-- replace with your image path
											alt="Cart Icon"
											width={60}                   // similar size to text-6xl
											height={60}
											className="mx-auto object-contain"
										/>
									</div>

									<h3 className="text-2xl text-center font-semibold mb-3 text-gray-800">
										{activeTab === "current"
											? "Nothing here but tumbleweeds! 🌵"
											: "Your order history is gathering dust! 🕸️"}
									</h3>
									<p className="text-gray-600 mb-8 text-center max-w-md">
										{activeTab === "current"
											? "Looks like you haven't ordered anything yet. Time to treat yourself!"
											: "No completed orders yet. Your shopping adventure awaits!"}
									</p>
									<button
										className="w-50 md:w-125 py-2 border cursor-pointer border-black font-semibold text-base hover:bg-gray-100"
										onClick={() => { router.push("/products") }}
									>
										Continue Shopping
									</button>
								</div>
							)}

							{displayedOrders.length > 0 && (
								<section>
									<ul className="space-y-4">
										{displayedOrders.map((order) => {
											const created = order.createdAt && typeof order.createdAt.toDate === "function"
												? order.createdAt.toDate()
												: order.createdAt && order.createdAt.seconds
													? new Date(order.createdAt.seconds * 1000)
													: null;

											const statusInfo = getStatusInfo(order.status);
											const isExpanded = expandedOrderId === order.id;

											return (
												<li key={order.id} className="border border-gray-300 shadow-sm">
													{/* Order Header - Always Visible */}
													<div className="p-6 bg-white">
														<div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-0">
															<div className="flex-1 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
																<div>
																	<div className="text-sm text-gray-500 mb-1">Order ID</div>
																	<div className="font-semibold text-base break-all">
																		{order.cashfreeOrderId || order.id}
																	</div>
																</div>
																<div>
																	<div className="text-sm text-gray-500 mb-1">Order Date</div>
																	<div className="text-sm text-gray-800">
																		{created ? created.toLocaleString('en-IN', {
																			year: 'numeric',
																			month: 'short',
																			day: 'numeric',
																			hour: '2-digit',
																			minute: '2-digit'
																		}) : "—"}
																	</div>
																</div>
																<div>
																	<div className="text-sm text-gray-500 mb-1">Amount</div>
																	<div className="font-semibold text-base">
																		₹{Number(order.amount || 0).toFixed(2)}
																	</div>
																</div>
																<div>
																	<div className="text-sm text-gray-500 mb-1">Payment</div>
																	<div className="text-sm font-medium">
																		{order.paymentMode === 'COD' ? '💳 Cash on Delivery' : '💰 Online Payment'}
																	</div>
																</div>
															</div>

															<div className="flex items-center gap-2 flex-wrap">
																<div className="flex flex-col sm:flex-row gap-2">
																	<span className={`px-3 py-1 text-xs font-medium ${statusInfo.color}`}>
																		{statusInfo.label}
																	</span>
																	{order.paymentStatus && (
																		<span
																			className={`text-xs px-2 py-1 ${order.paymentStatus === "Paid" || order.paymentStatus === "paid"
																				? "bg-green-100 text-green-700"
																				: "bg-yellow-100 text-yellow-700"
																				}`}
																		>
																			{order.paymentStatus === "Paid" || order.paymentStatus === "paid" ? "PAID" : "PENDING"}
																		</span>
																	)}
																</div>
														<button
															onClick={() => setExpandedOrderId(isExpanded ? null : order.id)}
															className="px-4 py-2 bg-black text-white text-sm font-medium hover:bg-gray-800 transition-colors cursor-pointer"
														>
															{isExpanded ? 'Hide Details' : 'View Details'}
														</button>
													</div>
												</div>
													</div>

													{/* Order Details - Expandable */}
													{isExpanded && (
														<div className="border-t border-gray-200 p-6 bg-gray-50">
															{/* Customer Information */}
															<div className="mb-6">
																<h3 className="text-lg font-semibold mb-3 text-gray-900">Customer Information</h3>
																<div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-white p-4 rounded border border-gray-200">
																	<div>
																		<span className="text-sm text-gray-600">Name: </span>
																		<span className="font-medium">{order.customerName || 'N/A'}</span>
																	</div>
																	<div>
																		<span className="text-sm text-gray-600">Phone: </span>
																		<span className="font-medium">{order.phoneNumber || 'N/A'}</span>
																	</div>
																	<div>
																		<span className="text-sm text-gray-600">Email: </span>
																		<span className="font-medium text-blue-600">{order.userEmail || 'N/A'}</span>
																	</div>
																</div>
															</div>

															{/* Delivery Address */}
															{order.address && (
																<div className="mb-6">
																	<h3 className="text-lg font-semibold mb-3 text-gray-900">Delivery Address</h3>
																	<div className="bg-white p-4 rounded border border-gray-200">
																		<p className="text-sm mb-2">
																			<span className="text-gray-600">{order.address.firstName} {order.address.lastName}</span>
																		</p>
																		<p className="text-sm text-gray-700 mb-1">{order.address.address}</p>
																		<p className="text-sm text-gray-700">
																			{order.address.city}, {order.address.state} {order.address.postalCode}
																		</p>
																		<p className="text-sm text-gray-700 mt-2">
																			<span className="font-medium">Phone:</span> {order.address.mobileNumber}
																		</p>
																	</div>
																</div>
															)}

															{/* Order Items */}
															{order.items && order.items.length > 0 && (
																<div className="mb-6">
																	<h3 className="text-lg font-semibold mb-3 text-gray-900">Items Ordered ({order.totalProducts})</h3>
																	<div className="space-y-3">
																		{order.items.map((item: any, idx: number) => (
																			<div key={idx} className="bg-white p-4 rounded border border-gray-200 flex gap-4">
																				{/* Product Image */}
																				{item.image && (
																					<div className="w-20 h-20 shrink-0">
																						<Image
																							src={item.image}
																							alt={item.title || 'Product'}
																							width={80}
																							height={80}
																							className="w-full h-full object-cover rounded"
																						/>
																					</div>
																				)}

																				{/* Product Details */}
																				<div className="flex-1">
																					<h4 className="font-semibold text-gray-900">{item.title || 'Product'}</h4>
																					<div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-2 text-sm">
																						<div>
																							<span className="text-gray-600">Qty: </span>
																							<span className="font-medium">{item.quantity}</span>
																						</div>
																						<div>
																							<span className="text-gray-600">Price: </span>
																							<span className="font-medium">₹{Number(item.price || 0).toFixed(2)}</span>
																						</div>
																						{item.size && (
																							<div>
																								<span className="text-gray-600">Size: </span>
																								<span className="font-medium">{item.size}</span>
																							</div>
																						)}
																						{item.color && (
																							<div>
																								<span className="text-gray-600">Color: </span>
																								<span className="font-medium">
																									{typeof item.color === 'string' ? item.color : 'Selected'}
																								</span>
																							</div>
																						)}
																					</div>
																				</div>
																			</div>
																		))}
																	</div>
																</div>
															)}

															{/* Payment & Order Summary */}
															<div className="mb-6">
																<h3 className="text-lg font-semibold mb-3 text-gray-900">Order Summary</h3>
																<div className="bg-white p-4 rounded border border-gray-200 space-y-2">
																	<div className="flex justify-between text-sm">
																		<span className="text-gray-600">Subtotal:</span>
																		<span className="font-medium">₹{Number(order.amount || 0).toFixed(2)}</span>
																	</div>
																	<div className="flex justify-between text-sm border-t pt-2 mt-2">
																		<span className="font-semibold">Total Amount:</span>
																		<span className="font-semibold">₹{Number(order.amount || 0).toFixed(2)}</span>
																	</div>
																	<div className="flex justify-between text-sm border-t pt-2 mt-2">
																		<span className="text-gray-600">Payment Mode:</span>
																		<span className="font-medium">{order.paymentMode === 'COD' ? 'Cash on Delivery' : 'Online Payment'}</span>
																	</div>
																	<div className="flex justify-between text-sm">
																		<span className="text-gray-600">Payment Status:</span>
																		<span className={`font-medium ${order.paymentStatus === "Paid" || order.paymentStatus === "paid" ? 'text-green-600' : 'text-yellow-600'}`}>
																			{order.paymentStatus === "Paid" || order.paymentStatus === "paid" ? 'Paid' : 'Pending'}
																		</span>
																	</div>
																</div>
															</div>

															{/* Tracking & Action Buttons */}
															{order.trackingNumber && (
																<div className="mb-6">
																	<h3 className="text-lg font-semibold mb-3 text-gray-900">Tracking</h3>
																	<div className="bg-white p-4 rounded border border-gray-200">
																		<p className="text-sm text-gray-600 mb-1">Tracking Number:</p>
																		<p className="font-mono text-sm font-medium">{order.trackingNumber}</p>
																	</div>
																</div>
															)}
														</div>
													)}
												</li>
											);
										})}
									</ul>
								</section>
							)}
						</motion.section>
					)}
				</div>
			</motion.main>

			{/* Track Order Modal */}
			<TrackOrderModal
				isOpen={showTrackModal}
				onClose={() => {
					setShowTrackModal(false);
					setSelectedOrder(null);
				}}
				order={selectedOrder}
			/>

			<Footer />
		</>
	);
}