import React, { useState, useEffect } from "react";
import API from "../services/api";
import Navbar from "./Navbar";
import Footer from "./Footer";
import "../styles/AiFeatures.css";

export default function AiBudgetAssistant() {
    const [trips, setTrips] = useState([]);
    const [selectedTripId, setSelectedTripId] = useState("");
    const [loading, setLoading] = useState(false);
    const [analysis, setAnalysis] = useState(null);

    // Manual simulation inputs
    const [simBudget, setSimBudget] = useState(40000);
    const [simDays, setSimDays] = useState(4);
    const [simTravellers, setSimTravellers] = useState(2);
    const [simDestination, setSimDestination] = useState("Goa");

    useEffect(() => {
        fetchTrips();
    }, []);

    const fetchTrips = async () => {
        try {
            const res = await API.get("/trips/all");
            if (res.data && res.data.length > 0) {
                setTrips(res.data);
                setSelectedTripId(res.data[0].id.toString());
                analyzeTrip(res.data[0].id);
            } else {
                runSimulation();
            }
        } catch (err) {
            console.error("Fetch trips error:", err);
            runSimulation();
        }
    };

    const analyzeTrip = async (id) => {
        if (!id) return;
        setLoading(true);
        try {
            const res = await API.get(`/ai/budget/analyze-trip/${id}`);
            setAnalysis(res.data);
        } catch (err) {
            console.error("Analyze trip error:", err);
        } finally {
            setLoading(false);
        }
    };

    const runSimulation = async () => {
        setLoading(true);
        try {
            const payload = {
                totalBudget: parseFloat(simBudget) || 30000,
                durationDays: parseInt(simDays) || 3,
                travellers: parseInt(simTravellers) || 1,
                destination: simDestination,
            };
            const res = await API.post("/ai/budget/estimate", payload);
            setAnalysis(res.data);
        } catch (err) {
            console.error("Simulation error:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleTripChange = (e) => {
        const id = e.target.value;
        setSelectedTripId(id);
        if (id === "custom") {
            runSimulation();
        } else {
            analyzeTrip(id);
        }
    };
    return (
        <div className="page-wrapper bg-light min-vh-100">
            <Navbar />

            <div className="container py-4">
                <div className="ai-hero-header">
                    <span className="ai-badge mb-2">💎 Financial Intelligence</span>
                    <h2 className="fw-bold mb-2">AI Budget Assistant &amp; Expense Optimization</h2>
                    <p className="lead mb-0 opacity-90 text-light">
                        Deterministic financial balance auditing with AI-driven cost-reduction tips and alternative activities.
                    </p>
                </div>

                {/* Trip Selector Bar */}
                <div className="ai-glass-card p-3 mb-4">
                    <div className="row align-items-center g-3">
                        <div className="col-md-5">
                            <label className="form-label small fw-bold text-dark mb-1">
                                📊 Select Trip to Audit:
                            </label>
                            <select
                                className="form-select rounded-3"
                                value={selectedTripId}
                                onChange={handleTripChange}
                            >
                                {trips.map((t) => (
                                    <option key={t.id} value={t.id}>
                                        {t.destination} ({t.startDate || "Date"} • ₹{Number(t.budget).toLocaleString()})
                                    </option>
                                ))}
                                <option value="custom">⚡ New Trip Budget Simulator</option>
                            </select>
                        </div>

                        {selectedTripId === "custom" && (
                            <>
                                <div className="col-md-2">
                                    <label className="form-label small fw-bold text-dark mb-1">Budget (INR)</label>
                                    <input
                                        type="number"
                                        className="form-control rounded-3"
                                        value={simBudget}
                                        onChange={(e) => setSimBudget(e.target.value)}
                                    />
                                </div>
                                <div className="col-md-2">
                                    <label className="form-label small fw-bold text-dark mb-1">Days</label>
                                    <input
                                        type="number"
                                        className="form-control rounded-3"
                                        value={simDays}
                                        onChange={(e) => setSimDays(e.target.value)}
                                    />
                                </div>
                                <div className="col-md-3 d-flex align-items-end">
                                    <button
                                        type="button"
                                        className="btn btn-primary w-100 rounded-3 fw-bold"
                                        onClick={runSimulation}
                                        disabled={loading}
                                    >
                                        Run Simulation
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>

                {loading ? (
                    <div className="text-center py-5">
                        <div className="pulse-spinner text-primary" style={{ width: "3rem", height: "3rem" }}></div>
                        <p className="mt-2 text-muted">Auditing financial metrics and computing optimization matrix...</p>
                    </div>
                ) : analysis ? (
                    <div>
                        {/* Over-budget Warning Alert */}
                        {analysis.isOverBudget && (
                            <div className="alert alert-danger rounded-4 shadow-sm mb-4 border-0 p-3">
                                <div className="d-flex align-items-center gap-3">
                                    <span className="fs-2">🚨</span>
                                    <div>
                                        <h5 className="alert-heading fw-bold mb-1">Trip Over-Budget Warning!</h5>
                                        <p className="mb-0 small">
                                            Current expenditure has exceeded your planned allocation by{" "}
                                            <strong>₹{Number(analysis.overspentAmount).toLocaleString()}</strong>.
                                            Review the AI cost optimization tips below to balance spending.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Top Financial KPI Metrics */}
                        <div className="row g-3 mb-4">
                            <div className="col-md-3">
                                <div className="bg-white p-3 rounded-4 border shadow-sm text-center">
                                    <span className="text-muted small d-block">Planned Budget</span>
                                    <h4 className="fw-bold text-dark mt-1">₹{Number(analysis.totalBudget).toLocaleString()}</h4>
                                </div>
                            </div>
                            <div className="col-md-3">
                                <div className="bg-white p-3 rounded-4 border shadow-sm text-center">
                                    <span className="text-muted small d-block">Actual Spend</span>
                                    <h4 className="fw-bold text-primary mt-1">₹{Number(analysis.totalActualSpent).toLocaleString()}</h4>
                                </div>
                            </div>
                            <div className="col-md-3">
                                <div className="bg-white p-3 rounded-4 border shadow-sm text-center">
                                    <span className="text-muted small d-block">Remaining Balance</span>
                                    <h4 className={`fw-bold mt-1 ${analysis.remainingBudget < 0 ? "text-danger" : "text-success"}`}>
                                        ₹{Number(analysis.remainingBudget).toLocaleString()}
                                    </h4>
                                </div>
                            </div>
                            <div className="col-md-3">
                                <div className="bg-white p-3 rounded-4 border shadow-sm text-center">
                                    <span className="text-muted small d-block">Budget Utilization</span>
                                    <h4 className="fw-bold text-dark mt-1">{analysis.percentageSpent}%</h4>
                                </div>
                            </div>
                        </div>

                        {/* Category Breakdown Table */}
                        <div className="row g-4 mb-4">
                            <div className="col-lg-6">
                                <div className="bg-white p-4 rounded-4 border shadow-sm h-100">
                                    <h5 className="fw-bold text-dark mb-3">🏷️ Category Spending Breakdown</h5>
                                    {Object.entries(analysis.categoryEstimates || {}).map(([cat, est]) => {
                                        const actual = analysis.categoryActuals?.[cat] || 0;
                                        const isCatOver = actual > est;
                                        const pct = est > 0 ? Math.min(Math.round((actual / est) * 100), 100) : 0;

                                        return (
                                            <div key={cat} className="mb-3">
                                                <div className="d-flex justify-content-between align-items-center mb-1">
                                                    <span className="small fw-semibold text-dark">{cat}</span>
                                                    <span className="small text-muted">
                                                        ₹{actual.toLocaleString()} / ₹{est.toLocaleString()}{" "}
                                                        {isCatOver && <span className="text-danger fw-bold">(Exceeded)</span>}
                                                    </span>
                                                </div>
                                                <div className="budget-progress-bar">
                                                    <div
                                                        style={{
                                                            width: `${pct}%`,
                                                            height: "100%",
                                                            background: isCatOver ? "#ef4444" : "#0284c7",
                                                            borderRadius: "6px",
                                                            transition: "width 0.4s ease",
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Spending Alerts & Risk Factors */}
                            <div className="col-lg-6">
                                <div className="bg-white p-4 rounded-4 border shadow-sm h-100">
                                    <h5 className="fw-bold text-dark mb-3">⚠️ Spending Alerts &amp; Risk Insights</h5>
                                    {analysis.spendingAlerts?.length > 0 ? (
                                        <div className="list-group list-group-flush">
                                            {analysis.spendingAlerts.map((alert, idx) => (
                                                <div key={idx} className="list-group-item px-0 border-0 d-flex align-items-start gap-2">
                                                    <span className="text-warning">●</span>
                                                    <span className="small text-secondary">{alert}</span>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-muted small">No immediate spending risks identified.</p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* AI Cost-Reduction Tips & Alternatives */}
                        <div className="row g-4 mb-4">
                            <div className="col-lg-6">
                                <div className="bg-white p-4 rounded-4 border shadow-sm h-100">
                                    <h5 className="fw-bold text-success mb-3">💡 Practical Cost-Cutting Recommendations</h5>
                                    <ul className="ps-3 mb-0">
                                        {analysis.costOptimizationTips?.map((tip, idx) => (
                                            <li key={idx} className="small text-secondary mb-2">{tip}</li>
                                        ))}
                                    </ul>
                                </div>
                            </div>

                            <div className="col-lg-6">
                                <div className="bg-white p-4 rounded-4 border shadow-sm h-100">
                                    <h5 className="fw-bold text-primary mb-3">🔄 Recommended Lower-Cost Alternatives</h5>
                                    <ul className="ps-3 mb-0">
                                        {analysis.lowerCostAlternatives?.map((alt, idx) => (
                                            <li key={idx} className="small text-secondary mb-2">{alt}</li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        </div>

                        <div className="text-muted text-center small mb-5">
                            {analysis.sourceNotice}
                        </div>
                    </div>
                ) : null}
            </div>

            <Footer />
        </div>
    );
}