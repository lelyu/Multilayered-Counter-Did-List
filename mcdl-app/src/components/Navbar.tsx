import { onAuthStateChanged, signOut } from "firebase/auth";
import React, { useState, useEffect } from "react";
import { auth } from "../config/firebase";

const Navbar: React.FC = () => {
	const [user, setUser] = useState(null);
	const [loading, setLoading] = useState(true); // loading state

	useEffect(() => {
		const unsubscribe = onAuthStateChanged(auth, (user) => {
			if (user) {
				setUser(user);
				console.log("User is here");
			} else {
				console.log("User is not here");
			}
			setLoading(false); // authentication check is complete
		});

		// Cleanup the listener on component unmount
		return () => unsubscribe();
	}, []); // run only once on mount

	if (loading) {
		return (
			<button className="btn btn-primary" type="button" disabled>
				<span
					className="spinner-border spinner-border-sm"
					aria-hidden="true"
				></span>
				<span role="status">Loading...</span>
			</button>
		); // or return null/placeholder
	}

	const logout = (e: React.MouseEvent<HTMLButtonElement>) => {
		e.preventDefault();
		signOut(auth)
			.then(() => {
				window.location.href = "/login";
				console.log("user is outta here");
			})
			.catch((error) => {
				// An error happened.
				console.log(error);
			});
	};

	return (
		<>
			<nav className="navbar navbar-expand-lg bg-body-tertiary">
				<div className="container-fluid">
					<a className="navbar-brand" href="/">
						DocIt
					</a>
					<button
						className="navbar-toggler"
						type="button"
						data-bs-toggle="collapse"
						data-bs-target="#navbarSupportedContent"
						aria-controls="navbarSupportedContent"
						aria-expanded="false"
						aria-label="Toggle navigation"
					>
						<span className="navbar-toggler-icon"></span>
					</button>
					<div
						className="collapse navbar-collapse"
						id="navbarSupportedContent"
					>
						<ul className="navbar-nav me-auto mb-2 mb-lg-0">
							{user ? (
								<>
									<li className="nav-item">
										<button
											onClick={logout}
											className="nav-link"
										>
											Logout
										</button>
									</li>
									<li className="nav-item">
										<a className="nav-link">
											Welcome, {user.email}
										</a>
									</li>
								</>
							) : (
								<>
									<li className="nav-item">
										<a
											className="nav-link active"
											aria-current="page"
											href="/login"
										>
											Login
										</a>
									</li>
									<li className="nav-item">
										<a
											className="nav-link"
											href="/register"
										>
											Register
										</a>
									</li>
								</>
							)}

							<li className="nav-item dropdown">
								<a
									className="nav-link dropdown-toggle"
									href="#"
									role="button"
									data-bs-toggle="dropdown"
									aria-expanded="false"
								>
									Other Apps
								</a>
								<ul className="dropdown-menu">
									<li>
										<a className="dropdown-item" href="#">
											Daily Mood Tracker
										</a>
									</li>
									<li>
										<a className="dropdown-item" href="#">
											iPortfolio
										</a>
										`
									</li>
									<li>
										<hr className="dropdown-divider" />
									</li>
									<li>
										<a className="dropdown-item" href="#">
											Personal Website
										</a>
									</li>
								</ul>
							</li>
						</ul>
						<form className="d-flex" role="search">
							<input
								className="form-control me-2"
								type="search"
								placeholder="Search"
								aria-label="Search"
							/>
							<button
								className="btn btn-outline-success"
								type="submit"
							>
								Search
							</button>
						</form>
					</div>
				</div>
			</nav>
		</>
	);
};

export default Navbar;
