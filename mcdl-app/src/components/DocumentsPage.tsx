import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import MyEditor from "./MyEditor";
import ListButton from "./ListButton";
import ListItemButton from "./ListItemButton";
import { db } from "../config/firebase";
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

interface Item {
	id: string;
	name: string;
	count: number;
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

	// List items (or "My Items") related state
	const [itemName, setItemName] = useState<string>("");
	const [count, setCount] = useState<number>(0);
	const [currListItems, setCurrListItems] = useState<Item[]>([]);
	const [selectedListItem, setSelectedListItem] = useState<string>("");
	const [itemDescription, setItemDescription] = useState<string>("");

	// ------------------ List functions ------------------

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

	const handleListSelection = (listId: string) => {
		if (!user) return;
		setSelectedList(listId);
	};

	// ------------------ List items functions ------------------

	const getListItems = async (
		userId: string,
		folderId: string,
		listId: string,
	) => {
		if (!userId || !folderId) return;
		if (!listId) {
			setCurrListItems([]);
			return;
		}
		try {
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
			const items = itemsSnapshot.docs.map((doc) => ({
				id: doc.id,
				name: doc.data().name,
				count: doc.data().count,
				dateCreated: doc.data().dateCreated.toDate(),
				description: doc.data().description || "",
			}));
			setCurrListItems(items);
			setSelectedListItem(items[0]?.id || "");
		} catch (error) {
			console.error("Error fetching list items:", error);
			setCurrListItems([]);
		}
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
			return;
		}
		if (!folderId || !listId) {
			console.error("Error creating item: missing user or folder ID");
			return;
		}
		if (itemName.trim().length === 0) {
			console.error("Error creating item: missing item name");
			return;
		}
		try {
			await addDoc(
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
			console.error("Error deleting list item:", error);
		} finally {
			await getListItems(userId, folderId, listId);
		}
	};

	const new_handleListItemSelection = (itemId: string) => {
		if (!user) return;
		setSelectedListItem(itemId);
	};

	// ------------------ Effects ------------------

	// Fetch lists when user or folderId changes
	useEffect(() => {
		if (user && folderId) {
			getLists(user.uid, folderId);
		}
	}, [user, folderId]);

	// Fetch list items whenever selectedList changes
	useEffect(() => {
		if (user && folderId && selectedList) {
			getListItems(user.uid, folderId, selectedList);
		}
	}, [user, folderId, selectedList]);

	return (
		<>
			<h1>Folder {folderId}</h1>
			<div className="container-fluid">
				<div className="row">
					{/* --- Lists Column --- */}
					<div className="col-2">
						<div className="shadow p-3 mb-5 bg-body-tertiary rounded vh-100">
							<h3>My Lists</h3>

							<hr />

							<div
								className="btn-group-vertical container"
								role="group"
								aria-label="Vertical button group"
							>
								{currentLists.length === 0 ? (
									<button
										className="btn btn-light text-start"
										disabled
									>
										You haven't created any lists yet.
									</button>
								) : (
									currentLists.map((ls) => (
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
									))
								)}
							</div>
						</div>
					</div>
					{/* --- Editor Column --- */}
					<div className="col-8">
						<MyEditor />
					</div>
					{/* --- List Items Column --- */}
					<div className="col-2">
						<div className="shadow p-3 bg-body-tertiary rounded vh-100">
							<h3>Current Items</h3>
							<div>
								{/* Render list items */}
								<hr />
								<div
									className="btn-group-vertical container"
									role="group"
									aria-label="Vertical button group"
								>
									{currListItems.length === 0 ? (
										<button
											className="btn btn-light text-start"
											disabled
										>
											You haven't created any items yet.
										</button>
									) : (
										currListItems.map((item) => (
											<ListItemButton
												key={item.id}
												deleteAction={() =>
													user &&
													folderId &&
													selectedList &&
													deleteListItem(
														user.uid,
														folderId,
														selectedList,
														item.id,
													)
												}
												selectAction={() =>
													new_handleListItemSelection(
														item.id,
													)
												}
												userId={user.uid}
												folderId={folderId}
												listId={selectedList}
												listItemId={item.id}
												listItemName={item.name}
												dateCreated={item.dateCreated}
												isSelected={
													item.id === selectedListItem
												}
												count={item.count}
												itemDescription={
													item.description
												}
												onModalClose={() =>
													user &&
													folderId &&
													selectedList &&
													getListItems(
														user.uid,
														folderId,
														selectedList,
													)
												}
											/>
										))
									)}
								</div>
							</div>
						</div>
					</div>
					{/* End of columns */}
				</div>
			</div>
		</>
	);
};

export default DocumentsPage;
