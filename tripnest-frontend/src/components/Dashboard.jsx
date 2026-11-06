import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "./Navbar";
import Destinations from "./Destinations";
import Footer from "./Footer";
import API from "../services/api";
import "../styles/Dashboard.css";

function Dashboard() {
    const user = JSON.parse(localStorage.getItem("user"));
    const navigate = useNavigate();

    const [tripStats, setTripStats] = useState({
        total: 0,
        upcoming: 0,
        recent: null,
    });

    useEffect(() => {
        fetchDashboardStats();
    }, []);

    const fetchDashboardStats = async () => {
        try {
            const res = await API.get("/trips/all");
            const trips = res.data || [];
            const upcomingCount = trips.filter(t => new Date(t.startDate) >= new Date()).length;
            setTripStats({
                total: trips.length,
                upcoming: upcomingCount,
                recent: trips.length > 0 ? trips[trips.length - 1] : null,
            });
        } catch (error) {
            console.error("Dashboard stats fetch error:", error);
        }
    };

    return (
        <div className="page-wrapper">
            <Navbar />

            <div className="dashboard-container py-5">
                <div className="container">
                    {/* Welcome Banner */}
                    <div className="hero-banner p-5 rounded-4 shadow-lg text-white mb-5">
                        <div className="row align-items-center">
                            <div className="col-lg-8">
                                <span className="badge bg-primary-gradient px-3 py-2 rounded-pill mb-3">
                                    🌴 Welcome Back, Explorer
                                </span>
                                <h1 className="display-4 fw-bold mb-3">
                                    Ready for your next adventure, {user?.name || "Traveler"}?
                                </h1>
                                <p className="lead opacity-90 mb-4">
                                    Plan dream itineraries, track trip budgets in real-time, and discover handpicked world destinations with TripNest.
                                </p>
                                <div className="d-flex flex-wrap gap-3">
                                    <Link to="/ai-planner" className="btn btn-gradient-primary btn-lg shadow-sm">
                                        ✨ AI Trip Planner
                                    </Link>
                                    <Link to="/budget-assistant" className="btn btn-outline-light btn-lg">
                                        💰 Budget AI
                                    </Link>
                                    <Link to="/recommendations" className="btn btn-outline-light btn-lg">
                                        🧭 Destination Matcher
                                    </Link>
                                    <Link to="/my-trips" className="btn btn-outline-light btn-lg">
                                        🧳 My Trips ({tripStats.total})
                                    </Link>
                                    <Link to="/analytics" className="btn btn-outline-light btn-lg">
                                        📊 Analytics
                                    </Link>
                                    {user?.role === "ROLE_ADMIN" && (
                                        <Link to="/admin" className="btn btn-warning btn-lg text-dark fw-bold">
                                            🛡️ Admin Center
                                        </Link>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Quick Stats Grid */}
                    <div className="row g-4 mb-5">
                        <div className="col-md-4">
                            <div className="dash-stat-card p-4 rounded-4 shadow-sm">
                                <div className="stat-icon bg-soft-primary">🗺️</div>
                                <div>
                                    <h2 className="fw-bold mb-0">{tripStats.total}</h2>
                                    <p className="text-muted mb-0">Total Trips Planned</p>
                                </div>
                            </div>
                        </div>

                        <div className="col-md-4">
                            <div className="dash-stat-card p-4 rounded-4 shadow-sm">
                                <div className="stat-icon bg-soft-success">⏳</div>
                                <div>
                                    <h2 className="fw-bold mb-0">{tripStats.upcoming}</h2>
                                    <p className="text-muted mb-0">Upcoming Trips</p>
                                </div>
                            </div>
                        </div>

                        <div className="col-md-4">
                            <div className="dash-stat-card p-4 rounded-4 shadow-sm">
                                <div className="stat-icon bg-soft-warning">🧭</div>
                                <div>
                                    <h2 className="fw-bold mb-0">5+</h2>
                                    <p className="text-muted mb-0">Featured Destinations</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Recent Trip Quick Card (If exists) */}
                    {tripStats.recent && (
                        <div className="recent-trip-alert p-4 rounded-4 shadow-sm mb-5 d-flex justify-content-between align-items-center flex-wrap gap-3">
                            <div>
                                <span className="badge bg-secondary mb-2">Most Recent Trip</span>
                                <h4 className="fw-bold mb-1">📍 {tripStats.recent.destination}</h4>
                                <p className="mb-0 text-muted">
                                    {tripStats.recent.startDate} to {tripStats.recent.endDate} | Budget: ₹{tripStats.recent.budget?.toLocaleString()}
                                </p>
                            </div>
                            <button className="btn btn-primary" onClick={() => navigate(`/trip/${tripStats.recent.id}`)}>
                                Manage Itinerary & Expenses ➡️
                            </button>
                        </div>
                    )}

                    {/* AI Travel Suite Showcase */}
                    <div className="mb-5">
                        <div className="d-flex justify-content-between align-items-center mb-3">
                            <div>
                                <h3 className="fw-bold mb-1 text-dark">✨ AI Travel Planning Suite</h3>
                                <p className="text-muted mb-0">Smart personalized itineraries, automated budget auditing, and interactive shortest-route planning.</p>
                            </div>
                        </div>
                        <div className="row g-4">
                            <div className="col-md-4">
                                <div className="card h-100 border-0 rounded-4 shadow-sm p-4 bg-white d-flex flex-column justify-content-between">
                                    <div>
                                        <div className="stat-icon bg-soft-primary fs-3 mb-3">🤖</div>
                                        <h5 className="fw-bold text-dark">AI Trip Planner</h5>
                                        <p className="text-muted small">Generate personalized day-wise itineraries with attractions, timing, notes, and road maps.</p>
                                    </div>
                                    <Link to="/ai-planner" className="btn btn-outline-primary rounded-pill btn-sm fw-bold">
                                        Launch Planner &rarr;
                                    </Link>
                                </div>
                            </div>
                            <div className="col-md-4">
                                <div className="card h-100 border-0 rounded-4 shadow-sm p-4 bg-white d-flex flex-column justify-content-between">
                                    <div>
                                        <div className="stat-icon bg-soft-success fs-3 mb-3">💰</div>
                                        <h5 className="fw-bold text-dark">AI Budget Assistant</h5>
                                        <p className="text-muted small">Compare planned allocations against actual spends with overspending risk detection and cost-reduction tips.</p>
                                    </div>
                                    <Link to="/budget-assistant" className="btn btn-outline-success rounded-pill btn-sm fw-bold">
                                        Audit Budget &rarr;
                                    </Link>
                                </div>
                            </div>
                            <div className="col-md-4">
                                <div className="card h-100 border-0 rounded-4 shadow-sm p-4 bg-white d-flex flex-column justify-content-between">
                                    <div>
                                        <div className="stat-icon bg-soft-warning fs-3 mb-3">🧭</div>
                                        <h5 className="fw-bold text-dark">Destination Matcher</h5>
                                        <p className="text-muted small">Explore climate- and interest-matched destinations with instant handoff to the AI itinerary builder.</p>
                                    </div>
                                    <Link to="/recommendations" className="btn btn-outline-warning text-dark rounded-pill btn-sm fw-bold">
                                        Find Matches &rarr;
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Featured Destinations Component */}
                    <div className="mb-5">
                        <div className="d-flex justify-content-between align-items-center mb-4">
                            <div>
                                <h2 className="fw-bold mb-1">🏖️ Explore Popular Destinations</h2>
                                <p className="text-muted mb-0">Handpicked top destinations to kickstart your itinerary.</p>
                            </div>
                            <Link to="/destinations" className="btn btn-link text-decoration-none fw-bold">
                                View All Destinations →
                            </Link>
                        </div>
                        <Destinations />
                    </div>
                </div>
            </div>

            <Footer />
        </div>
    );
}

export default Dashboard;