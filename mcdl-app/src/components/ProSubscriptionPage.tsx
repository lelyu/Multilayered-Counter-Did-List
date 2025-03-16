import React from "react";

const ProSubscriptionPage = () => {
	return (
		<section
			className="bg-dark text-light py-5"
			style={{ height: "100vh" }}
		>
			<div className="container">
				{/* Page Heading */}
				<h1 className="text-center display-4 mb-4">Unlock DocIt Pro</h1>
				<p className="lead text-center mb-5">
					Subscribe to DocIt Pro and get unlimited AI access plus the
					ability to request new features.
				</p>

				{/* Pricing Card */}
				{/*monthly plans*/}
				<div className="row justify-content-center">
					<div className="col-md-6 col-lg-4">
						<div className="card text-center border border-success border-5 shadow-lg">
							<div className="card-header bg-success text-dark">
								<h3 className="card-title m-0">
									DocIt Pro Monthly Plan
								</h3>
							</div>
							<div className="card-body bg-dark text-white">
								<h4 className="card-price">$4.99/month</h4>
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
					{/*annual plan*/}
					<div className="col-md-6 col-lg-4">
						<div className="card text-center border border-danger border-5 shadow-lg">
							<div className="card-header bg-danger text-dark">
								<h3 className="card-title m-0">
									DocIt Pro Annual Plan
								</h3>
							</div>
							<div className="card-body bg-dark text-white">
								<h4 className="card-price">$48.88/year</h4>
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
