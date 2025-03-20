import React, { useState, useEffect } from "react";
import { serverTimestamp, updateDoc, doc } from "firebase/firestore";
import { db } from "../config/firebase";
import { Tooltip } from 'bootstrap';
import { createPortal } from 'react-dom';

interface FolderButtonProps {
	deleteAction: () => void;
	selectAction: () => void;
	userId: string;
	folderId: string;
	folderName: string;
	dateCreated: Date;
	isSelected: boolean;
	folderDescription?: string;
	onModalClose: () => void;
}

const FolderButton: React.FC<FolderButtonProps> = ({
	deleteAction,
	selectAction,
	userId,
	folderId,
	folderName,
	folderDescription,
	dateCreated,
	isSelected,
	onModalClose,
}) => {
	const [name, setName] = useState(folderName);
	const [description, setDescription] = useState(folderDescription);
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
	}, [folderName]);

	// Reset form state when folder data changes
	useEffect(() => {
		setName(folderName);
		setDescription(folderDescription);
	}, [folderName, folderDescription]);

	const editAction = async () => {
		if (name === folderName && description === (folderDescription || "")) {
			return;
		}

		setIsSubmitting(true);
		try {
			const folderRef = doc(db, "users", userId, "folders", folderId);
			if (description && description !== "") {
				await updateDoc(folderRef, {
					name: name,
					description: description,
					dateModified: serverTimestamp(),
				});
			} else {
				await updateDoc(folderRef, {
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

	const modalId = `modal-folder-${folderId}`;
	const detailModalId = `modal-folder-detail-${folderId}`;

	return (
		<>
			{/* Main Folder Button */}
			<div className="mb-2 w-100">
				<div className={`card w-100 ${isSelected ? 'border-primary' : 'border-light'}`}>
					<div className="card-body py-2 px-3">
						<div className="row align-items-center">
							{/* Folder Name */}
							<div 
								className="col d-flex align-items-center"
								onClick={selectAction}
								role="button"
								style={{ cursor: 'pointer' }}
							>
								<i className={`bi bi-folder2 me-2 ${isSelected ? 'text-primary' : ''}`}></i>
								<div 
									className={`text-truncate ${isSelected ? 'fw-semibold' : ''}`}
									data-bs-toggle="tooltip"
									data-bs-placement="top"
									title={folderName}
								>
									{folderName}
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
												Edit Folder
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
												Delete Folder
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
						aria-labelledby={`editModalLabel-${folderId}`}
						aria-hidden="true"
					>
						<div className="modal-dialog modal-dialog-centered">
							<div className="modal-content shadow-sm">
								<div className="modal-header">
									<h1
										className="modal-title fs-5 d-flex align-items-center"
										id={`editModalLabel-${folderId}`}
									>
										<i className="bi bi-pencil-square me-2"></i>
										Edit Folder
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
												htmlFor={`folder-name-${folderId}`}
												className="form-label"
											>
												Folder Name
											</label>
											<input
												type="text"
												className="form-control"
												id={`folder-name-${folderId}`}
												value={name}
												onChange={(e) => setName(e.target.value)}
												placeholder="Enter folder name"
												disabled={isSubmitting}
											/>
										</div>
										<div className="mb-3">
											<label
												htmlFor={`folder-description-${folderId}`}
												className="form-label"
											>
												Description
											</label>
											<textarea
												className="form-control"
												id={`folder-description-${folderId}`}
												value={description}
												onChange={(e) => setDescription(e.target.value)}
												placeholder="Add a description for your folder"
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
						aria-labelledby={`detailModalLabel-${folderId}`}
						aria-hidden="true"
					>
						<div className="modal-dialog modal-dialog-centered">
							<div className="modal-content shadow-sm">
								<div className="modal-header">
									<h1
										className="modal-title fs-5"
										id={`detailModalLabel-${folderId}`}
									>
										<i className="bi bi-info-circle me-2"></i>
										Folder Details
									</h1>
									<button
										type="button"
										className="btn-close"
										data-bs-dismiss="modal"
										aria-label="Close"
									></button>
								</div>
								<div className="modal-body">
									<h4 className="mb-3">{folderName}</h4>
									<p className="text-muted mb-4">
										{folderDescription?.length === 0
											? "No description provided"
											: folderDescription}
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

export default FolderButton;
