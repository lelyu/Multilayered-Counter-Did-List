import React, { useState, useEffect } from "react";
import { auth, db } from "../config/firebase";
import {
	collection,
	getDocs,
	addDoc,
	serverTimestamp,
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";

interface Folder {
	id: string;
	name: string;
	dateCreated: Date;
}

interface List {
	id: string;
	name: string;
	dateCreated: Date;
}

interface Item {
	id: string;
	name: string;
	count: number;
	dateCreated: Date;
}

const Home: React.FC = () => {
	// user
	const [user, setUser] = useState(null);
	const [loading, setLoading] = useState(true);

	// item related attributes
	const [itemName, setItemName] = useState<string>(""); // used for creating a new item; bound with input
	const [count, setCount] = useState<number>(0); // bound with current item
	const [currListItems, setCurrListItems] = useState<Item[]>([]); // list of items under currently selected list

	// list related attributes
	const [selectedList, setSelectedList] = useState<string>(""); // used for setting initial data and button click
	const [currentLists, setCurrLists] = useState<List[]>([]); // current lists returned by firestore
	const [currentList, setCurrentList] = useState<string>(""); // specifically used for new list creation

	// folder related attributes
	const [folders, setFolders] = useState<Folder[]>([]); // current folders returned by firestore
	const [selectedFolder, setSelectedFolder] = useState<string>(""); // used for setting initial data and button click
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
			};
		});
		setFolders(folders);
		setSelectedFolder(folders[0].id);
	};

	const createFolder = async (userId: string, folderName: string) => {
		console.log(userId);
		if (userId === null) {
			alert("You are not logged in");
			window.location.href = "/login";
		}
		if (folderName.length === 0) {
			console.error("Error creating folder: missing folder name");
			return;
		}
		try {
			const folderRef = await addDoc(
				collection(db, "users", userId, "folders"),
				{
					name: folderName,
					dateCreated: serverTimestamp(),
				},
			);
			getFolders(userId);
			setCurrentFolder("");
			return folderRef.id;
		} catch (error) {
			console.log(error);
		}
	};

	const handleFolderSelection = async (e) => {
		e.preventDefault();
		if (!user) return;
		const folderId = e.target.value;
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
					name: listName,
					dateCreated: serverTimestamp(),
				},
			);
			getLists(userId, folderId);
			setCurrentList("");
			return listRef.id; // Return list id for further nesting
		} catch (error) {
			console.error("Error creating list:", error);
		}
	};

	const handleListSelection = async (e) => {
		e.preventDefault();
		if (!user) return;
		const listId = e.target.value;
		setSelectedList(listId);
	};

	// item related functions
	const getListItems = async (
		userId: string,
		folderId: string,
		listId: string,
	) => {
		if (!userId || !folderId || !listId) return;
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
			};
		});
		setCurrListItems(items);
	};

	const createItem = async (
		userId: string,
		folderId: string,
		listId: string,
		itemName: string,
		count: number,
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
					name: itemName,
					dateCreated: serverTimestamp(),
					count: count,
				},
			);
			console.log("Item created with ID:", itemRef.id);
			getListItems(userId, folderId, listId);
			setItemName("");
			return itemRef.id;
		} catch (error) {
			console.error("Error creating item:", error);
		}
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

	const onCounterClick = (isPlus: boolean): void => {
		if (isPlus) {
			setCount((prevCount) => prevCount + 1);
		} else {
			setCount((prevCount) => prevCount - 1);
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
			fetchAndSetInitialData();
		}
	}, [user]); // run when user changes

	// whenever selected folder changes get new lists
	useEffect(() => {
		if (selectedFolder) {
			getLists(user.uid, selectedFolder);
		}
	}, [selectedFolder]);

	// whenever selected list changes get new items
	useEffect(() => {
		if (selectedList) {
			getListItems(user.uid, selectedFolder, selectedList);
		}
	}, [selectedList]);

	return (
		<>
			<div className="container text-center">
				{user === null && <h1>Welcome to DocIt.</h1>}
				{loading && <h3>Loading...</h3>}
				{user === null && <h3>You need to login to use this app.</h3>}
				<div className="row align-items-start">
					<div className="col">
						<h1>My Folders</h1>
						<div className="input-group mb-3">
							<span
								className="input-group-text"
								id="inputGroup-sizing-default"
							>
								Add a new folder:
							</span>
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
						<button
							disabled={user === null}
							type="button"
							className="btn btn-light"
							onClick={() =>
								createFolder(user.uid, currentFolder)
							}
						>
							Create New Folder
						</button>
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
								<button
									value={folder.id}
									onClick={handleFolderSelection}
									key={folder.id}
									type="button"
									className={`btn ${selectedFolder === folder.id ? "btn-primary" : "btn-light"} text-start `}
								>
									{folder.name}
									---
									{folder.dateCreated.getDate()}/
									{folder.dateCreated.getMonth() + 1}/
									{folder.dateCreated.getFullYear()}
								</button>
							))}
						</div>
					</div>
					<div className="col">
						<h1>My Items</h1>
						<div>
							<div className="input-group mb-3">
								<span
									className="input-group-text"
									id="inputGroup-sizing-default"
								>
									Add a new item
								</span>
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
							</div>
							<button
								disabled={user === null}
								onClick={() =>
									createItem(
										user.uid,
										selectedFolder,
										selectedList,
										itemName,
										count,
									)
								}
								className="btn btn-light"
							>
								Create new item
							</button>
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
									<button
										key={item.id}
										type="button"
										className="btn btn-light text-start"
									>
										{item.name}
									</button>
								))}
							</div>
							<button
								type="button"
								className="btn btn-light"
								onClick={() => onCounterClick(true)}
							>
								+
							</button>
							<button
								type="button"
								className="btn btn-light"
								onClick={() => onCounterClick(false)}
							>
								-
							</button>
							<p>Count: {count}</p>
						</div>
					</div>
					<div className="col">
						<h1>My Lists</h1>
						<div className="input-group mb-3">
							<span
								className="input-group-text"
								id="inputGroup-sizing-default"
							>
								Add a new list:
							</span>
							<input
								value={currentList}
								onChange={(e) => setCurrentList(e.target.value)}
								type="text"
								className="form-control"
								aria-label="Sizing example input"
								aria-describedby="inputGroup-sizing-default"
							/>
						</div>
						<button
							disabled={user === null}
							type="button"
							className="btn btn-light"
							onClick={() =>
								createList(
									user.uid,
									selectedFolder,
									currentList,
								)
							}
						>
							Create New List
						</button>

						<div
							className="btn-group-vertical container"
							role="group"
							aria-label="Vertical button group"
						>
							{currentLists.length > 0 ? (
								currentLists.map((list) => (
									<button
										onClick={handleListSelection}
										value={list.id}
										key={list.id}
										type="button"
										className={`btn ${selectedList === list.id ? "btn-primary" : "btn-light"} text-start`}
									>
										{list.name}
										---
										{list.dateCreated.getDate()}/
										{list.dateCreated.getMonth() + 1}/
										{list.dateCreated.getFullYear()}
									</button>
								))
							) : (
								<button
									className="btn btn-light text-start"
									disabled
								>
									You haven't created any lists yet.
								</button>
							)}
						</div>
					</div>
				</div>
			</div>
		</>
	);
};

export default Home;
