import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";
import API from "../services/api";
import {
    Chart as ChartJS,
    ArcElement,
    Tooltip,
    Legend,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
} from "chart.js";
import { Doughnut, Bar } from "react-chartjs-2";

ChartJS.register(
    ArcElement,
    Tooltip,
    Legend,
    CategoryScale,
    LinearScale,
    BarElement,
    Title
);

function AnalyticsDashboard() {
    const [trips, setTrips] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const res = await API.get("/trips/all");
            setTrips(res.data || []);
        } catch (error) {
            console.error("Error loading analytics:", error);
        } finally {
            setLoading(false);
        }
    };

    // Calculate aggregated metrics
    const totalTrips = trips.length;
    const totalBudgetAllocated = trips.reduce((sum, t) => sum + (t.budget || 0), 0);

    const allExpenses = trips.flatMap((t) => t.expenses || []);
    const totalExpensesLogged = allExpenses.reduce((sum, e) => sum + (e.amount || 0), 0);
    const netBalance = totalBudgetAllocated - totalExpensesLogged;

    // Category breakdown
    const categoryTotals = allExpenses.reduce((acc, e) => {
        const cat = e.category || "Miscellaneous";
        acc[cat] = (acc[cat] || 0) + (e.amount || 0);
        return acc;
    }, {});

    // Prepare Category Doughnut Chart Data
    const categoryLabels = Object.keys(categoryTotals).length > 0
        ? Object.keys(categoryTotals)
        : ["Accommodation", "Transportation", "Food & Dining", "Activities", "Shopping"];

    const categoryValues = Object.keys(categoryTotals).length > 0
        ? Object.values(categoryTotals)
        : [0, 0, 0, 0, 0];

    const doughnutData = {
        labels: categoryLabels,
        datasets: [
            {
                label: "Amount Spent (₹)",
                data: categoryValues,
                backgroundColor: [
                    "#3b82f6",
                    "#10b981",
                    "#f59e0b",
                    "#8b5cf6",
                    "#ec4899",
                    "#06b6d4",
                    "#64748b",
                ],
                borderWidth: 2,
                borderColor: "#ffffff",
            },
        ],
    };

    // Prepare Trip-by-Trip Budget vs Spent Bar Chart
    const tripNames = trips.slice(0, 7).map((t) => t.destination);
    const tripBudgets = trips.slice(0, 7).map((t) => t.budget || 0);
    const tripSpent = trips.slice(0, 7).map((t) =>
        (t.expenses || []).reduce((sum, e) => sum + (e.amount || 0), 0)
    );

    const barData = {
        labels: tripNames.length > 0 ? tripNames : ["Sample Destination"],
        datasets: [
            {
                label: "Allocated Budget (₹)",
                data: tripBudgets.length > 0 ? tripBudgets : [0],
                backgroundColor: "rgba(59, 130, 246, 0.7)",
                borderColor: "#3b82f6",
                borderWidth: 1,
                borderRadius: 6,
            },
            {
                label: "Actual Spent (₹)",
                data: tripSpent.length > 0 ? tripSpent : [0],
                backgroundColor: "rgba(239, 68, 68, 0.7)",
                borderColor: "#ef4444",
                borderWidth: 1,
                borderRadius: 6,
            },
        ],
    };

    const barOptions = {
        responsive: true,
        plugins: {
            legend: { position: "top" },
            title: {
                display: true,
                text: "Trip Financial Performance (Budget vs Actual Spent)",
            },
        },
        scales: {
            y: {
                beginAtZero: true,
                ticks: {
                    callback: (value) => "₹" + value.toLocaleString(),
                },
            },
        },
    };

    if (loading) {
        return (
            <div className="page-wrapper">
                <Navbar />
                <div className="container text-center py-5">
                    <div className="spinner-border text-primary" role="status"></div>
                    <p className="mt-2 text-muted">Calculating travel analytics & reports...</p>
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
                        <span className="badge bg-primary px-3 py-2 rounded-pill mb-2">Milestone 4 Analytics</span>
                        <h1 className="fw-bold display-5 mb-1">📊 Travel Analytics & Expense Reports</h1>
                        <p className="text-muted mb-0">
                            Centralized financial analysis, category breakdowns, and trip expenditure metrics.
                        </p>
                    </div>
                    <div className="d-flex gap-2">
                        <Link to="/plan-trip" className="btn btn-primary">
                            ➕ Plan New Trip
                        </Link>
                        <button className="btn btn-outline-secondary" onClick={() => window.print()}>
                            🖨️ Export PDF Report
                        </button>
                    </div>
                </div>

                {/* KPI Cards */}
                <div className="row g-4 mb-5">
                    <div className="col-md-3">
                        <div className="card shadow-sm border-0 rounded-4 p-4 h-100 bg-white">
                            <span className="text-muted small text-uppercase fw-bold">Total Trips</span>
                            <h2 className="fw-bold mt-2 mb-1">{totalTrips}</h2>
                            <span className="badge bg-light text-primary align-self-start">Explored</span>
                        </div>
                    </div>
                    <div className="col-md-3">
                        <div className="card shadow-sm border-0 rounded-4 p-4 h-100 bg-white">
                            <span className="text-muted small text-uppercase fw-bold">Total Budget Allocated</span>
                            <h2 className="fw-bold mt-2 mb-1 text-primary">₹{totalBudgetAllocated.toLocaleString()}</h2>
                            <small className="text-muted">Across all planned trips</small>
                        </div>
                    </div>
                    <div className="col-md-3">
                        <div className="card shadow-sm border-0 rounded-4 p-4 h-100 bg-white">
                            <span className="text-muted small text-uppercase fw-bold">Total Expenses Logged</span>
                            <h2 className="fw-bold mt-2 mb-1 text-danger">₹{totalExpensesLogged.toLocaleString()}</h2>
                            <small className="text-muted">{allExpenses.length} Expense transactions</small>
                        </div>
                    </div>
                    <div className="col-md-3">
                        <div className="card shadow-sm border-0 rounded-4 p-4 h-100 bg-white">
                            <span className="text-muted small text-uppercase fw-bold">Net Remaining Budget</span>
                            <h2 className={`fw-bold mt-2 mb-1 ${netBalance < 0 ? "text-danger" : "text-success"}`}>
                                ₹{netBalance.toLocaleString()}
                            </h2>
                            <small className={netBalance < 0 ? "text-danger fw-bold" : "text-success"}>
                                {netBalance < 0 ? "⚠️ Overall Budget Exceeded" : "✅ Within Overall Budget"}
                            </small>
                        </div>
                    </div>
                </div>

                {/* Charts Grid */}
                <div className="row g-4 mb-5">
                    {/* Bar Chart: Budget vs Actual */}
                    <div className="col-lg-8">
                        <div className="card shadow-sm border-0 rounded-4 p-4 h-100 bg-white">
                            <h4 className="fw-bold mb-4">📈 Budget vs. Actual Expenditure Comparison</h4>
                            {trips.length === 0 ? (
                                <p className="text-muted text-center py-5">No trip data available to plot charts yet.</p>
                            ) : (
                                <Bar data={barData} options={barOptions} />
                            )}
                        </div>
                    </div>

                    {/* Doughnut Chart: Expense by Category */}
                    <div className="col-lg-4">
                        <div className="card shadow-sm border-0 rounded-4 p-4 h-100 bg-white">
                            <h4 className="fw-bold mb-3">🥧 Category Breakdown</h4>
                            <p className="text-muted small mb-4">Distribution of expenses across categories</p>
                            {allExpenses.length === 0 ? (
                                <p className="text-muted text-center py-5">No expenses logged yet.</p>
                            ) : (
                                <div style={{ maxHeight: "300px" }} className="d-flex justify-content-center">
                                    <Doughnut data={doughnutData} options={{ responsive: true, maintainAspectRatio: false }} />
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Detailed Trip Financial Ledger Table */}
                <div className="card shadow-sm border-0 rounded-4 p-4 bg-white">
                    <h4 className="fw-bold mb-3">📋 Detailed Trip Expense Ledger</h4>
                    {trips.length === 0 ? (
                        <p className="text-muted text-center py-4 mb-0">No trips planned yet.</p>
                    ) : (
                        <div className="table-responsive">
                            <table className="table table-hover align-middle">
                                <thead className="table-light">
                                    <tr>
                                        <th>Destination</th>
                                        <th>Duration</th>
                                        <th>Status</th>
                                        <th>Allocated Budget</th>
                                        <th>Actual Spent</th>
                                        <th>Remaining</th>
                                        <th>Utilization</th>
                                        <th>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {trips.map((trip) => {
                                        const spent = (trip.expenses || []).reduce((sum, e) => sum + (e.amount || 0), 0);
                                        const remaining = (trip.budget || 0) - spent;
                                        const pct = trip.budget > 0 ? Math.min(Math.round((spent / trip.budget) * 100), 100) : 0;
                                        const isOver = remaining < 0;

                                        return (
                                            <tr key={trip.id}>
                                                <td className="fw-bold">📍 {trip.destination}</td>
                                                <td className="small text-muted">{trip.startDate} to {trip.endDate}</td>
                                                <td>
                                                    <span className={`badge ${trip.status === "Completed" ? "bg-success" : trip.status === "Ongoing" ? "bg-primary" : "bg-warning text-dark"}`}>
                                                        {trip.status || "Planned"}
                                                    </span>
                                                </td>
                                                <td>₹{trip.budget?.toLocaleString()}</td>
                                                <td className="fw-bold">₹{spent.toLocaleString()}</td>
                                                <td className={isOver ? "text-danger fw-bold" : "text-success fw-bold"}>
                                                    ₹{remaining.toLocaleString()}
                                                </td>
                                                <td style={{ minWidth: "120px" }}>
                                                    <div className="d-flex align-items-center gap-2">
                                                        <div className="progress flex-grow-1" style={{ height: "6px" }}>
                                                            <div
                                                                className={`progress-bar ${isOver ? "bg-danger" : pct > 80 ? "bg-warning" : "bg-primary"}`}
                                                                style={{ width: `${pct}%` }}
                                                            ></div>
                                                        </div>
                                                        <small className="small fw-bold">{pct}%</small>
                                                    </div>
                                                </td>
                                                <td>
                                                    <Link to={`/trip/${trip.id}`} className="btn btn-sm btn-outline-primary">
                                                        Manage ➡️
                                                    </Link>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>

            <Footer />
        </div>
    );
}

export default AnalyticsDashboard;
