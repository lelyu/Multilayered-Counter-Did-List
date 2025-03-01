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
				style={{ width: "70%" }}
			>
				{folderName}
			</button>
			<button
				onClick={selectAction}
				type="button"
				className="btn btn-light dropdown-toggle dropdown-toggle-split"
				data-bs-toggle="dropdown"
				aria-expanded="false"
				style={{ width: "30%" }}
			>
				<span className="visually-hidden">See Actions</span>
			</button>
			<ul className="dropdown-menu">
				<li>
					<a onClick={editAction} className="dropdown-item" href="#">
						Edit Folder
					</a>
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
	);
};

export default FolderButton;
