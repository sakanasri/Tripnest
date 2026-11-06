import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../services/api";
import Navbar from "./Navbar";
import Footer from "./Footer";
import "../styles/MyTrips.css";

function MyTripsPage() {
    const [trips, setTrips] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        fetchTrips();
    }, []);

    const fetchTrips = async () => {
        try {
            setLoading(true);
            const response = await API.get("/trips/all");
            setTrips(response.data || []);
        } catch (error) {
            console.error("Error fetching trips:", error);
            alert("Failed to load your trips. Please log in again.");
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteTrip = async (id, destination) => {
        if (window.confirm(`Are you sure you want to delete the trip to ${destination}?`)) {
            try {
                await API.delete(`/trips/delete/${id}`);
                setTrips(trips.filter((t) => t.id !== id));
                alert("Trip deleted successfully!");
            } catch (error) {
                console.error("Delete Trip Error:", error);
                alert("Failed to delete trip.");
            }
        }
    };

    const calculateSpent = (trip) => {
        if (!trip.expenses || trip.expenses.length === 0) return 0;
        return trip.expenses.reduce((sum, exp) => sum + (exp.amount || 0), 0);
    };

    const getStatusBadge = (startDate, endDate) => {
        if (!startDate) return { text: "Planned", class: "bg-info" };
        const today = new Date();
        const start = new Date(startDate);
        const end = new Date(endDate || startDate);

        if (today < start) return { text: "Upcoming ⏳", class: "status-upcoming" };
        if (today >= start && today <= end) return { text: "Ongoing ✈️", class: "status-ongoing" };
        return { text: "Completed 🏁", class: "status-completed" };
    };

    const filteredTrips = trips.filter(
        (t) =>
            t.destination?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            t.fromLocation?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="page-wrapper">
            <Navbar />

            <div className="container py-5 min-vh-100">
                <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 pb-2 border-bottom">
                    <div>
                        <h1 className="page-heading">🧳 My Travel Expeditions</h1>
                        <p className="page-subheading">Manage your previous, ongoing, and upcoming planned trips.</p>
                    </div>
                    <div className="d-flex gap-3 mt-3 mt-md-0">
                        <input
                            type="text"
                            className="form-control search-input"
                            placeholder="🔍 Filter trips by destination..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <Link to="/plan-trip" className="btn btn-create-trip text-nowrap">
                            ➕ Plan New Trip
                        </Link>
                    </div>
                </div>

                {loading ? (
                    <div className="text-center py-5">
                        <div className="spinner-border text-primary" role="status">
                            <span className="visually-hidden">Loading trips...</span>
                        </div>
                        <p className="mt-3 text-secondary">Fetching your trip history...</p>
                    </div>
                ) : filteredTrips.length === 0 ? (
                    <div className="empty-trips-card text-center py-5">
                        <div className="empty-icon mb-3">🌴</div>
                        <h3>No Trips Found</h3>
                        <p className="text-secondary max-w-500 mx-auto">
                            {searchTerm
                                ? "No trips match your search criteria."
                                : "You haven't planned any trips yet! Start exploring destinations and map out your dream vacation."}
                        </p>
                        <Link to="/plan-trip" className="btn btn-primary btn-lg mt-3">
                            ✈️ Create Your First Trip
                        </Link>
                    </div>
                ) : (
                    <div className="row g-4">
                        {filteredTrips.map((trip) => {
                            const spent = calculateSpent(trip);
                            const percent = Math.min(100, Math.round((spent / (trip.budget || 1)) * 100));
                            const status = getStatusBadge(trip.startDate, trip.endDate);

                            return (
                                <div className="col-lg-6 col-xl-4" key={trip.id}>
                                    <div className="trip-card-wrapper">
                                        <div className="trip-card-header d-flex justify-content-between align-items-start">
                                            <div>
                                                <div className="d-flex gap-1 flex-wrap mb-2">
                                                    <span className={`status-pill ${status.class}`}>
                                                        {status.text}
                                                    </span>
                                                    <span className="badge bg-dark">
                                                        {trip.user?.email === JSON.parse(localStorage.getItem("user"))?.email ? "👑 Owner" : "👥 Co-Traveler"}
                                                    </span>
                                                </div>
                                                <h3 className="trip-destination-title mt-1 mb-0">
                                                    {trip.destination}
                                                </h3>
                                                <small className="text-muted">From: {trip.fromLocation || "Not specified"}</small>
                                            </div>
                                            <button
                                                className="btn-icon-delete"
                                                title="Delete Trip"
                                                onClick={() => handleDeleteTrip(trip.id, trip.destination)}
                                            >
                                                🗑️
                                            </button>
                                        </div>

                                        <div className="trip-card-body my-3">
                                            <div className="info-row">
                                                <span>📅 Dates:</span>
                                                <strong>{trip.startDate} to {trip.endDate}</strong>
                                            </div>
                                            <div className="info-row">
                                                <span>👥 Travellers:</span>
                                                <strong>{trip.travellers} Person(s)</strong>
                                            </div>
                                            <div className="info-row">
                                                <span>💰 Total Budget:</span>
                                                <strong className="text-success">₹{trip.budget?.toLocaleString()}</strong>
                                            </div>

                                            {/* Expense progress bar */}
                                            <div className="budget-progress-section mt-3">
                                                <div className="d-flex justify-content-between small mb-1">
                                                    <span>Expenses Logged:</span>
                                                    <strong className={spent > trip.budget ? "text-danger" : "text-dark"}>
                                                        ₹{spent.toLocaleString()} ({percent}%)
                                                    </strong>
                                                </div>
                                                <div className="progress custom-progress">
                                                    <div
                                                        className={`progress-bar ${
                                                            percent > 90 ? "bg-danger" : percent > 70 ? "bg-warning" : "bg-success"
                                                        }`}
                                                        role="progressbar"
                                                        style={{ width: `${percent}%` }}
                                                        aria-valuenow={percent}
                                                        aria-valuemin="0"
                                                        aria-valuemax="100"
                                                    ></div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="trip-card-footer pt-3 border-top d-flex gap-2">
                                            <button
                                                className="btn btn-outline-primary flex-grow-1"
                                                onClick={() => navigate(`/trip/${trip.id}`)}
                                            >
                                                📝 Details & Itinerary
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            <Footer />
        </div>
    );
}

export default MyTripsPage;
