import React, { useState } from "react";
import { model } from "../config/firebase";

type ChatMessage = {
	role: "user" | "model";
	text: string;
};

const ChatUI: React.FC = () => {
	const [chatHistory, setChatHistory] = useState<ChatMessage[]>([
		{
			role: "user",
			text: "Hello, I have 2 dogs in my house.",
		},
		{
			role: "model",
			text: "Great to meet you. What would you like to know?",
		},
	]);
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
				maxOutputTokens: 100,
			},
		});

		// Start streaming the AI response.
		const result = await chat.sendMessageStream(userPrompt);
		let aiResponse = "";
		// Add a placeholder AI message.
		setChatHistory((prev) => [...prev, { role: "model", text: "" }]);

		// Update the AI message as each chunk arrives.
		for await (const chunk of result.stream) {
			const chunkText = chunk.text();
			aiResponse += chunkText;
			setChatHistory((prev) => {
				const updated = [...prev];
				updated[updated.length - 1] = {
					role: "model",
					text: aiResponse,
				};
				return updated;
			});
		}
		setUserPrompt("");
	};

	// Optional handlers to clear history or start a new chat.
	const handleClearHistory = () => {
		setChatHistory([]);
	};

	const handleNewChat = () => {
		setChatHistory([]);
	};

	return (
		<>
			<button
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
						Chat with Gemini
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
									{msg.role === "user" ? "You" : "Gemini"}
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
							placeholder="Chat with Gemini"
						/>
						<button
							type="submit"
							className="btn btn-outline-secondary"
						>
							<i className="bi bi-send"></i>
						</button>
						<button
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
