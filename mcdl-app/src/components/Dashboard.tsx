import { auth } from "../config/firebase";
import {
	sendPasswordResetEmail,
	sendEmailVerification,
	onAuthStateChanged,
} from "firebase/auth";
import React, { useEffect, useState } from "react";

const Dashboard: React.FC = () => {
	const [user, setUser] = useState(null);
	useEffect(() => {
		const unsubscribe = onAuthStateChanged(auth, (user) => {
			if (user !== null) {
				setUser(user);
			} else {
				setUser(null);
			}
		});
		// Cleanup the listener on component unmount
		return () => unsubscribe();
	}, []); // run only once on mount

	if (!user) {
		return <h4>You need to sign in.</h4>;
	}

	const resetPassword = async () => {
		try {
			await sendPasswordResetEmail(auth, user.email);
			alert("Password reset email sent! Please check your inbox.");
		} catch (error: any) {
			console.error("Error sending password reset email:", error);
			alert("Failed to send password reset email: " + error.message);
		}
	};

	const verifyEmail = async () => {
		try {
			if (!user.emailVerified) {
				await sendEmailVerification(user);
				alert("Verification email sent! Please check your inbox.");
			} else {
				alert("Your email is already verified.");
			}
		} catch (error: any) {
			console.error("Error sending verification email:", error);
			alert("Failed to send verification email: " + error.message);
		}
	};

	const deleteAccount = async () => {
		const confirmDelete = window.confirm(
			"Are you sure you want to delete your account? This action is irreversible.",
		);
		if (!confirmDelete) return;

		try {
			await user.delete();
			alert("Your account has been deleted.");
			// Optionally, redirect the user after deletion
			window.location.href = "/login";
		} catch (error: any) {
			console.error("Error deleting account:", error);
			alert("Failed to delete account: " + error.message);
		}
	};

	return (
		<>
			<h4>Dashboard</h4>
			<h4>Hello, {user.email}</h4>
			<div className="btn-group mt-3">
				<button className="btn btn-dark" onClick={resetPassword}>
					Reset Password
				</button>
				<button className="btn btn-secondary" onClick={verifyEmail}>
					Verify Email
				</button>
				<button className="btn btn-danger" onClick={deleteAccount}>
					Delete Account
				</button>
			</div>
		</>
	);
};

export default Dashboard;
