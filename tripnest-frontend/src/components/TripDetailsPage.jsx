import InteractiveRouteMap from "./InteractiveRouteMap";
import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../services/api";
import Navbar from "./Navbar";
import Footer from "./Footer";
import "../styles/TripPlan.css";
import { getCoordinatesSync, resolveCoordinatesAsync } from "../utils/geoUtils";

// Chart.js
import {
    Chart as ChartJS,
    ArcElement,
    Tooltip,
    Legend,
} from "chart.js";
import { Doughnut } from "react-chartjs-2";

// Leaflet
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Leaflet default icon fix for React/Vite
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
    iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

ChartJS.register(ArcElement, Tooltip, Legend);

function getCoordinates(cityName, fallback = null) {
    return getCoordinatesSync(cityName, fallback);
}

function TripDetailsPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const currentUser = JSON.parse(localStorage.getItem("user") || "{}");

    const [trip, setTrip] = useState(null);
    const [itineraries, setItineraries] = useState([]);
    const [activities, setActivities] = useState([]);
    const [expenses, setExpenses] = useState([]);
    const [documents, setDocuments] = useState([]);
    const [chatMessages, setChatMessages] = useState([]);
    const [loading, setLoading] = useState(true);

    const [activeTab, setActiveTab] = useState("itinerary");

    // Itinerary Form State
    const [newItinerary, setNewItinerary] = useState({
        day: "Day 1",
        timeSlot: "Morning",
        activity: "",
        activityType: "Sightseeing",
        location: "",
        notes: "",
    });

    // Activity Form State (Milestone 2 Activity Scheduling)
    const [newActivity, setNewActivity] = useState({
        name: "",
        activityType: "Sightseeing",
        scheduledDate: "",
        timeSlot: "Morning",
        location: "",
        cost: "",
        notes: "",
    });

    // Expense Form State
    const [newExpense, setNewExpense] = useState({
        expenseName: "",
        amount: "",
        category: "Accommodation",
        paidBy: currentUser?.name || currentUser?.email || "Self",
        notes: "",
    });

    // Document Form State
    const [newDocument, setNewDocument] = useState({
        documentName: "",
        documentType: "Ticket",
    });
    const [selectedFile, setSelectedFile] = useState(null);
    const [uploadingDoc, setUploadingDoc] = useState(false);
    const [extractingDoc, setExtractingDoc] = useState(false);
    const [extractedDocData, setExtractedDocData] = useState(null);

    // Collaborator Invite State
    const [inviteEmail, setInviteEmail] = useState("");

    // Chat Message State
    const [chatInput, setChatInput] = useState("");
    const chatEndRef = useRef(null);
    const mapContainerRef = useRef(null);
    const mapInstanceRef = useRef(null);

    useEffect(() => {
        fetchTripDetails();
    }, [id]);

    // Polling for chat messages if on chat tab
    useEffect(() => {
        let chatInterval;
        if (activeTab === "chat") {
            fetchChatMessages();
            chatInterval = setInterval(fetchChatMessages, 5000);
        }
        return () => clearInterval(chatInterval);
    }, [activeTab, id]);

    useEffect(() => {
        if (activeTab === "chat" && chatEndRef.current) {
            chatEndRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [chatMessages, activeTab]);

    const fetchTripDetails = async () => {
        try {
            setLoading(true);
            const [tripRes, itinRes, actRes, expRes, docRes] = await Promise.all([
                API.get(`/trips/${id}`),
                API.get(`/itinerary/trip/${id}`).catch(() => ({ data: [] })),
                API.get(`/activities/trip/${id}`).catch(() => ({ data: [] })),
                API.get(`/expense/trip/${id}`).catch(() => ({ data: [] })),
                API.get(`/documents/trip/${id}`).catch(() => ({ data: [] })),
            ]);

            setTrip(tripRes.data);
            setItineraries(itinRes.data || []);
            setActivities(actRes.data || []);
            setExpenses(expRes.data || []);
            setDocuments(docRes.data || []);
        } catch (error) {
            console.error("Error loading trip details:", error);
            alert("Could not load trip details.");
        } finally {
            setLoading(false);
        }
    };

    const fetchChatMessages = async () => {
        try {
            const res = await API.get(`/chat/trip/${id}`);
            setChatMessages(res.data || []);
        } catch (err) {
            console.error("Chat fetch error:", err);
        }
    };

    const handleSendChatMessage = async (e) => {
        e.preventDefault();
        if (!chatInput.trim()) return;

        const payload = {
            senderName: currentUser.name || "Explorer",
            senderEmail: currentUser.email || "explorer@tripnest.com",
            message: chatInput.trim(),
        };

        try {
            const res = await API.post(`/chat/trip/${id}`, payload);
            setChatMessages((prev) => [...prev, res.data]);
            setChatInput("");
        } catch (err) {
            console.error("Failed to send message:", err);
        }
    };

    const handleInviteCollaborator = async (e) => {
        e.preventDefault();
        if (!inviteEmail || !inviteEmail.trim()) {
            alert("Please enter a valid email address!");
            return;
        }

        try {
            const res = await API.post(`/trips/${id}/collaborators/invite`, {
                email: inviteEmail.trim(),
            });
            const { status, message } = res.data;
            if (status === "invite_sent") {
                alert("📩 Invitation sent! They will see an Accept/Deny request in their notifications.");
            } else if (status === "already_member") {
                alert("ℹ️ This person is already a co-traveler on this trip.");
            } else if (status === "user_not_found") {
                alert("❌ No TripNest account found for that email. They need to register first.");
            } else {
                alert(message || "Invitation sent!");
            }
            setInviteEmail("");
        } catch (error) {
            console.error("Invite Collaborator Error:", error);
            const msg = error?.response?.data?.message || "Failed to send invitation.";
            alert("❌ " + msg);
        }
    };


    const handleRemoveCollaborator = async (email) => {
        if (!window.confirm(`Remove ${email} from this trip group?`)) return;

        try {
            const res = await API.delete(`/trips/${id}/collaborators/remove?email=${encodeURIComponent(email)}`);
            setTrip(res.data);
            alert("Collaborator removed successfully.");
        } catch (error) {
            console.error("Remove Collaborator Error:", error);
            alert("Failed to remove collaborator.");
        }
    };

    const handleExtractDocument = async (e) => {
        if (e) e.preventDefault();
        if (!selectedFile) {
            alert("Please select a ticket, voucher, or confirmation file first!");
            return;
        }

        const formData = new FormData();
        formData.append("file", selectedFile);
        formData.append("tripId", id);

        setExtractingDoc(true);
        try {
            const res = await API.post("/documents/assistant/extract", formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });
            if (res.data && res.data.success) {
                setExtractedDocData(res.data);
            } else {
                alert(res.data?.notes || "Could not extract fields from document.");
            }
        } catch (error) {
            console.error("Document extraction error:", error);
            alert("Document extraction failed.");
        } finally {
            setExtractingDoc(false);
        }
    };

    const handleApplyExtractedToTrip = async () => {
        if (!extractedDocData) return;
        try {
            await API.post(`/documents/assistant/apply/${id}`, extractedDocData);
            alert("🎉 Document details successfully added to your trip itinerary and scheduled activities!");
            setExtractedDocData(null);
            fetchTripDetails();
        } catch (err) {
            console.error("Apply extracted details error:", err);
            alert("Failed to apply details to trip.");
        }
    };

    const handleUploadDocument = async (e) => {
        e.preventDefault();
        if (!selectedFile) {
            alert("Please select a document or media file to upload!");
            return;
        }

        const formData = new FormData();
        formData.append("file", selectedFile);
        formData.append("documentName", newDocument.documentName || selectedFile.name);
        formData.append("documentType", newDocument.documentType);

        try {
            setUploadingDoc(true);
            const res = await API.post(`/documents/upload/${id}`, formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });
            setDocuments([...documents, res.data]);
            setNewDocument({ documentName: "", documentType: "Ticket" });
            setSelectedFile(null);
            const fileInput = document.getElementById("tripDocFileInput");
            if (fileInput) fileInput.value = "";
            alert("📁 Document uploaded successfully!");
        } catch (error) {
            console.error("Upload Document Error:", error);
            alert("Failed to upload document.");
        } finally {
            setUploadingDoc(false);
        }
    };

    const handleDeleteDocument = async (docId) => {
        if (!window.confirm("Are you sure you want to delete this document?")) return;
        try {
            await API.delete(`/documents/delete/${docId}`);
            setDocuments(documents.filter((item) => item.id !== docId));
        } catch (error) {
            console.error("Delete Document Error:", error);
        }
    };

    const handleAddItinerary = async (e) => {
        e.preventDefault();
        if (!newItinerary.activity) {
            alert("Please enter activity details!");
            return;
        }

        try {
            const res = await API.post(`/itinerary/trip/${id}`, newItinerary);
            setItineraries([...itineraries, res.data]);
            setNewItinerary({
                day: "Day 1",
                timeSlot: "Morning",
                activity: "",
                activityType: "Sightseeing",
                location: "",
                notes: "",
            });
        } catch (error) {
            console.error("Add Itinerary Error:", error);
        }
    };

    const handleDeleteItinerary = async (itinId) => {
        try {
            await API.delete(`/itinerary/delete/${itinId}`);
            setItineraries(itineraries.filter((item) => item.id !== itinId));
        } catch (error) {
            console.error("Delete Itinerary Error:", error);
        }
    };

    const handleAddActivity = async (e) => {
        e.preventDefault();
        if (!newActivity.name) {
            alert("Please enter activity title!");
            return;
        }

        try {
            const payload = {
                ...newActivity,
                cost: newActivity.cost ? parseFloat(newActivity.cost) : 0.0,
                scheduledDate: newActivity.scheduledDate || trip.startDate,
            };
            const res = await API.post(`/activities/trip/${id}`, payload);
            setActivities([...activities, res.data]);
            setNewActivity({
                name: "",
                activityType: "Sightseeing",
                scheduledDate: "",
                timeSlot: "Morning",
                location: "",
                cost: "",
                notes: "",
            });
        } catch (error) {
            console.error("Add Activity Error:", error);
        }
    };

    const handleToggleActivityStatus = async (act) => {
        try {
            const nextStatus = act.status === "Completed" ? "Scheduled" : "Completed";
            const res = await API.put(`/activities/${act.id}`, { status: nextStatus });
            setActivities(activities.map((a) => (a.id === act.id ? res.data : a)));
        } catch (err) {
            console.error("Toggle Activity Error:", err);
        }
    };

    const handleDeleteActivity = async (actId) => {
        try {
            await API.delete(`/activities/delete/${actId}`);
            setActivities(activities.filter((a) => a.id !== actId));
        } catch (err) {
            console.error("Delete Activity Error:", err);
        }
    };

    const handleAddExpense = async (e) => {
        e.preventDefault();
        if (!newExpense.expenseName || !newExpense.amount) {
            alert("Please enter expense name and amount!");
            return;
        }

        const amt = parseFloat(newExpense.amount);
        const travelerCount = (trip?.collaboratorEmails?.length || 0) + 1;
        const splitPerPerson = Math.round((amt / travelerCount) * 100) / 100;

        try {
            const payload = {
                ...newExpense,
                amount: amt,
                splitAmount: splitPerPerson,
                isSettled: false,
            };
            const res = await API.post(`/expense/trip/${id}`, payload);
            setExpenses([...expenses, res.data]);
            setNewExpense({
                expenseName: "",
                amount: "",
                category: "Accommodation",
                paidBy: currentUser?.name || "Self",
                notes: "",
            });
        } catch (error) {
            console.error("Add Expense Error:", error);
        }
    };

    const handleToggleSettle = async (expId) => {
        try {
            const res = await API.put(`/expense/settle/${expId}`);
            setExpenses(expenses.map((e) => (e.id === expId ? res.data : e)));
        } catch (err) {
            console.error("Toggle Settle Error:", err);
        }
    };

    const handleDeleteExpense = async (expId) => {
        try {
            await API.delete(`/expense/delete/${expId}`);
            setExpenses(expenses.filter((item) => item.id !== expId));
        } catch (error) {
            console.error("Delete Expense Error:", error);
        }
    };

    const handlePrint = () => {
        window.print();
    };

    const totalSpent = expenses.reduce((sum, e) => sum + (e.amount || 0), 0);
    const budgetRemaining = (trip?.budget || 0) - totalSpent;
    const isOverBudget = budgetRemaining < 0;
    const budgetPct = trip?.budget > 0 ? Math.min(Math.round((totalSpent / trip.budget) * 100), 100) : 0;

    // Travelers count
    const totalTravelers = (trip?.collaboratorEmails?.length || 0) + 1;
    const perPersonShare = Math.round(totalSpent / totalTravelers);

    // Expense category breakdown logic
    const categoryTotals = expenses.reduce((acc, exp) => {
        const cat = exp.category || "Other";
        acc[cat] = (acc[cat] || 0) + (exp.amount || 0);
        return acc;
    }, {});

    const chartLabels = Object.keys(categoryTotals).length > 0 ? Object.keys(categoryTotals) : ["Accommodation", "Transport", "Food", "Activities", "Shopping"];
    const chartDataValues = Object.keys(categoryTotals).length > 0 ? Object.values(categoryTotals) : [0, 0, 0, 0, 0];

    const doughnutData = {
        labels: chartLabels,
        datasets: [
            {
                data: chartDataValues,
                backgroundColor: ["#3b82f6", "#10b981", "#f59e0b", "#ec4899", "#8b5cf6", "#06b6d4"],
                borderWidth: 2,
                borderColor: "#ffffff",
            },
        ],
    };

    // Dynamic Coordinates for Route Map - resolves to the entered starting location
    const [resolvedOrigin, setResolvedOrigin] = useState(null);
    const [resolvedDest, setResolvedDest] = useState(null);

    useEffect(() => {
        if (!trip) return;
        let isMounted = true;
        if (trip.fromLocation) {
            resolveCoordinatesAsync(trip.fromLocation, [13.0827, 80.2707]).then((coords) => {
                if (isMounted) setResolvedOrigin(coords);
            });
        }
        if (trip.destination) {
            resolveCoordinatesAsync(trip.destination, [15.2993, 74.1240]).then((coords) => {
                if (isMounted) setResolvedDest(coords);
            });
        }
        return () => { isMounted = false; };
    }, [trip?.fromLocation, trip?.destination]);

    const originCoords = resolvedOrigin || getCoordinatesSync(trip?.fromLocation, [13.0827, 80.2707]);
    const destCoords = resolvedDest || getCoordinatesSync(trip?.destination, [15.2993, 74.1240]);
    const mapStops = [
        { name: trip?.fromLocation || "Origin", latitude: originCoords[0], longitude: originCoords[1], stopType: "origin" },
        ...itineraries.map((it, idx) => {
            const c = getCoordinatesSync(it.location || it.activity, destCoords);
            return {
                name: `${it.activity} (${it.location || trip?.destination})`,
                latitude: c[0],
                longitude: c[1],
                stopType: "stop"
            };
        }),
        { name: trip?.destination || "Destination", latitude: destCoords[0], longitude: destCoords[1], stopType: "destination" }
    ];
    const mapCenter = [
        (originCoords[0] + destCoords[0]) / 2,
        (originCoords[1] + destCoords[1]) / 2,
    ];

    useEffect(() => {
        if (!mapContainerRef.current || !trip) return;
        if (mapInstanceRef.current) {
            mapInstanceRef.current.remove();
            mapInstanceRef.current = null;
        }

        try {
            const map = L.map(mapContainerRef.current).setView(mapCenter, 5);
            mapInstanceRef.current = map;

            L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
                attribution: '&copy; OpenStreetMap contributors'
            }).addTo(map);

            L.marker(originCoords).addTo(map).bindPopup(`Origin: <b>${trip.fromLocation}</b>`);
            L.marker(destCoords).addTo(map).bindPopup(`Destination: <b>${trip.destination}</b>`).openPopup();
            L.polyline([originCoords, destCoords], { color: "#3b82f6", weight: 4, dashArray: "6, 8" }).addTo(map);
        } catch (e) {
            console.error("Leaflet init error:", e);
        }

        return () => {
            if (mapInstanceRef.current) {
                mapInstanceRef.current.remove();
                mapInstanceRef.current = null;
            }
        };
    }, [trip?.fromLocation, trip?.destination, loading]);

    if (loading) {
        return (
            <div className="page-wrapper">
                <Navbar />
                <div className="container text-center py-5">
                    <div className="spinner-border text-primary"></div>
                    <p className="mt-2">Loading trip expedition...</p>
                </div>
            </div>
        );
    }

    if (!trip) {
        return (
            <div className="page-wrapper">
                <Navbar />
                <div className="container text-center py-5">
                    <h3>Trip Not Found</h3>
                    <button className="btn btn-primary mt-3" onClick={() => navigate("/my-trips")}>
                        Back to My Trips
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="page-wrapper">
            <Navbar />

            <div className="container py-5 min-vh-100">
                {/* Over Budget Warning Banner */}
                {isOverBudget && (
                    <div className="alert alert-danger alert-dismissible fade show rounded-4 shadow-sm mb-4" role="alert">
                        <div className="d-flex align-items-center gap-2">
                            <span className="fs-3">⚠️</span>
                            <div>
                                <h5 className="alert-heading fw-bold mb-1">Over Budget Warning!</h5>
                                <p className="mb-0">
                                    Your total expenses of <strong>₹{totalSpent.toLocaleString()}</strong> have exceeded your budget allocation of <strong>₹{trip.budget?.toLocaleString()}</strong> by <strong>₹{Math.abs(budgetRemaining).toLocaleString()}</strong>.
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Hero Trip Banner */}
                <div className="trip-banner-card mb-4 p-4 p-md-5 rounded-4 shadow-lg text-white bg-gradient-primary">
                    <div className="d-flex justify-content-between align-items-start flex-wrap gap-3">
                        <div>
                            <span className="badge bg-light text-primary mb-2 fs-6 fw-bold">
                                Expedition #{trip.id} • {trip.status || "Planned"}
                            </span>
                            <h1 className="fw-bold display-4 mb-1">📍 {trip.destination}</h1>
                            <p className="lead mb-2 opacity-90">Departure from: <strong>{trip.fromLocation}</strong></p>
                            <p className="mb-0 opacity-90">
                                📅 <strong>{trip.startDate}</strong> to <strong>{trip.endDate}</strong> | 👥 <strong>{totalTravelers} Group Travelers</strong> | 👑 <strong>Created By: {trip.user?.email || "You"}</strong>
                            </p>
                        </div>
                        <div className="d-flex gap-2 flex-wrap">
                            <button className="btn btn-warning text-dark fw-bold" onClick={handlePrint}>
                                🖨️ Export PDF
                            </button>
                            <button className="btn btn-outline-light" onClick={() => navigate("/my-trips")}>
                                ⬅️ All Trips
                            </button>
                        </div>
                    </div>

                    {/* Financial KPI Row */}
                    <div className="row g-3 mt-4 pt-3 border-top border-white-50">
                        <div className="col-md-3">
                            <div className="stat-box p-3 rounded-3 bg-white bg-opacity-10 text-white">
                                <small className="text-uppercase text-white-50">Allocated Budget</small>
                                <h3 className="fw-bold mb-0">₹{trip.budget?.toLocaleString()}</h3>
                            </div>
                        </div>
                        <div className="col-md-3">
                            <div className="stat-box p-3 rounded-3 bg-white bg-opacity-10 text-white">
                                <small className="text-uppercase text-white-50">Total Expenses Logged</small>
                                <h3 className="fw-bold mb-0">₹{totalSpent.toLocaleString()}</h3>
                            </div>
                        </div>
                        <div className="col-md-3">
                            <div className="stat-box p-3 rounded-3 bg-white bg-opacity-10 text-white">
                                <small className="text-uppercase text-white-50">Remaining Balance</small>
                                <h3 className={`fw-bold mb-0 ${isOverBudget ? "text-warning" : "text-white"}`}>
                                    ₹{budgetRemaining.toLocaleString()}
                                </h3>
                            </div>
                        </div>
                        <div className="col-md-3">
                            <div className="stat-box p-3 rounded-3 bg-white bg-opacity-10 text-white">
                                <small className="text-uppercase text-white-50">Per-Traveler Share</small>
                                <h3 className="fw-bold mb-0">₹{perPersonShare.toLocaleString()}</h3>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Weather & Map Insights Row (Milestone 2) */}
                <div className="row g-4 mb-4">
                    {/* Live Destination Weather Widget */}
                    <div className="col-lg-4">
                        <div className="card shadow-sm border-0 rounded-4 p-4 h-100 bg-white">
                            <div className="d-flex justify-content-between align-items-center mb-3">
                                <h5 className="fw-bold mb-0">⛅ Destination Weather</h5>
                                <span className="badge bg-soft-primary text-primary">Live Insights</span>
                            </div>
                            <div className="d-flex align-items-center gap-3 mb-3">
                                <span className="display-4">☀️</span>
                                <div>
                                    <h2 className="fw-bold mb-0">28°C</h2>
                                    <span className="text-muted small">Pleasant & Clear Skies</span>
                                </div>
                            </div>
                            <div className="p-3 bg-light rounded-3 small">
                                <div className="d-flex justify-content-between mb-1">
                                    <span className="text-muted">Humidity</span>
                                    <strong>64%</strong>
                                </div>
                                <div className="d-flex justify-content-between mb-1">
                                    <span className="text-muted">Wind Speed</span>
                                    <strong>12 km/h</strong>
                                </div>
                                <div className="d-flex justify-content-between">
                                    <span className="text-muted">Packing Tip</span>
                                    <strong>Light cottons & sunglasses</strong>
                                </div>
                            </div>
                        </div>
                    </div>

                                        {/* Interactive Leaflet Route Map */}
                    <div className="col-lg-8">
                        <InteractiveRouteMap
                            stops={mapStops}
                            initialMode="driving"
                            height="340px"
                        />
                    </div>
                </div>

                {/* Navigation Tabs */}
                <div className="d-flex gap-2 mb-4 flex-wrap">
                    <button
                        className={`btn btn-lg ${activeTab === "itinerary" ? "btn-primary" : "btn-outline-secondary"}`}
                        onClick={() => setActiveTab("itinerary")}
                    >
                        🗓️ Itinerary ({itineraries.length})
                    </button>
                    <button
                        className={`btn btn-lg ${activeTab === "activities" ? "btn-primary" : "btn-outline-secondary"}`}
                        onClick={() => setActiveTab("activities")}
                    >
                        🎯 Activities ({activities.length})
                    </button>
                    <button
                        className={`btn btn-lg ${activeTab === "expenses" ? "btn-primary" : "btn-outline-secondary"}`}
                        onClick={() => setActiveTab("expenses")}
                    >
                        💳 Expenses & Splitting ({expenses.length})
                    </button>
                    <button
                        className={`btn btn-lg ${activeTab === "chat" ? "btn-primary" : "btn-outline-secondary"}`}
                        onClick={() => setActiveTab("chat")}
                    >
                        💬 Group Chat ({chatMessages.length})
                    </button>
                    <button
                        className={`btn btn-lg ${activeTab === "collaborators" ? "btn-primary" : "btn-outline-secondary"}`}
                        onClick={() => setActiveTab("collaborators")}
                    >
                        👥 Co-Travelers ({totalTravelers})
                    </button>
                    <button
                        className={`btn btn-lg ${activeTab === "documents" ? "btn-primary" : "btn-outline-secondary"}`}
                        onClick={() => setActiveTab("documents")}
                    >
                        📁 Documents Vault ({documents.length})
                    </button>
                </div>

                {/* TAB 1: Day-wise Itinerary */}
                {activeTab === "itinerary" && (
                    <div className="row g-4">
                        <div className="col-lg-5">
                            <div className="card shadow-sm border-0 p-4 rounded-4 bg-white">
                                <h4 className="fw-bold mb-3">➕ Add Itinerary Timeline Entry</h4>
                                <form onSubmit={handleAddItinerary}>
                                    <div className="row g-2 mb-3">
                                        <div className="col-6">
                                            <label className="form-label small fw-bold">Select Day</label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                placeholder="Day 1, Day 2..."
                                                value={newItinerary.day}
                                                onChange={(e) => setNewItinerary({ ...newItinerary, day: e.target.value })}
                                                required
                                            />
                                        </div>
                                        <div className="col-6">
                                            <label className="form-label small fw-bold">Time Slot</label>
                                            <select
                                                className="form-select"
                                                value={newItinerary.timeSlot}
                                                onChange={(e) => setNewItinerary({ ...newItinerary, timeSlot: e.target.value })}
                                            >
                                                <option value="Morning">Morning 🌅</option>
                                                <option value="Afternoon">Afternoon ☀️</option>
                                                <option value="Evening">Evening 🌆</option>
                                                <option value="Night">Night 🌙</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label small fw-bold">Activity Type</label>
                                        <select
                                            className="form-select"
                                            value={newItinerary.activityType}
                                            onChange={(e) => setNewItinerary({ ...newItinerary, activityType: e.target.value })}
                                        >
                                            <option value="Sightseeing">Sightseeing 🏛️</option>
                                            <option value="Transportation">Transportation 🚗</option>
                                            <option value="Accommodation">Accommodation 🏨</option>
                                            <option value="Dining">Dining 🍲</option>
                                            <option value="Adventure Activities">Adventure Activities 🧗</option>
                                            <option value="Shopping">Shopping 🛍️</option>
                                        </select>
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label small fw-bold">Activity Description</label>
                                        <textarea
                                            className="form-control"
                                            rows="3"
                                            placeholder="e.g. Visit Baga Beach & Scuba diving session"
                                            value={newItinerary.activity}
                                            onChange={(e) => setNewItinerary({ ...newItinerary, activity: e.target.value })}
                                            required
                                        ></textarea>
                                    </div>
                                    <button type="submit" className="btn btn-primary w-100 btn-lg fw-bold">
                                        📌 Pin to Itinerary
                                    </button>
                                </form>
                            </div>
                        </div>

                        <div className="col-lg-7">
                            <div className="card shadow-sm border-0 p-4 rounded-4 bg-white">
                                <h4 className="fw-bold mb-3">🗓️ Scheduled Itinerary Timeline</h4>
                                {itineraries.length === 0 ? (
                                    <p className="text-muted py-4 mb-0 text-center">No itinerary activities planned yet. Add entries using the left form.</p>
                                ) : (
                                    <div className="timeline mt-2">
                                        {itineraries.map((item) => (
                                            <div key={item.id} className="timeline-item p-3 rounded-3 bg-light border d-flex justify-content-between align-items-center">
                                                <div>
                                                    <div className="d-flex gap-2 align-items-center mb-1">
                                                        <span className="badge bg-primary">{item.day}</span>
                                                        <span className="badge bg-secondary">{item.timeSlot}</span>
                                                        <span className="badge bg-info text-dark">{item.activityType || "Sightseeing"}</span>
                                                    </div>
                                                    <p className="mb-0 fw-bold">{item.activity}</p>
                                                </div>
                                                <button
                                                    className="btn btn-sm btn-outline-danger"
                                                    onClick={() => handleDeleteItinerary(item.id)}
                                                    title="Delete activity"
                                                >
                                                    🗑️
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* TAB 2: Activity Scheduling (Milestone 2) */}
                {activeTab === "activities" && (
                    <div className="row g-4">
                        <div className="col-lg-5">
                            <div className="card shadow-sm border-0 p-4 rounded-4 bg-white">
                                <h4 className="fw-bold mb-3">🎯 Schedule Specific Activity</h4>
                                <form onSubmit={handleAddActivity}>
                                    <div className="mb-3">
                                        <label className="form-label small fw-bold">Activity Name</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            placeholder="e.g. Paragliding at Solang Valley"
                                            value={newActivity.name}
                                            onChange={(e) => setNewActivity({ ...newActivity, name: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div className="row g-2 mb-3">
                                        <div className="col-6">
                                            <label className="form-label small fw-bold">Type</label>
                                            <select
                                                className="form-select"
                                                value={newActivity.activityType}
                                                onChange={(e) => setNewActivity({ ...newActivity, activityType: e.target.value })}
                                            >
                                                <option value="Sightseeing">Sightseeing 🏛️</option>
                                                <option value="Transportation">Transportation 🚗</option>
                                                <option value="Accommodation">Accommodation 🏨</option>
                                                <option value="Dining">Dining 🍲</option>
                                                <option value="Adventure Activities">Adventure Activities 🧗</option>
                                                <option value="Shopping">Shopping 🛍️</option>
                                            </select>
                                        </div>
                                        <div className="col-6">
                                            <label className="form-label small fw-bold">Slot</label>
                                            <select
                                                className="form-select"
                                                value={newActivity.timeSlot}
                                                onChange={(e) => setNewActivity({ ...newActivity, timeSlot: e.target.value })}
                                            >
                                                <option value="Morning">Morning 🌅</option>
                                                <option value="Afternoon">Afternoon ☀️</option>
                                                <option value="Evening">Evening 🌆</option>
                                                <option value="Night">Night 🌙</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div className="row g-2 mb-3">
                                        <div className="col-6">
                                            <label className="form-label small fw-bold">Location</label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                placeholder="Spot location"
                                                value={newActivity.location}
                                                onChange={(e) => setNewActivity({ ...newActivity, location: e.target.value })}
                                            />
                                        </div>
                                        <div className="col-6">
                                            <label className="form-label small fw-bold">Estimated Cost (₹)</label>
                                            <input
                                                type="number"
                                                className="form-control"
                                                placeholder="e.g. 2500"
                                                value={newActivity.cost}
                                                onChange={(e) => setNewActivity({ ...newActivity, cost: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label small fw-bold">Notes</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            placeholder="Booking reference, requirements..."
                                            value={newActivity.notes}
                                            onChange={(e) => setNewActivity({ ...newActivity, notes: e.target.value })}
                                        />
                                    </div>
                                    <button type="submit" className="btn btn-primary w-100 btn-lg fw-bold">
                                        ➕ Save Scheduled Activity
                                    </button>
                                </form>
                            </div>
                        </div>

                        <div className="col-lg-7">
                            <div className="card shadow-sm border-0 p-4 rounded-4 bg-white">
                                <h4 className="fw-bold mb-3">📋 Scheduled Activities Checklist</h4>
                                {activities.length === 0 ? (
                                    <p className="text-muted py-4 mb-0 text-center">No specific activities scheduled yet.</p>
                                ) : (
                                    <div className="d-flex flex-column gap-3">
                                        {activities.map((act) => {
                                            const isDone = act.status === "Completed";
                                            return (
                                                <div
                                                    key={act.id}
                                                    className={`p-3 rounded-3 border d-flex justify-content-between align-items-center ${isDone ? "bg-light text-muted" : "bg-white shadow-sm"}`}
                                                >
                                                    <div>
                                                        <div className="d-flex align-items-center gap-2 mb-1">
                                                            <span className="badge bg-primary">{act.activityType}</span>
                                                            <span className="badge bg-secondary">{act.timeSlot}</span>
                                                            {act.cost > 0 && (
                                                                <span className="badge bg-success">₹{act.cost}</span>
                                                            )}
                                                        </div>
                                                        <h6 className={`mb-1 fw-bold ${isDone ? "text-decoration-line-through text-muted" : ""}`}>
                                                            {act.name}
                                                        </h6>
                                                        <small className="text-muted">
                                                            📍 {act.location || trip.destination} {act.notes ? `• ${act.notes}` : ""}
                                                        </small>
                                                    </div>
                                                    <div className="d-flex gap-2">
                                                        <button
                                                            className={`btn btn-sm ${isDone ? "btn-success" : "btn-outline-success"}`}
                                                            onClick={() => handleToggleActivityStatus(act)}
                                                        >
                                                            {isDone ? "✅ Completed" : "Mark Done"}
                                                        </button>
                                                        <button
                                                            className="btn btn-sm btn-outline-danger"
                                                            onClick={() => handleDeleteActivity(act.id)}
                                                        >
                                                            🗑️
                                                        </button>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* TAB 3: Expenses & Group Expense Splitting (Milestone 3 & Module 11) */}
                {activeTab === "expenses" && (
                    <div className="row g-4">
                        <div className="col-lg-5">
                            {/* Log Expense Form */}
                            <div className="card shadow-sm border-0 p-4 rounded-4 bg-white mb-4">
                                <h4 className="fw-bold mb-3">➕ Log Trip Expense</h4>
                                <form onSubmit={handleAddExpense}>
                                    <div className="mb-3">
                                        <label className="form-label small fw-bold">Expense Description</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            placeholder="e.g. Resort Booking / Dinner"
                                            value={newExpense.expenseName}
                                            onChange={(e) => setNewExpense({ ...newExpense, expenseName: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div className="row g-2 mb-3">
                                        <div className="col-6">
                                            <label className="form-label small fw-bold">Amount (₹)</label>
                                            <input
                                                type="number"
                                                className="form-control"
                                                placeholder="5000"
                                                value={newExpense.amount}
                                                onChange={(e) => setNewExpense({ ...newExpense, amount: e.target.value })}
                                                required
                                            />
                                        </div>
                                        <div className="col-6">
                                            <label className="form-label small fw-bold">Category</label>
                                            <select
                                                className="form-select"
                                                value={newExpense.category}
                                                onChange={(e) => setNewExpense({ ...newExpense, category: e.target.value })}
                                            >
                                                <option value="Accommodation">Accommodation 🏨</option>
                                                <option value="Food & Dining">Food & Dining 🍲</option>
                                                <option value="Transportation">Transportation 🚕</option>
                                                <option value="Activities">Activities & Tours 🏄</option>
                                                <option value="Shopping">Shopping 🛍️</option>
                                                <option value="Miscellaneous">Miscellaneous 📦</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label small fw-bold">Paid By</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            placeholder="Who paid for this?"
                                            value={newExpense.paidBy}
                                            onChange={(e) => setNewExpense({ ...newExpense, paidBy: e.target.value })}
                                        />
                                    </div>
                                    <button type="submit" className="btn btn-success w-100 btn-lg fw-bold">
                                        💵 Record Expense
                                    </button>
                                </form>
                            </div>

                            {/* Chart.js Category Breakdown */}
                            <div className="card shadow-sm border-0 p-4 rounded-4 bg-white">
                                <h5 className="fw-bold mb-3">📊 Category Breakdown</h5>
                                {expenses.length === 0 ? (
                                    <p className="text-muted small mb-0">No expenses recorded yet.</p>
                                ) : (
                                    <div style={{ maxHeight: "240px" }} className="d-flex justify-content-center">
                                        <Doughnut data={doughnutData} options={{ responsive: true, maintainAspectRatio: false }} />
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="col-lg-7">
                            <div className="card shadow-sm border-0 p-4 rounded-4 bg-white">
                                <div className="d-flex justify-content-between align-items-center mb-3">
                                    <h4 className="fw-bold mb-0">👥 Group Expense Splitting & Ledger</h4>
                                    <span className="badge bg-primary">{totalTravelers} Group Split</span>
                                </div>
                                <p className="text-muted small mb-3">
                                    Each member's equal share is automatically calculated. Mark settlements as co-travelers repay!
                                </p>

                                {expenses.length === 0 ? (
                                    <p className="text-muted py-4 mb-0 text-center">No expenses recorded yet.</p>
                                ) : (
                                    <div className="table-responsive">
                                        <table className="table table-hover align-middle">
                                            <thead className="table-light">
                                                <tr>
                                                    <th>Expense</th>
                                                    <th>Paid By</th>
                                                    <th>Total</th>
                                                    <th>Per-Person</th>
                                                    <th>Settlement</th>
                                                    <th>Action</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {expenses.map((exp) => (
                                                    <tr key={exp.id}>
                                                        <td>
                                                            <div className="fw-bold">{exp.expenseName}</div>
                                                            <span className="badge bg-secondary small">{exp.category || "General"}</span>
                                                        </td>
                                                        <td>{exp.paidBy || "Self"}</td>
                                                        <td className="fw-bold">₹{exp.amount?.toLocaleString()}</td>
                                                        <td>
                                                            <span className="badge bg-light text-dark">
                                                                ₹{Math.round((exp.amount || 0) / totalTravelers)}
                                                            </span>
                                                        </td>
                                                        <td>
                                                            <button
                                                                className={`btn btn-sm ${exp.isSettled ? "btn-success" : "btn-outline-warning"}`}
                                                                onClick={() => handleToggleSettle(exp.id)}
                                                            >
                                                                {exp.isSettled ? "✅ Settled" : "⏳ Unsettled"}
                                                            </button>
                                                        </td>
                                                        <td>
                                                            <button
                                                                className="btn btn-sm btn-outline-danger"
                                                                onClick={() => handleDeleteExpense(exp.id)}
                                                            >
                                                                🗑️
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* TAB 4: Group Discussion & Real-Time Chat (Milestone 3) */}
                {activeTab === "chat" && (
                    <div className="row justify-content-center">
                        <div className="col-lg-9">
                            <div className="card shadow-sm border-0 rounded-4 p-4 bg-white">
                                <div className="d-flex justify-content-between align-items-center mb-3 pb-2 border-bottom">
                                    <div>
                                        <h4 className="fw-bold mb-0">💬 Trip Discussion & Co-Traveler Chat</h4>
                                        <small className="text-muted">Chat with invited travelers about itinerary & meetup plans</small>
                                    </div>
                                    <span className="badge bg-success">🟢 In-App Live</span>
                                </div>

                                {/* Messages Stream */}
                                <div
                                    className="chat-stream p-3 rounded-3 bg-light mb-3"
                                    style={{ height: "380px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "10px" }}
                                >
                                    {chatMessages.length === 0 ? (
                                        <p className="text-muted text-center my-auto">
                                            No messages yet. Send a greeting to start coordinating with your co-travelers!
                                        </p>
                                    ) : (
                                        chatMessages.map((msg) => {
                                            const isMe = msg.senderEmail === currentUser.email;
                                            return (
                                                <div
                                                    key={msg.id}
                                                    style={{
                                                        alignSelf: isMe ? "flex-end" : "flex-start",
                                                        maxWidth: "75%",
                                                    }}
                                                >
                                                    <div
                                                        className={`p-3 rounded-4 ${
                                                            isMe ? "bg-primary text-white" : "bg-white border text-dark shadow-sm"
                                                        }`}
                                                    >
                                                        <div className="d-flex align-items-center gap-2 mb-1">
                                                            <strong className="small">{msg.senderName}</strong>
                                                            <small className={isMe ? "text-white-50" : "text-muted"}>
                                                                {msg.timestamp ? new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ""}
                                                            </small>
                                                        </div>
                                                        <p className="mb-0">{msg.message}</p>
                                                    </div>
                                                </div>
                                            );
                                        })
                                    )}
                                    <div ref={chatEndRef} />
                                </div>

                                {/* Message Composer */}
                                <form onSubmit={handleSendChatMessage} className="d-flex gap-2">
                                    <input
                                        type="text"
                                        className="form-control form-control-lg"
                                        placeholder="Type a group message or plan update..."
                                        value={chatInput}
                                        onChange={(e) => setChatInput(e.target.value)}
                                        required
                                    />
                                    <button type="submit" className="btn btn-primary px-4 fw-bold">
                                        Send 🚀
                                    </button>
                                </form>
                            </div>
                        </div>
                    </div>
                )}

                {/* TAB 5: Co-Travelers */}
                {activeTab === "collaborators" && (
                    <div className="row g-4">
                        <div className="col-lg-5">
                            <div className="card shadow-sm border-0 p-4 rounded-4 bg-white">
                                <h4 className="fw-bold mb-3">👥 Invite Co-Traveler</h4>
                                <p className="text-muted small">
                                    Invite travel companions by email to access itineraries, chat, and share group expenses.
                                </p>
                                <form onSubmit={handleInviteCollaborator}>
                                    <div className="mb-3">
                                        <label className="form-label small fw-bold">Companion's Email</label>
                                        <input
                                            type="email"
                                            className="form-control form-control-lg"
                                            placeholder="friend@example.com"
                                            value={inviteEmail}
                                            onChange={(e) => setInviteEmail(e.target.value)}
                                            required
                                        />
                                    </div>
                                    <button type="submit" className="btn btn-primary w-100 btn-lg fw-bold">
                                        📩 Send Invitation
                                    </button>
                                </form>
                            </div>
                        </div>

                        <div className="col-lg-7">
                            <div className="card shadow-sm border-0 p-4 rounded-4 bg-white">
                                <h4 className="fw-bold mb-3">🌍 Group Members ({totalTravelers})</h4>
                                <div className="p-3 mb-2 rounded-3 bg-light border d-flex justify-content-between align-items-center">
                                    <div className="d-flex align-items-center gap-3">
                                        <span className="fs-3">👑</span>
                                        <div>
                                            <span className="badge bg-warning text-dark mb-1">Trip Lead / Owner</span>
                                            <p className="mb-0 fw-bold">{trip.user?.email || "You"}</p>
                                        </div>
                                    </div>
                                </div>

                                {(!trip.collaboratorEmails || trip.collaboratorEmails.length === 0) ? (
                                    <p className="text-muted mt-3 mb-0">No other co-travelers yet. Invite companions with the form.</p>
                                ) : (
                                    trip.collaboratorEmails.map((email, idx) => (
                                        <div key={idx} className="p-3 mb-2 rounded-3 bg-white border d-flex justify-content-between align-items-center shadow-sm">
                                            <div className="d-flex align-items-center gap-3">
                                                <span className="fs-3">👤</span>
                                                <div>
                                                    <span className="badge bg-info text-dark mb-1">Co-Traveler</span>
                                                    <p className="mb-0 fw-bold">{email}</p>
                                                </div>
                                            </div>
                                            <button
                                                className="btn btn-sm btn-outline-danger"
                                                onClick={() => handleRemoveCollaborator(email)}
                                            >
                                                ❌ Remove
                                            </button>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* TAB 6: Document Vault (Milestone 3) */}
                {activeTab === "documents" && (
                    <div className="row g-4">
                        <div className="col-lg-5">
                            <div className="card shadow-sm border-0 p-4 rounded-4 bg-white">
                                <h4 className="fw-bold mb-3">📁 Upload Travel Document</h4>
                                <form onSubmit={handleUploadDocument}>
                                    <div className="mb-3">
                                        <label className="form-label small fw-bold">Document Title</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            placeholder="e.g. Flight Boarding Pass / Hotel Voucher"
                                            value={newDocument.documentName}
                                            onChange={(e) => setNewDocument({ ...newDocument, documentName: e.target.value })}
                                        />
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label small fw-bold">Document Type</label>
                                        <select
                                            className="form-select"
                                            value={newDocument.documentType}
                                            onChange={(e) => setNewDocument({ ...newDocument, documentType: e.target.value })}
                                        >
                                            <option value="Ticket">🎫 Flight / Train Ticket</option>
                                            <option value="Hotel Booking">🏨 Hotel Voucher</option>
                                            <option value="Passport/ID">🆔 Passport / ID Card</option>
                                            <option value="Travel Photo">🖼️ Travel Photo / Memory</option>
                                            <option value="Other">📄 Other Document</option>
                                        </select>
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label small fw-bold">Select File</label>
                                        <input
                                            id="tripDocFileInput"
                                            type="file"
                                            className="form-control"
                                            onChange={(e) => setSelectedFile(e.target.files[0])}
                                            required
                                        />
                                    </div>
                                    <button type="submit" className="btn btn-success w-100 btn-lg fw-bold" disabled={uploadingDoc}>
                                        {uploadingDoc ? "⏳ Uploading..." : "📤 Upload Document"}
                                    </button>
                                </form>
                            </div>
                        </div>

                        <div className="col-lg-7">
                            <div className="card shadow-sm border-0 p-4 rounded-4 bg-white">
                                <h4 className="fw-bold mb-3">🗂️ Stored Travel Documents ({documents.length})</h4>
                                {documents.length === 0 ? (
                                    <p className="text-muted py-4 mb-0 text-center">No documents uploaded yet.</p>
                                ) : (
                                    <div className="d-flex flex-column gap-3">
                                        {documents.map((doc) => {
                                            // Port 8081 backend download URL
                                            const fileUrl = doc.fileUrl?.startsWith("http")
                                                ? doc.fileUrl
                                                : `http://localhost:8081${doc.fileUrl}`;
                                            const sizeKb = doc.fileSize ? Math.round(doc.fileSize / 1024) : 0;
                                            return (
                                                <div key={doc.id} className="p-3 border rounded-3 bg-white d-flex justify-content-between align-items-center shadow-sm">
                                                    <div>
                                                        <span className="badge bg-primary mb-1">{doc.documentType}</span>
                                                        <h6 className="mb-0 fw-bold">{doc.documentName}</h6>
                                                        <small className="text-muted">{doc.fileName} • {sizeKb} KB</small>
                                                    </div>
                                                    <div className="d-flex gap-2">
                                                        <a
                                                            href={fileUrl}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="btn btn-sm btn-outline-primary"
                                                        >
                                                            👁️ Download
                                                        </a>
                                                        <button
                                                            className="btn btn-sm btn-outline-danger"
                                                            onClick={() => handleDeleteDocument(doc.id)}
                                                        >
                                                            🗑️
                                                        </button>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <Footer />
        </div>
    );
}

export default TripDetailsPage;
