import { useEffect, useState } from "react";
import API from "../services/api";
import "../styles/MyTrips.css";

function MyTrips() {

    const [trips, setTrips] = useState([]);

    useEffect(() => {
        fetchTrips();
    }, []);

    const fetchTrips = async () => {

        try {

            const response = await API.get("/trips/all");

            setTrips(response.data);

        } catch (error) {

            console.error(error);

            alert("Failed to load trips!");

        }

    };

    return (

        <div className="container mt-5">

            <h2 className="text-center text-primary mb-4">
                🧳 My Trips
            </h2>

            <div className="row">

                {trips.length === 0 ? (

                    <h4 className="text-center">
                        No Trips Found
                    </h4>

                ) : (

                    trips.map((trip) => (

                        <div
                            className="col-md-6 mb-4"
                            key={trip.id}
                        >

                            <div className="trip-box">

                                <h4>{trip.destination}</h4>

                                <p>
                                    <strong>From:</strong> {trip.fromLocation}
                                </p>

                                <p>
                                    <strong>Start Date:</strong> {trip.startDate}
                                </p>

                                <p>
                                    <strong>End Date:</strong> {trip.endDate}
                                </p>

                                <p>
                                    <strong>Travellers:</strong> {trip.travellers}
                                </p>

                                <p>
                                    <strong>Budget:</strong> ₹{trip.budget}
                                </p>

                            </div>

                        </div>

                    ))

                )}

            </div>

        </div>

    );
}

export default MyTrips;