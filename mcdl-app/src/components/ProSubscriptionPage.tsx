import React, { useState, useEffect } from "react";
import { auth, db } from "../config/firebase";
import {
	collection,
	query,
	where,
	getDocs,
	doc,
	addDoc,
	getDoc,
	onSnapshot,
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";

const ProSubscriptionPage = () => {
	const [productData, setProductData] = useState(null);
	const [monthlyPrice, setMonthlyPrice] = useState(null);
	const [annualPrice, setAnnualPrice] = useState(null);
	const [user, setUser] = useState(null);
	const [loadingPriceId, setLoadingPriceId] = useState(null);
	const [isPremium, setIsPremium] = useState(false);

	// check if the current user has active subscription
	// Check current user's subscription status
	const checkPremiumStatus = async () => {
		if (!user) {
			console.log("User signed out");
			return;
		}
		try {
			const currentCustomerRef = doc(db, "customers", user.uid);
			const docSnap = await getDoc(currentCustomerRef);
			if (docSnap.exists()) {
				// Use getDocs to fetch subscription documents
				const subscriptionsRef = collection(
					currentCustomerRef,
					"subscriptions",
				);
				// Optionally filter for active subscriptions directly:
				const activeQuery = query(
					subscriptionsRef,
					where("status", "==", "active"),
				);
				const subscriptionsSnapshot = await getDocs(activeQuery);

				// If there's at least one active subscription, mark user as premium.
				if (!subscriptionsSnapshot.empty) {
					setIsPremium(true);
				} else {
					setIsPremium(false);
				}
			} else {
				console.log("Current user has no Stripe instance.");
				setIsPremium(false);
			}
		} catch (error) {
			console.error("Error checking subscription status:", error);
			setIsPremium(false);
		}
	};

	useEffect(() => {
		checkPremiumStatus();
	}, [user]);

	useEffect(() => {
		const unsubscribe = onAuthStateChanged(auth, (user) => {
			if (user) {
				setUser(user);
			} else {
				setUser(null);
			}
		});
		// Cleanup the listener on component unmount
		return () => unsubscribe();
	}, []); // run only once on mount

	useEffect(() => {
		const getProducts = async () => {
			try {
				// 1. Reference the 'products' collection
				const productsRef = collection(db, "products");

				// 2. Query only active products
				const activeProductsQuery = query(
					productsRef,
					where("active", "==", true),
				);

				// 3. Execute the query
				const productSnapshot = await getDocs(activeProductsQuery);

				// 4. set states:
				productSnapshot.forEach(async (productDoc) => {
					setProductData({
						id: productDoc.id,
						...productDoc.data(),
					});

					// 5. Reference 'prices' subcollection
					const pricesRef = collection(productDoc.ref, "prices");
					const priceSnapshot = await getDocs(pricesRef);

					priceSnapshot.forEach((priceDoc) => {
						const priceData = priceDoc.data();

						// Distinguish monthly vs annual by 'interval'
						if (priceData.interval === "month") {
							setMonthlyPrice({
								id: priceDoc.id,
								...priceData,
							});
						} else if (priceData.interval === "year") {
							setAnnualPrice({
								id: priceDoc.id,
								...priceData,
							});
						}
					});
				});
			} catch (error) {
				console.error("Error fetching products:", error);
			}
		};

		getProducts();
	}, []);

	// Helper to format the Firestore price (cents) into dollars
	const formatPrice = (amount) => (amount / 100).toFixed(2);

	// Initiates Stripe Checkout using the extension’s recommended structure
	const handleSubscribe = async (priceId) => {
		try {
			if (!user?.uid) {
				alert("No user is logged in!");
				return;
			}
			setLoadingPriceId(priceId);

			// Reference to the customer's checkout_sessions subcollection
			const checkoutSessionsRef = collection(
				db,
				"customers",
				user.uid,
				"checkout_sessions",
			);

			// Create a new checkout session doc
			const docRef = await addDoc(checkoutSessionsRef, {
				price: priceId,
				success_url: window.location.origin,
				cancel_url: window.location.origin,
			});

			// Listen for updates (Stripe extension will add the checkout URL)
			onSnapshot(docRef, (snap) => {
				const { error, url } = snap.data() || {};
				if (error) {
					alert(`An error occurred: ${error.message}`);
					setLoadingPriceId(null);
				}
				if (url) {
					// Redirect to Stripe Checkout
					window.location.assign(url);
				}
			});
		} catch (err) {
			setLoadingPriceId(null);
			console.error("Error creating checkout session:", err);
		}
	};

	return (
		<section
			className="bg-dark text-light py-5"
			style={{ minHeight: "100vh" }}
		>
			<div className="container">
				{isPremium && (
					<h4 className="text-center display-4 mb-4">
						You are already subscribed to DocIt Pro, yay!
					</h4>
				)}
				{/* Page Heading */}
				<h1 className="text-center display-4 mb-4">Unlock DocIt Pro</h1>
				<p className="lead text-center mb-5">
					Subscribe to DocIt Pro and get unlimited AI access plus the
					ability to request new features.
				</p>

				{/* Show product name/description from Firestore (optional) */}
				{productData && (
					<div className="text-center mb-5">
						<h2>{productData.name}</h2>
						<p>{productData.description}</p>
					</div>
				)}

				<div className="row justify-content-center">
					{/* Monthly Plan Card */}
					<div className="col-md-6 col-lg-4">
						<div className="card text-center border border-success border-5 shadow-lg">
							<div className="card-header bg-success text-dark">
								<h3 className="card-title m-0">
									DocIt Pro Monthly Plan
								</h3>
							</div>
							<div className="card-body bg-dark text-white">
								{monthlyPrice ? (
									<h4 className="card-price">
										${formatPrice(monthlyPrice.unit_amount)}
										/month
									</h4>
								) : (
									<h4 className="card-price">Loading...</h4>
								)}
								<ul className="list-unstyled my-4">
									<li className="mb-2">
										Unlimited AI Access
									</li>
								</ul>
								<button
									className="btn btn-success btn-lg"
									disabled={
										!monthlyPrice ||
										loadingPriceId === monthlyPrice?.id
									}
									onClick={() =>
										handleSubscribe(monthlyPrice?.id)
									}
								>
									{loadingPriceId === monthlyPrice?.id
										? "Loading..."
										: "Subscribe Now"}
								</button>
							</div>
						</div>
					</div>

					{/* Annual Plan Card */}
					<div className="col-md-6 col-lg-4">
						<div className="card text-center border border-danger border-5 shadow-lg">
							<div className="card-header bg-danger text-dark">
								<h3 className="card-title m-0">
									DocIt Pro Annual Plan
								</h3>
							</div>
							<div className="card-body bg-dark text-white">
								{annualPrice ? (
									<h4 className="card-price">
										${formatPrice(annualPrice.unit_amount)}
										/year
									</h4>
								) : (
									<h4 className="card-price">Loading...</h4>
								)}
								<ul className="list-unstyled my-4">
									<li className="mb-2">
										20% Discount Over Monthly Plan
									</li>
								</ul>
								<button
									className="btn btn-danger btn-lg"
									disabled={
										!monthlyPrice ||
										loadingPriceId === monthlyPrice?.id
									}
									onClick={() =>
										handleSubscribe(annualPrice?.id)
									}
								>
									{loadingPriceId === monthlyPrice?.id
										? "Loading..."
										: "Subscribe Now"}
								</button>
							</div>
						</div>
					</div>
				</div>
			</div>
		</section>
	);
};

export default ProSubscriptionPage;
