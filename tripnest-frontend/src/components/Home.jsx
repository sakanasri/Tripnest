import { Link } from "react-router-dom";
import "../styles/Home.css";

function Home() {
    return (
        <div className="home">

            <h1>✈️ TripNest</h1>

            <p>Your Smart Travel Planner</p>

            <div className="buttons">
                <Link to="/login">
                    <button>Login</button>
                </Link>

                <Link to="/register">
                    <button>Sign Up</button>
                </Link>
            </div>

        </div>
    );
}

export default Home;