import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import API from "../services/api";
import Navbar from "./Navbar";
import Footer from "./Footer";
import "../styles/TripPlan.css";

function TripPlan() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const destParam = searchParams.get("destination");

    const [trip, setTrip] = useState({
        from: "",
        destination: destParam || "",
        startDate: "",
        endDate: "",
        travellers: "1",
        budget: "20000",
    });

    useEffect(() => {
        if (destParam) {
            setTrip((prev) => ({ ...prev, destination: destParam }));
        }
    }, [destParam]);

    const handleChange = (e) => {
        setTrip({
            ...trip,
            [e.target.name]: e.target.value,
        });
    };

    const planTrip = async (e) => {
        if (e) e.preventDefault();

        if (!trip.destination || !trip.startDate || !trip.endDate) {
            alert("Please fill in destination, start date, and end date!");
            return;
        }

        const tripData = {
            fromLocation: (trip.from && trip.from.trim()) ? trip.from.trim() : "Chennai",
            destination: trip.destination.trim(),
            startDate: trip.startDate,
            endDate: trip.endDate,
            travellers: Number(trip.travellers) || 1,
            budget: Number(trip.budget) || 0,
        };

        try {
            const response = await API.post("/trips/add", tripData);
            console.log(response.data);

            alert("🎉 Trip Planned Successfully! Navigating to My Trips...");
            navigate("/my-trips");
        } catch (error) {
            console.error(error);
            if (error.response) {
                alert("Failed to Save Trip!\nStatus: " + error.response.status);
            } else {
                alert("Cannot connect to Spring Boot Backend!");
            }
        }
    };

    return (
        <div className="page-wrapper">
            <Navbar />

            <div className="container py-5 min-vh-100">
                <div className="row justify-content-center">
                    <div className="col-lg-8 col-xl-7">
                        <div className="card shadow-lg border-0 rounded-4 overflow-hidden">
                            <div className="bg-gradient-primary text-white p-4 text-center">
                                <span className="badge bg-light text-primary px-3 py-2 rounded-pill mb-2 fw-bold">
                                    Trip Planner
                                </span>
                                <h2 className="display-6 fw-bold mb-1">✈️ Plan Your Dream Expedition</h2>
                                <p className="opacity-90 mb-0">Fill in the details below to generate your trip timeline.</p>
                            </div>

                            <div className="card-body p-4 p-md-5">
                                <form onSubmit={planTrip}>
                                    <div className="row g-3 mb-3">
                                        <div className="col-md-6">
                                            <label className="form-label fw-bold d-flex justify-content-between align-items-center">
                                                <span>📍 Starting Location</span>
                                                <small className="text-muted fw-normal">Route map begins here</small>
                                            </label>
                                            <input
                                                type="text"
                                                className="form-control form-control-lg"
                                                name="from"
                                                placeholder="e.g. Chennai, Coimbatore, Bangalore, Mumbai..."
                                                value={trip.from}
                                                onChange={handleChange}
                                                required
                                            />
                                            <div className="d-flex flex-wrap gap-1 mt-2">
                                                <span className="small text-muted me-1 align-self-center">Quick pick:</span>
                                                {["Chennai", "Coimbatore", "Bengaluru", "Madurai", "Trichy", "Mumbai"].map((city) => (
                                                    <button
                                                        key={city}
                                                        type="button"
                                                        className="btn btn-sm btn-outline-secondary py-0 px-2 rounded-pill"
                                                        style={{ fontSize: "0.75rem" }}
                                                        onClick={() => setTrip({ ...trip, from: city })}
                                                    >
                                                        {city}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="col-md-6">
                                            <label className="form-label fw-bold">Destination</label>
                                            <input
                                                type="text"
                                                className="form-control form-control-lg"
                                                name="destination"
                                                placeholder="e.g. Goa, Paris, Ooty..."
                                                value={trip.destination}
                                                onChange={handleChange}
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="row g-3 mb-3">
                                        <div className="col-md-6">
                                            <label className="form-label fw-bold">Start Date</label>
                                            <input
                                                type="date"
                                                className="form-control form-control-lg"
                                                name="startDate"
                                                value={trip.startDate}
                                                onChange={handleChange}
                                                required
                                            />
                                        </div>

                                        <div className="col-md-6">
                                            <label className="form-label fw-bold">End Date</label>
                                            <input
                                                type="date"
                                                className="form-control form-control-lg"
                                                name="endDate"
                                                value={trip.endDate}
                                                onChange={handleChange}
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="row g-3 mb-4">
                                        <div className="col-md-6">
                                            <label className="form-label fw-bold">Number of Travellers</label>
                                            <input
                                                type="number"
                                                className="form-control form-control-lg"
                                                name="travellers"
                                                min="1"
                                                value={trip.travellers}
                                                onChange={handleChange}
                                                required
                                            />
                                        </div>

                                        <div className="col-md-6">
                                            <label className="form-label fw-bold">Total Budget (₹)</label>
                                            <input
                                                type="number"
                                                className="form-control form-control-lg"
                                                name="budget"
                                                placeholder="e.g. 25000"
                                                value={trip.budget}
                                                onChange={handleChange}
                                                required
                                            />
                                        </div>
                                    </div>

                                    <button type="submit" className="btn btn-primary btn-lg w-100 py-3 fw-bold rounded-3 shadow">
                                        🚀 Save & Launch Trip Expedition
                                    </button>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <Footer />
        </div>
    );
}

export default TripPlan;