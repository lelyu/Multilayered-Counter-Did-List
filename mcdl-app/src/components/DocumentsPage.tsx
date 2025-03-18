const DocumentsPage = ({ lists }) => {
	return (
		<>
			<h1>DocumentsPage</h1>

			<div className="container-fluid">
				<div className="row">
					<div className="col-2">
						<ul>
							<li>List 1</li>
							<li>List 2</li>
							<li>List 3</li>
						</ul>
					</div>
					<div className="col-8">
						{/*    big text area */}
						<textarea placeholder={"Typing..."}></textarea>
					</div>
					<div className={"col-2"}>
						{/*    floating counter area */}
						<button>+</button>
						list items 1<button>-</button>
						<br />
						<button>+</button>
						list items 2<button>-</button>
						<br />
						<button>+</button>
						list items 3<button>-</button>
					</div>
				</div>
			</div>
		</>
	);
};

export default DocumentsPage;
