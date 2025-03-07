const getUserDataTools = {
	functionDeclarations: [
		{
			name: "getAllFolders",
			description:
				"Retrieves all folder objects associated with a specified user from the database. " +
				"Each folder contains metadata including its unique ID, name, creation date, an optional description, " +
				"and modification date if available. This structured data supports AI-assisted report generation by " +
				"providing a clear view of the user's folder organization.",
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
				"providing a clear view of the user's list organization within a folder.",
			parameters: {
				type: "object",
				properties: {
					userId: {
						type: "string",
						description:
							"The unique identifier for the user owning the folder. This ID is used to locate the user's data in the Firebase database.",
					},
				},
				required: ["userId"],
			},
		},
	],
};

export default getUserDataTools;
