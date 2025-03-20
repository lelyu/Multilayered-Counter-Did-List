import React, { useState, useEffect } from "react";
import { doc, serverTimestamp, updateDoc } from "firebase/firestore";
import { db } from "../config/firebase.ts";
import { Tooltip } from 'bootstrap';
import { createPortal } from 'react-dom';

interface ListButtonProps {
	deleteAction: () => void;
	selectAction: () => void;
	userId: string;
	folderId: string;
	listId: string;
	listName: string;
	dateCreated: Date;
	isSelected: boolean;
	listDescription?: string;
	onModalClose: () => void;
}

const ListButton: React.FC<ListButtonProps> = ({
	deleteAction,
	selectAction,
	userId,
	folderId,
	listId,
	listName,
	listDescription,
	dateCreated,
	isSelected,
	onModalClose,
}): React.JSX.Element => {
	const [name, setName] = useState(listName);
	const [description, setDescription] = useState(listDescription);
	const [isSubmitting, setIsSubmitting] = useState(false);

	// Initialize tooltips after component mounts
	useEffect(() => {
		const tooltips = document.querySelectorAll('[data-bs-toggle="tooltip"]');
		tooltips.forEach(tooltip => {
			new Tooltip(tooltip);
		});

		// Cleanup tooltips on unmount
		return () => {
			tooltips.forEach(tooltip => {
				const bsTooltip = Tooltip.getInstance(tooltip);
				bsTooltip?.dispose();
			});
		};
	}, [listName]);

	// Reset form state when list data changes
	useEffect(() => {
		setName(listName);
		setDescription(listDescription);
	}, [listName, listDescription]);

	const editAction = async () => {
		if (name === listName && description === (listDescription || "")) {
			return;
		}

		setIsSubmitting(true);
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
			if (description && description !== "") {
				await updateDoc(listRef, {
					name: name,
					description: description,
					dateModified: serverTimestamp(),
				});
			} else {
				await updateDoc(listRef, {
					name: name,
					dateModified: serverTimestamp(),
				});
			}
			onModalClose();
		} catch (error) {
			console.error("Error updating document: ", error);
		} finally {
			setIsSubmitting(false);
		}
	};

	const modalId = `modal-list-${listId}`;
	const detailModalId = `modal-list-detail-${listId}`;

	return (
		<>
			{/* Main List Button */}
			<div className="mb-2 w-100">
				<div className={`card w-100 ${isSelected ? 'border-primary' : 'border-light'}`}>
					<div className="card-body py-2 px-3">
						<div className="row align-items-center">
							{/* List Name */}
							<div 
								className="col d-flex align-items-center"
								onClick={selectAction}
								role="button"
								style={{ cursor: 'pointer' }}
							>
								<i className={`bi bi-list-task me-2 ${isSelected ? 'text-primary' : ''}`}></i>
								<div 
									className={`text-truncate ${isSelected ? 'fw-semibold' : ''}`}
									data-bs-toggle="tooltip"
									data-bs-placement="top"
									title={listName}
								>
									{listName}
								</div>
							</div>

							{/* Actions Dropdown */}
							<div className="col-auto">
								<div className="dropdown">
									<button
										type="button"
										className="btn btn-light btn-sm"
										data-bs-toggle="dropdown"
										data-bs-auto-close="true"
										aria-expanded="false"
										disabled={isSubmitting}
									>
										<i className="bi bi-three-dots-vertical"></i>
									</button>
									<ul className="dropdown-menu dropdown-menu-end shadow-sm">
										<li>
											<button
												className="dropdown-item d-flex align-items-center"
												type="button"
												data-bs-toggle="modal"
												data-bs-target={`#${modalId}`}
											>
												<i className="bi bi-pencil me-2"></i>
												Edit List
											</button>
										</li>
										<li>
											<button
												className="dropdown-item d-flex align-items-center"
												type="button"
												data-bs-toggle="modal"
												data-bs-target={`#${detailModalId}`}
											>
												<i className="bi bi-info-circle me-2"></i>
												View Details
											</button>
										</li>
										<li><hr className="dropdown-divider" /></li>
										<li>
											<button
												type="button"
												onClick={deleteAction}
												className="dropdown-item text-danger d-flex align-items-center"
											>
												<i className="bi bi-trash me-2"></i>
												Delete List
											</button>
										</li>
									</ul>
								</div>
							</div>
						</div>

						{/* Saving Indicator */}
						{isSubmitting && (
							<div className="position-absolute top-0 end-0 p-2">
								<div className="spinner-border spinner-border-sm text-primary" role="status">
									<span className="visually-hidden">Saving...</span>
								</div>
							</div>
						)}
					</div>
				</div>
			</div>

			{/* Modals */}
			{createPortal(
				<>
					{/* Edit Modal */}
					<div
						className="modal fade"
						id={modalId}
						data-bs-backdrop="static"
						data-bs-keyboard="false"
						tabIndex={-1}
						aria-labelledby={`editModalLabel-${listId}`}
						aria-hidden="true"
					>
						<div className="modal-dialog modal-dialog-centered">
							<div className="modal-content shadow-sm">
								<div className="modal-header">
									<h1
										className="modal-title fs-5 d-flex align-items-center"
										id={`editModalLabel-${listId}`}
									>
										<i className="bi bi-pencil-square me-2"></i>
										Edit List
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
												htmlFor={`list-name-${listId}`}
												className="form-label"
											>
												List Name
											</label>
											<input
												type="text"
												className="form-control"
												id={`list-name-${listId}`}
												value={name}
												onChange={(e) => setName(e.target.value)}
												placeholder="Enter list name"
												disabled={isSubmitting}
											/>
										</div>
										<div className="mb-3">
											<label
												htmlFor={`list-description-${listId}`}
												className="form-label"
											>
												Description
											</label>
											<textarea
												className="form-control"
												id={`list-description-${listId}`}
												value={description}
												onChange={(e) => setDescription(e.target.value)}
												placeholder="Add a description for your list"
												rows={4}
												disabled={isSubmitting}
											></textarea>
										</div>
									</form>
								</div>
								<div className="modal-footer">
									<button
										type="button"
										className="btn btn-outline-secondary"
										data-bs-dismiss="modal"
										disabled={isSubmitting}
									>
										Cancel
									</button>
									<button
										type="button"
										className="btn btn-primary"
										onClick={editAction}
										data-bs-dismiss="modal"
										disabled={isSubmitting || name.trim() === ""}
									>
										{isSubmitting ? (
											<>
												<span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
												Saving...
											</>
										) : (
											'Save Changes'
										)}
									</button>
								</div>
							</div>
						</div>
					</div>

					{/* Details Modal */}
					<div
						className="modal fade"
						id={detailModalId}
						data-bs-backdrop="static"
						data-bs-keyboard="false"
						tabIndex={-1}
						aria-labelledby={`detailModalLabel-${listId}`}
						aria-hidden="true"
					>
						<div className="modal-dialog modal-dialog-centered">
							<div className="modal-content shadow-sm">
								<div className="modal-header">
									<h1
										className="modal-title fs-5"
										id={`detailModalLabel-${listId}`}
									>
										<i className="bi bi-info-circle me-2"></i>
										List Details
									</h1>
									<button
										type="button"
										className="btn-close"
										data-bs-dismiss="modal"
										aria-label="Close"
									></button>
								</div>
								<div className="modal-body">
									<h4 className="mb-3">{listName}</h4>
									<p className="text-muted mb-4">
										{listDescription?.length === 0
											? "No description provided"
											: listDescription}
									</p>
									<div className="text-muted small">
										<i className="bi bi-calendar3 me-2"></i>
										Created on {dateCreated.toLocaleDateString()}
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
				</>,
				document.getElementById('modal-root') || document.body
			)}
		</>
	);
};

export default ListButton;
