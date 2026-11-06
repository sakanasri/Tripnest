import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import Navbar from "./Navbar";
import Footer from "./Footer";
import "../styles/AiFeatures.css";

const CLIMATE_OPTIONS = [
    { id: "Cool / Mountain", label: "🏔️ Cool Mountain & Hills" },
    { id: "Coastal / Beach", label: "🏖️ Coastal & Tropical Beaches" },
    { id: "Heritage / Moderate", label: "🏰 Royal Heritage & Bazaars" },
    { id: "Tropical", label: "🌴 Tropical Backwaters & Nature" },
];

const INTEREST_OPTIONS = [
    "Nature", "Adventure", "Beaches", "Heritage", "Temples", "Historical places", "Shopping", "Food", "Relaxation"
];

export default function AiDestinationRecommendations() {
    const navigate = useNavigate();

    const [climate, setClimate] = useState("Cool / Mountain");
    const [selectedInterests, setSelectedInterests] = useState(["Nature", "Adventure"]);
    const [budget, setBudget] = useState(30000);
    const [durationDays, setDurationDays] = useState(4);
    const [loading, setLoading] = useState(false);
    const [recommendations, setRecommendations] = useState([]);
    const [favorites, setFavorites] = useState([]);
    const [userPreferenceNotice, setUserPreferenceNotice] = useState("");

    useEffect(() => {
        initPreferencesAndFetch();
    }, []);

    const initPreferencesAndFetch = async () => {
        try {
            fetchFavorites();
            const localUser = JSON.parse(localStorage.getItem("user") || "{}");
            let initialClimate = "Cool / Mountain";
            let initialInterests = ["Nature", "Adventure"];
            let notice = "";

            if (localUser.email) {
                try {
                    const profileRes = await API.get(`/users/profile?email=${encodeURIComponent(localUser.email)}`);
                    const prefs = profileRes.data?.travelPreferences || localUser.travelPreferences || "";
                    if (prefs && prefs.trim().length > 0) {
                        notice = prefs;
                        const lower = prefs.toLowerCase();

                        // Tailor climate and interests based on user profile
                        if (lower.includes("temple") || lower.includes("pilgrim") || lower.includes("heritage")) {
                            initialClimate = "Heritage / Moderate";
                            initialInterests = ["Temples", "Heritage", "Historical places"];
                        } else if (lower.includes("beach") || lower.includes("coastal")) {
                            initialClimate = "Coastal / Beach";
                            initialInterests = ["Beaches", "Relaxation", "Food"];
                        } else if (lower.includes("hill") || lower.includes("mountain") || lower.includes("adventure")) {
                            initialClimate = "Cool / Mountain";
                            initialInterests = ["Adventure", "Nature", "Relaxation"];
                        } else if (lower.includes("tropical") || lower.includes("backwater")) {
                            initialClimate = "Tropical";
                            initialInterests = ["Relaxation", "Nature", "Food"];
                        }
                    }
                } catch (e) {
                    console.warn("Could not load user profile preferences:", e);
                }
            }

            setClimate(initialClimate);
            setSelectedInterests(initialInterests);
            setUserPreferenceNotice(notice);
            fetchRecommendations(initialClimate, initialInterests, budget, durationDays);
        } catch (err) {
            fetchRecommendations(climate, selectedInterests, budget, durationDays);
        }
    };

    const fetchFavorites = async () => {
        try {
            const res = await API.get("/ai/destinations/favorites");
            if (res.data) setFavorites(res.data);
        } catch (err) {
            console.error("Fetch favorites error:", err);
        }
    };

    const fetchRecommendations = async (
        activeClimate = climate,
        activeInterests = selectedInterests,
        activeBudget = budget,
        activeDays = durationDays
    ) => {
        setLoading(true);
        try {
            const payload = {
                climate: activeClimate,
                interests: activeInterests,
                budget: parseFloat(activeBudget) || 30000,
                durationDays: parseInt(activeDays) || 4,
            };
            const res = await API.post("/ai/destinations/recommend", payload);
            setRecommendations(res.data || []);
        } catch (err) {
            console.error("Fetch recommendations error:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleClimateChange = (newVal) => {
        setClimate(newVal);
        fetchRecommendations(newVal, selectedInterests, budget, durationDays);
    };

    const toggleInterest = (item) => {
        const updated = selectedInterests.includes(item)
            ? selectedInterests.filter((i) => i !== item)
            : [...selectedInterests, item];
        setSelectedInterests(updated);
        fetchRecommendations(climate, updated, budget, durationDays);
    };

    const handleBudgetChange = (newBudget) => {
        setBudget(newBudget);
    };

    const handleToggleFavorite = async (destName) => {
        try {
            const res = await API.post("/ai/destinations/favorites/toggle", { destinationName: destName });
            if (res.data) {
                if (res.data.isFavorite) {
                    setFavorites([...favorites, destName]);
                } else {
                    setFavorites(favorites.filter((f) => f.toLowerCase() !== destName.toLowerCase()));
                }
            }
        } catch (err) {
            console.error("Toggle favorite error:", err);
        }
    };

    const handleSendToPlanner = (destName) => {
        navigate(`/plan-trip?destination=${encodeURIComponent(destName)}`);
    };

    return (
        <div className="page-wrapper bg-light min-vh-100">
            <Navbar />

            <div className="container py-4">
                <div className="ai-hero-header">
                    <span className="ai-badge mb-2">🧭 Personalized Discovery</span>
                    <h2 className="fw-bold mb-2">AI Destination Recommendations</h2>
                    <p className="lead mb-0 opacity-90 text-light">
                        Discover top-tier destinations dynamically matched to your preferred climate, travel interests, and budget.
                    </p>
                    {userPreferenceNotice && (
                        <div className="mt-3">
                            <span className="badge bg-white text-primary p-2 px-3 rounded-pill fw-bold shadow-sm">
                                👤 Matched to your profile preferences: {userPreferenceNotice}
                            </span>
                        </div>
                    )}
                </div>

                {/* Filter and Criteria Card */}
                <div className="ai-glass-card p-4 mb-4">
                    <div className="row g-3">
                        <div className="col-md-6">
                            <label className="form-label small fw-bold text-dark">
                                🌤️ Preferred Climate / Scenery:
                            </label>
                            <select
                                className="form-select rounded-3"
                                value={climate}
                                onChange={(e) => handleClimateChange(e.target.value)}
                            >
                                {CLIMATE_OPTIONS.map((c) => (
                                    <option key={c.id} value={c.id}>{c.label}</option>
                                ))}
                            </select>
                        </div>

                        <div className="col-md-3">
                            <label className="form-label small fw-bold text-dark">
                                ⏳ Duration: {durationDays} Days
                            </label>
                            <input
                                type="range"
                                className="form-range"
                                min="2"
                                max="14"
                                value={durationDays}
                                onChange={(e) => {
                                    setDurationDays(e.target.value);
                                    fetchRecommendations(climate, selectedInterests, budget, e.target.value);
                                }}
                            />
                        </div>

                        <div className="col-md-3">
                            <label className="form-label small fw-bold text-dark">
                                💵 Budget: ₹{Number(budget).toLocaleString()}
                            </label>
                            <input
                                type="range"
                                className="form-range"
                                min="10000"
                                max="100000"
                                step="5000"
                                value={budget}
                                onChange={(e) => handleBudgetChange(e.target.value)}
                                onMouseUp={() => fetchRecommendations(climate, selectedInterests, budget, durationDays)}
                                onTouchEnd={() => fetchRecommendations(climate, selectedInterests, budget, durationDays)}
                            />
                        </div>

                        <div className="col-12 mt-2">
                            <label className="form-label small fw-bold text-dark d-block">
                                🎯 Preferred Travel Interests (Click to filter live):
                            </label>
                            <div className="d-flex flex-wrap gap-2">
                                {INTEREST_OPTIONS.map((item) => (
                                    <button
                                        key={item}
                                        type="button"
                                        className={`preference-chip ${selectedInterests.includes(item) ? "selected" : ""}`}
                                        onClick={() => toggleInterest(item)}
                                    >
                                        {item}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="col-12 text-end mt-3 d-flex justify-content-between align-items-center flex-wrap gap-2">
                            <small className="text-muted">
                                Showing {recommendations.length} curated destinations sorted by highest preference match score.
                            </small>
                            <button
                                type="button"
                                className="btn btn-primary rounded-pill px-4 fw-bold shadow-sm"
                                onClick={() => fetchRecommendations(climate, selectedInterests, budget, durationDays)}
                                disabled={loading}
                            >
                                {loading ? "Matching Places..." : "🔄 Refresh Recommendations"}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Recommendations Grid */}
                {loading ? (
                    <div className="text-center py-5">
                        <div className="pulse-spinner text-primary" style={{ width: "3rem", height: "3rem" }}></div>
                        <p className="mt-2 text-muted">Calculating real-time preference match scores across destinations...</p>
                    </div>
                ) : (
                    <div className="row g-4 mb-5">
                        {recommendations.map((dest) => {
                            const isFav = favorites.some((f) => f.toLowerCase() === dest.name.toLowerCase());
                            const score = dest.matchScore || 70;
                            const badgeColor = score >= 85 ? "bg-success text-white" : score >= 70 ? "bg-primary text-white" : "bg-secondary text-white";

                            return (
                                <div key={dest.id || dest.name} className="col-md-6 col-lg-4">
                                    <div className="card h-100 border-0 rounded-4 shadow-sm overflow-hidden d-flex flex-column hover-lift">
                                        <div
                                            className="destination-card-hero"
                                            style={{ backgroundImage: `url(${dest.imageUrl || "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=600"})` }}
                                        >
                                            <div className="destination-card-overlay">
                                                <div className="d-flex justify-content-between align-items-center">
                                                    <span className={`badge ${badgeColor} rounded-pill fw-bold px-3 py-1 shadow-sm`}>
                                                        ⭐ {score}% Match
                                                    </span>
                                                    <button
                                                        type="button"
                                                        className={`btn btn-sm rounded-circle p-2 ${isFav ? "btn-danger" : "btn-light"}`}
                                                        onClick={() => handleToggleFavorite(dest.name)}
                                                        title={isFav ? "Remove from Favorites" : "Save to Favorites"}
                                                    >
                                                        {isFav ? "❤️" : "🤍"}
                                                    </button>
                                                </div>

                                                <div className="mt-auto">
                                                    <h4 className="fw-bold text-white mb-0 text-shadow">{dest.name}</h4>
                                                    <small className="text-white-50">{dest.country} • {dest.category}</small>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="card-body p-4 d-flex flex-column flex-grow-1">
                                            <div className="d-flex justify-content-between align-items-center mb-2">
                                                <span className="badge bg-light text-dark border rounded-pill small">
                                                    🗓️ {dest.bestTimeToVisit}
                                                </span>
                                                <span className="badge bg-primary-subtle text-primary rounded-pill small">
                                                    💰 {dest.estimatedBudget}
                                                </span>
                                            </div>

                                            <p className="card-text text-muted small mb-3 flex-grow-1">
                                                {dest.description}
                                            </p>

                                            <div className="mb-3">
                                                <h6 className="fw-bold text-dark small mb-2">✨ Why it matches your preference:</h6>
                                                <p className="text-secondary small mb-0 p-2 rounded-3 bg-light border-start border-3 border-primary">
                                                    {dest.matchReason}
                                                </p>
                                            </div>

                                            <div className="mb-3">
                                                <h6 className="fw-bold text-dark small mb-1">Key Attractions:</h6>
                                                <div className="d-flex flex-wrap gap-1">
                                                    {dest.keyAttractions?.slice(0, 3).map((att, i) => (
                                                        <span key={i} className="badge bg-secondary-subtle text-secondary small rounded-pill">
                                                            📍 {att}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>

                                            <div className="pt-2 border-top mt-auto d-flex justify-content-between align-items-center">
                                                <small className="text-muted fw-bold">
                                                    ⏱️ {dest.suggestedDuration}
                                                </small>
                                                <button
                                                    type="button"
                                                    className="btn btn-primary btn-sm rounded-pill px-3 fw-bold shadow-sm"
                                                    onClick={() => handleSendToPlanner(dest.name)}
                                                >
                                                    🚀 Plan Trip
                                                </button>
                                            </div>
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