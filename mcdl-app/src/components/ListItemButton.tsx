import React, { useState, useEffect } from "react";
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

	// Update the item (name, description, count)
	const editAction = async () => {
		if (
			currCount === count &&
			listItemName === name &&
			(itemDescription === description || description === "")
		) {
			console.log("No changes detected.");
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

	// Increment or decrement the count
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

	// OPTIONAL: If you're not using React Bootstrap or similar,
	// you might need to initialize tooltips yourself:
	// useEffect(() => {
	//   const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'))
	//   tooltipTriggerList.map(function (tooltipTriggerEl) {
	//     return new bootstrap.Tooltip(tooltipTriggerEl)
	//   })
	// }, [])

	return (
		<>
			{/* ===== Edit Modal ===== */}
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

			{/* ===== Details Modal ===== */}
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

			{/* ===== Saving Spinner ===== */}
			{isSaving && (
				<button className="btn btn-success mb-2" type="button" disabled>
					<span
						className="spinner-grow spinner-grow-sm"
						aria-hidden="true"
					/>
					<span role="status"> Saving...</span>
				</button>
			)}

			{/* ===== Row Layout for Each List Item ===== */}
			<div className="row row-cols-1">
				<div className="col">
					<div className="d-flex flex-wrap align-items-center justify-content-between p-2 border rounded">
						{/* Item Name: truncated + tooltip */}
						<div
							className={`text-truncate ${isSelected ? "fw-bold" : ""}`}
							style={{ maxWidth: "120px" }}
							data-bs-toggle="tooltip"
							title={listItemName}
							onClick={selectAction}
						>
							{listItemName}
						</div>

						{/* Count Increment/Decrement */}
						<div
							className="input-group input-group-sm"
							style={{ width: "120px" }}
						>
							<button
								className="btn btn-outline-secondary"
								onClick={() => handleCountChanges(false)}
								disabled={isSaving}
							>
								<i className="bi bi-dash"></i>
							</button>
							<input
								type="text"
								className="form-control text-center"
								value={currCount}
								readOnly
							/>
							<button
								className="btn btn-outline-secondary"
								onClick={() => handleCountChanges(true)}
								disabled={isSaving}
							>
								<i className="bi bi-plus"></i>
							</button>
						</div>

						{/* Actions Dropdown */}
						<div className="btn-group">
							<button
								disabled={isSaving}
								type="button"
								className="btn btn-light dropdown-toggle"
								data-bs-toggle="dropdown"
								aria-expanded="false"
							>
								Actions
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
					</div>
				</div>
			</div>
		</>
	);
};

export default ListItemButton;
