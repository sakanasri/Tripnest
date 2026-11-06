import { useEffect, useState } from "react";
import Navbar from "./Navbar";
import Footer from "./Footer";
import API from "../services/api";

function AdminDashboard() {
    const [stats, setStats] = useState(null);
    const [users, setUsers] = useState([]);
    const [trips, setTrips] = useState([]);
    const [destinations, setDestinations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("overview");
    const [message, setMessage] = useState({ type: "", text: "" });

    // Destination Form State
    const [newDest, setNewDest] = useState({
        name: "",
        country: "India",
        category: "Beach & Nightlife",
        description: "",
        bestTimeToVisit: "",
        estimatedBudget: "",
        imageUrl: "",
    });
    const [destSubmitting, setDestSubmitting] = useState(false);

    useEffect(() => {
        fetchAllAdminData();
    }, []);

    const fetchAllAdminData = async () => {
        try {
            setLoading(true);
            const [statsRes, usersRes, tripsRes, destRes] = await Promise.all([
                API.get("/admin/stats"),
                API.get("/admin/users"),
                API.get("/admin/trips"),
                API.get("/destinations/all"),
            ]);

            setStats(statsRes.data);
            setUsers(usersRes.data || []);
            setTrips(tripsRes.data || []);
            setDestinations(destRes.data || []);
        } catch (error) {
            console.error("Admin data fetch error:", error);
            setMessage({ type: "danger", text: "Failed to load admin management data." });
        } finally {
            setLoading(false);
        }
    };

    const handleRoleChange = async (userId, newRole) => {
        try {
            const res = await API.put(`/admin/users/${userId}/role`, { role: newRole });
            setUsers(users.map((u) => (u.id === userId ? res.data : u)));
            setMessage({ type: "success", text: `User role updated to ${newRole} successfully!` });
        } catch (error) {
            console.error("Role change error:", error);
            setMessage({ type: "danger", text: "Failed to update user role." });
        }
    };

    const handleAddDestination = async (e) => {
        e.preventDefault();
        if (!newDest.name || !newDest.description) {
            alert("Please provide at least a name and description!");
            return;
        }

        try {
            setDestSubmitting(true);
            const res = await API.post("/admin/destinations", newDest);
            setDestinations([...destinations, res.data]);
            setNewDest({
                name: "",
                country: "India",
                category: "Beach & Nightlife",
                description: "",
                bestTimeToVisit: "",
                estimatedBudget: "",
                imageUrl: "",
            });
            setMessage({ type: "success", text: `Destination '${res.data.name}' added successfully!` });
        } catch (error) {
            console.error("Add destination error:", error);
            setMessage({ type: "danger", text: "Failed to create destination." });
        } finally {
            setDestSubmitting(false);
        }
    };

    const handleDeleteDestination = async (destId, name) => {
        if (!window.confirm(`Are you sure you want to delete destination '${name}'?`)) return;
        try {
            await API.delete(`/admin/destinations/${destId}`);
            setDestinations(destinations.filter((d) => d.id !== destId));
            setMessage({ type: "success", text: `Destination '${name}' deleted successfully.` });
        } catch (error) {
            console.error("Delete destination error:", error);
            setMessage({ type: "danger", text: "Failed to delete destination." });
        }
    };

    if (loading) {
        return (
            <div className="page-wrapper">
                <Navbar />
                <div className="container text-center py-5">
                    <div className="spinner-border text-primary" role="status"></div>
                    <p className="mt-2 text-muted">Loading administrator dashboard...</p>
                </div>
                <Footer />
            </div>
        );
    }

    return (
        <div className="page-wrapper">
            <Navbar />

            <div className="container py-5 min-vh-100">
                {/* Header */}
                <div className="d-flex justify-content-between align-items-center mb-4 pb-2 border-bottom flex-wrap gap-3">
                    <div>
                        <span className="badge bg-danger px-3 py-2 rounded-pill mb-2">🛡️ System Administration</span>
                        <h1 className="fw-bold display-5 mb-1">TripNest Admin Control Center</h1>
                        <p className="text-muted mb-0">Platform overview, user role management, and global destination controls.</p>
                    </div>
                </div>

                {message.text && (
                    <div className={`alert alert-${message.type} alert-dismissible fade show rounded-4 shadow-sm mb-4`} role="alert">
                        {message.text}
                        <button type="button" className="btn-close" onClick={() => setMessage({ type: "", text: "" })}></button>
                    </div>
                )}

                {/* Navigation Tabs */}
                <div className="d-flex gap-2 mb-4 flex-wrap">
                    <button
                        className={`btn btn-lg ${activeTab === "overview" ? "btn-primary" : "btn-outline-secondary"}`}
                        onClick={() => setActiveTab("overview")}
                    >
                        📈 Platform Metrics
                    </button>
                    <button
                        className={`btn btn-lg ${activeTab === "users" ? "btn-primary" : "btn-outline-secondary"}`}
                        onClick={() => setActiveTab("users")}
                    >
                        👥 User Management ({users.length})
                    </button>
                    <button
                        className={`btn btn-lg ${activeTab === "trips" ? "btn-primary" : "btn-outline-secondary"}`}
                        onClick={() => setActiveTab("trips")}
                    >
                        🧳 Platform Trips ({trips.length})
                    </button>
                    <button
                        className={`btn btn-lg ${activeTab === "destinations" ? "btn-primary" : "btn-outline-secondary"}`}
                        onClick={() => setActiveTab("destinations")}
                    >
                        🏖️ Destinations Catalog ({destinations.length})
                    </button>
                </div>

                {/* Tab 1: Overview */}
                {activeTab === "overview" && (
                    <div>
                        <div className="row g-4 mb-5">
                            <div className="col-md-3">
                                <div className="card shadow-sm border-0 rounded-4 p-4 bg-white text-center">
                                    <span className="fs-2">👥</span>
                                    <h3 className="fw-bold mt-2 mb-0">{stats?.totalUsers || users.length}</h3>
                                    <p className="text-muted small mb-0">Registered Travelers</p>
                                </div>
                            </div>
                            <div className="col-md-3">
                                <div className="card shadow-sm border-0 rounded-4 p-4 bg-white text-center">
                                    <span className="fs-2">🗺️</span>
                                    <h3 className="fw-bold mt-2 mb-0">{stats?.totalTrips || trips.length}</h3>
                                    <p className="text-muted small mb-0">Total Platform Trips</p>
                                </div>
                            </div>
                            <div className="col-md-3">
                                <div className="card shadow-sm border-0 rounded-4 p-4 bg-white text-center">
                                    <span className="fs-2">💰</span>
                                    <h3 className="fw-bold mt-2 mb-0 text-primary">₹{(stats?.totalBudget || 0).toLocaleString()}</h3>
                                    <p className="text-muted small mb-0">Total Platform Budget</p>
                                </div>
                            </div>
                            <div className="col-md-3">
                                <div className="card shadow-sm border-0 rounded-4 p-4 bg-white text-center">
                                    <span className="fs-2">💳</span>
                                    <h3 className="fw-bold mt-2 mb-0 text-danger">₹{(stats?.totalExpenseAmount || 0).toLocaleString()}</h3>
                                    <p className="text-muted small mb-0">Total Expenses Tracked</p>
                                </div>
                            </div>
                        </div>

                        {/* Status Highlights */}
                        <div className="row g-4">
                            <div className="col-md-4">
                                <div className="card shadow-sm border-0 rounded-4 p-4 bg-white">
                                    <h5 className="fw-bold text-muted mb-2">Planned Trips</h5>
                                    <h2 className="fw-bold text-warning">{stats?.plannedTrips || 0}</h2>
                                    <small className="text-muted">Awaiting departure</small>
                                </div>
                            </div>
                            <div className="col-md-4">
                                <div className="card shadow-sm border-0 rounded-4 p-4 bg-white">
                                    <h5 className="fw-bold text-muted mb-2">Ongoing Trips</h5>
                                    <h2 className="fw-bold text-primary">{stats?.ongoingTrips || 0}</h2>
                                    <small className="text-muted">Currently active</small>
                                </div>
                            </div>
                            <div className="col-md-4">
                                <div className="card shadow-sm border-0 rounded-4 p-4 bg-white">
                                    <h5 className="fw-bold text-muted mb-2">Completed Trips</h5>
                                    <h2 className="fw-bold text-success">{stats?.completedTrips || 0}</h2>
                                    <small className="text-muted">Memories created</small>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Tab 2: User Role Management */}
                {activeTab === "users" && (
                    <div className="card shadow-sm border-0 rounded-4 p-4 bg-white">
                        <div className="d-flex justify-content-between align-items-center mb-3">
                            <h4 className="fw-bold mb-0">Registered Platform Users & Role Assignment</h4>
                            <span className="badge bg-primary fs-6">{users.length} Users</span>
                        </div>
                        <div className="table-responsive">
                            <table className="table table-hover align-middle">
                                <thead className="table-light">
                                    <tr>
                                        <th>ID</th>
                                        <th>User</th>
                                        <th>Email</th>
                                        <th>Age</th>
                                        <th>Current Role</th>
                                        <th>Role Modification</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {users.map((u) => (
                                        <tr key={u.id}>
                                            <td>#{u.id}</td>
                                            <td className="fw-bold">{u.name}</td>
                                            <td>{u.email}</td>
                                            <td>{u.age || "N/A"}</td>
                                            <td>
                                                <span className={`badge ${u.role === "ROLE_ADMIN" ? "bg-danger" : u.role === "ROLE_GROUP_ADMIN" ? "bg-warning text-dark" : "bg-primary"}`}>
                                                    {u.role || "ROLE_TRAVELER"}
                                                </span>
                                            </td>
                                            <td>
                                                <select
                                                    className="form-select form-select-sm"
                                                    style={{ width: "190px" }}
                                                    value={u.role || "ROLE_TRAVELER"}
                                                    onChange={(e) => handleRoleChange(u.id, e.target.value)}
                                                >
                                                    <option value="ROLE_TRAVELER">Traveler</option>
                                                    <option value="ROLE_GROUP_ADMIN">Group Admin</option>
                                                    <option value="ROLE_ADMIN">Administrator</option>
                                                </select>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* Tab 3: Platform Trips */}
                {activeTab === "trips" && (
                    <div className="card shadow-sm border-0 rounded-4 p-4 bg-white">
                        <h4 className="fw-bold mb-3">All Platform Trips</h4>
                        <div className="table-responsive">
                            <table className="table table-hover align-middle">
                                <thead className="table-light">
                                    <tr>
                                        <th>Trip ID</th>
                                        <th>Destination</th>
                                        <th>Origin</th>
                                        <th>Dates</th>
                                        <th>Travelers</th>
                                        <th>Budget</th>
                                        <th>Status</th>
                                        <th>Creator</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {trips.map((t) => (
                                        <tr key={t.id}>
                                            <td>#{t.id}</td>
                                            <td className="fw-bold">📍 {t.destination}</td>
                                            <td>{t.fromLocation}</td>
                                            <td className="small text-muted">{t.startDate} to {t.endDate}</td>
                                            <td>👥 {t.travellers}</td>
                                            <td className="fw-bold">₹{t.budget?.toLocaleString()}</td>
                                            <td>
                                                <span className={`badge ${t.status === "Completed" ? "bg-success" : t.status === "Ongoing" ? "bg-primary" : "bg-warning text-dark"}`}>
                                                    {t.status || "Planned"}
                                                </span>
                                            </td>
                                            <td className="small">{t.user?.email || "System"}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* Tab 4: Destinations Management */}
                {activeTab === "destinations" && (
                    <div className="row g-4">
                        {/* Add Destination Form */}
                        <div className="col-lg-5">
                            <div className="card shadow-sm border-0 rounded-4 p-4 bg-white">
                                <h4 className="fw-bold mb-3">➕ Add New Destination</h4>
                                <form onSubmit={handleAddDestination}>
                                    <div className="mb-3">
                                        <label className="form-label fw-bold">Destination Name</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            placeholder="e.g. Shimla, Udaipur"
                                            value={newDest.name}
                                            onChange={(e) => setNewDest({ ...newDest, name: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div className="row g-2 mb-3">
                                        <div className="col-6">
                                            <label className="form-label fw-bold">Country</label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                value={newDest.country}
                                                onChange={(e) => setNewDest({ ...newDest, country: e.target.value })}
                                            />
                                        </div>
                                        <div className="col-6">
                                            <label className="form-label fw-bold">Category</label>
                                            <select
                                                className="form-select"
                                                value={newDest.category}
                                                onChange={(e) => setNewDest({ ...newDest, category: e.target.value })}
                                            >
                                                <option value="Beach & Nightlife">Beach & Nightlife</option>
                                                <option value="Hill Station & Nature">Hill Station & Nature</option>
                                                <option value="Adventure & Mountains">Adventure & Mountains</option>
                                                <option value="Heritage & Culture">Heritage & Culture</option>
                                                <option value="Relaxation & Culture">Relaxation & Culture</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label fw-bold">Description</label>
                                        <textarea
                                            className="form-control"
                                            rows="3"
                                            placeholder="Overview of the destination..."
                                            value={newDest.description}
                                            onChange={(e) => setNewDest({ ...newDest, description: e.target.value })}
                                            required
                                        ></textarea>
                                    </div>
                                    <div className="row g-2 mb-3">
                                        <div className="col-6">
                                            <label className="form-label fw-bold">Best Time</label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                placeholder="Oct - March"
                                                value={newDest.bestTimeToVisit}
                                                onChange={(e) => setNewDest({ ...newDest, bestTimeToVisit: e.target.value })}
                                            />
                                        </div>
                                        <div className="col-6">
                                            <label className="form-label fw-bold">Est. Budget</label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                placeholder="₹15,000 - ₹30,000"
                                                value={newDest.estimatedBudget}
                                                onChange={(e) => setNewDest({ ...newDest, estimatedBudget: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label fw-bold">Image URL</label>
                                        <input
                                            type="url"
                                            className="form-control"
                                            placeholder="https://images.unsplash.com/..."
                                            value={newDest.imageUrl}
                                            onChange={(e) => setNewDest({ ...newDest, imageUrl: e.target.value })}
                                        />
                                    </div>
                                    <button type="submit" className="btn btn-primary w-100" disabled={destSubmitting}>
                                        {destSubmitting ? "Adding..." : "Add Destination to Catalog"}
                                    </button>
                                </form>
                            </div>
                        </div>

                        {/* Existing Destinations List */}
                        <div className="col-lg-7">
                            <div className="card shadow-sm border-0 rounded-4 p-4 bg-white">
                                <h4 className="fw-bold mb-3">Catalog Destinations ({destinations.length})</h4>
                                <div className="d-flex flex-column gap-3">
                                    {destinations.map((d) => (
                                        <div key={d.id} className="p-3 border rounded-3 bg-light d-flex justify-content-between align-items-center">
                                            <div className="d-flex align-items-center gap-3">
                                                <img
                                                    src={d.imageUrl || "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=100"}
                                                    alt={d.name}
                                                    style={{ width: "60px", height: "60px", objectFit: "cover", borderRadius: "8px" }}
                                                />
                                                <div>
                                                    <span className="badge bg-secondary mb-1">{d.category}</span>
                                                    <h5 className="mb-0 fw-bold">{d.name}, {d.country}</h5>
                                                    <small className="text-muted">Budget: {d.estimatedBudget} • Best: {d.bestTimeToVisit}</small>
                                                </div>
                                            </div>
                                            <button
                                                className="btn btn-sm btn-outline-danger"
                                                onClick={() => handleDeleteDestination(d.id, d.name)}
                                            >
                                                🗑️ Delete
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <Footer />
        </div>
    );
}

export default AdminDashboard;
