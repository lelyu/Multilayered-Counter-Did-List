import React from "react";

interface FolderButtonProps {
	deleteAction: () => void;
	selectAction: () => void;
	editAction: () => void;
	folderId: string;
	folderName: string;
	dateCreated: Date;
	isSelected: boolean;
}

const FolderButton: React.FC<FolderButtonProps> = ({
	deleteAction,
	selectAction,
	editAction,
	folderId,
	folderName,
	dateCreated,
	isSelected,
}) => {
	return (
		<>
			<div
			className="modal fade"
			id="exampleModal"
			tabIndex={-1}
			aria-labelledby="exampleModalLabel"
			aria-hidden="true"
			>
			<div className="modal-dialog">
				<div className="modal-content">
				<div className="modal-header">
					<h1 className="modal-title fs-5" id="exampleModalLabel">
					New message
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
						<label htmlFor="recipient-name" className="col-form-label">
						Recipient:
						</label>
						<input
						type="text"
						className="form-control"
						id="recipient-name"
						/>
					</div>
					<div className="mb-3">
						<label htmlFor="message-text" className="col-form-label">
						Message:
						</label>
						<textarea
						className="form-control"
						id="message-text"
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
					<button type="button" className="btn btn-primary">
					Send message
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
					className={`btn ${isSelected ? "btn-primary" : "btn-light"} text-start`}
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
						<button onClick={editAction} className="dropdown-item" data-bs-toggle="modal" data-bs-target="#exampleModal" data-bs-whatever="@mdo">
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
