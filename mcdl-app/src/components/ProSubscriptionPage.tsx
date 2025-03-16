import React, { useState, useEffect } from "react";
import { db } from "../config/firebase";
// Firebase v9+ imports
import { collection, query, where, getDocs } from "firebase/firestore";

const ProSubscriptionPage = () => {
	// State to store product & price details
	const [productData, setProductData] = useState(null);
	const [monthlyPrice, setMonthlyPrice] = useState(null);
	const [annualPrice, setAnnualPrice] = useState(null);

	useEffect(() => {
		const getProducts = async () => {
			try {
				// 1. Reference the 'products' collection
				const productsRef = collection(db, "products");

				// 2. Create a query to fetch only active products
				const activeProductsQuery = query(
					productsRef,
					where("active", "==", true),
				);

				// 3. Execute the query
				const productSnapshot = await getDocs(activeProductsQuery);

				// 4. For each product document (assuming only one):
				productSnapshot.forEach(async (productDoc) => {
					// Store product info in state
					setProductData({
						id: productDoc.id,
						...productDoc.data(),
					});
					// 5. Fetch the 'prices' subcollection from the productDoc
					const pricesRef = collection(productDoc.ref, "prices");
					const priceSnapshot = await getDocs(pricesRef);
					priceSnapshot.forEach((priceDoc) => {
						const priceData = priceDoc.data();

						// Distinguish monthly vs. annual plan by 'interval'
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
	const formatPrice = (amount) => {
		// e.g., 499 => "4.99"
		return (amount / 100).toFixed(2);
	};

	return (
		<section
			className="bg-dark text-light py-5"
			style={{ minHeight: "100vh" }}
		>
			<div className="container">
				{/* Page Heading */}
				<h1 className="text-center display-4 mb-4">Unlock DocIt Pro</h1>
				<p className="lead text-center mb-5">
					Subscribe to DocIt Pro and get unlimited AI access plus the
					ability to request new features.
				</p>
				{/* Optional: Show product name/description from Firestore */}={" "}
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
								<button className="btn btn-success btn-lg">
									Subscribe Now
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
								<button className="btn btn-danger btn-lg">
									Subscribe Now
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
