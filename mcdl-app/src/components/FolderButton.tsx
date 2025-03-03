import React, { useState } from "react";
import { serverTimestamp, updateDoc, doc } from "firebase/firestore";
import { db } from "../config/firebase";

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

	const modalId = `exampleModal-${folderId}`;

	const editAction = async () => {
		if (name === folderName && description === (folderDescription || "")) {
			// No changes detected, so do nothing (parent callback won't be called)
			return;
		}
		try {
			const folderNameRef = doc(db, "users", userId, "folders", folderId);
			if (description && description !== "") {
				await updateDoc(folderNameRef, {
					name: name,
					description: description,
					dateModified: serverTimestamp(),
				});
			} else {
				await updateDoc(folderNameRef, {
					name: name,
					dateModified: serverTimestamp(),
				});
			}
			onModalClose();
		} catch (error) {
			console.error("Error updating document: ", error);
		}
	};

	return (
		<>
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
								Edit Folder {folderId}
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
										Folder Name
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
								onClick={editAction}
								data-bs-dismiss="modal"
							>
								Save
							</button>
						</div>
					</div>
				</div>
			</div>
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
					{folderName}
				</button>
				<button
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
							Edit Folder
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
							Delete This Folder
						</a>
					</li>
				</ul>
			</div>
		</>
	);
};

export default FolderButton;
