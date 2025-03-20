import React from "react";
import { Link } from "react-router-dom";

interface Folder {
	id: string;
	name: string;
	description?: string;
	items?: string[];
}

interface FoldersPageProps {
	folders: Folder[];
}

const FoldersPage: React.FC<FoldersPageProps> = ({ folders }) => {
	return (
		<div className="container-fluid py-3">
			<div className="row g-3">
				{folders.map((folder: Folder) => (
					<div
						className="col-12 col-sm-6 col-md-4 col-lg-3"
						key={folder.id}
					>
						<div className="card h-100">
							<div className="card-body">
								<h5 className="card-title">{folder.name}</h5>
								<p
									className="card-text"
									style={{
										maxHeight: "100px",
										overflowY: "auto",
									}}
								>
									{folder.description}
								</p>
							</div>
							<ul className="list-group list-group-flush">
								{folder.items && folder.items.length > 0 ? (
									folder.items.map((item: string, idx: number) => (
										<li
											className="list-group-item"
											key={idx}
										>
											{item}
										</li>
									))
								) : (
									<>
										<li className="list-group-item">
											current list 1
										</li>
										<li className="list-group-item">
											current list 2
										</li>
										<li className="list-group-item">
											current list 3
										</li>
									</>
								)}
							</ul>
							<div className="card-body">
								{/* Pass folder name in state */}
								<Link
									to={`/documents/${folder.id}`}
									state={{ folderName: folder.name }}
									className="btn btn-primary w-100 mb-2"
								>
									<i className="bi bi-folder2-open me-2"></i>
									Open Folder
								</Link>
								<Link
									to={`/edit-folder/${folder.id}`}
									className="btn btn-outline-secondary w-100"
								>
									<i className="bi bi-pencil me-2"></i>
									Edit
								</Link>
							</div>
						</div>
					</div>
				))}
			</div>
		</div>
	);
};

export default FoldersPage;
