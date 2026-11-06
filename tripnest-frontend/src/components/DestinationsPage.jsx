import { Link } from "react-router-dom";
import Navbar from "./Navbar";
import Destinations from "./Destinations";
import Footer from "./Footer";

function DestinationsPage() {
    return (
        <div className="page-wrapper">
            <Navbar />
            <div className="container py-5 min-vh-100">
                <div className="text-center mb-5">
                    <span className="badge bg-primary px-3 py-2 rounded-pill mb-2">Explore the World</span>
                    <h1 className="display-4 fw-bold">Popular Destinations Catalog</h1>
                    <p className="lead text-muted max-w-600 mx-auto">
                        Browse top-rated vacation spots, hill stations, and cultural cities with estimated budgets and travel recommendations.
                    </p>
                    <div className="mt-3">
                        <Link to="/recommendations" className="btn btn-primary rounded-pill px-4 py-2 fw-bold shadow-sm">
                            ✨ Find Personalized AI Matches &rarr;
                        </Link>
                    </div>
                </div>

                <Destinations />
            </div>
            <Footer />
        </div>
    );
}

export default DestinationsPage;