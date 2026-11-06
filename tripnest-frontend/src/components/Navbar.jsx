import { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import API from "../services/api";
import "../styles/Navbar.css";

function Navbar() {
    const navigate = useNavigate();
    const location = useLocation();
    const [notifications, setNotifications] = useState([]);
    const [showDropdown, setShowDropdown] = useState(false);
    const [respondingId, setRespondingId] = useState(null); // tracks which invite is loading
    const dropdownRef = useRef(null);

    const user = JSON.parse(localStorage.getItem("user") || "null");

    const logout = () => {
        localStorage.removeItem("user");
        localStorage.removeItem("token");
        navigate("/");
    };

    const isActive = (path) => location.pathname === path ? "nav-link active" : "nav-link";

    useEffect(() => {
        fetchNotifications();
        const interval = setInterval(fetchNotifications, 10000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setShowDropdown(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const fetchNotifications = async () => {
        try {
            const res = await API.get("/notifications/my");
            if (res.data) {
                setNotifications(res.data);
            }
        } catch (error) {
            console.error("Fetch notifications error:", error);
        }
    };

    const markAsRead = async (id) => {
        try {
            await API.put(`/notifications/mark-read/${id}`);
            setNotifications(notifications.map(n => n.id === id ? { ...n, status: "READ" } : n));
        } catch (error) {
            console.error("Mark read error:", error);
        }
    };

    const markAllAsRead = async () => {
        try {
            await API.put("/notifications/mark-all-read");
            setNotifications(notifications.map(n =>
                n.type === "COLLAB_INVITE" ? n : { ...n, status: "READ" }
            ));
        } catch (error) {
            console.error("Mark all read error:", error);
        }
    };

    // Accept a co-traveler invite
    const handleAcceptInvite = async (notifId) => {
        setRespondingId(notifId);
        try {
            await API.post(`/notifications/collab-invite/accept/${notifId}`);
            setNotifications(prev =>
                prev.map(n => n.id === notifId ? { ...n, status: "ACCEPTED" } : n)
            );
        } catch (error) {
            console.error("Accept invite error:", error);
            alert("Failed to accept invite. Please try again.");
        } finally {
            setRespondingId(null);
        }
    };

    // Deny a co-traveler invite
    const handleDenyInvite = async (notifId) => {
        setRespondingId(notifId);
        try {
            await API.post(`/notifications/collab-invite/deny/${notifId}`);
            setNotifications(prev =>
                prev.map(n => n.id === notifId ? { ...n, status: "DENIED" } : n)
            );
        } catch (error) {
            console.error("Deny invite error:", error);
            alert("Failed to deny invite. Please try again.");
        } finally {
            setRespondingId(null);
        }
    };

    const unreadCount = notifications.filter(n => n.status === "UNREAD").length;

    return (
        <nav className="navbar navbar-expand-lg custom-navbar shadow-sm sticky-top">
            <div className="container">
                <Link className="navbar-brand brand-title" to="/dashboard">
                    ✈️ <span className="brand-highlight">Trip</span>Nest
                </Link>

                <div className="navbar-nav-container">
                    <ul className="navbar-nav me-auto mb-2 mb-lg-0">
                        <li className="nav-item">
                            <Link className={isActive("/ai-planner")} to="/ai-planner">
                                ✨ AI Planner
                            </Link>
                        </li>
                        <li className="nav-item">
                            <Link className={isActive("/budget-assistant")} to="/budget-assistant">
                                💰 Budget AI
                            </Link>
                        </li>
                        <li className="nav-item">
                            <Link className={isActive("/plan-trip")} to="/plan-trip">
                                📝 Quick Plan
                            </Link>
                        </li>
                        <li className="nav-item">
                            <Link className={isActive("/my-trips")} to="/my-trips">
                                🧳 My Trips
                            </Link>
                        </li>
                        <li className="nav-item">
                            <Link className={isActive("/destinations")} to="/destinations">
                                🏖️ Destinations
                            </Link>
                        </li>
                        <li className="nav-item">
                            <Link className={isActive("/analytics")} to="/analytics">
                                📊 Analytics
                            </Link>
                        </li>
                        {user?.role === "ROLE_ADMIN" && (
                            <li className="nav-item">
                                <Link className={`${isActive("/admin")} text-danger fw-bold`} to="/admin">
                                    🛡️ Admin
                                </Link>
                            </li>
                        )}
                    </ul>

                    <div className="nav-user-actions d-flex align-items-center gap-2">
                        {/* Profile Link */}
                        <Link to="/profile" className="btn btn-sm btn-outline-secondary d-flex align-items-center gap-1 rounded-pill px-3 py-1.5" title="User Profile & Settings">
                            <span>👤</span>
                            <span className="small fw-bold">{user?.name ? user.name.split(" ")[0] : "Profile"}</span>
                        </Link>

                        {/* Notification Bell Dropdown */}
                        <div className="notification-wrapper position-relative" ref={dropdownRef}>
                            <button
                                className="btn-bell"
                                onClick={() => setShowDropdown(!showDropdown)}
                                title="Notifications"
                                aria-label="Notifications"
                            >
                                🔔
                                {unreadCount > 0 && (
                                    <span className="notification-badge">{unreadCount}</span>
                                )}
                            </button>

                            {showDropdown && (
                                <div className="notification-dropdown shadow-lg rounded-4 p-3">
                                    <div className="d-flex justify-content-between align-items-center mb-3 pb-2 border-bottom">
                                        <h6 className="fw-bold mb-0 text-dark">🔔 Notifications</h6>
                                        {unreadCount > 0 && (
                                            <button
                                                className="btn btn-sm btn-link text-decoration-none p-0 text-primary small fw-bold"
                                                onClick={markAllAsRead}
                                            >
                                                Mark all read
                                            </button>
                                        )}
                                    </div>

                                    <div className="notification-list" style={{ maxHeight: "380px", overflowY: "auto" }}>
                                        {notifications.length === 0 ? (
                                            <p className="text-muted text-center py-3 mb-0 small">
                                                No notifications yet.
                                            </p>
                                        ) : (
                                            notifications.slice().reverse().map((item) => (
                                                <div
                                                    key={item.id}
                                                    className={`notification-item p-2 mb-2 rounded-3 ${
                                                        item.status === "UNREAD" ? "unread-bg" : "read-bg"
                                                    }`}
                                                    style={{ cursor: item.type === "COLLAB_INVITE" ? "default" : "pointer" }}
                                                    onClick={() => {
                                                        if (item.type !== "COLLAB_INVITE" && item.status === "UNREAD") {
                                                            markAsRead(item.id);
                                                        }
                                                    }}
                                                >
                                                    {/* Message row */}
                                                    <div className="d-flex justify-content-between align-items-start gap-2">
                                                        <p className="mb-0 small text-dark" style={{ lineHeight: "1.4" }}>
                                                            {item.message}
                                                        </p>
                                                        {item.status === "UNREAD" && item.type !== "COLLAB_INVITE" && (
                                                            <span className="badge-unread-dot" title="Unread"></span>
                                                        )}
                                                    </div>

                                                    {/* Accept / Deny buttons for COLLAB_INVITE */}
                                                    {item.type === "COLLAB_INVITE" && item.status === "UNREAD" && (
                                                        <div className="d-flex gap-2 mt-2">
                                                            <button
                                                                className="btn btn-sm btn-success fw-bold flex-fill"
                                                                style={{ fontSize: "0.75rem", padding: "4px 8px" }}
                                                                disabled={respondingId === item.id}
                                                                onClick={(e) => { e.stopPropagation(); handleAcceptInvite(item.id); }}
                                                            >
                                                                {respondingId === item.id ? "..." : "✅ Accept"}
                                                            </button>
                                                            <button
                                                                className="btn btn-sm btn-outline-danger fw-bold flex-fill"
                                                                style={{ fontSize: "0.75rem", padding: "4px 8px" }}
                                                                disabled={respondingId === item.id}
                                                                onClick={(e) => { e.stopPropagation(); handleDenyInvite(item.id); }}
                                                            >
                                                                {respondingId === item.id ? "..." : "❌ Deny"}
                                                            </button>
                                                        </div>
                                                    )}

                                                    {/* Show result if already responded */}
                                                    {item.type === "COLLAB_INVITE" && item.status === "ACCEPTED" && (
                                                        <div className="mt-1">
                                                            <span className="badge bg-success" style={{ fontSize: "0.7rem" }}>✅ Accepted — You joined the trip!</span>
                                                        </div>
                                                    )}
                                                    {item.type === "COLLAB_INVITE" && item.status === "DENIED" && (
                                                        <div className="mt-1">
                                                            <span className="badge bg-secondary" style={{ fontSize: "0.7rem" }}>❌ Invitation Declined</span>
                                                        </div>
                                                    )}
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>

                        <button className="btn btn-logout" onClick={logout} title="Sign Out">
                            🚪 Logout
                        </button>
                    </div>
                </div>
            </div>
        </nav>
    );
}

export default Navbar;