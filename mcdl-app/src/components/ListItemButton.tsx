import React, { useState, useEffect } from "react";
import { doc, serverTimestamp, updateDoc } from "firebase/firestore";
import { db } from "../config/firebase";
import { Tooltip } from 'bootstrap';

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
	}, [listItemName, currCount]);

	// Reset form state when item data changes
	useEffect(() => {
		setName(listItemName);
		setDescription(itemDescription);
		setCurrCount(count);
	}, [listItemName, itemDescription, count]);

	// Format large numbers with commas
	const formatNumber = (num: number) => {
		return num.toLocaleString();
	};

	// Update the item (name, description, count)
	const editAction = async () => {
		if (
			currCount === count &&
			listItemName === name &&
			(itemDescription === description || description === "")
		) {
			return;
		}
		setIsSaving(true);
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
			console.error("Error updating item:", error);
		} finally {
			setIsSaving(false);
		}
	};

	// Increment or decrement the count
	const handleCountChanges = async (isAdding: boolean) => {
		const newCount = isAdding ? currCount + 1 : currCount - 1;
		if (newCount < 0) return; // Prevent negative counts
		
		setCurrCount(newCount);
		setIsSaving(true);
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
			await updateDoc(itemRef, { count: newCount });
		} catch (error) {
			console.error("Error updating count:", error);
			setCurrCount(count); // Revert on error
		} finally {
			setTimeout(() => setIsSaving(false), 300);
		}
	};

	const modalId = `modal-item-${listItemId}`;
	const detailModalId = `modal-item-detail-${listItemId}`;

	return (
		<div className="mb-2 w-100">
			{/* Edit Modal */}
			<div
				className="modal fade"
				id={modalId}
				data-bs-backdrop="static"
				data-bs-keyboard="false"
				tabIndex={-1}
				aria-labelledby={`editModalLabel-${listItemId}`}
				aria-hidden="true"
			>
				<div className="modal-dialog modal-dialog-centered">
					<div className="modal-content shadow-sm">
						<div className="modal-header">
							<h1
								className="modal-title fs-5 d-flex align-items-center"
								id={`editModalLabel-${listItemId}`}
							>
								<i className="bi bi-pencil-square me-2"></i>
								Edit Item
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
										htmlFor={`item-name-${listItemId}`}
										className="form-label"
									>
										Item Name
									</label>
									<input
										type="text"
										className="form-control"
										id={`item-name-${listItemId}`}
										value={name}
										onChange={(e) => setName(e.target.value)}
										placeholder="Enter item name"
										disabled={isSaving}
									/>
								</div>
								<div className="mb-3">
									<label
										htmlFor={`item-count-${listItemId}`}
										className="form-label"
									>
										Count
									</label>
									<div className="input-group">
										<button
											className="btn btn-outline-secondary"
											type="button"
											onClick={() => setCurrCount(prev => Math.max(0, prev - 1))}
											disabled={isSaving}
										>
											<i className="bi bi-dash"></i>
										</button>
										<input
											type="number"
											className="form-control text-center"
											id={`item-count-${listItemId}`}
											value={currCount}
											onChange={(e) => setCurrCount(Math.max(0, parseInt(e.target.value) || 0))}
											disabled={isSaving}
										/>
										<button
											className="btn btn-outline-secondary"
											type="button"
											onClick={() => setCurrCount(prev => prev + 1)}
											disabled={isSaving}
										>
											<i className="bi bi-plus"></i>
										</button>
									</div>
								</div>
								<div className="mb-3">
									<label
										htmlFor={`item-description-${listItemId}`}
										className="form-label"
									>
										Description
									</label>
									<textarea
										className="form-control"
										id={`item-description-${listItemId}`}
										value={description}
										onChange={(e) => setDescription(e.target.value)}
										placeholder="Add a description for your item"
										rows={4}
										disabled={isSaving}
									></textarea>
								</div>
							</form>
						</div>
						<div className="modal-footer">
							<button
								type="button"
								className="btn btn-outline-secondary"
								data-bs-dismiss="modal"
								disabled={isSaving}
							>
								Cancel
							</button>
							<button
								type="button"
								className="btn btn-primary"
								onClick={editAction}
								data-bs-dismiss="modal"
								disabled={isSaving || name.trim() === ""}
							>
								{isSaving ? (
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
				aria-labelledby={`detailModalLabel-${listItemId}`}
				aria-hidden="true"
			>
				<div className="modal-dialog modal-dialog-centered">
					<div className="modal-content shadow-sm">
						<div className="modal-header">
							<h1
								className="modal-title fs-5"
								id={`detailModalLabel-${listItemId}`}
							>
								<i className="bi bi-info-circle me-2"></i>
								Item Details
							</h1>
							<button
								type="button"
								className="btn-close"
								data-bs-dismiss="modal"
								aria-label="Close"
							></button>
						</div>
						<div className="modal-body">
							<h4 className="mb-3">{listItemName}</h4>
							<div className="mb-3">
								<span className="badge bg-primary rounded-pill fs-6">
									Count: {formatNumber(currCount)}
								</span>
							</div>
							<p className="text-muted mb-4">
								{itemDescription?.length === 0
									? "No description provided"
									: itemDescription}
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

			{/* Main Item Button */}
			<div className={`card w-100 ${isSelected ? 'border-primary' : 'border-light'}`}>
				<div className="card-body py-2 px-3">
					<div className="row align-items-center">
						{/* Item Name and Count */}
						<div 
							className="col d-flex align-items-center"
							onClick={selectAction}
							role="button"
							style={{ cursor: 'pointer' }}
						>
							<i className={`bi bi-box me-2 ${isSelected ? 'text-primary' : ''}`}></i>
							<div className="min-w-0">
								<div 
									className={`text-truncate ${isSelected ? 'fw-semibold' : ''}`}
									data-bs-toggle="tooltip"
									data-bs-placement="top"
									title={listItemName}
								>
									{listItemName}
								</div>
								<small 
									className="text-muted text-truncate d-block"
									data-bs-toggle="tooltip"
									data-bs-placement="bottom"
									title={`Count: ${formatNumber(currCount)}`}
								>
									Count: {formatNumber(currCount)}
								</small>
							</div>
						</div>

						{/* Quick Actions */}
						<div className="col-auto d-flex align-items-center gap-2">
							{/* Count Controls */}
							<div className="btn-group btn-group-sm">
								<button
									className="btn btn-outline-secondary"
									onClick={() => handleCountChanges(false)}
									disabled={isSaving || currCount <= 0}
								>
									<i className="bi bi-dash"></i>
								</button>
								<button
									className="btn btn-outline-secondary"
									onClick={() => handleCountChanges(true)}
									disabled={isSaving}
								>
									<i className="bi bi-plus"></i>
								</button>
							</div>

							{/* Actions Dropdown */}
							<div className="dropdown">
								<button
									type="button"
									className="btn btn-light btn-sm"
									data-bs-toggle="dropdown"
									data-bs-auto-close="true"
									aria-expanded="false"
									disabled={isSaving}
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
											Edit Item
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
											Delete Item
										</button>
									</li>
								</ul>
							</div>
						</div>
					</div>

					{/* Saving Indicator */}
					{isSaving && (
						<div className="position-absolute top-0 end-0 p-2">
							<div className="spinner-border spinner-border-sm text-primary" role="status">
								<span className="visually-hidden">Saving...</span>
							</div>
						</div>
					)}
				</div>
			</div>
		</div>
	);
};

export default ListItemButton;
