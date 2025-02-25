import { auth, db } from "../config/firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import React, { useState } from "react";

const Register: React.FC = () => {
	const [email, setEmail] = useState<string>("");
	const [password, setPassword] = useState<string>("");
	const [confirmedPassword, setConfirmedPassword] = useState<string>("");
	const [firstName, setFirstName] = useState<string>("");
	const [lastName, setLastName] = useState<string>("");

	const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setEmail(e.target.value);
	};

	const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setPassword(e.target.value);
	};

	const register = async (
		event: React.MouseEvent<HTMLButtonElement>,
	): Promise<void> => {
		event.preventDefault();

		if (password !== confirmedPassword) {
			alert("Passwords do not match");
			setConfirmedPassword("");
			setPassword("");
			return;
		}

		try {
			// Create the user with email and password
			const userCredential = await createUserWithEmailAndPassword(
				auth,
				email,
				password,
			);
			const user = userCredential.user;

			// Create a user document in the "users" collection
			const docRef = await addDoc(collection(db, "users"), {
				userId: user.uid,
				firstName: firstName,
				lastName: lastName,
				email: email,
			});
			console.log("Document written with ID:", docRef.id);

			// Redirect after document creation is complete
			window.location.href = "/";
		} catch (error) {
			console.error("Error during registration:", error);
		}
	};

	return (
		<>
			<h1>Register</h1>
			<form>
				<div className="mb-3">
					<label htmlFor="firstName" className="form-label">
						First Name
					</label>
					<input
						value={firstName}
						onChange={(e) => setFirstName(e.target.value)}
						type="text"
						className="form-control"
						id="firstName"
					/>
				</div>
				<div className="mb-3">
					<label htmlFor="lastName" className="form-label">
						Last Name
					</label>
					<input
						value={lastName}
						onChange={(e) => setLastName(e.target.value)}
						type="text"
						className="form-control"
						id="lastName"
					/>
				</div>
				<div className="mb-3">
					<label htmlFor="exampleInputEmail1" className="form-label">
						Email address
					</label>
					<input
						value={email}
						onChange={handleEmailChange}
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
						value={password}
						onChange={handlePasswordChange}
						type="password"
						className="form-control"
						id="exampleInputPassword1"
					/>
				</div>
				<div className="mb-3">
					<label
						htmlFor="exampleInputPassword1"
						className="form-label"
					>
						Confirm Password
					</label>
					<input
						value={confirmedPassword}
						onChange={(e) => setConfirmedPassword(e.target.value)}
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
				<button
					onClick={register}
					type="submit"
					className="btn btn-light"
				>
					Register
				</button>
			</form>
		</>
	);
};

export default Register;
