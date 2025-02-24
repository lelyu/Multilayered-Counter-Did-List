import React, {useState, useEffect} from "react";
import {auth, db} from "../config/firebase";
import {collection, getDocs, addDoc, serverTimestamp} from "firebase/firestore";
import {onAuthStateChanged} from "firebase/auth";

const Home: React.FC = () => {
    const [itemName, setItemName] = useState<string>("");
    const [count, setCount] = useState<number>(0); // Corrected type annotation
    const [folders, setFolders] = useState<string[]>([]);
    const [currentLists, setCurrLists] = useState<string[]>([]);
    const [currListItems, setCurrListItems] = useState<string[]>([]);
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedFolder, setSelectedFolder] = useState<string>("");
    const [selectedList, setSelectedList] = useState<string>("");


    // fetch and set user ojbect
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                setUser(user);
                console.log('User is here');
            } else {
                console.log('User is not here');
            }
            setLoading(false); // authentication check is complete
        });

        // Cleanup the listener on component unmount
        return () => unsubscribe();
    }, []); // run only once on mount
    // fetch folders created by current user
    useEffect(() => {
        if (!user) return;
        const getFolders = async (userId: string) => {
            const foldersRef = collection(db, "users", userId, "folders");
            const foldersSnapshot = await getDocs(foldersRef);
            const folders = foldersSnapshot.docs.map((doc) => doc.id);
            setFolders(folders);
        }
        getFolders(user.uid);
    }, [])
    // fetch and set list under current folder
    const getLists = async (folderId: string) => {
        if (!user) return;
        const listsRef = collection(db, "folders", folderId);
        const listsSnapshot = await getDocs(listsRef);
        const lists = listsSnapshot.docs.map((doc) => doc.id);
        setCurrLists(lists);
    }

    const getListItems = async (folderId: string, listId: string) => {
        const itemsRef = collection(db, "folders", folderId, "lists", listId);
        const itemsSnapshot = await getDocs(itemsRef);
        const items = itemsSnapshot.docs.map((doc) => doc.id);
        setCurrListItems(items);
    }

    // by default set selected folder and selected list to be the first one
    useEffect(() => {
        if (!user) return;
        if (folders.length > 0) {
            setSelectedFolder(folders[0]);
            getLists(folders[0]);
        }
        if (currentLists.length > 0) {
            setSelectedList(currentLists[0]);
        }
    }, []);

    // fetch and set items under current list
    useEffect(() => {
        if (!user) return;
        getListItems(selectedFolder, selectedList);
    }, [])


    const createFolder = async (userId: string, folderName: string) => {
        try {
            const folderRef = await addDoc(collection(db, 'folders'), {
                name: folderName,
                dateCreated: serverTimestamp()
            });
            console.log("folder was created", folderRef.id);
            return folderRef.id
        } catch (error) {
            console.log(error);
        }
    };

    const createList = async (folderId: string, listName: string) => {
        try {
            const listRef = await addDoc(collection(db, 'folders', folderId, 'lists'), {
                name: listName,
                dateCreated: serverTimestamp()
            });
            console.log("List created with ID:", listRef.id);
            return listRef.id;  // Return list id for further nesting
        } catch (error) {
            console.error("Error creating list:", error);
        }
    }

    const createItem = async (folderId: string, listId: string, itemName: string, count: number) => {
        try {
            const itemRef = await addDoc(collection(db, 'folders', folderId, 'lists', listId, 'items'), {
                name: itemName,
                dateCreated: serverTimestamp(),
                count: count
            });
            console.log("Item created with ID:", itemRef.id);
            return itemRef.id;
        } catch (error) {
            console.error("Error creating item:", error);
        }
    }

    const handleSaveToCurrentList = async (e) => {
        if (!user) return;
        if (selectedFolder === "") {
            // create a new default folder
            const folderId: string = await createFolder(user.uid, "Default Folder");
            setSelectedFolder(folderId);
        }
        if (selectedList === "") {
            const ListId: string = await createList(selectedFolder, "Default List");
            setSelectedList(ListId);
        }

        e.preventDefault();
        createItem(selectedFolder, selectedList, itemName, count);
        console.log("Item created");
    }


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
                        <div
                            className="btn-group-vertical container"
                            role="group"
                            aria-label="Vertical button group"
                        >
                            {folders.map((folder) => (
                                <button type="button" className="btn btn-light text-start">
                                    {folder}
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
                                <button type="button" className="btn btn-light text-start">
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
                                <button type="button" className="btn btn-light text-start">
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
