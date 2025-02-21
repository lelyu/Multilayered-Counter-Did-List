import React, {useState} from "react";

const Home: React.FC = () => {
    const [count, setCount] = useState<number>(0); // Corrected type annotation
    const folders: string[] = [];
    const currLists: string[] = [];
    for (let i = 0; i < 10; i++) {
        folders.push(`Folder ${i}`);
    }
    for (let i = 0; i < 10; i++) {
        currLists.push(`List ${i}`);
    }

    const onCounterClick = () => {
        setCount(prevCount => prevCount + 1); // Best practice: use previous state
    };

    return (
        <>
            <div className="container text-center">
                <div className="row align-items-start">
                    <div className="col">
                        <h1>Folder Column</h1>
                        <div className="btn-group-vertical container" role="group" aria-label="Vertical button group">
                            {folders.map(folder => (
                                <button type="button" className="btn btn-light text-start">{folder}</button>
                            ))}
                        </div>
                    </div>
                    <div className="col">
                        <h1>Home</h1>
                        <button onClick={onCounterClick}>Click me</button>
                        <p>Count: {count}</p>
                    </div>
                    <div className="col">
                        <h1>List Column (current folder)</h1>

                        <div className="btn-group-vertical container" role="group"
                             aria-label="Vertical button group">
                            {currLists.map(ls => (
                                <button type="button" className="btn btn-light text-start">{ls}</button>
                            ))}
                        </div>

                    </div>
                </div>
            </div>

        </>
    )
};

export default Home;
