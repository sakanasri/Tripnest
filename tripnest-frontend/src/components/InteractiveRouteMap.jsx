import React, { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import API from "../services/api";

// Fix Leaflet default icon paths in React / Vite
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
    iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

function createCustomPin(number, color = "#0284c7") {
    return L.divIcon({
        className: "custom-map-pin",
        html: `
            <div style="
                background: ${color};
                color: #ffffff;
                width: 28px;
                height: 28px;
                border-radius: 50% 50% 50% 0;
                transform: rotate(-45deg);
                display: flex;
                align-items: center;
                justify-content: center;
                box-shadow: 0 3px 8px rgba(0,0,0,0.3);
                border: 2px solid #ffffff;
            ">
                <span style="transform: rotate(45deg); font-weight: bold; font-size: 11px;">${number}</span>
            </div>
        `,
        iconSize: [28, 28],
        iconAnchor: [14, 28],
        popupAnchor: [0, -28],
    });
}

export default function InteractiveRouteMap({ stops = [], initialMode = "driving", height = "420px" }) {
    const mapContainerRef = useRef(null);
    const mapInstanceRef = useRef(null);
    const polylineRef = useRef(null);
    const markersRef = useRef([]);

    const [mode, setMode] = useState(initialMode); // driving, cycling, walking
    const [criteria, setCriteria] = useState("shortest"); // shortest, fastest
    const [optimizeOrder, setOptimizeOrder] = useState(false);
    const [loading, setLoading] = useState(false);
    const [routeData, setRouteData] = useState(null);
    const [showSteps, setShowSteps] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");

    // Initialize Leaflet map
    useEffect(() => {
        if (!mapContainerRef.current) return;

        if (!mapInstanceRef.current) {
            const startCenter = (stops && stops.length > 0 && stops[0].latitude)
                ? [stops[0].latitude, stops[0].longitude]
                : [13.0827, 80.2707];
            const map = L.map(mapContainerRef.current).setView(startCenter, 6);
            L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
                maxZoom: 19,
            }).addTo(map);
            mapInstanceRef.current = map;
        }

        return () => {
            if (mapInstanceRef.current) {
                mapInstanceRef.current.remove();
                mapInstanceRef.current = null;
            }
        };
    }, []);

    // Fetch and render route whenever stops, mode, criteria, or optimizeOrder changes
    useEffect(() => {
        if (!stops || stops.length < 2) {
            setRouteData(null);
            clearMapLayers();
            if (stops && stops.length === 1 && mapInstanceRef.current) {
                const s = stops[0];
                mapInstanceRef.current.setView([s.latitude, s.longitude], 12);
                const marker = L.marker([s.latitude, s.longitude], {
                    icon: createCustomPin(1, "#0284c7")
                }).addTo(mapInstanceRef.current).bindPopup(`<b>${s.name}</b>`);
                markersRef.current.push(marker);
            }
            return;
        }

        fetchRoute();
    }, [stops, mode, criteria, optimizeOrder]);

    const clearMapLayers = () => {
        if (polylineRef.current && mapInstanceRef.current) {
            mapInstanceRef.current.removeLayer(polylineRef.current);
            polylineRef.current = null;
        }
        if (markersRef.current.length > 0 && mapInstanceRef.current) {
            markersRef.current.forEach((m) => mapInstanceRef.current.removeLayer(m));
            markersRef.current = [];
        }
    };

    const fetchRoute = async () => {
        setLoading(true);
        setErrorMsg("");

        try {
            const payload = {
                stops: stops.map((s, idx) => ({
                    name: s.name,
                    latitude: s.latitude,
                    longitude: s.longitude,
                    stopType: idx === 0 ? "origin" : idx === stops.length - 1 ? "destination" : "stop",
                    orderIndex: idx,
                })),
                transportMode: mode,
                criteria: criteria,
                optimizeOrder: optimizeOrder,
            };

            const res = await API.post("/api/routes/calculate", payload);
            if (res.data && res.data.success) {
                setRouteData(res.data);
                renderRouteOnMap(res.data);
            } else {
                setErrorMsg(res.data?.disclaimer || "Could not calculate road route.");
            }
        } catch (err) {
            console.error("Route calculation error:", err);
            // Fallback: draw basic polyline between stops directly
            drawDirectFallback(stops);
        } finally {
            setLoading(false);
        }
    };

    const renderRouteOnMap = (data) => {
        const map = mapInstanceRef.current;
        if (!map) return;

        clearMapLayers();

        // 1. Add markers
        const bounds = L.latLngBounds();
        const ordered = data.orderedStops || stops;

        ordered.forEach((stop, idx) => {
            const isOrigin = idx === 0;
            const isDest = idx === ordered.length - 1;
            const color = isOrigin ? "#10b981" : isDest ? "#ef4444" : "#0284c7";
            const pinIcon = createCustomPin(idx + 1, color);

            const marker = L.marker([stop.latitude, stop.longitude], { icon: pinIcon })
                .addTo(map)
                .bindPopup(`
                    <div style="font-family: inherit; font-size: 13px;">
                        <strong style="color: ${color};">${isOrigin ? "Origin" : isDest ? "Final Stop" : "Stop " + (idx + 1)}</strong><br/>
                        <b>${stop.name}</b><br/>
                        <span style="color: #64748b; font-size: 11px;">Lat: ${stop.latitude.toFixed(4)}, Lng: ${stop.longitude.toFixed(4)}</span>
                    </div>
                `);

            markersRef.current.push(marker);
            bounds.extend([stop.latitude, stop.longitude]);
        });

        // 2. Draw polyline
        const coords = data.polylineCoordinates || [];
        if (coords.length > 0) {
            const polyline = L.polyline(coords, {
                color: mode === "walking" ? "#10b981" : mode === "cycling" ? "#f59e0b" : "#0284c7",
                weight: 5,
                opacity: 0.85,
                dashArray: mode === "walking" ? "4, 8" : null,
            }).addTo(map);

            polylineRef.current = polyline;
            map.fitBounds(polyline.getBounds(), { padding: [40, 40] });
        } else if (bounds.isValid()) {
            map.fitBounds(bounds, { padding: [40, 40] });
        }
    };

    const drawDirectFallback = (stopsList) => {
        const map = mapInstanceRef.current;
        if (!map) return;
        clearMapLayers();

        const latLngs = stopsList.map((s) => [s.latitude, s.longitude]);
        const polyline = L.polyline(latLngs, {
            color: "#64748b",
            weight: 3,
            dashArray: "6, 6",
        }).addTo(map);

        polylineRef.current = polyline;
        map.fitBounds(polyline.getBounds(), { padding: [40, 40] });
    };

    return (
        <div className="interactive-map-card bg-white rounded-4 border p-3 shadow-sm mb-4">
            {/* Header Controls */}
            <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
                <div className="d-flex align-items-center gap-2">
                    <span className="fs-5">🗺️</span>
                    <div>
                        <h6 className="fw-bold mb-0 text-dark">Interactive Shortest-Route Planning</h6>
                        <small className="text-muted">OSRM Road Geometry &amp; Multi-Stop Navigation</small>
                    </div>
                </div>

                {/* Transport Mode & Optimization Toggles */}
                <div className="d-flex flex-wrap align-items-center gap-2">
                    {/* Mode Buttons */}
                    <div className="btn-group btn-group-sm" role="group">
                        <button
                            type="button"
                            className={`btn ${mode === "driving" ? "btn-primary" : "btn-outline-secondary"}`}
                            onClick={() => setMode("driving")}
                            title="Driving Mode"
                        >
                            🚗 Car
                        </button>
                        <button
                            type="button"
                            className={`btn ${mode === "cycling" ? "btn-primary" : "btn-outline-secondary"}`}
                            onClick={() => setMode("cycling")}
                            title="Cycling Mode"
                        >
                            🚴 Bike
                        </button>
                        <button
                            type="button"
                            className={`btn ${mode === "walking" ? "btn-primary" : "btn-outline-secondary"}`}
                            onClick={() => setMode("walking")}
                            title="Walking Mode"
                        >
                            🚶 Walk
                        </button>
                    </div>

                    {/* Criteria Selector */}
                    <div className="btn-group btn-group-sm" role="group">
                        <button
                            type="button"
                            className={`btn ${criteria === "shortest" ? "btn-dark" : "btn-outline-secondary"}`}
                            onClick={() => setCriteria("shortest")}
                            title="Shortest distance road route"
                        >
                            ⚡ Shortest
                        </button>
                        <button
                            type="button"
                            className={`btn ${criteria === "fastest" ? "btn-dark" : "btn-outline-secondary"}`}
                            onClick={() => setCriteria("fastest")}
                            title="Fastest estimated travel time"
                        >
                            ⏱️ Fastest
                        </button>
                    </div>

                    {/* TSP Optimize Order Toggle */}
                    <button
                        type="button"
                        className={`btn btn-sm ${optimizeOrder ? "btn-success" : "btn-outline-success"}`}
                        onClick={() => setOptimizeOrder(!optimizeOrder)}
                        title="Optimize intermediate stop order using TSP"
                    >
                        🔄 {optimizeOrder ? "Optimized" : "Optimize Stops"}
                    </button>
                </div>
            </div>

            {/* Error Message */}
            {errorMsg && (
                <div className="alert alert-warning py-1.5 px-3 small rounded-3 mb-2">
                    {errorMsg}
                </div>
            )}

            {/* Route Stats Bar */}
            {routeData && (
                <div className="row g-2 mb-3">
                    <div className="col-4 col-md-3">
                        <div className="route-stat-box text-center">
                            <span className="text-muted d-block small">Distance</span>
                            <span className="fw-bold text-primary fs-6">{routeData.totalDistanceKm} km</span>
                        </div>
                    </div>
                    <div className="col-4 col-md-3">
                        <div className="route-stat-box text-center">
                            <span className="text-muted d-block small">
                                {mode === "walking" ? "🚶 Walk Time" : mode === "cycling" ? "🚴 Bike Time" : "🚗 Drive Time"}
                            </span>
                            <span className="fw-bold text-dark fs-6 d-inline-flex align-items-center justify-content-center gap-1">
                                {routeData.formattedDuration}
                            </span>
                            {routeData.aiCalculated ? (
                                <span className="badge bg-primary-subtle text-primary border border-primary-subtle d-block mx-auto mt-1" style={{ fontSize: "0.65rem", width: "fit-content" }}>
                                    ✨ AI Exact
                                </span>
                            ) : (
                                <span className="badge bg-light text-secondary border d-block mx-auto mt-1" style={{ fontSize: "0.65rem", width: "fit-content" }}>
                                    ⚡ Calibrated
                                </span>
                            )}
                        </div>
                    </div>
                    <div className="col-4 col-md-3">
                        <div className="route-stat-box text-center">
                            <span className="text-muted d-block small">Stops</span>
                            <span className="fw-bold text-success fs-6">{stops.length} Waypoints</span>
                        </div>
                    </div>
                    <div className="col-12 col-md-3 d-flex align-items-center justify-content-end gap-2">
                        {routeData.externalMapsUrl && (
                            <a
                                href={routeData.externalMapsUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="btn btn-sm btn-outline-primary w-100 rounded-3 text-truncate"
                                title="Open this route in Google Maps"
                            >
                                ↗️ Google Maps ({mode === "walking" ? "Walk" : mode === "cycling" ? "Bike" : "Car"})
                            </a>
                        )}
                    </div>
                </div>
            )}

            {/* Map Canvas */}
            <div className="map-container-wrapper" style={{ height: height, width: "100%" }}>
                {loading && (
                    <div
                        style={{
                            position: "absolute",
                            inset: 0,
                            background: "rgba(255,255,255,0.75)",
                            zIndex: 1000,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            flexDirection: "column",
                            gap: "8px",
                        }}
                    >
                        <div className="pulse-spinner text-primary" style={{ width: "2rem", height: "2rem" }}></div>
                        <span className="small fw-semibold text-dark">Calculating AI route duration &amp; geometry...</span>
                    </div>
                )}
                <div ref={mapContainerRef} style={{ height: "100%", width: "100%" }} />
            </div>

            {/* Provider Disclaimer */}
            <div className="d-flex justify-content-between align-items-center mt-2 px-1">
                <small className="text-muted" style={{ fontSize: "11px" }}>
                    ℹ️ {routeData?.disclaimer || "AI-powered travel duration & OpenStreetMap road geometry."}
                </small>
                {routeData?.turnByTurnInstructions?.length > 0 && (
                    <button
                        type="button"
                        className="btn btn-link btn-sm p-0 text-decoration-none small fw-bold"
                        onClick={() => setShowSteps(!showSteps)}
                    >
                        {showSteps ? "▲ Hide Directions" : "▼ Step-by-Step Directions (" + routeData.turnByTurnInstructions.length + ")"}
                    </button>
                )}
            </div>

            {/* Step-by-Step Turn Instructions Accordion */}
            {showSteps && (
                <div className="mt-3 p-3 bg-light rounded-3 border" style={{ maxHeight: "280px", overflowY: "auto" }}>
                    {routeData?.legs?.length > 0 && (
                        <div className="mb-3">
                            <h6 className="fw-bold small text-dark mb-2">⏱️ Leg Durations:</h6>
                            <div className="d-flex flex-column gap-1">
                                {routeData.legs.map((leg, lIdx) => (
                                    <div key={lIdx} className="d-flex justify-content-between align-items-center bg-white p-2 rounded border small">
                                        <span><strong>{leg.fromStop}</strong> ➔ <strong>{leg.toStop}</strong> ({leg.distanceKm} km)</span>
                                        <span className="badge bg-secondary">{leg.formattedDuration || `${leg.durationMinutes} min`}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                    {routeData?.turnByTurnInstructions?.length > 0 && (
                        <>
                            <h6 className="fw-bold small text-dark mb-2">Detailed Route Instructions:</h6>
                            <div className="list-group list-group-flush">
                                {routeData.turnByTurnInstructions.map((step, idx) => (
                                    <div key={idx} className="step-instruction-item">
                                        <span className="badge bg-secondary rounded-pill" style={{ minWidth: "22px" }}>{idx + 1}</span>
                                        <span>{step}</span>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}
                </div>
            )}
        </div>
    );
}