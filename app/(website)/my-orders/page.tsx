"use client";

import React from "react";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Navbar from "../../../src/components/header";
import Footer from "../../../src/components/footer";
import { useAuth, db } from "../../../src/context/authProvider";
import { collection, query, where, orderBy, onSnapshot } from "firebase/firestore";
import TrackOrderModal from "@/src/components/modals/trackOrderModal";
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
	const router = useRouter();

	// Real-time listener for orders
	useEffect(() => {
		if (!user) {
			setOrders([]);
			return;
		}

		setFetching(true);
		setError(null);

		try {
			const ordersRef = collection(db, "orders");
			const q = query(
				ordersRef,
				where("userId", "==", user.uid),
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
					console.error("Error fetching orders:", err);
					setError("Unable to load orders. Try again later.");
					setFetching(false);
				}
			);

			// Cleanup listener on unmount
			return () => unsubscribe();
		} catch (err) {
			console.error("Error setting up orders listener:", err);
			setError("Unable to load orders. Try again later.");
			setFetching(false);
		}
	}, [user]);

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

	return (
		<>
			<Navbar />
			<motion.main 
				className="min-h-screen bg-white"
				initial={{ opacity: 0 }}
				animate={{ opacity: 1 }}
				transition={{ duration: 0.5 }}
			>
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-30 pb-14">
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
							className="text-base md:text-lg text-gray-700 text-center md:w-[300px] md:text-right"
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
					{!loading && !user && <p>Please log in to view your orders.</p>}

					{user && (
						<motion.section
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							transition={{ duration: 0.5, delay: 0.4 }}
						>
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
										className="w-[200px] md:w-[500px] py-2 border cursor-pointer border-black font-semibold text-base hover:bg-gray-100"
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

											return (
												<li key={order.id} className="border border-gray-300 p-6 shadow-sm">
													<div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
														<div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
															<div>
																<div className="text-sm text-gray-500 mb-1">Order ID</div>
																<div className="font-semibold text-base">
																	{order.razorpayOrderId || order.id}
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
														</div>

														<div className="flex items-center gap-4">
															<div className="flex flex-col sm:flex-row gap-2 items-start sm:items-center">
																<span className={`px-3 py-1 text-xs font-medium ${statusInfo.color}`}>
																	{statusInfo.label}
																</span>
																{order.paymentStatus && (
																	<span
																		className={`text-xs px-2 py-1 ${order.paymentStatus === "paid"
																			? "bg-green-100 text-green-700"
																			: "bg-red-100 text-red-700"
																			}`}
																	>
																		{order.paymentStatus === "paid" ? "PAID" : "PAYMENT PENDING"}
																	</span>
																)}
															</div>
															<button
																onClick={() => handleTrackOrder(order)}
																className="px-4 py-2 bg-black text-white text-sm font-medium hover:bg-gray-800 transition-colors cursor-pointer"
															>
																Track Order
															</button>
														</div>
													</div>

													{/* Show tracking number if available */}
													{order.trackingNumber && (
														<div className="mt-4 pt-4 border-t border-gray-200">
															<div className="text-sm text-gray-500">Tracking Number</div>
															<div className="font-mono text-sm font-medium mt-1">
																{order.trackingNumber}
															</div>
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