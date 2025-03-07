import { auth, db } from "../config/firebase";
import { collection, getDocs, query, where } from "firebase/firestore";

// function calling (tools) for the Vertex API

const getAllFolders = async ({ userId }) => {
	if (!userId) return;
	const foldersRef = collection(db, "users", userId, "folders");
	const foldersSnapshot = await getDocs(foldersRef);
	const folders = foldersSnapshot.docs.map((folder) => {
		return {
			id: folder.id,
			name: folder.data().name,
			dateCreated: folder.data().dateCreated.toDate(),
			description: folder.data().description
				? folder.data().description
				: "",
			dateModified: folder.data().dateModified
				? folder.data().dateModified.toDate()
				: "",
		};
	});
	return folders;
};

// testing
// const getAllFolders = async ({ userId }) => {
// 	if (!userId) return;
// 	console.log("User ID:", userId, typeof userId);
// 	const foldersRef = collection(db, "users", userId, "folders");
// 	const foldersSnapshot = await getDocs(foldersRef);
// 	const folders = foldersSnapshot.docs.map((folder) => ({
// 		id: folder.id,
// 		name: folder.data().name,
// 		dateCreated: folder.data().dateCreated.toDate(),
// 		description: folder.data().description ? folder.data().description : "",
// 		dateModified: folder.data().dateModified
// 			? folder.data().dateModified.toDate()
// 			: "",
// 	}));
// 	// Return the first folder object, or null if no folders exist.
// 	return folders.length > 0 ? folders[0] : null;
// };

const getAllLists = async (userId, folderId) => {
	if (!userId || !folderId) return;
	const listsRef = collection(
		db,
		"users",
		userId,
		"folders",
		folderId,
		"lists",
	);
	const listsSnapshot = await getDocs(listsRef);
	const lists = listsSnapshot.docs.map((list) => {
		return {
			id: list.id,
			name: list.data().name,
			dateCreated: list.data().dateCreated.toDate(),
			description: list.data().description ? list.data().description : "",
			dateModified: list.data().dateModified
				? list.data().dateModified.toDate()
				: "",
		};
	});
	return lists;
};

const getAllListItems = async (userId, folderId, listId) => {
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
	const items = itemsSnapshot.docs.map((item) => {
		return {
			id: item.id,
			name: item.data().name,
			dateCreated: item.data().dateCreated.toDate(),
			description: item.data().description ? item.data().description : "",
			dateModified: item.data().dateModified
				? item.data().dateModified.toDate()
				: "",
			count: item.data().count,
		};
	});
	return items;
};

const getSingleFolderByName = async (userId, folderName) => {
	const foldersRef = collection(db, "users", userId, "folders");
	const q = query(foldersRef, where("name", "==", folderName));
	const querySnapshot = await getDocs(q);
	querySnapshot.forEach((doc) => {
		// doc.data() is never undefined for query doc snapshots
		console.log(doc.id, " => ", doc.data());
	});
};

const getSingleListByName = async (userId, listName) => {};

const getSingleListItemByName = async (userId, itemName) => {};

export { getAllFolders, getSingleListByName, getSingleListItemByName };
