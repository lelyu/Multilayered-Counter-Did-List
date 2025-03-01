import React from "react";

interface ItemProps {
	deleteAction: () => void;
	selectAction: () => void;
	editAction: () => void;
	itemId: string;
	itemName: string;
	dateCreated: Date;
	isSelected: boolean;
}

const ItemButton: React.FC<ItemProps> = ({
	deleteAction,
	selectAction,
	editAction,
	itemId,
	itemName,
	dateCreated,
	isSelected,
}): Element => {
	return;
};
