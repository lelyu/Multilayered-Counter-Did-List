import React from "react";
import { Link } from "react-router-dom";

const FoldersPage = ({ folders }) => {
	return (
		<div className="container-fluid py-3">
			<div className="row g-3">
				{folders.map((folder) => (
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
									folder.items.map((item, idx) => (
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
								{/* Link to the DocumentsPage with the folder's ID */}
								<Link
									to={`/documents/${folder.id}`}
									className="card-link"
								>
									Open Folder
								</Link>
								{/* Optionally add an edit link */}
								<Link
									to={`/edit-folder/${folder.id}`}
									className="card-link"
								>
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
