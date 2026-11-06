import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import API from "../services/api";
import Navbar from "./Navbar";
import Footer from "./Footer";
import "../styles/DestinationDetails.css";

function DestinationDetails() {
    const { name } = useParams();
    const navigate = useNavigate();
    const [destination, setDestination] = useState(null);
    const [loading, setLoading] = useState(true);

    const fallbackData = {
        Goa: {
            name: "Goa",
            country: "India",
            category: "Beach & Nightlife",
            description: "Famous for pristine sandy beaches, vibrant nightlife, water sports, and Portuguese colonial architecture.",
            bestTimeToVisit: "November – February",
            estimatedBudget: "₹15,000 – ₹35,000",
            imageUrl: "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=800",
            attractions: ["Calangute & Baga Beaches", "Dudsagar Waterfalls", "Fort Aguada", "Scuba Diving & Water Sports"]
        },
        Ooty: {
            name: "Ooty",
            country: "India",
            category: "Hill Station & Nature",
            description: "Known as the Queen of Hill Stations, featuring serene tea gardens, Nilgiri Toy Train, and lush botanical gardens.",
            bestTimeToVisit: "October – June",
            estimatedBudget: "₹10,000 – ₹25,000",
            imageUrl: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=800",
            attractions: ["Ooty Lake & Boating", "Botanical Gardens", "Nilgiri Mountain Railway", "Doddabetta Peak"]
        },
        Manali: {
            name: "Manali",
            country: "India",
            category: "Adventure & Mountains",
            description: "High-altitude Himalayan resort town known for snow-capped mountain vistas, paragliding, and Solang Valley adventures.",
            bestTimeToVisit: "October – June",
            estimatedBudget: "₹20,000 – ₹45,000",
            imageUrl: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800",
            attractions: ["Solang Valley Paragliding", "Rohtang Pass", "Hadimba Temple", "Old Manali Cafes"]
        },
        "Kerala Backwaters": {
            name: "Kerala Backwaters",
            country: "India",
            category: "Relaxation & Culture",
            description: "Experience tranquil houseboat cruises through palm-fringed backwaters, spice plantations, and Ayurvedic wellness.",
            bestTimeToVisit: "September – March",
            estimatedBudget: "₹18,000 – ₹40,000",
            imageUrl: "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=800",
            attractions: ["Alleppey Houseboat Cruise", "Vembanad Lake", "Kumarakom Bird Sanctuary", "Ayurvedic Spa Treatments"]
        },
        Jaipur: {
            name: "Jaipur",
            country: "India",
            category: "Heritage & Culture",
            description: "The iconic Pink City featuring majestic palaces like Hawa Mahal, Amer Fort, vibrant bazaars, and royal heritage.",
            bestTimeToVisit: "October – March",
            estimatedBudget: "₹12,000 – ₹30,000",
            imageUrl: "https://images.unsplash.com/photo-1477587458883-47145ed94245?w=800",
            attractions: ["Hawa Mahal", "Amer Fort", "City Palace", "Johari Bazaar Shopping"]
        }
    };

    useEffect(() => {
        fetchDestinationDetails();
    }, [name]);

    const fetchDestinationDetails = async () => {
        try {
            setLoading(true);
            const res = await API.get("/destinations/all");
            if (res.data && res.data.length > 0) {
                const found = res.data.find(
                    (d) => d.name?.toLowerCase() === name?.toLowerCase()
                );
                if (found) {
                    setDestination({
                        ...found,
                        attractions: fallbackData[found.name]?.attractions || [
                            "Local Sightseeing & Markets",
                            "Famous Cultural Spots",
                            "Scenic Viewpoints & Parks"
                        ]
                    });
                    setLoading(false);
                    return;
                }
            }
            // Fallback lookup
            if (fallbackData[name]) {
                setDestination(fallbackData[name]);
            } else {
                setDestination({
                    name: name,
                    country: "World Destination",
                    category: "Vacation Spot",
                    description: `Explore the vibrant culture, scenery, local cuisine, and heritage of ${name}.`,
                    bestTimeToVisit: "October – April",
                    estimatedBudget: "₹15,000 – ₹35,000",
                    imageUrl: "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=800",
                    attractions: ["Historic Landmarks", "City Center & Bazaars", "Natural Vistas"]
                });
            }
        } catch (error) {
            console.error("Error fetching destination:", error);
            if (fallbackData[name]) {
                setDestination(fallbackData[name]);
            }
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="page-wrapper">
                <Navbar />
                <div className="container text-center py-5">
                    <div className="spinner-border text-primary"></div>
                    <p className="mt-2 text-muted">Loading destination highlights...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="page-wrapper">
            <Navbar />

            <div className="container py-5">
                <div className="row justify-content-center">
                    <div className="col-lg-10">
                        <div className="card shadow-lg border-0 rounded-4 overflow-hidden">
                            {/* Hero Header Image */}
                            <div className="destination-hero-wrapper position-relative">
                                <img
                                    src={destination?.imageUrl || "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=800"}
                                    alt={destination?.name}
                                    className="w-100 destination-hero-img"
                                />
                                <div className="destination-hero-overlay p-4 p-md-5 d-flex flex-column justify-content-end">
                                    <span className="badge bg-primary fs-6 mb-2 align-self-start">
                                        {destination?.category}
                                    </span>
                                    <h1 className="display-4 fw-bold text-white mb-0">{destination?.name}</h1>
                                    <p className="lead text-white-50 mb-0">📍 {destination?.country}</p>
                                </div>
                            </div>

                            {/* Body Content */}
                            <div className="card-body p-4 p-md-5">
                                <div className="row g-4">
                                    <div className="col-lg-8">
                                        <h3 className="fw-bold text-primary mb-3">About Destination</h3>
                                        <p className="lead text-secondary">{destination?.description}</p>

                                        <h4 className="fw-bold mt-4 mb-3">🌟 Top Attractions & Highlights</h4>
                                        <div className="row g-3 mb-4">
                                            {destination?.attractions?.map((spot, index) => (
                                                <div className="col-md-6" key={index}>
                                                    <div className="p-3 rounded-3 bg-light border d-flex align-items-center gap-3">
                                                        <span className="fs-4">📍</span>
                                                        <span className="fw-bold text-dark">{spot}</span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>

                                        {/* Travel Guide & Insider Tips (Milestone 2) */}
                                        <h4 className="fw-bold mb-3">🧭 Essential Travel Guide & Tips</h4>
                                        <div className="card border-0 bg-light rounded-4 p-4 mb-4">
                                            <div className="row g-3">
                                                <div className="col-md-6">
                                                    <h6 className="fw-bold text-primary mb-1">🎒 What to Pack</h6>
                                                    <p className="small text-muted mb-0">
                                                        {destination?.category?.includes("Beach") 
                                                            ? "Sunscreen SPF 50+, swimwear, breathable linen wear, flip-flops, sunglasses."
                                                            : destination?.category?.includes("Mountain") || destination?.category?.includes("Hill")
                                                            ? "Warm layered jackets, thermal inners, trekking boots, rain poncho, lip balm."
                                                            : "Comfortable walking sneakers, light cotton outfits, camera, power bank."}
                                                    </p>
                                                </div>
                                                <div className="col-md-6">
                                                    <h6 className="fw-bold text-primary mb-1">🍲 Local Cuisine to Try</h6>
                                                    <p className="small text-muted mb-0">
                                                        {destination?.name === "Goa" ? "Goan Fish Curry, Bebinca, Prawn Balchão, Feni cocktail."
                                                            : destination?.name === "Manali" ? "Siddu with ghee, Trout fish, Thukpa, Momos, Babru."
                                                            : destination?.name === "Ooty" ? "Homemade chocolates, Nilgiri tea, Varkey pastry, South Indian thali."
                                                            : destination?.name === "Jaipur" ? "Dal Baati Churma, Ghewar, Pyaaz Kachori, Laal Maas."
                                                            : "Traditional regional delicacies, street food stalls, fresh herbal teas."}
                                                    </p>
                                                </div>
                                                <div className="col-md-6">
                                                    <h6 className="fw-bold text-primary mb-1">🚌 Getting Around</h6>
                                                    <p className="small text-muted mb-0">
                                                        Rented scooters, local app-based cabs, self-drive rentals, and guided local autorickshaws.
                                                    </p>
                                                </div>
                                                <div className="col-md-6">
                                                    <h6 className="fw-bold text-primary mb-1">🤝 Cultural Etiquette</h6>
                                                    <p className="small text-muted mb-0">
                                                        Dress modestly when visiting heritage temples & spiritual shrines. Remove footwear before entering.
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="col-lg-4">
                                        {/* Weather Widget (Milestone 2) */}
                                        <div className="p-4 rounded-4 bg-white border shadow-sm mb-4">
                                            <div className="d-flex justify-content-between align-items-center mb-2">
                                                <h6 className="fw-bold mb-0">⛅ Weather Forecast</h6>
                                                <span className="badge bg-primary text-white">Live API</span>
                                            </div>
                                            <div className="d-flex align-items-center gap-3 my-2">
                                                <span className="display-4">
                                                    {destination?.category?.includes("Beach") ? "🏖️" : destination?.category?.includes("Mountain") ? "🏔️" : "🌤️"}
                                                </span>
                                                <div>
                                                    <h3 className="fw-bold mb-0">
                                                        {destination?.category?.includes("Mountain") ? "14°C" : destination?.category?.includes("Beach") ? "29°C" : "24°C"}
                                                    </h3>
                                                    <span className="text-muted small">
                                                        {destination?.category?.includes("Mountain") ? "Crisp Mountain Breeze" : "Sunny & Coastal Warmth"}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="d-flex justify-content-between small text-muted border-top pt-2">
                                                <span>Humidity: 58%</span>
                                                <span>Wind: 14 km/h</span>
                                            </div>
                                        </div>
                                        <div className="p-4 rounded-4 bg-light border shadow-sm">
                                            <h5 className="fw-bold mb-3 text-dark">💡 Travel Quick Specs</h5>

                                            <div className="mb-3">
                                                <small className="text-muted text-uppercase fw-bold d-block">Best Time to Visit</small>
                                                <span className="fs-6 fw-bold text-dark">🗓️ {destination?.bestTimeToVisit}</span>
                                            </div>

                                            <div className="mb-4">
                                                <small className="text-muted text-uppercase fw-bold d-block">Estimated Budget Range</small>
                                                <span className="fs-5 fw-bold text-success">💰 {destination?.estimatedBudget}</span>
                                            </div>

                                            <button
                                                className="btn btn-primary btn-lg w-100 py-3 fw-bold rounded-3 shadow mb-3"
                                                onClick={() => navigate(`/plan-trip?destination=${encodeURIComponent(destination?.name)}`)}
                                            >
                                                ✈️ Plan Trip to {destination?.name}
                                            </button>

                                            <Link to="/destinations" className="btn btn-outline-secondary w-100">
                                                ⬅️ Back to Catalog
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <Footer />
        </div>
    );
}

export default DestinationDetails;