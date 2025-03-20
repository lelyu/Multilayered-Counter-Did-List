import "../styles/editor_styles.scss";
import { Color } from "@tiptap/extension-color";
import TextStyle from "@tiptap/extension-text-style";
import { EditorProvider, useCurrentEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import { useEffect, useState, useCallback } from "react";
import { db } from "../config/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";

interface EditorProps {
	userId?: string;
	folderId?: string;
	listId?: string;
	listItemId?: string;
}

type ActionButton = {
	icon?: string;
	text?: string;
	action: () => boolean;
	isActive?: boolean;
	disabled?: boolean;
};

type SeparatorButton = {
	type: "separator";
};

type ToolbarButton = ActionButton | SeparatorButton;

const MenuBar = () => {
	const { editor } = useCurrentEditor();

	if (!editor) {
		return null;
	}

	const buttons: ToolbarButton[] = [
		{
			icon: "bi bi-type-bold",
			action: () => editor.chain().focus().toggleBold().run(),
			isActive: editor.isActive("bold"),
		},
		{
			icon: "bi bi-type-italic",
			action: () => editor.chain().focus().toggleItalic().run(),
			isActive: editor.isActive("italic"),
		},
		{
			icon: "bi bi-type-strikethrough",
			action: () => editor.chain().focus().toggleStrike().run(),
			isActive: editor.isActive("strike"),
		},
		{
			icon: "bi bi-code",
			action: () => editor.chain().focus().toggleCode().run(),
			isActive: editor.isActive("code"),
		},
		{ type: "separator" },
		{
			icon: "bi bi-text-paragraph",
			action: () => editor.chain().focus().setParagraph().run(),
			isActive: editor.isActive("paragraph"),
		},
		{
			text: "H1",
			action: () =>
				editor.chain().focus().toggleHeading({ level: 1 }).run(),
			isActive: editor.isActive("heading", { level: 1 }),
		},
		{
			text: "H2",
			action: () =>
				editor.chain().focus().toggleHeading({ level: 2 }).run(),
			isActive: editor.isActive("heading", { level: 2 }),
		},
		{
			text: "H3",
			action: () =>
				editor.chain().focus().toggleHeading({ level: 3 }).run(),
			isActive: editor.isActive("heading", { level: 3 }),
		},
		{ type: "separator" },
		{
			icon: "bi bi-list-ul",
			action: () => editor.chain().focus().toggleBulletList().run(),
			isActive: editor.isActive("bulletList"),
		},
		{
			icon: "bi bi-list-ol",
			action: () => editor.chain().focus().toggleOrderedList().run(),
			isActive: editor.isActive("orderedList"),
		},
		{
			icon: "bi bi-code-square",
			action: () => editor.chain().focus().toggleCodeBlock().run(),
			isActive: editor.isActive("codeBlock"),
		},
		{
			icon: "bi bi-quote",
			action: () => editor.chain().focus().toggleBlockquote().run(),
			isActive: editor.isActive("blockquote"),
		},
		{ type: "separator" },
		{
			icon: "bi bi-dash",
			action: () => editor.chain().focus().setHorizontalRule().run(),
		},
		{
			icon: "bi bi-arrow-return-left",
			action: () => editor.chain().focus().setHardBreak().run(),
		},
		{ type: "separator" },
		{
			icon: "bi bi-arrow-counterclockwise",
			action: () => editor.chain().focus().undo().run(),
			disabled: !editor.can().chain().focus().undo().run(),
		},
		{
			icon: "bi bi-arrow-clockwise",
			action: () => editor.chain().focus().redo().run(),
			disabled: !editor.can().chain().focus().redo().run(),
		},
	];

	return (
		<div className="control-group">
			<div className="button-group">
				{buttons.map((button, index) =>
					"type" in button ? (
						<div
							key={index}
							className="border-end mx-2"
							style={{ height: "20px" }}
						/>
					) : (
						<button
							key={index}
							onClick={() => button.action()}
							className={button.isActive ? "is-active" : ""}
							disabled={button.disabled}
							title={
								button.text ||
								(button.icon
									? button.icon.split("-").pop()
									: "")
							}
						>
							{button.icon ? (
								<i className={button.icon}></i>
							) : (
								button.text
							)}
						</button>
					),
				)}
			</div>
		</div>
	);
};

const extensions = [
	Color.configure({}),
	TextStyle.configure({}),
	StarterKit.configure({
		bulletList: {
			keepMarks: true,
			keepAttributes: false,
		},
		orderedList: {
			keepMarks: true,
			keepAttributes: false,
		},
	}),
	Placeholder.configure({
		placeholder: "Write something amazing...",
	}),
];

const MyEditor: React.FC<EditorProps> = ({
	userId,
	folderId,
	listId,
	listItemId,
}) => {
	const [content, setContent] = useState("");
	const [isSaving, setIsSaving] = useState(false);
	const [lastSaved, setLastSaved] = useState<Date | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
	const [autoSaveInterval, setAutoSaveInterval] = useState<NodeJS.Timeout | null>(null);

	useEffect(() => {
		const loadContent = async () => {
			if (!userId || !folderId || !listId || !listItemId) {
				setContent("");
				setIsLoading(false);
				return;
			}

			setIsLoading(true);
			try {
				const docRef = doc(
					db,
					"users",
					userId,
					"folders",
					folderId,
					"lists",
					listId,
					"items",
					listItemId,
				);
				const docSnap = await getDoc(docRef);

				if (docSnap.exists()) {
					setContent(docSnap.data().content || "");
				} else {
					// Initialize the document if it doesn't exist
					await updateDoc(docRef, {
						content: "",
						lastModified: new Date(),
					});
					setContent("");
				}
			} catch (error) {
				console.error("Error loading content:", error);
				setContent("");
			} finally {
				setIsLoading(false);
			}
		};

		loadContent();
	}, [userId, folderId, listId, listItemId]);

	// Set up auto-save interval
	useEffect(() => {
		if (hasUnsavedChanges) {
			const interval = setInterval(() => {
				saveContent(content);
			}, 60000); // Auto-save every minute

			setAutoSaveInterval(interval);
		}

		return () => {
			if (autoSaveInterval) {
				clearInterval(autoSaveInterval);
			}
		};
	}, [hasUnsavedChanges, content]);

	const saveContent = useCallback(
		async (newContent: string) => {
			if (!userId || !folderId || !listId || !listItemId) return;

			setIsSaving(true);
			try {
				const docRef = doc(
					db,
					"users",
					userId,
					"folders",
					folderId,
					"lists",
					listId,
					"items",
					listItemId,
				);
				await updateDoc(docRef, {
					content: newContent,
					lastModified: new Date(),
				});
				setLastSaved(new Date());
				setHasUnsavedChanges(false);
			} catch (error) {
				console.error("Error saving content:", error);
			} finally {
				setIsSaving(false);
			}
		},
		[userId, folderId, listId, listItemId],
	);

	const handleManualSave = () => {
		saveContent(content);
	};

	if (isLoading) {
		return (
			<div className="d-flex justify-content-center align-items-center h-100">
				<div className="spinner-border text-primary" role="status">
					<span className="visually-hidden">Loading...</span>
				</div>
			</div>
		);
	}

	// Add check for no items
	if (!listItemId) {
		return (
			<div className="d-flex flex-column justify-content-center align-items-center h-100 text-muted">
				<i className="bi bi-document-text display-4 mb-3"></i>
				<h5 className="mb-2">No Item Selected</h5>
				<p className="text-center mb-0">
					Select an item from the list to start editing
				</p>
			</div>
		);
	}

	return (
		<div className="tiptap">
			<EditorProvider
				slotBefore={<MenuBar />}
				extensions={extensions}
				content={content}
				onUpdate={({ editor }) => {
					const newContent = editor.getHTML();
					setContent(newContent);
					setHasUnsavedChanges(true);
				}}
			>
				<div className="editor-status-bar">
					<div className="d-flex justify-content-between align-items-center px-3 py-2 border-top">
						<div className="d-flex align-items-center">
							{hasUnsavedChanges && (
								<div className="d-flex align-items-center me-3">
									<div className="spinner-border spinner-border-sm text-primary me-2" role="status">
										<span className="visually-hidden">Auto-saving...</span>
									</div>
									<span className="text-muted small">Auto-saving every minute...</span>
								</div>
							)}
							{lastSaved && (
								<span className="text-muted small">
									Last saved: {lastSaved.toLocaleTimeString()}
								</span>
							)}
						</div>
						<button
							className="btn btn-primary btn-sm"
							onClick={handleManualSave}
							disabled={isSaving || !hasUnsavedChanges}
						>
							{isSaving ? (
								<>
									<span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
									Saving...
								</>
							) : (
								<>
									<i className="bi bi-save me-2"></i>
									Save
								</>
							)}
						</button>
					</div>
				</div>
			</EditorProvider>
		</div>
	);
};

export default MyEditor;
