import { useState } from "react";
import "../styles/SearchBar.css";

function SearchBar() {
    const [search, setSearch] = useState("");

    const handleSearch = () => {
        if (search.trim() === "") {
            alert("Please enter a destination.");
        } else {
            alert(`Searching for: ${search}`);
        }
    };

    return (
        <div className="search-container">
            <h2>🔍 Search Your Dream Destination</h2>

            <div className="search-box">
                <input
                    type="text"
                    placeholder="Enter destination..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />

                <button onClick={handleSearch}>
                    Search
                </button>
            </div>
        </div>
    );
}

export default SearchBar;