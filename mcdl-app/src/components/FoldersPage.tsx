import React, {useEffect, useState} from "react";
import { Link } from "react-router-dom";
import { collection, query, orderBy, limit, getDocs, doc, updateDoc, deleteDoc, serverTimestamp, addDoc } from "firebase/firestore";
import { db } from "../config/firebase";
import { createPortal } from 'react-dom';
import { Modal } from 'bootstrap';

interface List {
	id: string;
	name: string;
	dateModified: Date;
	description?: string;
}

interface Folder {
	id: string;
	name: string;
	description?: string;
	dateCreated: Date;
	dateModified: Date;
	userId: string;
}

interface FoldersPageProps {
	folders: Folder[];
	userId: string;
	onFolderUpdate: () => void;  // Callback to refresh folders after update/delete
}

const FoldersPage: React.FC<FoldersPageProps> = ({ folders, userId, onFolderUpdate }) => {
	const [folderLists, setFolderLists] = useState<{ [key: string]: List[] }>({});
	const [editingFolder, setEditingFolder] = useState<Folder | null>(null);
	const [editName, setEditName] = useState("");
	const [editDescription, setEditDescription] = useState("");
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [newFolderName, setNewFolderName] = useState("");
	const [isCreating, setIsCreating] = useState(false);
	const [modalInstance, setModalInstance] = useState<Modal | null>(null);

	// Initialize modal when editingFolder changes
	useEffect(() => {
		if (editingFolder) {
			const modalElement = document.getElementById(`modal-folder-${editingFolder.id}`);
			if (modalElement) {
				const modal = new Modal(modalElement, {
					backdrop: 'static',
					keyboard: false
				});
				setModalInstance(modal);
				modal.show();
			}
		}
	}, [editingFolder]);

	// Cleanup modal instance when component unmounts
	useEffect(() => {
		return () => {
			if (modalInstance) {
				modalInstance.dispose();
			}
		};
	}, [modalInstance]);

	// Fetch recent lists for each folder
	useEffect(() => {
		const fetchRecentLists = async () => {
			const listsMap: { [key: string]: List[] } = {};
			
			for (const folder of folders) {
				try {
					const listsRef = collection(db, "users", userId, "folders", folder.id, "lists");
					const q = query(
						listsRef,
						orderBy("dateCreated", "desc"),
						limit(3)
					);
					
					const querySnapshot = await getDocs(q);
					const lists = querySnapshot.docs.map(doc => ({
						id: doc.id,
						name: doc.data().name,
						dateModified: doc.data().dateModified?.toDate() || new Date(),
						description: doc.data().description
					}));
					
					listsMap[folder.id] = lists;
				} catch (error) {
					console.error(`Error fetching lists for folder ${folder.id}:`, error);
					listsMap[folder.id] = [];
				}
			}
			
			setFolderLists(listsMap);
		};

		if (folders.length > 0) {
			fetchRecentLists();
		}
	}, [folders, userId]);

	// Reset form when editing folder changes
	useEffect(() => {
		if (editingFolder) {
			setEditName(editingFolder.name);
			setEditDescription(editingFolder.description || "");
		}
	}, [editingFolder]);

	const handleEdit = async () => {
		if (!editingFolder) return;

		if (editName === editingFolder.name && editDescription === (editingFolder.description || "")) {
			return;
		}

		setIsSubmitting(true);
		try {
			const folderRef = doc(db, "users", userId, "folders", editingFolder.id);
			if (editDescription && editDescription !== "") {
				await updateDoc(folderRef, {
					name: editName,
					description: editDescription,
					dateModified: serverTimestamp(),
				});
			} else {
				await updateDoc(folderRef, {
					name: editName,
					dateModified: serverTimestamp(),
				});
			}
			onFolderUpdate();
			if (modalInstance) {
				modalInstance.hide();
			}
		} catch (error) {
			console.error("Error updating folder:", error);
		} finally {
			setIsSubmitting(false);
			setEditingFolder(null);
		}
	};

	const handleDelete = async (folderId: string) => {
		if (!confirm("Are you sure you want to delete this folder? This action cannot be undone.")) {
			return;
		}

		try {
			const folderRef = doc(db, "users", userId, "folders", folderId);
			await deleteDoc(folderRef);
			onFolderUpdate();
		} catch (error) {
			console.error("Error deleting folder:", error);
		}
	};

	const handleCreateFolder = async () => {
		if (!userId) {
			alert("You are not logged in");
			window.location.href = "/login";
		}
		if (newFolderName.length === 0) {
			console.error("Error creating folder: missing folder name");
			return;
		}

		setIsCreating(true);
		try {
			const folderRef = collection(db, "users", userId, "folders");
			await addDoc(folderRef, {
				createdBy: userId,
				name: newFolderName,
				dateCreated: serverTimestamp(),
				dateModified: serverTimestamp(),
			});
			setNewFolderName("");
			onFolderUpdate();
		} catch (error) {
			console.error("Error creating folder:", error);
		} finally {
			setIsCreating(false);
		}
	};

	return (
		<>
			<div className="container-fluid py-4">
				{/* New Folder Input */}
				<div className="row mb-4">
					<div className="col-12">
						<div className="card shadow-sm">
							<div className="card-body">
								<h5 className="card-title mb-3">
									<i className="bi bi-plus-circle me-2"></i>
									Create New Folder
								</h5>
								<div className="input-group">
									<input
										type="text"
										className="form-control"
										placeholder="Enter folder name"
										value={newFolderName}
										onChange={(e) => setNewFolderName(e.target.value)}
										onKeyDown={(e) => {
											if (e.key === 'Enter') {
												handleCreateFolder();
											}
										}}
										disabled={isCreating}
									/>
									<button
										className="btn btn-primary"
										onClick={handleCreateFolder}
										disabled={isCreating || newFolderName.trim() === ""}
									>
										{isCreating ? (
											<>
												<span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
												Creating...
											</>
										) : (
											<>
												<i className="bi bi-plus-lg me-2"></i>
												Create Folder
											</>
										)}
									</button>
								</div>
							</div>
						</div>
					</div>
				</div>

				<div className="row g-4">
					{folders.map((folder) => (
						<div
							className="col-12 col-sm-6 col-md-4 col-lg-3"
							key={folder.id}
						>
							<div className="card h-100 shadow-sm hover-shadow">
								<div className="card-body">
									<div className="d-flex justify-content-between align-items-start mb-3">
										<h5 className="card-title mb-0">
											<i className="bi bi-folder2 text-primary me-2"></i>
											{folder.name}
										</h5>
										<div className="dropdown">
											<button
												className="btn btn-light btn-sm"
												type="button"
												data-bs-toggle="dropdown"
												aria-expanded="false"
											>
												<i className="bi bi-three-dots-vertical"></i>
											</button>
											<ul className="dropdown-menu dropdown-menu-end shadow-sm">
												<li>
													<Link
														to={`/documents/${folder.id}`}
														state={{ folderName: folder.name }}
														className="dropdown-item d-flex align-items-center"
													>
														<i className="bi bi-folder2-open me-2"></i>
														Open Folder
													</Link>
												</li>
												<li>
													<button
														className="dropdown-item d-flex align-items-center"
														onClick={() => setEditingFolder(folder)}
													>
														<i className="bi bi-pencil me-2"></i>
														Edit Folder
													</button>
												</li>
												<li><hr className="dropdown-divider" /></li>
												<li>
													<button
														className="dropdown-item text-danger d-flex align-items-center"
														onClick={() => handleDelete(folder.id)}
													>
														<i className="bi bi-trash me-2"></i>
														Delete Folder
													</button>
												</li>
											</ul>
										</div>
									</div>
									
									{folder.description && (
										<p className="card-text text-muted small mb-3" style={{
											maxHeight: "60px",
											overflowY: "auto",
										}}>
											{folder.description}
										</p>
									)}

									<div className="recent-lists">
										<h6 className="text-muted mb-2 small">
											<i className="bi bi-clock-history me-1"></i>
											Recent Lists
										</h6>
										{folderLists[folder.id]?.length > 0 ? (
											<div className="list-group list-group-flush">
												{folderLists[folder.id].map((list) => (
													<div
														key={list.id}
														className="list-group-item list-group-item-action py-2 px-3"
													>
														<div className="d-flex justify-content-between align-items-center">
															<div className="text-truncate me-3">
																<i className="bi bi-list-task text-secondary me-2"></i>
																{list.name}
															</div>
															<small className="text-muted">
																{list.dateModified.toLocaleDateString()}
															</small>
														</div>
													</div>
												))}
											</div>
										) : (
											<div className="text-muted small">
												No lists yet
											</div>
										)}
									</div>
								</div>
								<div className="card-footer bg-transparent border-top-0">
									<div className="d-flex justify-content-between align-items-center">
										<small className="text-muted">
											<i className="bi bi-calendar3 me-1"></i>
											Created {folder.dateCreated.toLocaleDateString()}
										</small>
										<Link
											to={`/documents/${folder.id}`}
											state={{ folderName: folder.name }}
											className="btn btn-primary btn-sm"
										>
											<i className="bi bi-folder2-open me-1"></i>
											Open
										</Link>
									</div>
								</div>
							</div>
						</div>
					))}
				</div>
			</div>

			{/* Edit Modal */}
			{editingFolder && createPortal(
				<div
					className="modal fade"
					id={`modal-folder-${editingFolder.id}`}
					tabIndex={-1}
					aria-labelledby={`editModalLabel-${editingFolder.id}`}
					aria-hidden="true"
				>
					<div className="modal-dialog modal-dialog-centered">
						<div className="modal-content shadow-sm">
							<div className="modal-header">
								<h1
									className="modal-title fs-5 d-flex align-items-center"
									id={`editModalLabel-${editingFolder.id}`}
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
											htmlFor={`folder-name-${editingFolder.id}`}
											className="form-label"
										>
											Folder Name
										</label>
										<input
											type="text"
											className="form-control"
											id={`folder-name-${editingFolder.id}`}
											value={editName}
											onChange={(e) => setEditName(e.target.value)}
											placeholder="Enter folder name"
											disabled={isSubmitting}
										/>
									</div>
									<div className="mb-3">
										<label
											htmlFor={`folder-description-${editingFolder.id}`}
											className="form-label"
										>
											Description
										</label>
										<textarea
											className="form-control"
											id={`folder-description-${editingFolder.id}`}
											value={editDescription}
											onChange={(e) => setEditDescription(e.target.value)}
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
									onClick={handleEdit}
									disabled={isSubmitting || editName.trim() === ""}
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
				</div>,
				document.getElementById('modal-root') || document.body
			)}
		</>
	);
};

export default FoldersPage;
