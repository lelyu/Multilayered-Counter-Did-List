import React, { useEffect, useState } from "react";
import { model, auth } from "../config/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { getAllFolders, getAllLists } from "../utils/getUserData.ts";

interface ChatMessage {
	role: "user" | "model";
	text: string;
}

const ChatUI: React.FC = () => {
	const [userId, setUserId] = useState<string | null>(null);
	const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
	const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
	const [userPrompt, setUserPrompt] = useState("");

	const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		if (!userPrompt.trim()) return;

		// Add the user's message to the chat history.
		const newChatHistory = [
			...chatHistory,
			{ role: "user", text: userPrompt },
		];
		setChatHistory(newChatHistory);

		// Initialize the chat with the current history.
		const chat = model.startChat({
			history: newChatHistory.map((msg) => ({
				role: msg.role,
				parts: [{ text: msg.text }],
			})),
			generationConfig: {
				maxOutputTokens: 300,
			},
		});

		// Send the user's question (the prompt) to the model using multi-turn chat.
		let result = await chat.sendMessage(userPrompt);
		const functionCalls = result.response.functionCalls();

		if (functionCalls && functionCalls.length > 0) {
			const aggregatedResults = [];

			for (const call of functionCalls) {
				try {
					if (call.name === "getAllFolders") {
						const foldersArray = await getAllFolders(call.args);
						aggregatedResults.push({
							name: call.name,
							response: { folders: foldersArray },
						});
					} else if (call.name === "getAllLists") {
						const listsArray = await getAllLists(call.args);
						aggregatedResults.push({
							name: call.name,
							response: { lists: listsArray },
						});
					}
				} catch (error) {
					// Handle individual function call error
					aggregatedResults.push({
						name: call.name,
						response: { error: error.message },
					});
				}
			}
			console.log(aggregatedResults);
			// Send all aggregated function responses to the model.
			result = await chat.sendMessage(
				aggregatedResults.map((fnResult) => ({
					functionResponse: {
						name: fnResult.name,
						response: fnResult.response,
					},
				})),
			);
		} else {
			// Fallback: resend the original user prompt if no function calls are present.
			result = await chat.sendMessage(userPrompt);
		}

		// Immediately add a loading indicator to the chat history.
		setChatHistory((prev) => [
			...prev,
			{ role: "model", text: "Loading..." },
		]);

		// Accumulate the streaming response.
		const aiResponse = result.response.text();

		// Once the stream is complete, update the chat history with the final response.
		setChatHistory((prev) => {
			const updated = [...prev];
			updated[updated.length - 1] = { role: "model", text: aiResponse };
			return updated;
		});
		setUserPrompt("");
	};

	// Optional handlers to clear history or start a new chat.
	const handleClearHistory = () => {
		setChatHistory([]);
	};

	const handleNewChat = () => {
		setChatHistory([]);
	};

	useEffect(() => {
		onAuthStateChanged(auth, (user) => {
			if (user) {
				// User is signed in, see docs for a list of available properties
				// https://firebase.google.com/docs/reference/js/auth.user
				console.log(user.uid);
				setUserId(user.uid);
				setIsLoggedIn(true);
				setChatHistory([
					{
						role: "user",
						text: `Hello, my userId is ${user.uid}`,
					},
					{
						role: "model",
						text: "Great to meet you. What would you like to know?",
					},
				]);
			} else {
				// User is signed out
				// ...
				setIsLoggedIn(false);
			}
		});
	}, []);

	return (
		<>
			{!isLoggedIn && <h4>You must login to use AI</h4>}
			<button
				disabled={!isLoggedIn}
				className="btn btn-primary"
				type="button"
				data-bs-toggle="offcanvas"
				data-bs-target="#offcanvasRight"
				aria-controls="offcanvasRight"
			>
				Ask AI
			</button>

			<div
				className="offcanvas offcanvas-end"
				tabIndex={-1}
				id="offcanvasRight"
				aria-labelledby="offcanvasRightLabel"
			>
				<div className="offcanvas-header">
					<h5 className="offcanvas-title" id="offcanvasRightLabel">
						Chat with Kian
					</h5>
					<button
						type="button"
						className="btn-close"
						data-bs-dismiss="offcanvas"
						aria-label="Close"
					></button>
				</div>
				{/* The offcanvas body uses a flex-column layout */}
				<div className="offcanvas-body d-flex flex-column">
					{/* Chat history container that scrolls if necessary */}
					<div className="chat-content flex-grow-1 overflow-auto mb-2">
						{chatHistory.map((msg, idx) => (
							<div
								key={idx}
								className={`mb-2 text-${
									msg.role === "user" ? "end" : "start"
								}`}
							>
								<span
									className={`badge bg-${
										msg.role === "user"
											? "primary"
											: "secondary"
									} me-2`}
								>
									{msg.role === "user" ? "You" : "Kian"}
								</span>
								<span>{msg.text}</span>
							</div>
						))}
					</div>
					{/* Input area sticks at the bottom */}
					<form
						className="input-group mt-auto"
						onSubmit={handleSubmit}
					>
						<input
							value={userPrompt}
							onChange={(e) => setUserPrompt(e.target.value)}
							type="text"
							className="form-control"
							aria-label="Chat input"
							placeholder="Chat history won't be saved"
						/>
						<button
							disabled={!isLoggedIn}
							type="submit"
							className="btn btn-outline-secondary"
						>
							<i className="bi bi-send"></i>
						</button>
						<button
							disabled={!isLoggedIn}
							type="button"
							className="btn btn-outline-secondary dropdown-toggle dropdown-toggle-split"
							data-bs-toggle="dropdown"
							aria-expanded="false"
						>
							<span className="visually-hidden">
								Toggle Dropdown
							</span>
						</button>
						<ul className="dropdown-menu dropdown-menu-end">
							<li>
								<a className="dropdown-item" href="#">
									Submit
								</a>
							</li>
							<li>
								<a
									className="dropdown-item"
									href="#"
									onClick={handleClearHistory}
								>
									Clear history
								</a>
							</li>
							<li>
								<a
									className="dropdown-item"
									href="#"
									onClick={handleNewChat}
								>
									Start a new chat
								</a>
							</li>
							<li>
								<hr className="dropdown-divider" />
							</li>
							<li>
								<a className="dropdown-item" href="#">
									Learn more
								</a>
							</li>
						</ul>
					</form>
				</div>
			</div>
		</>
	);
};

export default ChatUI;
