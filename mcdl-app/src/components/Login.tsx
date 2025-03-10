import {
	getAuth,
	signInWithEmailAndPassword,
	GoogleAuthProvider,
	signInWithRedirect,
	getRedirectResult,
	signInWithPopup,
} from "firebase/auth";
import React, { useState, useEffect } from "react";
import { addDoc, collection, doc, setDoc } from "firebase/firestore";
import { db, auth } from "../config/firebase";

const Login: React.FC = () => {
	const [email, setEmail] = useState<string>("");
	const [password, setPassword] = useState<string>("");
	const provider = new GoogleAuthProvider();
	const auth = getAuth();

	const login = (event: React.MouseEvent<HTMLButtonElement>) => {
		event.preventDefault();
		signInWithEmailAndPassword(auth, email, password)
			.then((userCredential) => {
				// Signed in
				const user = userCredential.user;
				console.log(user);
				window.location.href = "/";
				// ...
			})
			.catch((error) => {
				const errorCode = error.code;
				const errorMessage = error.message;
				console.log(errorCode, errorMessage);
			});
	};

	const loginWithGoogle = async (
		event: React.MouseEvent<HTMLButtonElement>,
	) => {
		event.preventDefault();

		try {
			const result = await signInWithPopup(auth, provider);
			// Get the Google Access Token and user info.
			const credential = GoogleAuthProvider.credentialFromResult(result);
			const token = credential?.accessToken;
			const user = result.user;

			// Optionally split the displayName if you need first and last names.
			const [firstName = "", lastName = ""] = user.displayName
				? user.displayName.split(" ")
				: [];

			// Create a user document in the "users" collection.
			await setDoc(doc(db, "users", user.uid), {
				userId: user.uid,
				firstName,
				lastName,
				email: user.email,
			});

			// Redirect to home.
			window.location.href = "/";
		} catch (error: any) {
			// Handle Errors here.
			console.error("Error during sign in:", error);
			const errorCode = error.code;
			const errorMessage = error.message;
			const email = error.customData?.email;
			const credential = GoogleAuthProvider.credentialFromError(error);
			// Optionally, display the error message to the user.
		}
	};

	return (
		<>
			<h1>Login</h1>
			<form>
				<div className="mb-3">
					<label htmlFor="exampleInputEmail1" className="form-label">
						Email address
					</label>
					<input
						onChange={(e) => setEmail(e.target.value)}
						type="email"
						className="form-control"
						id="exampleInputEmail1"
						aria-describedby="emailHelp"
					/>
					<div id="emailHelp" className="form-text">
						We'll never share your email with anyone else.
					</div>
				</div>
				<div className="mb-3">
					<label
						htmlFor="exampleInputPassword1"
						className="form-label"
					>
						Password
					</label>
					<input
						onChange={(e) => setPassword(e.target.value)}
						type="password"
						className="form-control"
						id="exampleInputPassword1"
					/>
				</div>
				<div className="mb-3 form-check">
					<input
						type="checkbox"
						className="form-check-input"
						id="exampleCheck1"
					/>
					<label className="form-check-label" htmlFor="exampleCheck1">
						Check me out
					</label>
				</div>
				<div
					className="btn-group"
					role="group"
					aria-label="Basic example"
				>
					<button
						onClick={login}
						type="submit"
						className="btn btn-light me-3"
					>
						Login
					</button>
					<button
						onClick={loginWithGoogle}
						type="button"
						className="btn btn-light"
					>
						Sign in with Google{" "}
						<span className="badge text-bg-secondary">
							<i className="bi bi-google"></i>
						</span>
					</button>
				</div>
			</form>
		</>
	);
};

export default Login;
