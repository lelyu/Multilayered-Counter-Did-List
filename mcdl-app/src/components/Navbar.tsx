import {getAuth, onAuthStateChanged, signOut} from "firebase/auth";
import React, {useState, useEffect} from "react";

const Navbar: React.FC = () => {
    const [user, setUser] = useState(null);

    const auth = getAuth();

    useEffect(() => {
        onAuthStateChanged(auth, (user) => {
            if (user) {
                // User is signed in, see docs for a list of available properties
                // https://firebase.google.com/docs/reference/js/auth.user
                setUser(user);
                console.log('user is here');
                // ...
            } else {
                // User is signed out
                // ...
                console.log('user is not here');
            }
        });
    }, [user]);

    const logout = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        signOut(auth).then(() => {
            window.location.href = '/';
            console.log('user is outta here');
        }).catch((error) => {
            // An error happened.
            console.log(error);
        });
    }


    return (
        <>
            <nav className="navbar navbar-expand-lg bg-body-tertiary">
                <div className="container-fluid">
                    <a className="navbar-brand" href="/">
                        DocIt
                    </a>
                    <button
                        className="navbar-toggler"
                        type="button"
                        data-bs-toggle="collapse"
                        data-bs-target="#navbarSupportedContent"
                        aria-controls="navbarSupportedContent"
                        aria-expanded="false"
                        aria-label="Toggle navigation"
                    >
                        <span className="navbar-toggler-icon"></span>
                    </button>
                    <div className="collapse navbar-collapse" id="navbarSupportedContent">
                        <ul className="navbar-nav me-auto mb-2 mb-lg-0">
                            {
                                user ? (
                                    <>
                                        <li className="nav-item">
                                            <button onClick={logout} className="nav-link">
                                                Logout
                                            </button>
                                        </li>
                                        <li className="nav-item">
                                            <a className="nav-link">Welcome, {user.email}</a>
                                        </li>
                                    </>
                                ) : (
                                    <>
                                        <li className="nav-item">
                                            <a className="nav-link active" aria-current="page" href="/login">
                                                Login
                                            </a>
                                        </li>
                                        <li className="nav-item">
                                            <a className="nav-link" href="/register">
                                                Register
                                            </a>
                                        </li>
                                    </>
                                )
                            }

                            <li className="nav-item dropdown">
                                <a
                                    className="nav-link dropdown-toggle"
                                    href="#"
                                    role="button"
                                    data-bs-toggle="dropdown"
                                    aria-expanded="false"
                                >
                                    Other Apps
                                </a>
                                <ul className="dropdown-menu">
                                    <li>
                                        <a className="dropdown-item" href="#">
                                            Daily Mood Tracker
                                        </a>
                                    </li>
                                    <li>
                                        <a className="dropdown-item" href="#">
                                            iPortfolio
                                        </a>
                                    </li>
                                    <li>
                                        <hr className="dropdown-divider"/>
                                    </li>
                                    <li>
                                        <a className="dropdown-item" href="#">
                                            Personal Website
                                        </a>
                                    </li>
                                </ul>
                            </li>

                        </ul>
                        <form className="d-flex" role="search">
                            <input
                                className="form-control me-2"
                                type="search"
                                placeholder="Search"
                                aria-label="Search"
                            />
                            <button className="btn btn-outline-success" type="submit">
                                Search
                            </button>
                        </form>
                    </div>
                </div>
            </nav>
        </>
    );
}

export default Navbar;
