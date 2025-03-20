import React, { useEffect, useState, useRef } from "react";
import { auth } from "../config/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { httpsCallable, getFunctions } from "firebase/functions";

interface ChatMessage {
	role: "user" | "model";
	text: string;
}

interface Position {
	x: number;
	y: number;
}

const ChatUI: React.FC = () => {
	const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
	const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
	const [userPrompt, setUserPrompt] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const [isOpen, setIsOpen] = useState(false);
	const [position, setPosition] = useState<Position>({ x: 20, y: 20 });
	const [isDragging, setIsDragging] = useState(false);
	const [dragStart, setDragStart] = useState<Position>({ x: 0, y: 0 });
	const chatWindowRef = useRef<HTMLDivElement>(null);

	const handleMouseDown = (e: React.MouseEvent) => {
		if (e.target instanceof HTMLElement && e.target.closest('.chat-header')) {
			setIsDragging(true);
			setDragStart({
				x: e.clientX - position.x,
				y: e.clientY - position.y
			});
		}
	};

	const handleMouseMove = (e: MouseEvent) => {
		if (isDragging) {
			setPosition({
				x: e.clientX - dragStart.x,
				y: e.clientY - dragStart.y
			});
		}
	};

	const handleMouseUp = () => {
		setIsDragging(false);
	};

	useEffect(() => {
		if (isDragging) {
			window.addEventListener('mousemove', handleMouseMove);
			window.addEventListener('mouseup', handleMouseUp);
		}
		return () => {
			window.removeEventListener('mousemove', handleMouseMove);
			window.removeEventListener('mouseup', handleMouseUp);
		};
	}, [isDragging, dragStart]);

	const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();

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

		setIsLoading(true);

		const newChatHistory = [
			...chatHistory,
			{ role: "user" as const, text: userPrompt },
		];
		setChatHistory(newChatHistory);

		const summarizeData = httpsCallable(getFunctions(), "summarizeData");

		try {
			const response = await summarizeData({
				prompt: userPrompt,
			});

			const aiResponse = response.data as string;
			setChatHistory((prev) => {
				const updated = [...prev];
				if (
					updated.length > 0 &&
					updated[updated.length - 1].text === "Loading..."
				) {
					updated.pop();
				}
				return [...updated, { role: "model" as const, text: aiResponse }];
			});
		} catch (error) {
			console.error("Error during chat:", error);
			alert("There was an error processing your request.");
			setChatHistory((prev) => {
				const newHistory = [...prev];
				newHistory.pop();
				return newHistory;
			});
		} finally {
			setIsLoading(false);
			setUserPrompt("");
		}
	};

	const handleClearHistory = () => {
		setChatHistory([]);
	};

	const handleNewChat = () => {
		setChatHistory([]);
	};

	useEffect(() => {
		const unsubscribe = onAuthStateChanged(auth, (user) => {
			if (user) {
				setIsLoggedIn(true);
				setChatHistory([]);
			} else {
				setIsLoggedIn(false);
			}
		});
		return () => unsubscribe();
	}, []);

	return (
		<>
			{/* Floating Chat Button */}
			<div className="position-fixed bottom-0 end-0 p-3" style={{ zIndex: 1050 }}>
				<button
					disabled={!isLoggedIn}
					className="btn btn-primary rounded-circle shadow-lg"
					type="button"
					onClick={() => setIsOpen(!isOpen)}
					style={{ width: '56px', height: '56px' }}
				>
					<i className="bi bi-chat-dots-fill fs-4"></i>
				</button>
			</div>

			{/* Floating Chat Window */}
			{isOpen && (
				<div
					ref={chatWindowRef}
					className="position-fixed shadow-lg rounded-3 bg-white"
					style={{
						width: '400px',
						height: '600px',
						left: position.x,
						top: position.y,
						zIndex: 1051,
						display: 'flex',
						flexDirection: 'column',
						overflow: 'hidden'
					}}
				>
					{/* Header */}
					<div 
						className="chat-header p-3 border-bottom d-flex align-items-center justify-content-between"
						onMouseDown={handleMouseDown}
						style={{ cursor: 'move' }}
					>
						<h5 className="m-0 d-flex align-items-center">
							<i className="bi bi-robot me-2"></i>
							Chat with Kian
						</h5>
						<button
							type="button"
							className="btn-close"
							onClick={() => setIsOpen(false)}
							aria-label="Close"
						></button>
					</div>

					{/* Chat Content */}
					<div className="flex-grow-1 p-3 overflow-auto" style={{ maxHeight: 'calc(100% - 120px)' }}>
						{chatHistory.length === 0 && !isLoading && (
							<div className="text-center text-muted py-5">
								<i className="bi bi-chat-dots display-4 mb-3"></i>
								<p className="mb-0">Start a conversation with Kian</p>
							</div>
						)}
						{chatHistory.map((msg, idx) => (
							<div
								key={idx}
								className={`mb-3 ${msg.role === "user" ? "text-end" : "text-start"}`}
							>
								<div className={`d-inline-block p-3 rounded-3 ${
									msg.role === "user" 
										? "bg-primary text-white" 
										: "bg-light"
								}`} style={{ maxWidth: '85%' }}>
									{msg.text}
								</div>
							</div>
						))}
						{isLoading && (
							<div className="text-start mb-3">
								<div className="d-inline-block p-3 rounded-3 bg-light">
									<div className="d-flex align-items-center">
										<div className="spinner-border spinner-border-sm me-2" role="status">
											<span className="visually-hidden">Loading...</span>
										</div>
										<span>Thinking...</span>
									</div>
								</div>
							</div>
						)}
					</div>

					{/* Input Area */}
					<div className="border-top p-3">
						<form
							className="input-group"
							onSubmit={handleSubmit}
						>
							<input
								value={userPrompt}
								onChange={(e) => setUserPrompt(e.target.value)}
								type="text"
								className="form-control"
								aria-label="Chat input"
								placeholder="Type your message..."
								disabled={isLoading}
							/>
							<button
								disabled={!isLoggedIn || isLoading || !userPrompt.trim()}
								type="submit"
								className="btn btn-primary"
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
								<span className="visually-hidden">Toggle Dropdown</span>
							</button>
							<ul className="dropdown-menu dropdown-menu-end">
								<li>
									<button
										type="button"
										className="dropdown-item"
										onClick={handleClearHistory}
									>
										<i className="bi bi-trash me-2"></i>
										Clear history
									</button>
								</li>
								<li>
									<button
										type="button"
										className="dropdown-item"
										onClick={handleNewChat}
									>
										<i className="bi bi-plus-circle me-2"></i>
										New chat
									</button>
								</li>
							</ul>
						</form>
					</div>
				</div>
			)}
		</>
	);
};

export default ChatUI;
