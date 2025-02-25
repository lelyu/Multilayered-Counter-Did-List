import React, { useState, useEffect } from "react";
import { auth, db } from "../config/firebase";
import {
	collection,
	getDocs,
	addDoc,
	serverTimestamp,
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";

const Home: React.FC = () => {
	interface Folder {
		id: string;
		name: string;
		dateCreated: Date;
	}

	const [itemName, setItemName] = useState<string>("");
	const [count, setCount] = useState<number>(0); // Corrected type annotation
	const [folders, setFolders] = useState<Folder[]>([]);
	const [currentLists, setCurrLists] = useState<string[]>([]);
	const [currListItems, setCurrListItems] = useState<string[]>([]);
	const [user, setUser] = useState(null);
	const [loading, setLoading] = useState(true);
	const [selectedFolder, setSelectedFolder] = useState<string>("");
	const [selectedList, setSelectedList] = useState<string>("");
	const [currentFolder, setCurrentFolder] = useState<string>("");

	const getFolders = async (userId: string) => {
		const foldersRef = collection(db, "users", userId, "folders");
		const foldersSnapshot = await getDocs(foldersRef);
		const folders = foldersSnapshot.docs.map((doc) => {
			console.log(doc.data().dateCreated.toDate());

			return {
				id: doc.id,
				name: doc.data().name,
				dateCreated: doc.data().dateCreated.toDate(),
			};
		});
		setFolders(folders);
	};

	const getLists = async (userId: string, folderId: string) => {
		if (!user) return;
		const listsRef = collection(
			db,
			"users",
			userId,
			"folders",
			folderId,
			"lists",
		);
		const listsSnapshot = await getDocs(listsRef);
		const lists = listsSnapshot.docs.map((doc) => doc.id);
		setCurrLists(lists);
	};

	const getListItems = async (
		userId: string,
		folderId: string,
		listId: string,
	) => {
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
		const items = itemsSnapshot.docs.map((doc) => doc.id);
		setCurrListItems(items);
	};

	const createFolder = async (userId: string, folderName: string) => {
		try {
			const folderRef = await addDoc(
				collection(db, "users", userId, "folders"),
				{
					name: folderName,
					dateCreated: serverTimestamp(),
				},
			);
			console.log("folder was created", folderRef.id);
			return folderRef.id;
		} catch (error) {
			console.log(error);
		}
	};

	const createList = async (
		userId: string,
		folderId: string,
		listName: string,
	) => {
		try {
			const listRef = await addDoc(
				collection(db, "users", userId, "folders", folderId, "lists"),
				{
					name: listName,
					dateCreated: serverTimestamp(),
				},
			);
			console.log("List created with ID:", listRef.id);
			return listRef.id; // Return list id for further nesting
		} catch (error) {
			console.error("Error creating list:", error);
		}
	};

	const createItem = async (
		userId: string,
		folderId: string,
		listId: string,
		itemName: string,
		count: number,
	) => {
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
			return itemRef.id;
		} catch (error) {
			console.error("Error creating item:", error);
		}
	};

	const fetchAndSetInitialData = async () => {
		try {
			getFolders(user.uid);
		} catch (error) {
			console.error("Error fetching initial data:", error);
		}
	};

	// fetch and set user object
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

	useEffect(() => {
		if (user) {
			fetchAndSetInitialData();
		}
	}, [user]); // run when user changes

	const handleSaveToCurrentList = async (e) => {
		e.preventDefault();
		if (!user) return;

		// Determine the folder to use
		let folderIdToUse = selectedFolder;
		if (!folderIdToUse) {
			folderIdToUse = await createFolder(user.uid, "Default Folder");
			setSelectedFolder(folderIdToUse);
		}

		// Determine the list to use
		let listIdToUse = selectedList;
		if (!listIdToUse) {
			listIdToUse = await createList(
				user.uid,
				folderIdToUse,
				"Default List",
			);
			setSelectedList(listIdToUse);
		}

		await createItem(user.uid, folderIdToUse, listIdToUse, itemName, count);
		console.log("Item created");
	};

	const onCounterClick = (isPlus: boolean): void => {
		if (isPlus) {
			setCount((prevCount) => prevCount + 1);
		} else {
			setCount((prevCount) => prevCount - 1);
		}
	};

	return (
		<>
			<div className="container text-center">
				<div className="row align-items-start">
					<div className="col">
						<h1>Folder Column</h1>
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
							{folders.map((folder) => (
								<button
									key={folder.id}
									type="button"
									className="btn btn-light text-start"
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
						<h1>Home</h1>
						<button
							type="button"
							className="btn btn-light"
							onClick={handleSaveToCurrentList}
						>
							Save
						</button>
						<div
							className="btn-group-vertical container"
							role="group"
							aria-label="Vertical button group"
						>
							{currListItems.map((item) => (
								<button
									type="button"
									className="btn btn-light text-start"
								>
									{item}
								</button>
							))}
						</div>
						<div>
							<div className="input-group mb-3">
								<span
									className="input-group-text"
									id="inputGroup-sizing-default"
								>
									Type or Select
								</span>
								<input
									type="text"
									className="form-control"
									aria-label="Sizing example input"
									aria-describedby="inputGroup-sizing-default"
								/>
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
						<h1>List Column (current folder)</h1>

						<div
							className="btn-group-vertical container"
							role="group"
							aria-label="Vertical button group"
						>
							{currentLists.map((ls) => (
								<button
									type="button"
									className="btn btn-light text-start"
								>
									{ls}
								</button>
							))}
						</div>
					</div>
				</div>
			</div>
		</>
	);
};

export default Home;
