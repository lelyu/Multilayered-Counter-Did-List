import React, {useState, useEffect} from "react";
import {auth, db} from "../config/firebase";
import {addDoc, collection, serverTimestamp} from "firebase/firestore";

const Home: React.FC = () => {
    const [count, setCount] = useState<number>(0); // Corrected type annotation

    const folders: string[] = [];
    const currLists: string[] = [];
    const currListItems: string[] = [];

    for (let i = 0; i < 10; i++) {
        folders.push(`Folder ${i}`);
    }
    for (let i = 0; i < 10; i++) {
        currLists.push(`List ${i}`);
    }
    for (let i = 0; i < 10; i++) {
        currListItems.push(`Item ${i}`);
    }

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


    const onCounterClick = (isPlus: boolean): void => {
        if (isPlus) {
            setCount((prevCount) => prevCount + 1);
        } else {
            setCount((prevCount) => prevCount - 1);
        }
    };

    const addToCurrentList = (): void => {
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
                            onClick={addToCurrentList}
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
                            {currLists.map((ls) => (
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
