import React, { useState } from "react";
import { doc, serverTimestamp, updateDoc } from "firebase/firestore";
import { db } from "../config/firebase.ts";

interface ListItemButtonProps {
	deleteAction: () => void;
	selectAction: () => void;
	onModalClose: () => void;
	userId: string;
	folderId: string;
	listId: string;
	listItemId: string;
	listItemName: string;
	dateCreated: Date;
	isSelected: boolean;
	count: number;
	itemDescription?: string;
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
}) => {
	const [currCount, setCurrCount] = useState(count);
	const [name, setName] = useState(listItemName);
	const [description, setDescription] = useState(itemDescription);
	const [isSaving, setIsSaving] = useState(false);

	// Unique IDs for each modal & label
	const modalId = `exampleModal-ls-item-${listItemId}`;
	const editModalLabelId = `editModalLabel-${listItemId}`;

	const detailModalId = `exampleDetailModalLs-item-${listItemId}`;
	const detailModalLabelId = `detailModalLabel-${listItemId}`;

	const editAction = async () => {
		// if no changes occur return
		if (
			currCount === count &&
			listItemName === name &&
			(itemDescription === description || description === "")
		) {
			console.log("itemDescription", itemDescription);
			console.log("no changes detected");
			return;
		}
		try {
			console.log("updating database");
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
			await updateDoc(itemRef, {
				name,
				description,
				dateModified: serverTimestamp(),
				count: currCount,
			});
			onModalClose();
		} catch (error) {
			console.log(error);
		}
	};

	const handleCountChanges = async (isAdding: boolean) => {
		const newCount = isAdding ? currCount + 1 : currCount - 1;
		setCurrCount(newCount);
		setIsSaving(true);

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
		await updateDoc(itemRef, { count: newCount });
		setTimeout(() => {
			setIsSaving(false);
		}, 300);
	};

	return (
		<>
			{/* Edit Item Modal */}
			<div
				className="modal fade"
				id={modalId}
				tabIndex={-1}
				aria-labelledby={editModalLabelId}
				aria-hidden="true"
			>
				<div className="modal-dialog">
					<div className="modal-content">
						<div className="modal-header">
							<h1
								className="modal-title fs-5"
								id={editModalLabelId}
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

			{/* View Details Modal */}
			<div
				className="modal fade"
				id={detailModalId}
				tabIndex={-1}
				aria-labelledby={detailModalLabelId}
				aria-hidden="true"
			>
				<div className="modal-dialog">
					<div className="modal-content">
						<div className="modal-header">
							<h1
								className="modal-title fs-5"
								id={detailModalLabelId}
							>
								Item Details
								<span className="ms-3">
									<i className="bi bi-activity"></i>
								</span>
							</h1>
							<button
								type="button"
								className="btn-close"
								data-bs-dismiss="modal"
								aria-label="Close"
							></button>
						</div>
						<div className="modal-body">
							<div className="card" style={{ width: "18rem" }}>
								<div className="card-body">
									<h5 className="card-title">
										{listItemName}
									</h5>
									<p className="card-text">
										{itemDescription?.length === 0
											? "No description"
											: itemDescription}
									</p>
								</div>
								<ul className="list-group list-group-flush">
									<li className="list-group-item">
										Date Created:{" "}
										{dateCreated.toLocaleString()}
									</li>
								</ul>
							</div>
						</div>
						<div className="modal-footer">
							<button
								type="button"
								className="btn btn-secondary"
								data-bs-dismiss="modal"
							>
								Close
							</button>
						</div>
					</div>
				</div>
			</div>

			{/* If isSaving is true, show spinner */}
			{isSaving && (
				<button className="btn btn-success" type="button" disabled>
					<span
						className="spinner-grow spinner-grow-sm"
						aria-hidden="true"
					/>
					<span role="status">Saving...</span>
				</button>
			)}

			{/* Main Button Group */}
			<div
				className="btn-group"
				role="group"
				aria-label="Folder Button"
				style={{ width: "100%", display: "flex" }}
			>
				<button
					onClick={selectAction}
					type="button"
					className={`btn ${
						isSelected ? "btn-primary" : "btn-light"
					} text-start`}
					style={{ width: "80%" }}
				>
					{listItemName}{" "}
					<span className="fst-italic">Count: {currCount}</span>
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
						<button
							className="dropdown-item"
							data-bs-toggle="modal"
							data-bs-target={`#${detailModalId}`}
						>
							View Details
						</button>
					</li>
					<li>
						<hr className="dropdown-divider" />
					</li>
					<li>
						<button
							onClick={deleteAction}
							className="btn btn-danger dropdown-item"
						>
							Delete This Item
						</button>
					</li>
				</ul>
			</div>
		</>
	);
};

export default ListItemButton;
