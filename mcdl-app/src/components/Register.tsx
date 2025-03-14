import { auth, db } from "../config/firebase";
import {
	createUserWithEmailAndPassword,
	validatePassword,
} from "firebase/auth";
import { setDoc, doc } from "firebase/firestore";
import React, { useState } from "react";

const Register: React.FC = () => {
	const [email, setEmail] = useState<string>("");
	const [password, setPassword] = useState<string>("");
	const [confirmedPassword, setConfirmedPassword] = useState<string>("");
	const [firstName, setFirstName] = useState<string>("");
	const [lastName, setLastName] = useState<string>("");
	const [validated, setValidated] = useState<boolean>(false);

	const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setEmail(e.target.value);
	};

	const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setPassword(e.target.value);
	};

	const register = async (
		event: React.FormEvent<HTMLFormElement>,
	): Promise<void> => {
		event.preventDefault();
		const form = event.currentTarget;
		setValidated(true);

		// Check client-side validation using Bootstrap's form validation
		if (form.checkValidity() === false) {
			event.stopPropagation();
			return;
		}

		// Ensure passwords match
		if (password !== confirmedPassword) {
			alert("Passwords do not match");
			setPassword("");
			setConfirmedPassword("");
			return;
		}

		try {
			// Server-side password validation using Firebase
			const status = await validatePassword(auth, password);
			if (!status.isValid) {
				const needsLowerCase = status.containsLowercaseLetter;
				const needsUpperCase = status.containsUppercaseLetter;
				const needsSpecialChar =
					status.containsNonAlphanumericCharacter;
				const needsNumber = status.containsNumericCharacter;
				alert(
					`Password is not strong enough\nConsider the following Criteria:\nHas Lower Case: ${needsLowerCase}\nHas Upper Case: ${needsUpperCase}\nHas Special Character: ${needsSpecialChar}\nHas Number: ${needsNumber}\nLength >=8: ${password.length >= 8}`,
				);
				return;
			}

			// Create the user with email and password
			const userCredential = await createUserWithEmailAndPassword(
				auth,
				email,
				password,
			);
			const user = userCredential.user;

			// Create a user document in Firestore
			await setDoc(doc(db, "users", user.uid), {
				userId: user.uid,
				firstName: firstName,
				lastName: lastName,
				email: email,
			});

			// Redirect after successful registration
			window.location.href = "/";
		} catch (error) {
			console.error("Error during registration:", error);
		}
	};

	return (
		<>
			<h1>Register</h1>
			<form
				className={`needs-validation ${validated ? "was-validated" : ""}`}
				noValidate
				onSubmit={register}
			>
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
						required
					/>
					<div className="invalid-feedback">
						Please provide a first name.
					</div>
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
						required
					/>
					<div className="invalid-feedback">
						Please provide a last name.
					</div>
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
						required
					/>
					<div className="invalid-feedback">
						Please provide an email address.
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
						required
					/>
					<div className="invalid-feedback">
						Please provide a strong password.
					</div>
				</div>
				<div className="mb-3">
					<label
						htmlFor="exampleInputPassword2"
						className="form-label"
					>
						Confirm Password
					</label>
					<input
						value={confirmedPassword}
						onChange={(e) => setConfirmedPassword(e.target.value)}
						type="password"
						className="form-control"
						id="exampleInputPassword2"
						required
					/>
					<div className="invalid-feedback">
						Please confirm your password.
					</div>
				</div>
				<div className="mb-3 form-check">
					<input
						type="checkbox"
						className="form-check-input"
						id="exampleCheck1"
						required
					/>
					<label className="form-check-label" htmlFor="exampleCheck1">
						Agree to terms and conditions
					</label>
					<div className="invalid-feedback">
						You must agree before submitting.
					</div>
				</div>
				<button type="submit" className="btn btn-light">
					Register
				</button>
			</form>
		</>
	);
};

export default Register;
