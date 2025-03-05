const Scrollspy = () => {
	return (
		<div className="row">
			<div className="col-2">
				<div id="list-example" className="list-group">
					<a
						className="list-group-item list-group-item-action"
						href={"#intro"}
					>
						DocIt
					</a>
					<a
						className="list-group-item list-group-item-action"
						href={"#folder"}
					>
						Folder
					</a>
					<a
						className="list-group-item list-group-item-action"
						href={"#list"}
					>
						List
					</a>
					<a
						className="list-group-item list-group-item-action"
						href={"#list-item"}
					>
						List Item
					</a>
					<a
						className="list-group-item list-group-item-action"
						href={"#ai"}
					>
						AI
					</a>
				</div>
			</div>
			<div className="col-10">
				<div
					data-bs-spy="scroll"
					data-bs-target="#list-example"
					data-bs-smooth-scroll="true"
					className="scrollspy-example"
					tabIndex={0}
					style={{
						height: "20vh",
						overflowY: "scroll",
						position: "relative",
					}}
				>
					<h4 id="intro">Doc it? It docs!</h4>
					<p>
						Our attention span is getting shorter, and we're getting
						busier. A lot of times, I couldn't remember what I ate
						for breakfast!
					</p>
					<p>
						DocIt solves this kind of problem in workplace. Imagine
						you're asked to submit a monthly report by the end of
						today. I bet you can't remember all the details --
						details that matter!
					</p>
					<p>
						DocIt is a new way to document and organize your work
						journal. You just need to enter a few things, and DocIt
						will handle the rest. You could even use AI to write a
						work report for you. This time, you won't miss out on
						any important details, because DocIt meticulously checks
						your day to day work, acting like an unbiased assistant.
					</p>

					<h4 id="folder">Folder</h4>
					<p>
						The folder feature in the app serves as a robust
						organizational tool, enabling you to group and store
						related items or files in one dedicated space. By
						creating folders, you can keep your documents, media,
						and other data neatly arranged, which simplifies
						navigation and management. This feature is particularly
						useful for users who work with multiple projects or
						categories, as it ensures that everything is easy to
						locate and access.
					</p>
					<h4 id="list">List</h4>
					<p>
						The list component acts as a central hub for managing
						tasks, items, or records within the app. Designed with
						usability in mind, it offers a clear overview of all
						your entries in one place, allowing for quick scanning
						and selection. The list is integrated with the scrollspy
						functionality, so as you scroll through different
						sections, the corresponding list entry is highlighted.
					</p>
					<h4 id="list-item">List Item</h4>
					<p>
						Each list item represents an individual entry within
						your larger list, providing detailed information and
						specific actions for that entry. You can click on a list
						item to view more details, mark tasks as complete, or
						edit the information as needed. This granularity allows
						for precise control over your data.
					</p>

					<h4 id="ai">AI</h4>
					<p>
						The AI feature is the app’s intelligent assistant,
						designed to augment your productivity by offering smart
						recommendations and automated insights. Leveraging
						advanced algorithms, the AI component can help you
						analyze your data, predict trends, or even suggest the
						next best actions to take based on your behavior.
					</p>
				</div>
			</div>
		</div>
	);
};

export default Scrollspy;
