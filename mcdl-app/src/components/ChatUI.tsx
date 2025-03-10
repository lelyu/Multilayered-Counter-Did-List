import React, { useEffect, useState } from "react";
import { auth } from "../config/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { httpsCallable, getFunctions } from "firebase/functions";

import {
	getAllFolders,
	getAllLists,
	getAllListItems,
} from "../utils/getUserData.ts";

interface ChatMessage {
	role: "user" | "model";
	text: string;
}

const ChatUI: React.FC = () => {
	const [userId, setUserId] = useState<string | null>(null);
	const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
	const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
	const [userPrompt, setUserPrompt] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const [lastRequestTime, setLastRequestTime] = useState<number>(0);

	const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		const now = Date.now();

		if (
			chatHistory.length > 0 &&
			chatHistory[chatHistory.length - 1].role === "user"
		) {
			alert(
				"Please wait for the response before sending another message.",
			);
			return;
		}

		if (!userPrompt.trim()) return;

		// Set loading and record the time
		setIsLoading(true);
		setLastRequestTime(now);

		// Add the user's message to the chat history.
		const newChatHistory = [
			...chatHistory,
			{ role: "user", text: userPrompt },
		];
		setChatHistory(newChatHistory);

		const summarizeData = httpsCallable(getFunctions(), "summarizeData");

		try {
			// Send the user's question (the prompt) to the model using multi-turn chat.
			const response = await summarizeData({
				prompt: userPrompt,
			});

			// Update loading UI: Replace loading indicator with actual response.
			const aiResponse = response.data;
			console.log(aiResponse);
			setChatHistory((prev) => {
				// Remove the temporary loading indicator if present.
				let updated = [...prev];
				if (
					updated.length > 0 &&
					updated[updated.length - 1].text === "Loading..."
				) {
					updated.pop();
				}
				return [...updated, { role: "model", text: aiResponse }];
			});
		} catch (error) {
			console.error("Error during chat:", error);
			alert("There was an error processing your request.");
			setChatHistory((prev) => {
				// Remove the last message from chat history.
				const newHistory = [...prev];
				newHistory.pop();
				return newHistory;
			});
		} finally {
			setIsLoading(false);
			setUserPrompt("");
		}
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
				<div className="offcanvas-body d-flex flex-column">
					<div className="chat-content flex-grow-1 overflow-auto mb-2">
						{chatHistory.map((msg, idx) => (
							<div
								key={idx}
								className={`mb-2 text-${msg.role === "user" ? "end" : "start"}`}
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
						{/* Loading indicator */}
						{isLoading && (
							<div className="mb-2 text-start">
								<span className="badge bg-secondary me-2">
									Kian
								</span>
								<span>Loading...</span>
							</div>
						)}
					</div>
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
							disabled={isLoading} // disable input while waiting
						/>
						<button
							disabled={!isLoggedIn || isLoading}
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
