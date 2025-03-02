import React, {useState} from "react";


interface ListItemButtonProps {
    deleteAction: () => void;
    selectAction: () => void;
    editAction: () => void;
    listItemId: string;
    listItemName: string;
    dateCreated: Date;
    isSelected: boolean;
    count: number;
}

const ListItemButton: React.FC<ListItemButtonProps> = ({
    deleteAction,
    selectAction,
    editAction,
    listItemId,
    listItemName,
    dateCreated,
    isSelected,
    count
}): Element => {
    const [currCount, setCurrCount] = useState(count);
    
    return (
        <div
            className="btn-group"
            role="group"
            aria-label="Folder Button"
            style={{ width: "100%", display: "flex" }}
        >
            <button
                onClick={selectAction}
                type="button"
                className={`btn ${isSelected ? "btn-primary" : "btn-light"} text-start`}
                style={{ width: "80%" }}
            >
                {listItemName}
                <span> Count: {currCount} </span>
            </button>
            <button
                onClick={selectAction}
                type="button"
                className="btn btn-light dropdown-toggle dropdown-toggle-split"
                data-bs-toggle="dropdown"
                aria-expanded="false"
                style={{ width: "20%" }}
            >
                <span className="visually-hidden">See Actions</span>
            </button>
            <ul className="dropdown-menu">
                <li>
                    <a onClick={editAction} className="dropdown-item" href="#">
                        Edit Item
                    </a>
                </li>
                <li>
                    <a className="dropdown-item" href="#">
                        View Details
                    </a>
                </li>
                <li>
                    <a className="dropdown-item" href="#">
                        Something else here
                    </a>
                </li>
                <li>
                    <hr className="dropdown-divider" />
                </li>
                <li>
                    <a
                        onClick={deleteAction}
                        className="btn btn-danger dropdown-item"
                        href="#"
                    >
                        Delete This Item
                    </a>
                </li>
            </ul>
        </div>
    );
};

export default ListItemButton;
