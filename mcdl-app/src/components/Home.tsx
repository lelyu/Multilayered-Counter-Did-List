import React, {useState} from "react";

const Home: React.FC = () => {
    const [count, setCount] = useState<number>(0); // Corrected type annotation

    const onCounterClick = () => {
        setCount(prevCount => prevCount + 1); // Best practice: use previous state
    };

    return (
        <>
            <h1>Home</h1>
            <button onClick={onCounterClick}>Click me</button>
            <p>Count: {count}</p>
        </>
    );
};

export default Home;
