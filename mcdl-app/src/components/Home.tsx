import React, { useState, useEffect } from "react";
import { auth, db } from "../config/firebase";
import { collection, getDocs } from "firebase/firestore";
import { onAuthStateChanged, User } from "firebase/auth";
import FoldersPage from "./FoldersPage";
import ChatUI from "./ChatUI";

interface Folder {
	id: string;
	name: string;
	dateCreated: Date;
	dateModified: Date;
	description?: string;
	userId: string;
}

const Home: React.FC = () => {
	const [user, setUser] = useState<User | null>(null);
	const [loading, setLoading] = useState(true);
	const [folders, setFolders] = useState<Folder[]>([]);

	// Fetch and set user object
	useEffect(() => {
		const unsubscribe = onAuthStateChanged(auth, (user) => {
			if (user) {
				setUser(user);
			} else {
				setUser(null);
			}
			setLoading(false);
		});
		return () => unsubscribe();
	}, []);

	// Fetch folders when user changes
	useEffect(() => {
		const fetchFolders = async () => {
			if (!user) return;
			try {
				const foldersRef = collection(db, "users", user.uid, "folders");
				const foldersSnapshot = await getDocs(foldersRef);
				const folders = foldersSnapshot.docs.map((doc) => {
					const data = doc.data();
					return {
						id: doc.id,
						name: data.name,
						dateCreated: data.dateCreated?.toDate() || new Date(),
						dateModified: data.dateModified?.toDate() || data.dateCreated?.toDate() || new Date(),
						description: data.description || "",
						userId: user.uid
					};
				});
				setFolders(folders);
			} catch (error) {
				console.error("Error fetching folders:", error);
			}
		};

		fetchFolders();
	}, [user]);

	if (loading) {
		return (
			<button className="btn btn-primary" type="button" disabled>
				<span className="spinner-border spinner-border-sm" aria-hidden="true"></span>
				<span role="status">Loading...</span>
			</button>
		);
	}

	if (!user) {
		return (
			<div className="container mt-4">
				<h3>Welcome to DocIt</h3>
				<p>Please log in to use the application.</p>
			</div>
		);
	}

	if (!user.emailVerified) {
		return (
			<div className="container mt-4">
				<h3>Email Verification Required</h3>
				<p>Please verify your email address to use the application.</p>
			</div>
		);
	}

	return (
		<>
			<FoldersPage 
				folders={folders} 
				userId={user.uid} 
				onFolderUpdate={() => {
					const foldersRef = collection(db, "users", user.uid, "folders");
					getDocs(foldersRef).then(snapshot => {
						const updatedFolders = snapshot.docs.map(doc => {
							const data = doc.data();
							return {
								id: doc.id,
								name: data.name,
								dateCreated: data.dateCreated?.toDate() || new Date(),
								dateModified: data.dateModified?.toDate() || data.dateCreated?.toDate() || new Date(),
								description: data.description || "",
								userId: user.uid
							};
						});
						setFolders(updatedFolders);
					});
				}} 
			/>
			<ChatUI />
		</>
	);
};

export default Home;
