import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import MyEditor from "./MyEditor";
import ListButton from "./ListButton";
import { auth, db } from "../config/firebase";
import {
	collection,
	getDocs,
	addDoc,
	serverTimestamp,
	deleteDoc,
	doc,
} from "firebase/firestore";

interface List {
	id: string;
	name: string;
	dateCreated: Date;
	description?: string;
}

interface DocumentsPageProps {
	user: any; // Adjust the type as needed (e.g., firebase.User)
}

const DocumentsPage: React.FC<DocumentsPageProps> = ({ user }) => {
	// Get the folderId from the URL params
	const { folderId } = useParams<{ folderId: string }>();

	// List related state
	const [selectedList, setSelectedList] = useState<string>("");
	const [currentLists, setCurrLists] = useState<List[]>([]);
	const [currentList, setCurrentList] = useState<string>("");

	// Fetch lists for the given folderId
	const getLists = async (userId: string, folderId: string) => {
		if (!userId || !folderId) return;
		try {
			const listsRef = collection(
				db,
				"users",
				userId,
				"folders",
				folderId,
				"lists",
			);
			const listsSnapshot = await getDocs(listsRef);
			if (listsSnapshot.docs.length > 0) {
				const lists = listsSnapshot.docs.map((doc) => ({
					id: doc.id,
					name: doc.data().name,
					dateCreated: doc.data().dateCreated.toDate(),
					description: doc.data().description || "",
				}));
				setCurrLists(lists);
				setSelectedList(lists[0].id);
			} else {
				setCurrLists([]);
				setSelectedList("");
			}
		} catch (error) {
			console.error("No available lists", error);
			setCurrLists([]);
			setSelectedList("");
		}
	};

	// Create a new list in the current folder
	const createList = async (
		userId: string,
		folderId: string,
		listName: string,
	) => {
		if (!userId) {
			alert("You are not logged in");
			window.location.href = "/login";
			return;
		}
		if (!folderId) {
			console.error("Error creating list: folder ID missing");
			return;
		}
		if (listName.trim().length === 0) {
			console.error("Error creating list: missing list name");
			return;
		}

		try {
			const listRef = await addDoc(
				collection(db, "users", userId, "folders", folderId, "lists"),
				{
					createdBy: userId,
					name: listName,
					dateCreated: serverTimestamp(),
					parent: { parentFolder: folderId },
				},
			);
			await getLists(userId, folderId);
			setCurrentList("");
			return listRef.id;
		} catch (error) {
			console.error("Error creating list:", error);
		}
	};

	// Delete a list from the current folder
	const deleteList = async (
		userId: string,
		folderId: string,
		listId: string,
	) => {
		if (!userId || !folderId || !listId) return;
		try {
			const listRef = doc(
				db,
				"users",
				userId,
				"folders",
				folderId,
				"lists",
				listId,
			);
			await deleteDoc(listRef);
		} catch (error) {
			console.error("Error deleting list:", error);
		} finally {
			await getLists(userId, folderId);
		}
	};

	// Handle list selection change
	const handleListSelection = (listId: string) => {
		if (!user) return;
		setSelectedList(listId);
	};

	// Fetch lists whenever the user or folderId changes
	useEffect(() => {
		if (user && folderId) {
			console.log("Fetching lists for folder:", folderId);
			getLists(user.uid, folderId);
		}
	}, [user, folderId]);

	return (
		<>
			<h1>Folder {folderId}</h1>
			<div className="container-fluid">
				<div className="row">
					<div className="col-2">
						<div className="shadow p-3 mb-5 bg-body-tertiary rounded">
							<h3>My Lists</h3>
							<div className="input-group mb-3">
								<button
									className="input-group-text btn btn-light"
									disabled={user === null}
									onClick={() =>
										user &&
										folderId &&
										createList(
											user.uid,
											folderId,
											currentList,
										)
									}
								>
									New List
								</button>
								<input
									value={currentList}
									onChange={(e) =>
										setCurrentList(e.target.value)
									}
									type="text"
									className="form-control"
									aria-label="New list name"
								/>
							</div>
							<div
								className="btn-group-vertical container"
								role="group"
								aria-label="Vertical button group"
							>
								{currentLists.length === 0 && (
									<button
										className="btn btn-light text-start"
										disabled
									>
										You haven't created any lists yet.
									</button>
								)}
								{currentLists.map((ls) => (
									<ListButton
										key={ls.id}
										deleteAction={() =>
											user &&
											folderId &&
											deleteList(
												user.uid,
												folderId,
												ls.id,
											)
										}
										selectAction={() =>
											handleListSelection(ls.id)
										}
										userId={user?.uid}
										folderId={folderId}
										listId={ls.id}
										listName={ls.name}
										listDescription={ls.description}
										dateCreated={ls.dateCreated}
										isSelected={ls.id === selectedList}
										onModalClose={() =>
											user &&
											folderId &&
											getLists(user.uid, folderId)
										}
									/>
								))}
							</div>
						</div>
					</div>
					<div className="col-8">
						{/* Big text area */}
						<MyEditor />
					</div>
					<div className="col-2">
						{/* Floating counter area */}
						<button>+</button>
						list items 1 <button>-</button>
						<br />
						<button>+</button>
						list items 2 <button>-</button>
						<br />
						<button>+</button>
						list items 3 <button>-</button>
					</div>
				</div>
			</div>
		</>
	);
};

export default DocumentsPage;
