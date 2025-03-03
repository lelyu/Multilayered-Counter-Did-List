import React, { useState } from "react";
import { doc, serverTimestamp, updateDoc } from "firebase/firestore";
import { db } from "../config/firebase.ts";

interface ListItemButtonProps {
	deleteAction: () => void;
	selectAction: () => void;
	onModalClose: () => void; // parent callback
	userId: string;
	folderId: string;
	listId: string;
	listItemId: string;
	listItemName: string;
	dateCreated: Date;
	isSelected: boolean;
	count: number;
	itemDescription: string;
}

const ListItemButton: React.FC<ListItemButtonProps> = ({
	deleteAction,
	selectAction,
	onModalClose,
	userId,
	folderId,
	listId,
	listItemId,
	listItemName,
	dateCreated,
	isSelected,
	count,
	itemDescription,
}): Element => {
	const [currCount, setCurrCount] = useState(count);
	const [name, setName] = useState(listItemName);
	const [description, setDescription] = useState(itemDescription);
	const [isSaving, setIsSaving] = useState(false);
	const modalId = `exampleModal-ls-item-${listItemId}`;

	const editAction = async () => {
		// if no changes occur return
		if (
			currCount === count &&
			listItemName === name &&
			(itemDescription === description || itemDescription === "")
		) {
			return;
		}
		try {
			const itemRef = doc(
				db,
				"users",
				userId,
				"folders",
				folderId,
				"lists",
				listId,
				"items",
				listItemId,
			);
			if (description && description.length > 0) {
				await updateDoc(itemRef, {
					name: name,
					description: description,
					dateModified: serverTimestamp(),
					count: currCount,
				});
			} else {
				await updateDoc(itemRef, {
					name: name,
					description: description,
					dateModified: serverTimestamp(),
					count: currCount,
				});
			}
			onModalClose();
		} catch (error) {
			console.log(error);
		}
	};

	const handleCountChanges = async (isAdding: boolean) => {
		// Compute the new count based on the current value.
		const newCount = isAdding ? currCount + 1 : currCount - 1;
		// Update the state with the new count.
		setCurrCount(newCount);
		setIsSaving(true);
		// Reference to the document.
		const itemRef = doc(
			db,
			"users",
			userId,
			"folders",
			folderId,
			"lists",
			listId,
			"items",
			listItemId,
		);
		// Update the document with the new count.
		await updateDoc(itemRef, { count: newCount });
		setTimeout(() => {
			setIsSaving(false);
		}, 300);
	};

	return (
		<>
			{/*modal*/}
			<div
				className="modal fade"
				id={modalId}
				tabIndex={-1}
				aria-labelledby="exampleModalLabel"
				aria-hidden="true"
			>
				<div className="modal-dialog">
					<div className="modal-content">
						<div className="modal-header">
							<h1
								className="modal-title fs-5"
								id="exampleModalLabel"
							>
								Edit Item {listItemId}
							</h1>
							<button
								type="button"
								className="btn-close"
								data-bs-dismiss="modal"
								aria-label="Close"
							/>
						</div>
						<div className="modal-body">
							<form>
								<div className="mb-3">
									<label
										htmlFor="recipient-name"
										className="col-form-label"
									>
										Item Name
									</label>
									<input
										type="text"
										className="form-control"
										id="recipient-name"
										value={name}
										onChange={(e) =>
											setName(e.target.value)
										}
									/>
								</div>
								<div className="mb-3">
									<label
										htmlFor="message-text"
										className="col-form-label"
									>
										Add a Description
									</label>
									<textarea
										className="form-control"
										id="message-text"
										value={description}
										onChange={(e) =>
											setDescription(e.target.value)
										}
									></textarea>
								</div>
							</form>
						</div>
						<div className="modal-footer">
							<button
								type="button"
								className="btn btn-secondary"
								data-bs-dismiss="modal"
							>
								Close
							</button>
							<button
								type="button"
								className="btn btn-primary"
								data-bs-dismiss="modal"
								onClick={editAction}
							>
								Save
							</button>
						</div>
					</div>
				</div>
			</div>

			{/*modal ends*/}

			{isSaving && (
				<button className="btn btn-success" type="button" disabled>
					<span
						className="spinner-grow spinner-grow-sm"
						aria-hidden="true"
					></span>
					<span role="status">Saving...</span>
				</button>
			)}

			<div
				className="btn-group"
				role="group"
				aria-label="Folder Button"
				style={{ width: "100%", display: "flex" }}
			>
				<button
					onClick={selectAction}
					type="button"
					className={`btn ${isSelected ? "btn-primary" : "btn-light"} text-start`}
					style={{ width: "80%" }}
				>
					{listItemName}
					<span className="fst-italic"> Count: {currCount} </span>
				</button>

				<button
					disabled={isSaving}
					className="btn btn-light"
					onClick={() => handleCountChanges(false)}
				>
					<i className="bi bi-arrow-left"></i>
				</button>
				<button
					disabled={isSaving}
					className="btn btn-light"
					onClick={() => handleCountChanges(true)}
				>
					<i className="bi bi-arrow-right"></i>
				</button>

				<button
					disabled={isSaving}
					onClick={selectAction}
					type="button"
					className="btn btn-light dropdown-toggle dropdown-toggle-split"
					data-bs-toggle="dropdown"
					aria-expanded="false"
					style={{ width: "20%" }}
				>
					<span className="visually-hidden">See Actions</span>
				</button>
				<ul className="dropdown-menu">
					<li>
						<button
							className="dropdown-item"
							data-bs-toggle="modal"
							data-bs-target={`#${modalId}`}
							data-bs-whatever="@mdo"
						>
							Edit Item
						</button>
					</li>
					<li>
						<a className="dropdown-item" href="#">
							View Details
						</a>
					</li>
					<li>
						<a className="dropdown-item" href="#">
							Something else here
						</a>
					</li>
					<li>
						<hr className="dropdown-divider" />
					</li>
					<li>
						<a
							onClick={deleteAction}
							className="btn btn-danger dropdown-item"
							href="#"
						>
							Delete This Item
						</a>
					</li>
				</ul>
			</div>
		</>
	);
};

export default ListItemButton;
