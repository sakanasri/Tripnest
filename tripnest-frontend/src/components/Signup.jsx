import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../services/api";
import beach from "../assets/beach.jpg";
import "../styles/Signup.css";

function Signup() {
    const navigate = useNavigate();

    const [user, setUser] = useState({
        name: "",
        age: "",
        email: "",
        password: "",
        travelPreferences: "Beach & Coastline, Hill Stations",
        favoriteDestinations: "",
    });

    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    const handleChange = (e) => {
        setUser({
            ...user,
            [e.target.name]: e.target.value,
        });
        setErrorMessage("");
    };

    const register = async (e) => {
        if (e) e.preventDefault();
        if (!user.name || !user.email || !user.password) {
            setErrorMessage("Please complete all required fields.");
            return;
        }

        try {
            setLoading(true);
            setErrorMessage("");
            const payload = {
                ...user,
                age: user.age ? parseInt(user.age) : 25,
                role: "ROLE_TRAVELER",
            };

            await API.post("/auth/register", payload);

            // Auto-login or navigate to login
            alert("🎉 Registration Successful! Please login with your credentials.");
            navigate("/");
        } catch (error) {
            console.error("Registration Error:", error);
            if (error.response && error.response.data && error.response.data.message) {
                setErrorMessage(error.response.data.message);
            } else {
                setErrorMessage("Registration failed. Email might already be registered.");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div
            className="signup-page d-flex align-items-center justify-content-center min-vh-100 py-5"
            style={{
                backgroundImage: `linear-gradient(rgba(15, 23, 42, 0.65), rgba(15, 23, 42, 0.75)), url(${beach})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
            }}
        >
            <div className="card shadow-2-strong rounded-4 p-4 p-md-5 border-0 bg-white" style={{ maxWidth: "480px", width: "90%" }}>
                <div className="text-center mb-4">
                    <div className="fs-1 mb-2">✈️</div>
                    <h2 className="fw-bold mb-1">Create Your Account</h2>
                    <p className="text-muted small">Join TripNest & plan your dream expeditions</p>
                </div>

                {errorMessage && (
                    <div className="alert alert-danger py-2 small rounded-3 mb-3">
                        {errorMessage}
                    </div>
                )}

                <form onSubmit={register}>
                    <div className="row g-2 mb-3">
                        <div className="col-8">
                            <label className="form-label small fw-bold">Full Name *</label>
                            <input
                                type="text"
                                name="name"
                                className="form-control"
                                placeholder="John Doe"
                                value={user.name}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div className="col-4">
                            <label className="form-label small fw-bold">Age</label>
                            <input
                                type="number"
                                name="age"
                                className="form-control"
                                placeholder="25"
                                value={user.age}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    <div className="mb-3">
                        <label className="form-label small fw-bold">Email Address *</label>
                        <input
                            type="email"
                            name="email"
                            className="form-control"
                            placeholder="name@example.com"
                            value={user.email}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="mb-3">
                        <label className="form-label small fw-bold">Password *</label>
                        <input
                            type="password"
                            name="password"
                            className="form-control"
                            placeholder="Min 6 characters"
                            value={user.password}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="mb-4">
                        <label className="form-label small fw-bold">Favorite Destinations (Optional)</label>
                        <input
                            type="text"
                            name="favoriteDestinations"
                            className="form-control"
                            placeholder="e.g. Goa, Manali, Ooty"
                            value={user.favoriteDestinations}
                            onChange={handleChange}
                        />
                    </div>

                    <button
                        type="submit"
                        className="btn btn-primary btn-lg w-100 fw-bold mb-3 shadow-sm"
                        disabled={loading}
                    >
                        {loading ? "Creating Account..." : "Register Account"}
                    </button>
                </form>

                <p className="text-center text-muted small mb-0">
                    Already registered?{" "}
                    <Link to="/" className="text-primary fw-bold text-decoration-none">
                        Sign In
                    </Link>
                </p>
            </div>
        </div>
    );
}

export default Signup;