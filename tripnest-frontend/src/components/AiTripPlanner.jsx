import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import API from "../services/api";
import Navbar from "./Navbar";
import Footer from "./Footer";
import InteractiveRouteMap from "./InteractiveRouteMap";
import "../styles/AiFeatures.css";

const PREFERENCE_OPTIONS = [
    { id: "Nature", label: "🌲 Nature & Forests", icon: "🌲" },
    { id: "Adventure", label: "🧗 Adventure & Trekking", icon: "🧗" },
    { id: "Beaches", label: "🏖️ Beaches & Coastal", icon: "🏖️" },
    { id: "Historical places", label: "🏰 Historical & Heritage", icon: "🏰" },
    { id: "Temples", label: "🛕 Temples & Pilgrimage", icon: "🛕" },
    { id: "Shopping", label: "🛍️ Shopping & Bazaars", icon: "🛍️" },
    { id: "Food", label: "🍛 Local Food & Dining", icon: "🍛" },
    { id: "Relaxation", label: "🧘 Wellness & Relaxation", icon: "🧘" },
];

export default function AiTripPlanner() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const destParam = searchParams.get("destination");

    const localUser = JSON.parse(localStorage.getItem("user") || "{}");

    // Form Inputs - starting location is entered by user (not hardcoded to Delhi)
    const [formData, setFormData] = useState({
        startingLocation: localUser?.city || localUser?.location || "",
        destination: destParam || "Goa",
        destinationsList: destParam ? [destParam] : ["Goa"],
        startDate: new Date(Date.now() + 7 * 86400000).toISOString().split("T")[0],
        endDate: new Date(Date.now() + 10 * 86400000).toISOString().split("T")[0],
        travellers: 2,
        budget: 35000,
        transportMode: "car",
    });

    const [extraDestInput, setExtraDestInput] = useState("");
    const [selectedPreferences, setSelectedPreferences] = useState([
        "Beaches",
        "Sightseeing",
        "Food",
        "Relaxation",
    ]);

    // AI Generation States
    const [generating, setGenerating] = useState(false);
    const [saving, setSaving] = useState(false);
    const [itineraryResult, setItineraryResult] = useState(null);
    const [aiStatus, setAiStatus] = useState(null);
    const [customActivityModal, setCustomActivityModal] = useState({ isOpen: false, dayIndex: 0 });

    useEffect(() => {
        checkAiStatus();
        if (destParam) {
            setFormData((prev) => ({
                ...prev,
                destination: destParam,
                destinationsList: [destParam],
            }));
        }
    }, [destParam]);

    const checkAiStatus = async () => {
        try {
            const res = await API.get("/ai/planner/status");
            setAiStatus(res.data);
        } catch (err) {
            console.error("AI status error:", err);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const togglePreference = (prefId) => {
        if (selectedPreferences.includes(prefId)) {
            setSelectedPreferences(selectedPreferences.filter((p) => p !== prefId));
        } else {
            setSelectedPreferences([...selectedPreferences, prefId]);
        }
    };

    const addDestinationTag = () => {
        if (!extraDestInput.trim()) return;
        const clean = extraDestInput.trim();
        if (!formData.destinationsList.includes(clean)) {
            const updated = [...formData.destinationsList, clean];
            setFormData({
                ...formData,
                destinationsList: updated,
                destination: updated.join(" & "),
            });
        }
        setExtraDestInput("");
    };

    const removeDestinationTag = (tag) => {
        const updated = formData.destinationsList.filter((d) => d !== tag);
        setFormData({
            ...formData,
            destinationsList: updated,
            destination: updated.length > 0 ? updated.join(" & ") : "Goa",
        });
    };

    const handleGenerate = async (e) => {
        if (e) e.preventDefault();

        if (!formData.startingLocation.trim()) {
            alert("Please enter a starting location!");
            return;
        }
        if (formData.destinationsList.length === 0 && !formData.destination.trim()) {
            alert("Please provide at least one destination!");
            return;
        }
        if (!formData.startDate || !formData.endDate) {
            alert("Please select valid travel dates!");
            return;
        }
        if (new Date(formData.startDate) > new Date(formData.endDate)) {
            alert("End date cannot be earlier than start date!");
            return;
        }

        setGenerating(true);

        try {
            const payload = {
                startingLocation: formData.startingLocation.trim(),
                destination: formData.destination.trim(),
                destinations: formData.destinationsList,
                startDate: formData.startDate,
                endDate: formData.endDate,
                travellers: parseInt(formData.travellers) || 1,
                budget: parseFloat(formData.budget) || 20000,
                travelPreferences: selectedPreferences,
                transportMode: formData.transportMode,
            };

            const res = await API.post("/ai/planner/generate", payload);
            setItineraryResult(res.data);
            window.scrollTo({ top: 400, behavior: "smooth" });
        } catch (error) {
            console.error("AI Planner error:", error);
            alert("Could not generate trip itinerary. Please try again.");
        } finally {
            setGenerating(false);
        }
    };

    const handleSaveToTripNest = async () => {
        if (!itineraryResult) return;
        setSaving(true);

        try {
            const payload = {
                fromLocation: itineraryResult.startingLocation,
                destination: itineraryResult.destination,
                startDate: itineraryResult.startDate,
                endDate: itineraryResult.endDate,
                travellers: itineraryResult.travellers,
                budget: itineraryResult.userBudget,
                days: itineraryResult.days,
            };

            const res = await API.post("/ai/planner/save", payload);
            alert("🎉 AI Trip Itinerary successfully saved to TripNest! Navigating to your trip details...");
            navigate(`/trip/${res.data.id}`);
        } catch (error) {
            console.error("Save itinerary error:", error);
            alert("Failed to save trip to your account.");
        } finally {
            setSaving(false);
        }
    };

    const deleteActivity = (dayIndex, actIndex) => {
        const updated = { ...itineraryResult };
        updated.days[dayIndex].activities.splice(actIndex, 1);
        setItineraryResult({ ...updated });
    };

    const moveActivity = (dayIndex, actIndex, direction) => {
        const updated = { ...itineraryResult };
        const activities = updated.days[dayIndex].activities;
        const targetIndex = actIndex + direction;
        if (targetIndex < 0 || targetIndex >= activities.length) return;

        const temp = activities[actIndex];
        activities[actIndex] = activities[targetIndex];
        activities[targetIndex] = temp;
        setItineraryResult({ ...updated });
    };

    const handleAddCustomActivity = (dayIndex) => {
        setCustomActivityModal({
            isOpen: true,
            dayIndex,
            title: "",
            timeSlot: "Morning",
            activityType: "Sightseeing",
            location: itineraryResult?.destination || "",
            estimatedCost: 500,
            notes: "",
        });
    };

    const submitCustomActivity = () => {
        if (!customActivityModal.title) {
            alert("Please enter activity title!");
            return;
        }

        const updated = { ...itineraryResult };
        const newAct = {
            title: customActivityModal.title,
            timeSlot: customActivityModal.timeSlot,
            activityType: customActivityModal.activityType,
            location: customActivityModal.location,
            estimatedCost: parseFloat(customActivityModal.estimatedCost) || 0,
            notes: customActivityModal.notes,
            durationMinutes: 120,
            orderIndex: updated.days[customActivityModal.dayIndex].activities.length + 1,
        };

        updated.days[customActivityModal.dayIndex].activities.push(newAct);
        setItineraryResult({ ...updated });
        setCustomActivityModal({ isOpen: false, dayIndex: 0 });
    };
    return (
        <div className="page-wrapper bg-light min-vh-100">
            <Navbar />

            <div className="container py-4">
                <div className="ai-hero-header">
                    <div className="row align-items-center">
                        <div className="col-lg-8">
                            <span className="ai-badge mb-2">✨ AI-Powered Intelligence</span>
                            <h2 className="fw-bold mb-2">Personalized Trip Itinerary Planner</h2>
                            <p className="lead mb-0 opacity-90 text-light">
                                Craft optimized, day-wise travel itineraries with realistic budgets, multi-stop shortest routes, and tailored attractions.
                            </p>
                        </div>
                        <div className="col-lg-4 text-lg-end mt-3 mt-lg-0">
                            {aiStatus?.configured ? (
                                <span className="badge bg-success-subtle text-success border border-success p-2 px-3 rounded-pill">
                                    ● Gemini AI Connected ({aiStatus.model})
                                </span>
                            ) : (
                                <span className="badge bg-warning-subtle text-dark border border-warning p-2 px-3 rounded-pill" title="Set GEMINI_API_KEY environment variable for live generative LLM">
                                    ⚙️ Regional Knowledge Engine Active
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                <div className="ai-glass-card p-4 mb-4">
                    <form onSubmit={handleGenerate}>
                        <div className="row g-3">
                            <div className="col-md-6">
                                <label className="form-label fw-bold text-dark d-flex justify-content-between align-items-center">
                                    <span>📍 Starting Location / City</span>
                                    <small className="text-muted fw-normal">Map route begins here</small>
                                </label>
                                <input
                                    type="text"
                                    className="form-control form-control-lg rounded-3"
                                    name="startingLocation"
                                    value={formData.startingLocation}
                                    onChange={handleInputChange}
                                    placeholder="Enter your city (e.g., Chennai, Coimbatore, Bengaluru, Mumbai...)"
                                    required
                                />
                                <div className="d-flex flex-wrap gap-1 mt-2">
                                    <span className="small text-muted me-1 align-self-center">Quick pick:</span>
                                    {["Chennai", "Coimbatore", "Bengaluru", "Madurai", "Trichy", "Mumbai", "Kochi"].map((city) => (
                                        <button
                                            key={city}
                                            type="button"
                                            className="btn btn-sm btn-outline-secondary py-0 px-2 rounded-pill small"
                                            style={{ fontSize: "0.75rem" }}
                                            onClick={() => setFormData({ ...formData, startingLocation: city })}
                                        >
                                            {city}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="col-md-6">
                                <label className="form-label fw-bold text-dark">
                                    🎯 Destination(s)
                                </label>
                                <div className="input-group">
                                    <input
                                        type="text"
                                        className="form-control form-control-lg rounded-start-3"
                                        value={extraDestInput}
                                        onChange={(e) => setExtraDestInput(e.target.value)}
                                        onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addDestinationTag(); } }}
                                        placeholder="Add destination & press +"
                                    />
                                    <button
                                        type="button"
                                        className="btn btn-primary px-4 fw-bold"
                                        onClick={addDestinationTag}
                                    >
                                        + Add
                                    </button>
                                </div>
                                <div className="d-flex flex-wrap gap-1 mt-2">
                                    {formData.destinationsList.map((tag, idx) => (
                                        <span key={idx} className="badge bg-primary-subtle text-primary border border-primary p-2 rounded-pill d-inline-flex align-items-center gap-1">
                                            {tag}
                                            <button
                                                type="button"
                                                className="btn-close btn-close-white ms-1"
                                                style={{ fontSize: "0.55rem" }}
                                                onClick={() => removeDestinationTag(tag)}
                                            />
                                        </span>
                                    ))}
                                </div>
                            </div>

                            <div className="col-md-3">
                                <label className="form-label fw-semibold text-secondary">Start Date</label>
                                <input
                                    type="date"
                                    className="form-control rounded-3"
                                    name="startDate"
                                    value={formData.startDate}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>
                            <div className="col-md-3">
                                <label className="form-label fw-semibold text-secondary">End Date</label>
                                <input
                                    type="date"
                                    className="form-control rounded-3"
                                    name="endDate"
                                    value={formData.endDate}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>

                            <div className="col-md-3">
                                <label className="form-label fw-semibold text-secondary">Travellers</label>
                                <input
                                    type="number"
                                    min="1"
                                    max="20"
                                    className="form-control rounded-3"
                                    name="travellers"
                                    value={formData.travellers}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>

                            <div className="col-md-3">
                                <label className="form-label fw-semibold text-secondary">
                                    Total Budget: <strong>₹{Number(formData.budget).toLocaleString()}</strong>
                                </label>
                                <input
                                    type="range"
                                    className="form-range"
                                    min="5000"
                                    max="200000"
                                    step="2500"
                                    name="budget"
                                    value={formData.budget}
                                    onChange={handleInputChange}
                                />
                            </div>

                            <div className="col-12 mt-3">
                                <label className="form-label fw-bold text-dark d-block">
                                    🎨 Travel Preferences &amp; Vibes
                                </label>
                                <div className="d-flex flex-wrap gap-2">
                                    {PREFERENCE_OPTIONS.map((pref) => {
                                        const isSelected = selectedPreferences.includes(pref.id);
                                        return (
                                            <button
                                                key={pref.id}
                                                type="button"
                                                className={`preference-chip ${isSelected ? "selected" : ""}`}
                                                onClick={() => togglePreference(pref.id)}
                                            >
                                                {pref.label}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            <div className="col-12 mt-3">
                                <label className="form-label fw-bold text-dark d-block">
                                    🚗 Preferred Transport Mode
                                </label>
                                <div className="row g-2">
                                    {[
                                        { id: "car", label: "Car / Private Cab", icon: "🚗" },
                                        { id: "bike", label: "Motorcycle / Bike", icon: "🏍️" },
                                        { id: "walking", label: "Walking & Promenade", icon: "🚶" },
                                        { id: "public transport", label: "Public Transit / Train", icon: "🚆" },
                                    ].map((m) => (
                                        <div key={m.id} className="col-6 col-md-3">
                                            <div
                                                className={`transport-mode-card ${formData.transportMode === m.id ? "active" : ""}`}
                                                onClick={() => setFormData({ ...formData, transportMode: m.id })}
                                            >
                                                <div className="fs-3 mb-1">{m.icon}</div>
                                                <div className="fw-semibold small">{m.label}</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="col-12 text-center mt-4">
                                <button
                                    type="submit"
                                    className="btn btn-primary btn-lg rounded-pill px-5 shadow fw-bold"
                                    disabled={generating}
                                >
                                    {generating ? "✨ Generating AI Itinerary..." : "✨ Generate Day-Wise Itinerary"}
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
                {itineraryResult && (
                    <div className="itinerary-results-section mt-4">
                        <div className="alert alert-info rounded-4 border-0 shadow-sm d-flex justify-content-between align-items-center flex-wrap gap-2 mb-4">
                            <div>
                                <span className="fw-bold d-block">📌 Source &amp; Estimation Notice</span>
                                <small className="text-secondary">{itineraryResult.sourceNotice}</small>
                            </div>
                            <div className="d-flex align-items-center gap-2">
                                <button
                                    type="button"
                                    className="btn btn-outline-secondary btn-sm rounded-pill px-3"
                                    onClick={handleGenerate}
                                    disabled={generating}
                                >
                                    🔄 Regenerate
                                </button>
                                <button
                                    type="button"
                                    className="btn btn-success btn-sm rounded-pill px-4 fw-bold shadow-sm"
                                    onClick={handleSaveToTripNest}
                                    disabled={saving}
                                >
                                    {saving ? "Saving..." : "💾 Save to My Trips"}
                                </button>
                            </div>
                        </div>

                        <div className="row g-4 mb-4">
                            <div className="col-lg-7">
                                <div className="bg-white rounded-4 p-4 border shadow-sm h-100">
                                    <h4 className="fw-bold text-dark mb-2">{itineraryResult.tripTitle}</h4>
                                    <p className="text-secondary mb-3">{itineraryResult.overview}</p>

                                    <h6 className="fw-bold text-dark mt-3 mb-2">📋 Essential Travel Advice:</h6>
                                    <ul className="text-muted small ps-3 mb-0">
                                        {itineraryResult.travelNotes?.map((note, idx) => (
                                            <li key={idx} className="mb-1">{note}</li>
                                        ))}
                                    </ul>
                                </div>
                            </div>

                            <div className="col-lg-5">
                                <div className="bg-white rounded-4 p-4 border shadow-sm h-100">
                                    <h5 className="fw-bold text-dark mb-3">💰 Category Budget Breakdown</h5>
                                    {Object.entries(itineraryResult.suggestedBudgetBreakdown || {}).map(([cat, amt]) => (
                                        <div key={cat} className="d-flex justify-content-between align-items-center py-2 border-bottom">
                                            <span className="small text-secondary">{cat}</span>
                                            <span className="fw-bold text-dark small">₹{Number(amt).toLocaleString()}</span>
                                        </div>
                                    ))}
                                    <div className="d-flex justify-content-between align-items-center pt-3">
                                        <span className="fw-bold text-dark">Estimated Total:</span>
                                        <span className="fw-bold text-primary fs-5">
                                            ₹{Number(itineraryResult.estimatedTotalCost).toLocaleString()}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {itineraryResult.routeStops && itineraryResult.routeStops.length > 0 && (
                            <InteractiveRouteMap
                                stops={itineraryResult.routeStops}
                                initialMode={formData.transportMode}
                                height="440px"
                            />
                        )}

                        <h4 className="fw-bold text-dark mb-3">📅 Day-by-Day Expedition Timeline</h4>

                        {itineraryResult.days?.map((day, dIdx) => (
                            <div key={dIdx} className="day-timeline-card p-4">
                                <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3 pb-2 border-bottom">
                                    <div>
                                        <h5 className="fw-bold text-primary mb-0">{day.dayTitle}</h5>
                                        <small className="text-muted">{day.date} • {day.destinationArea} • {day.transportNotes}</small>
                                    </div>
                                    <div className="d-flex align-items-center gap-2">
                                        <span className="badge bg-light text-dark border p-2 px-3 rounded-pill">
                                            Est. Day Cost: ₹{Number(day.dayEstimatedCost).toLocaleString()}
                                        </span>
                                        <button
                                            type="button"
                                            className="btn btn-outline-primary btn-sm rounded-pill"
                                            onClick={() => handleAddCustomActivity(dIdx)}
                                        >
                                            + Add Activity
                                        </button>
                                    </div>
                                </div>

                                <div className="activities-list">
                                    {day.activities?.map((act, aIdx) => (
                                        <div key={aIdx} className="activity-item-card">
                                            <div className="d-flex justify-content-between align-items-start flex-wrap gap-2">
                                                <div className="d-flex align-items-start gap-2">
                                                    <span className="badge bg-secondary rounded-pill mt-1">{aIdx + 1}</span>
                                                    <div>
                                                        <div className="d-flex align-items-center gap-2">
                                                            <h6 className="fw-bold mb-0 text-dark">{act.title}</h6>
                                                            <span className="badge bg-primary-subtle text-primary rounded-pill small">
                                                                {act.timeSlot}
                                                            </span>
                                                            <span className="badge bg-light text-secondary border rounded-pill small">
                                                                {act.activityType}
                                                            </span>
                                                        </div>
                                                        <p className="text-muted small mb-1 mt-1">{act.notes}</p>
                                                        <small className="text-secondary">
                                                            📍 {act.location} • ⏳ {act.durationMinutes} mins • 💵 ₹{Number(act.estimatedCost).toLocaleString()}
                                                        </small>
                                                    </div>
                                                </div>

                                                <div className="btn-group btn-group-sm">
                                                    <button
                                                        type="button"
                                                        className="btn btn-outline-secondary"
                                                        onClick={() => moveActivity(dIdx, aIdx, -1)}
                                                        disabled={aIdx === 0}
                                                        title="Move up"
                                                    >
                                                        ▲
                                                    </button>
                                                    <button
                                                        type="button"
                                                        className="btn btn-outline-secondary"
                                                        onClick={() => moveActivity(dIdx, aIdx, 1)}
                                                        disabled={aIdx === day.activities.length - 1}
                                                        title="Move down"
                                                    >
                                                        ▼
                                                    </button>
                                                    <button
                                                        type="button"
                                                        className="btn btn-outline-danger"
                                                        onClick={() => deleteActivity(dIdx, aIdx)}
                                                        title="Remove stop"
                                                    >
                                                        ✕
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}

                        <div className="d-flex justify-content-end align-items-center gap-3 mt-4 mb-5">
                            <button
                                type="button"
                                className="btn btn-outline-secondary rounded-pill px-4"
                                onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                            >
                                ▲ Back to Top
                            </button>
                            <button
                                type="button"
                                className="btn btn-success btn-lg rounded-pill px-5 fw-bold shadow"
                                onClick={handleSaveToTripNest}
                                disabled={saving}
                            >
                                {saving ? "Saving to Account..." : "💾 Save Full Itinerary to My Trips"}
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {customActivityModal.isOpen && (
                <div className="modal show d-block" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content rounded-4 p-3 border-0 shadow">
                            <div className="modal-header border-0 pb-0">
                                <h5 className="modal-title fw-bold">Add Custom Stop / Activity</h5>
                                <button
                                    type="button"
                                    className="btn-close"
                                    onClick={() => setCustomActivityModal({ isOpen: false, dayIndex: 0 })}
                                />
                            </div>
                            <div className="modal-body">
                                <div className="mb-3">
                                    <label className="form-label small fw-bold">Activity Title</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        value={customActivityModal.title}
                                        onChange={(e) => setCustomActivityModal({ ...customActivityModal, title: e.target.value })}
                                        placeholder="e.g., Sunset Cruise or Local Cafe Visit"
                                        required
                                    />
                                </div>
                                <div className="row g-2 mb-3">
                                    <div className="col-6">
                                        <label className="form-label small fw-bold">Time Slot</label>
                                        <select
                                            className="form-select"
                                            value={customActivityModal.timeSlot}
                                            onChange={(e) => setCustomActivityModal({ ...customActivityModal, timeSlot: e.target.value })}
                                        >
                                            <option>Morning</option>
                                            <option>Afternoon</option>
                                            <option>Evening</option>
                                            <option>Night</option>
                                        </select>
                                    </div>
                                    <div className="col-6">
                                        <label className="form-label small fw-bold">Category</label>
                                        <select
                                            className="form-select"
                                            value={customActivityModal.activityType}
                                            onChange={(e) => setCustomActivityModal({ ...customActivityModal, activityType: e.target.value })}
                                        >
                                            <option>Sightseeing</option>
                                            <option>Food</option>
                                            <option>Adventure</option>
                                            <option>Relaxation</option>
                                            <option>Shopping</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="mb-3">
                                    <label className="form-label small fw-bold">Estimated Cost (INR)</label>
                                    <input
                                        type="number"
                                        className="form-control"
                                        value={customActivityModal.estimatedCost}
                                        onChange={(e) => setCustomActivityModal({ ...customActivityModal, estimatedCost: e.target.value })}
                                    />
                                </div>
                                <div className="mb-3">
                                    <label className="form-label small fw-bold">Notes / Description</label>
                                    <textarea
                                        className="form-control"
                                        rows="2"
                                        value={customActivityModal.notes}
                                        onChange={(e) => setCustomActivityModal({ ...customActivityModal, notes: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="modal-footer border-0 pt-0">
                                <button
                                    type="button"
                                    className="btn btn-secondary rounded-pill px-3"
                                    onClick={() => setCustomActivityModal({ isOpen: false, dayIndex: 0 })}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    className="btn btn-primary rounded-pill px-4 fw-bold"
                                    onClick={submitCustomActivity}
                                >
                                    Add Stop
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <Footer />
        </div>
    );
}