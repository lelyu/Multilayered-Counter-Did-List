import { auth, db } from "../config/firebase";
import {
	collection,
	getDocs,
	query,
	where,
	collectionGroup,
} from "firebase/firestore";

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

const getAllLists = async ({ userId }) => {
	if (!userId) return;
	const lists = query(
		collectionGroup(db, "lists"),
		where("createdBy", "==", userId),
	);
	const querySnapshot = await getDocs(lists);
	const res = querySnapshot.docs.map((ls) => {
		return {
			id: ls.id,
			name: ls.data().name,
			dateCreated: ls.data().dateCreated.toDate().toLocaleString(),
			description: ls.data().description ? ls.data().description : "",
			dateModified: ls.data().dateModified
				? ls.data().dateModified.toDate().toDate().toLocaleString()
				: "",
		};
	});
	return res;
};

const getAllListsTest = async ({ userId }) => {
	if (!userId) return;
	const lists = query(
		collectionGroup(db, "lists"),
		where("createdBy", "==", userId),
	);
	const querySnapshot = await getDocs(lists);

	querySnapshot.forEach((doc) => {
		console.log(doc.id, " => ", doc.data());
	});
	return [];
};

const getAllListItems = async ({ userId }) => {
	if (!userId) return;
	const items = query(
		collectionGroup(db, "items"),
		where("createdBy", "==", userId),
	);
	const querySnapshot = await getDocs(items);
	const res = querySnapshot.docs.map((item) => {
		return {
			id: item.id,
			name: item.data().name,
			count: item.data().count,
			dateCreated: item.data().dateCreated.toDate().toLocaleString(),
			description: item.data().description ? item.data().description : "",
			dateModified: item.data().dateModified
				? item.data().dateModified.toDate().toDate().toLocaleString()
				: "",
		};
	});
	console.log(res);
	return res;
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

export { getAllFolders, getAllLists, getAllListsTest, getAllListItems };
