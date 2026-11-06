import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API from "../services/api";
import "../styles/Destinations.css";

function Destinations() {
    const [destinations, setDestinations] = useState([]);
    const [loading, setLoading] = useState(true);

    const fallbackDestinations = [
        {
            id: 1,
            name: "Goa",
            country: "India",
            imageUrl: "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=600",
            description: "Beautiful beaches, water sports, and vibrant nightlife.",
            category: "Beach & Nightlife"
        },
        {
            id: 2,
            name: "Ooty",
            country: "India",
            imageUrl: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=600",
            description: "Queen of Hill Stations with tea gardens and cool mountain breezes.",
            category: "Hill Station"
        },
        {
            id: 3,
            name: "Manali",
            country: "India",
            imageUrl: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600",
            description: "Snow mountains, paragliding, and Himalayan adventure sports.",
            category: "Adventure & Snow"
        }
    ];

    useEffect(() => {
        fetchDestinations();
    }, []);

    const fetchDestinations = async () => {
        try {
            setLoading(true);
            const res = await API.get("/destinations/all");
            if (res.data && res.data.length > 0) {
                setDestinations(res.data);
            } else {
                setDestinations(fallbackDestinations);
            }
        } catch (error) {
            console.error("Error fetching destinations:", error);
            setDestinations(fallbackDestinations);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="text-center py-4">
                <div className="spinner-border text-primary"></div>
                <p className="mt-2 text-muted">Loading popular destinations...</p>
            </div>
        );
    }

    return (
        <div className="destinations-container">
            <div className="destination-grid">
                {destinations.map((place, index) => (
                    <div className="destination-card shadow-sm" key={place.id || index}>
                        <div className="card-image-wrapper">
                            <img
                                src={place.imageUrl || place.image || "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=600"}
                                alt={place.name}
                                className="card-img"
                            />
                            {place.category && (
                                <span className="category-tag">{place.category}</span>
                            )}
                        </div>

                        <div className="card-content p-3">
                            <h3 className="place-title">{place.name}</h3>
                            <p className="place-desc text-muted">{place.description}</p>

                            <div className="d-flex justify-content-between align-items-center mt-3">
                                <Link to={`/destination/${place.name}`}>
                                    <button className="btn btn-primary btn-sm">Explore Details ➡️</button>
                                </Link>
                                <Link to={`/plan-trip?destination=${encodeURIComponent(place.name)}`}>
                                    <button className="btn btn-outline-success btn-sm">✈️ Plan Trip</button>
                                </Link>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default Destinations;