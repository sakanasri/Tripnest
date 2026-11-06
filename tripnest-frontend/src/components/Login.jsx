import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import API from "../services/api";
import beach from "../assets/beach.jpg";
import "../styles/Login.css";

function Login() {
    const navigate = useNavigate();
    const location = useLocation();

    const [user, setUser] = useState({
        email: "",
        password: "",
    });

    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    // Forgot Password Modal State
    const [showForgotModal, setShowForgotModal] = useState(false);
    const [forgotStep, setForgotStep] = useState(1);
    const [forgotEmail, setForgotEmail] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [forgotMsg, setForgotMsg] = useState("");

    useEffect(() => {
        const queryParams = new URLSearchParams(location.search);
        if (queryParams.get("session") === "expired") {
            setErrorMessage("Your session has expired. Please sign in again.");
        }
    }, [location]);

    const handleChange = (e) => {
        setUser({
            ...user,
            [e.target.name]: e.target.value,
        });
        setErrorMessage("");
    };

    const login = async (e) => {
        if (e) e.preventDefault();
        if (!user.email || !user.password) {
            setErrorMessage("Please enter both email and password.");
            return;
        }

        try {
            setLoading(true);
            setErrorMessage("");
            const response = await API.post("/auth/login", {
                email: user.email.trim(),
                password: user.password,
            });

            // Store authentic token and user profile
            localStorage.setItem("token", response.data.token);
            localStorage.setItem("user", JSON.stringify(response.data.user));

            if (response.data.user && response.data.user.role === "ROLE_ADMIN") {
                navigate("/admin");
            } else {
                navigate("/dashboard");
            }
        } catch (error) {
            console.error("Login Error:", error);
            if (error.response && error.response.status === 401) {
                setErrorMessage("Invalid email or password. Please verify your credentials or Sign Up.");
            } else if (error.response && error.response.data && error.response.data.error) {
                setErrorMessage(error.response.data.error);
            } else if (error.response && error.response.data && error.response.data.message) {
                setErrorMessage(error.response.data.message);
            } else {
                setErrorMessage("Cannot connect to TripNest backend server. Please verify backend is running.");
            }
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyEmail = async (e) => {
        e.preventDefault();
        try {
            const res = await API.post("/auth/forgot-password", { email: forgotEmail });
            if (res.data.status === "success") {
                setForgotStep(2);
                setForgotMsg("Identity verified. Please set your new password.");
            } else {
                setForgotMsg(res.data.message || "Email address not found.");
            }
        } catch (err) {
            setForgotMsg("Error verifying email. Please check the address.");
        }
    };

    const handleResetPassword = async (e) => {
        e.preventDefault();
        try {
            const res = await API.post("/auth/reset-password", {
                email: forgotEmail,
                newPassword: newPassword,
            });
            if (res.data.status === "success") {
                alert("Password updated successfully. Please sign in with your new password.");
                setShowForgotModal(false);
                setForgotStep(1);
                setForgotEmail("");
                setNewPassword("");
            } else {
                setForgotMsg(res.data.message || "Failed to update password.");
            }
        } catch (err) {
            setForgotMsg("Failed to reset password. Please try again.");
        }
    };

    return (
        <div
            className="login-container"
            style={{
                backgroundImage: `linear-gradient(rgba(10, 25, 47, 0.65), rgba(10, 25, 47, 0.85)), url(${beach})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                minHeight: "100vh",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "20px",
            }}
        >
            <div
                className="card shadow-lg p-4 p-md-5 rounded-4 border-0"
                style={{
                    maxWidth: "460px",
                    width: "100%",
                    backgroundColor: "rgba(255, 255, 255, 0.95)",
                    backdropFilter: "blur(12px)",
                }}
            >
                <div className="text-center mb-4">
                    <div className="d-inline-flex align-items-center justify-content-center p-3 rounded-circle bg-primary bg-opacity-10 text-primary mb-2">
                        <svg width="32" height="32" fill="currentColor" viewBox="0 0 16 16">
                            <path d="M8 0a8 8 0 1 0 0 16A8 8 0 0 0 8 0zm0 1.5a6.5 6.5 0 0 1 5.09 10.575l-1.077-1.077A5 5 0 0 0 8 3a5 5 0 0 0-3.536 8.536l-1.077 1.076A6.5 6.5 0 0 1 8 1.5z"/>
                            <path d="M8 5a3 3 0 1 0 0 6 3 3 0 0 0 0-6zm0 1.5a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3z"/>
                        </svg>
                    </div>
                    <h2 className="fw-bold text-dark mb-1">Welcome to TripNest</h2>
                    <p className="text-muted small">Sign in securely with your registered account</p>
                </div>

                {errorMessage && (
                    <div className="alert alert-danger py-2.5 small rounded-3 mb-3 d-flex align-items-center gap-2">
                        <svg width="18" height="18" fill="currentColor" viewBox="0 0 16 16">
                            <path d="M8.982 1.566a1.13 1.13 0 0 0-1.96 0L.165 13.233c-.457.778.091 1.767.98 1.767h13.713c.889 0 1.438-.99.98-1.767L8.982 1.566zM8 5c.535 0 .954.462.9.995l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 5.995A.905.905 0 0 1 8 5zm.002 6a1 1 0 1 1 0 2 1 1 0 0 1 0-2z"/>
                        </svg>
                        <span>{errorMessage}</span>
                    </div>
                )}

                <form onSubmit={login}>
                    <div className="mb-3">
                        <label className="form-label small fw-bold">Email Address</label>
                        <input
                            type="email"
                            name="email"
                            className="form-control form-control-lg"
                            placeholder="name@example.com"
                            value={user.email}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="mb-3">
                        <div className="d-flex justify-content-between">
                            <label className="form-label small fw-bold">Password</label>
                            <button
                                type="button"
                                className="btn btn-link p-0 text-decoration-none small text-primary"
                                onClick={() => {
                                    setShowForgotModal(true);
                                    setForgotStep(1);
                                    setForgotMsg("");
                                }}
                            >
                                Forgot password?
                            </button>
                        </div>
                        <input
                            type="password"
                            name="password"
                            className="form-control form-control-lg"
                            placeholder="Enter password"
                            value={user.password}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        className="btn btn-primary btn-lg w-100 fw-bold mb-3 shadow-sm"
                        disabled={loading}
                    >
                        {loading ? "Verifying Credentials..." : "Sign In"}
                    </button>
                </form>

                <div className="border-top pt-3 text-center">
                    <p className="text-muted small mb-1">
                        Don't have an account?{" "}
                        <Link to="/signup" className="text-primary fw-bold text-decoration-none">
                            Sign Up
                        </Link>
                    </p>
                    <div className="mt-2 text-muted" style={{ fontSize: "11px" }}>
                        <span className="me-2">🔒 PostgreSQL Database Security</span>
                        <span>•</span>
                        <span className="ms-2">🛡️ 256-Bit JWT Encryption</span>
                    </div>
                </div>
            </div>

            {/* Forgot Password Modal */}
            {showForgotModal && (
                <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: "rgba(0,0,0,0.6)" }}>
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content rounded-4 p-3 border-0">
                            <div className="modal-header border-0">
                                <h5 className="modal-title fw-bold">Password Recovery</h5>
                                <button
                                    type="button"
                                    className="btn-close"
                                    onClick={() => setShowForgotModal(false)}
                                ></button>
                            </div>
                            <div className="modal-body">
                                {forgotMsg && (
                                    <div className="alert alert-info py-2 small rounded-3 mb-3">
                                        {forgotMsg}
                                    </div>
                                )}

                                {forgotStep === 1 ? (
                                    <form onSubmit={handleVerifyEmail}>
                                        <p className="text-muted small">
                                            Enter your registered email address to verify identity.
                                        </p>
                                        <div className="mb-3">
                                            <input
                                                type="email"
                                                className="form-control"
                                                placeholder="Enter registered email"
                                                value={forgotEmail}
                                                onChange={(e) => setForgotEmail(e.target.value)}
                                                required
                                            />
                                        </div>
                                        <button type="submit" className="btn btn-primary w-100">
                                            Verify Email
                                        </button>
                                    </form>
                                ) : (
                                    <form onSubmit={handleResetPassword}>
                                        <p className="text-muted small">
                                            Enter your new secure password for <strong>{forgotEmail}</strong>.
                                        </p>
                                        <div className="mb-3">
                                            <input
                                                type="password"
                                                className="form-control"
                                                placeholder="Enter new password"
                                                value={newPassword}
                                                onChange={(e) => setNewPassword(e.target.value)}
                                                required
                                            />
                                        </div>
                                        <button type="submit" className="btn btn-success w-100">
                                            Update Password
                                        </button>
                                    </form>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Login;