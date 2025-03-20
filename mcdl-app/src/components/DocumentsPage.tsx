import React, { useEffect, useState } from "react";
import { useParams, useLocation } from "react-router-dom";
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
import { User } from 'firebase/auth';
import { createPortal } from 'react-dom';

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
	user: User | null;
}

const DocumentsPage: React.FC<DocumentsPageProps> = ({ user }) => {
	const { folderId } = useParams<{ folderId: string }>();
	const location = useLocation();
	const folderName = location.state?.folderName || "Untitled Folder";

	// List related state
	const [selectedList, setSelectedList] = useState<string>("");
	const [currentLists, setCurrLists] = useState<List[]>([]);
	const [currentList, setCurrentList] = useState<string>("");

	// List items related state
	const [itemName, setItemName] = useState<string>("");
	const [count, setCount] = useState<number>(0);
	const [currListItems, setCurrListItems] = useState<Item[]>([]);
	const [selectedListItem, setSelectedListItem] = useState<string>("");
	const [itemDescription, setItemDescription] = useState<string>("");

	// Add new state for animations
	const [isListFormVisible, setIsListFormVisible] = useState(false);
	const [isItemFormVisible, setIsItemFormVisible] = useState(false);
	const [isSubmitting, setIsSubmitting] = useState(false);

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

	const handleCreateList = async () => {
		if (user?.uid && folderId && currentList.trim()) {
			setIsSubmitting(true);
			try {
				await createList(user.uid, folderId, currentList);
				setIsListFormVisible(false);
				setCurrentList("");
			} finally {
				setIsSubmitting(false);
			}
		}
	};

	const handleCreateItem = async () => {
		if (user?.uid && folderId && selectedList && itemName.trim()) {
			setIsSubmitting(true);
			try {
				await createItem(
					user.uid,
					folderId,
					selectedList,
					itemName,
					count,
					itemDescription || ""
				);
				setIsItemFormVisible(false);
				setItemName("");
				setItemDescription("");
				setCount(0);
			} finally {
				setIsSubmitting(false);
			}
		}
	};

	return (
		<>
			<div className="vh-100 d-flex flex-column">
				{/* Header */}
				<div className="border-bottom bg-white p-3 d-flex align-items-center">
					<h4 className="m-0 d-flex align-items-center">
						<i className="bi bi-folder2-open me-2 text-primary"></i>
						{folderName}
					</h4>
				</div>

				{/* Main Content */}
				<div className="flex-grow-1 d-flex">
					{/* Lists Sidebar */}
					<div className="border-end bg-light" style={{ width: "250px" }}>
						<div className="p-3" style={{ height: "100%", overflowY: "auto" }}>
							<div className="d-flex justify-content-between align-items-center mb-3">
								<h5 className="m-0">Lists</h5>
								<button
									className="btn btn-sm btn-primary"
									onClick={() => setIsListFormVisible(true)}
								>
									<i className="bi bi-plus-lg"></i>
								</button>
							</div>

							{/* New List Form */}
							<div className={`new-list-form ${isListFormVisible ? 'show' : ''}`}>
								<div className="card card-body shadow-sm">
									<div className="d-flex justify-content-between align-items-center mb-2">
										<h6 className="m-0">New List</h6>
										<button
											className="btn btn-sm btn-link text-muted p-0"
											onClick={() => {
												setIsListFormVisible(false);
												setCurrentList("");
											}}
										>
											<i className="bi bi-x-lg"></i>
										</button>
									</div>
									<div className="input-group">
										<input
											type="text"
											className="form-control form-control-sm"
											value={currentList}
											onChange={(e) => setCurrentList(e.target.value)}
											placeholder="List name"
											onKeyDown={(e) => {
												if (e.key === 'Enter') {
													handleCreateList();
												} else if (e.key === 'Escape') {
													setIsListFormVisible(false);
													setCurrentList("");
												}
											}}
											disabled={isSubmitting}
										/>
										<button
											className="btn btn-sm btn-primary"
											onClick={handleCreateList}
											disabled={isSubmitting || !currentList.trim()}
										>
											{isSubmitting ? (
												<span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
											) : (
												<i className="bi bi-check-lg"></i>
											)}
										</button>
									</div>
								</div>
							</div>

							{/* Lists */}
							<div className="list-group list-group-flush">
								{currentLists.length === 0 ? (
									<div className="text-muted small p-3 text-center">
										No lists yet. Create one to get started!
									</div>
								) : (
									currentLists.map((ls) => (
										<ListButton
											key={ls.id}
											deleteAction={() =>
												user?.uid &&
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
											userId={user?.uid || ""}
											folderId={folderId || ""}
											listId={ls.id}
											listName={ls.name}
											listDescription={ls.description}
											dateCreated={ls.dateCreated}
											isSelected={ls.id === selectedList}
											onModalClose={() =>
												user?.uid &&
												folderId &&
												getLists(user.uid, folderId)
											}
										/>
									))
								)}
							</div>
						</div>
					</div>

					{/* Editor */}
					<div className="flex-grow-1 bg-white">
						<MyEditor 
							userId={user?.uid}
							folderId={folderId}
							listId={selectedList}
							listItemId={selectedListItem}
						/>
					</div>

					{/* List Items Sidebar */}
					<div className="border-start bg-light" style={{ width: "300px" }}>
						<div className="p-3" style={{ height: "100%", overflowY: "auto" }}>
							<div className="d-flex justify-content-between align-items-center mb-3">
								<h5 className="m-0">Items</h5>
								{selectedList && (
									<button
										className="btn btn-sm btn-primary"
										onClick={() => setIsItemFormVisible(true)}
									>
										<i className="bi bi-plus-lg"></i>
									</button>
								)}
							</div>

							{/* New Item Form */}
							<div className={`new-item-form ${isItemFormVisible ? 'show' : ''}`}>
								<div className="card card-body shadow-sm">
									<div className="d-flex justify-content-between align-items-center mb-2">
										<h6 className="m-0">New Item</h6>
										<button
											className="btn btn-sm btn-link text-muted p-0"
											onClick={() => {
												setIsItemFormVisible(false);
												setItemName("");
												setItemDescription("");
												setCount(0);
											}}
										>
											<i className="bi bi-x-lg"></i>
										</button>
									</div>
									<div className="mb-2">
										<input
											type="text"
											className="form-control form-control-sm"
											placeholder="Item name"
											value={itemName}
											onChange={(e) => setItemName(e.target.value)}
											onKeyDown={(e) => {
												if (e.key === 'Enter') {
													handleCreateItem();
												} else if (e.key === 'Escape') {
													setIsItemFormVisible(false);
													setItemName("");
													setItemDescription("");
													setCount(0);
												}
											}}
											disabled={isSubmitting}
										/>
									</div>
									<div className="input-group input-group-sm mb-2">
										<span className="input-group-text">Count</span>
										<input
											type="number"
											className="form-control"
											value={count}
											onChange={(e) => setCount(Number(e.target.value))}
											disabled={isSubmitting}
										/>
									</div>
									<div className="mb-2">
										<textarea
											className="form-control form-control-sm"
											placeholder="Description (optional)"
											value={itemDescription}
											onChange={(e) => setItemDescription(e.target.value)}
											rows={2}
											disabled={isSubmitting}
										></textarea>
									</div>
									<button
										className="btn btn-sm btn-primary w-100"
										onClick={handleCreateItem}
										disabled={isSubmitting || !itemName.trim()}
									>
										{isSubmitting ? (
											<>
												<span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
												Creating...
											</>
										) : (
											<>
												<i className="bi bi-plus-lg me-2"></i>
												Add Item
											</>
										)}
									</button>
								</div>
							</div>

							{/* List Items */}
							<div>
								{!selectedList ? (
									<div className="text-muted small text-center">
										Select a list to view items
									</div>
								) : currListItems.length === 0 ? (
									<div className="text-muted small text-center">
										No items in this list yet
									</div>
								) : (
									currListItems.map((item) => (
										<ListItemButton
											key={item.id}
											deleteAction={() =>
												user?.uid &&
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
											userId={user?.uid || ""}
											folderId={folderId || ""}
											listId={selectedList}
											listItemId={item.id}
											listItemName={item.name}
											dateCreated={item.dateCreated}
											isSelected={
												item.id === selectedListItem
											}
											count={item.count}
											itemDescription={item.description || ""}
											onModalClose={() =>
												user?.uid &&
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
			</div>

			{/* Modal Portal Container */}
			{createPortal(
				<div id="modal-root" />,
				document.body
			)}
		</>
	);
};

export default DocumentsPage;
