import React, { useState, useEffect } from "react";
import { auth, db } from "../config/firebase";
import {
	collection,
	getDocs,
	addDoc,
	serverTimestamp,
	deleteDoc,
	doc,
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { httpsCallable, getFunctions } from "firebase/functions";
import FolderButton from "./FolderButton.tsx";
import ListButton from "./ListButton";
import ListItemButton from "./ListItemButton";
import ChatUI from "./ChatUI.tsx";
import FoldersPage from "./FoldersPage.tsx";
import DocumentsPage from "./DocumentsPage.tsx";

interface Folder {
	id: string;
	name: string;
	dateCreated: Date;
	description?: string;
}

interface List {
	id: string;
	name: string;
	dateCreated: Date;
	description?: string;
}

interface Item {
	id: string;
	name: string;
	count: number;
	dateCreated: Date;
	description?: string;
}

const Home: React.FC = () => {
	// user
	const [user, setUser] = useState(null);
	const [loading, setLoading] = useState(true);

	// item related attributes
	const [itemName, setItemName] = useState<string>(""); // used for creating a new item; bound with input
	const [count, setCount] = useState<number>(0); // bound with current item
	const [currListItems, setCurrListItems] = useState<Item[]>([]); // list of items under currently selected list
	const [selectedListItem, setSelectedListItem] = useState<string>(""); // id of the item. used for setting initial data and button click
	const [itemDescription, setItemDescription] = useState<string>("");

	// list related attributes
	const [selectedList, setSelectedList] = useState<string>(""); // id of the list. used for setting initial data and button click
	const [currentLists, setCurrLists] = useState<List[]>([]); // current lists returned by firestore
	const [currentList, setCurrentList] = useState<string>(""); // specifically used for new list creation

	// folder related attributes
	const [folders, setFolders] = useState<Folder[]>([]); // current folders returned by firestore
	const [selectedFolder, setSelectedFolder] = useState<string>(""); // id of the folder. used for setting initial data and button click
	const [currentFolder, setCurrentFolder] = useState<string>(""); // specifically used for new folder creation

	// folder related functions
	const getFolders = async (userId: string) => {
		if (!userId) return;
		const foldersRef = collection(db, "users", userId, "folders");
		const foldersSnapshot = await getDocs(foldersRef);
		const folders = foldersSnapshot.docs.map((doc) => {
			return {
				id: doc.id,
				name: doc.data().name,
				dateCreated: doc.data().dateCreated.toDate(),
				description: doc.data().description
					? doc.data().description
					: "",
			};
		});
		setFolders(folders);
		setSelectedFolder(folders[0].id);
	};

	const createFolder = async (userId: string, folderName: string) => {
		if (userId === null) {
			alert("You are not logged in");
			window.location.href = "/login";
		}
		if (folderName.length === 0) {
			console.error("Error creating folder: missing folder name");
			return;
		}
		try {
			const folderRef = collection(db, "users", userId, "folders");
			await addDoc(folderRef, {
				createdBy: userId,
				name: folderName,
				dateCreated: serverTimestamp(),
			});
			await getFolders(userId);
			setCurrentFolder("");
			return folderRef.id;
		} catch (error) {
			console.error(error);
		}
	};

	// note: only deleting current fields
	const deleteFolder = async (userId: string, folderId: string) => {
		if (!userId || !folderId) return;
		try {
			const folderRef = doc(db, "users", userId, "folders", folderId);
			await deleteDoc(folderRef);
		} catch (error) {
			console.error("Error deleting folder:", error);
		} finally {
			await getFolders(userId);
		}
	};

	const new_handleFolderSelection = async (folderId: string) => {
		if (!user) return;
		setSelectedFolder(folderId);
	};

	// list related functions
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
				const lists = listsSnapshot.docs.map((doc) => {
					return {
						id: doc.id,
						name: doc.data().name,
						dateCreated: doc.data().dateCreated.toDate(),
						description: doc.data().description
							? doc.data().description
							: "",
					};
				});
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

	const createList = async (
		userId: string,
		folderId: string,
		listName: string,
	) => {
		if (!userId) {
			alert("You are not logged in");
			window.location.href = "/login";
		}
		if (!folderId) {
			console.error("Error creating list: folder ID");
			return;
		}
		if (listName.length === 0) {
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
					parent: {
						parentFolder: folderId,
					},
				},
			);
			await getLists(userId, folderId);
			setCurrentList("");
			return listRef.id; // Return list id for further nesting
		} catch (error) {
			console.error("Error creating list:", error);
		}
	};

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
			console.error("Error deleting folder:", error);
		} finally {
			await getLists(userId, selectedFolder);
		}
	};

	const new_handleListSelection = async (listId: string) => {
		if (!user) return;
		setSelectedList(listId);
	};

	// item related functions
	const getListItems = async (
		userId: string,
		folderId: string,
		listId: string,
	) => {
		if (!userId || !folderId) {
			return;
		}
		if (!listId) {
			setCurrListItems([]);
			return;
		}
		const itemsRef = collection(
			db,
			"users",
			userId,
			"folders",
			folderId,
			"lists",
			listId,
			"items",
		);
		const itemsSnapshot = await getDocs(itemsRef);
		if (itemsSnapshot.docs.length === 0) {
			setCurrListItems([]);
			return;
		}
		const items = itemsSnapshot.docs.map((doc) => {
			return {
				id: doc.id,
				name: doc.data().name,
				count: doc.data().count,
				dateCreated: doc.data().dateCreated.toDate(),
				description: doc.data().description
					? doc.data().description
					: "",
			};
		});
		setCurrListItems(items);
		setSelectedListItem(items[0].id);
	};

	const createItem = async (
		userId: string,
		folderId: string,
		listId: string,
		itemName: string,
		count: number,
		description: string,
	) => {
		if (!userId) {
			alert("You are not logged in");
			window.location.href = "/login";
		}
		if (!folderId || !listId) {
			console.error("Error creating item: missing user or folder ID");
			return;
		}
		if (itemName.length === 0) {
			console.error("Error creating item: missing item name");
			return;
		}
		try {
			const itemRef = await addDoc(
				collection(
					db,
					"users",
					userId,
					"folders",
					folderId,
					"lists",
					listId,
					"items",
				),
				{
					createdBy: userId,
					name: itemName,
					dateCreated: serverTimestamp(),
					count: count,
					parent: { parentFolder: folderId, parentList: listId },
					description: description,
				},
			);
			await getListItems(userId, folderId, listId);
			setItemName("");
			setItemDescription("");
			return itemRef.id;
		} catch (error) {
			console.error("Error creating item:", error);
		}
	};

	const deleteListItem = async (
		userId: string,
		folderId: string,
		listId: string,
		itemId: string,
	) => {
		if (!userId || !folderId || !listId || !itemId) return;
		try {
			const listItemRef = doc(
				db,
				"users",
				userId,
				"folders",
				folderId,
				"lists",
				listId,
				"items",
				itemId,
			);
			await deleteDoc(listItemRef);
		} catch (error) {
			console.error("Error deleting folder:", error);
		} finally {
			await getListItems(userId, selectedFolder, selectedList);
		}
	};

	const new_handleListItemSelection = async (itemId: string) => {
		if (!user) return;
		setSelectedListItem(itemId);
	};

	// data related functions
	const fetchAndSetInitialData = async () => {
		if (!user) return;
		try {
			await getFolders(user.uid);
		} catch (error) {
			console.error("Error fetching initial data:", error);
		}
	};

	// fetch and set user object
	useEffect(() => {
		const unsubscribe = onAuthStateChanged(auth, (user) => {
			if (user !== null) {
				setUser(user);
			} else {
				setUser(null);
			}
			setLoading(false); // authentication check is complete
		});
		// Cleanup the listener on component unmount
		return () => unsubscribe();
	}, []); // run only once on mount

	// whenever user changes get new folders
	useEffect(() => {
		if (user) {
			fetchAndSetInitialData().then();
		}
	}, [user]); // run when user changes

	// whenever selected folder changes get new lists
	useEffect(() => {
		if (user !== null) {
			getLists(user.uid, selectedFolder).then(() => {
				return;
			});
		}
	}, [selectedFolder]);

	// whenever selected list changes get new items
	useEffect(() => {
		if (user !== null) {
			getListItems(user.uid, selectedFolder, selectedList).then();
		}
	}, [selectedList]);

	// testing cloud functions API
	const onTestClick = async () => {
		try {
			const testPrompt = httpsCallable(getFunctions(), "summarizeData");
			const response = await testPrompt({
				prompt: "Tell me about yourself!",
			});
			console.log(response);
		} catch (error) {
			console.error("Error calling generateResponse:", error);
		}
	};

	return (
		<>
			<div className="container-fluid">
				{user === null && <h3>Welcome to DocIt.</h3>}
				{loading && (
					<button className="btn btn-primary" type="button" disabled>
						<span
							className="spinner-border spinner-border-sm"
							aria-hidden="true"
						></span>
						<span role="status">Loading...</span>
					</button>
				)}
				{user === null && <h3>You need to login to use this app.</h3>}
				{!user?.emailVerified && (
					<h3>You need verify your account to use this app.</h3>
				)}
				<div className="row align-items-start column-gap-3">
					<div className="col shadow p-3 mb-5 bg-body-tertiary rounded">
						<h3>My Folders</h3>
						<div className="input-group mb-3">
							<button
								disabled={user === null}
								className="input-group-text btn btn-light"
								id="inputGroup-sizing-default"
								onClick={() =>
									createFolder(user.uid, currentFolder)
								}
							>
								New Folder
							</button>
							<input
								value={currentFolder}
								onChange={(e) =>
									setCurrentFolder(e.target.value)
								}
								type="text"
								className="form-control"
								aria-label="Sizing example input"
								aria-describedby="inputGroup-sizing-default"
							/>
						</div>

						<div
							className="btn-group-vertical container"
							role="group"
							aria-label="Vertical button group"
						>
							{folders.length === 0 && (
								<button className="btn btn-light" disabled>
									You haven't created any folder yet.
								</button>
							)}

							{folders.map((folder) => (
								<FolderButton
									key={folder.id}
									deleteAction={() =>
										deleteFolder(user.uid, folder.id)
									}
									selectAction={() =>
										new_handleFolderSelection(folder.id)
									}
									userId={user.uid}
									folderId={folder.id}
									folderName={folder.name}
									folderDescription={folder.description}
									dateCreated={folder.dateCreated}
									isSelected={folder.id === selectedFolder}
									onModalClose={() => getFolders(user.uid)}
								/>
							))}
						</div>
					</div>

					<div className="col-6 shadow p-3 mb-5 bg-body-tertiary rounded">
						<h3>My Items</h3>
						<div>
							<div className="input-group mb-3">
								<button
									className="input-group-text btn btn-light"
									id="inputGroup-sizing-default"
									disabled={user === null}
									onClick={() =>
										createItem(
											user.uid,
											selectedFolder,
											selectedList,
											itemName,
											count,
											itemDescription,
										)
									}
								>
									New Item
								</button>
								<input
									type="text"
									className="form-control"
									aria-label="Sizing example input"
									aria-describedby="inputGroup-sizing-default"
									value={itemName}
									onChange={(e) =>
										setItemName(e.target.value)
									}
								/>
								<span
									className="input-group-text"
									id="inputGroup-sizing-default"
								>
									Count: {count}
								</span>
								<input
									type="number"
									className="form-control"
									aria-label="Sizing example input"
									aria-describedby="inputGroup-sizing-default"
									value={count}
									onChange={(e) =>
										setCount(Number(e.target.value))
									}
								/>
							</div>

							{/* add a description for the list item*/}
							<div className="container mt-3 mb-3">
								{/* Button to toggle the collapse */}
								<button
									className="btn btn-secondary"
									type="button"
									data-bs-toggle="collapse"
									data-bs-target="#collapseTextarea"
									aria-expanded="false"
									aria-controls="collapseTextarea"
								>
									Add a description
								</button>

								{/* Collapsible container with the textarea */}
								<div
									className="collapse mt-3 form-floating"
									id="collapseTextarea"
								>
									<textarea
										className="form-control"
										rows={5}
										id="floatingTextarea"
										placeholder="Add a description here"
										value={itemDescription}
										onChange={(e) =>
											setItemDescription(e.target.value)
										}
									></textarea>
									<label htmlFor="floatingTextarea">
										Description
									</label>
								</div>
							</div>

							<div
								className="btn-group-vertical container"
								role="group"
								aria-label="Vertical button group"
							>
								{currListItems.length === 0 && (
									<button
										className="btn btn-light text-start"
										disabled
									>
										You haven't created any items yet.
									</button>
								)}

								{currListItems.map((item) => (
									<ListItemButton
										key={item.id}
										deleteAction={() =>
											deleteListItem(
												user.uid,
												selectedFolder,
												selectedList,
												item.id,
											)
										}
										selectAction={() =>
											new_handleListItemSelection(item.id)
										}
										userId={user.uid}
										folderId={selectedFolder}
										listId={selectedList}
										listItemId={item.id}
										listItemName={item.name}
										dateCreated={item.dateCreated}
										isSelected={
											item.id === selectedListItem
										}
										count={item.count}
										itemDescription={item.description}
										onModalClose={() =>
											getListItems(
												user.uid,
												selectedFolder,
												selectedList,
											)
										}
									/>
								))}
							</div>
						</div>
					</div>

					<div className="col shadow p-3 mb-5 bg-body-tertiary rounded">
						<h3>My Lists</h3>
						<div className="input-group mb-3">
							<button
								className="input-group-text btn btn-light"
								id="inputGroup-sizing-default"
								disabled={user === null}
								onClick={() =>
									createList(
										user.uid,
										selectedFolder,
										currentList,
									)
								}
							>
								New List
							</button>
							<input
								value={currentList}
								onChange={(e) => setCurrentList(e.target.value)}
								type="text"
								className="form-control"
								aria-label="Sizing example input"
								aria-describedby="inputGroup-sizing-default"
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
										deleteList(
											user.uid,
											selectedFolder,
											ls.id,
										)
									}
									selectAction={() =>
										new_handleListSelection(ls.id)
									}
									userId={user.uid}
									folderId={selectedFolder}
									listId={ls.id}
									listName={ls.name}
									listDescription={ls.description}
									dateCreated={ls.dateCreated}
									isSelected={ls.id === selectedList}
									onModalClose={() =>
										getLists(user.uid, selectedFolder)
									}
								/>
							))}
						</div>
					</div>
				</div>
			</div>
			<FoldersPage folders={folders} />
			<DocumentsPage lists={currentLists} />
			<ChatUI />
		</>
	);
};

export default Home;
