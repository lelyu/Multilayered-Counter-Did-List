import React from "react";
import { motion } from "framer-motion";

const FolderCard: React.FC = ({ folder, onClose }) => {
	return (
		<motion.div
			initial={{ opacity: 0, scale: 0.8 }}
			animate={{ opacity: 1, scale: 1 }}
			exit={{ opacity: 0, scale: 0.8 }}
			transition={{ duration: 0.3, ease: "easeOut" }}
			className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white shadow-xl rounded-lg p-6 w-96 z-50"
		>
			<button className="btn btn-light" onClick={onClose}>
				hide
			</button>
			<div className="card" style={{ width: "18rem" }}>
				<div className="card-body">
					<h5 className="card-title">{folder.name}</h5>
					<h6 className="card-subtitle mb-2 text-body-secondary">
						{folder.dateCreated}
					</h6>
					<p className="card-text">
						Some quick example text to build on the card title and
						make up the bulk of the card's content. I guess you
						could add some description here.
					</p>
					<a href="#" className="card-link">
						Edit this folder
					</a>
					<a href="#" className="card-link">
						Delete this folder
					</a>
				</div>
			</div>
		</motion.div>
	);
};

export default FolderCard;
