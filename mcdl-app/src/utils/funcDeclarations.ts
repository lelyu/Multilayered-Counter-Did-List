const getUserDataTools = {
	functionDeclarations: [
		{
			name: "getAllFolders",
			description:
				"Retrieves all folder objects associated with a specified user from the database. " +
				"Each folder contains metadata including its unique ID, name, creation date, an optional description, " +
				"and modification date if available. This data is used to provide an organized view of the user's folder structure, " +
				"supporting queries that require an overview of stored categories.",
			parameters: {
				type: "object",
				properties: {
					userId: {
						type: "string",
						description:
							"The unique identifier for the user whose folders are being retrieved. " +
							"This ID is used to locate all folder records for the user in the Firebase database.",
					},
				},
				required: ["userId"],
			},
		},
		{
			name: "getAllLists",
			description:
				"Retrieves all list objects associated with a specified user from the database. " +
				"Each list contains metadata including its unique ID, name, creation date, an optional description, " +
				"and modification date if available. This structured data supports AI-assisted report generation by " +
				"providing a clear view of the user's list organization within folders.",
			parameters: {
				type: "object",
				properties: {
					userId: {
						type: "string",
						description:
							"The unique identifier for the user owning the lists. " +
							"This ID is used to locate the user's list data in the Firebase database.",
					},
				},
				required: ["userId"],
			},
		},
		{
			name: "getAllItems",
			description:
				"Retrieves all item objects associated with a specified user from the database. " +
				"Each item contains various attributes such as name, count, creation date, and other details. " +
				"This function is particularly useful for answering queries that require an aggregated view of a user's data. " +
				"Use this function for queries like 'how many exercises have I done in the past month', " +
				"'how many xyz do I have', or 'what are the total amounts of xyz I have in the past year'. " +
				"The returned data can then be filtered by name and date to calculate the requested totals or counts.",
			parameters: {
				type: "object",
				properties: {
					userId: {
						type: "string",
						description:
							"The unique identifier for the user whose items are being retrieved. " +
							"This ID is used to locate all item records for the user in the Firebase database.",
					},
				},
				required: ["userId"],
			},
		},
	],
};

export default getUserDataTools;
