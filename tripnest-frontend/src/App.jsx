import AiTripPlanner from "./components/AiTripPlanner";
import AiBudgetAssistant from "./components/AiBudgetAssistant";
import AiDestinationRecommendations from "./components/AiDestinationRecommendations";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "./components/Login";
import Signup from "./components/Signup";
import Dashboard from "./components/Dashboard";
import MyTripsPage from "./components/MyTripsPage";
import TripDetailsPage from "./components/TripDetailsPage";
import TripPlan from "./components/TripPlan";
import DestinationsPage from "./components/DestinationsPage";
import DestinationDetails from "./components/DestinationDetails";
import Profile from "./components/Profile";
import AnalyticsDashboard from "./components/AnalyticsDashboard";
import AdminDashboard from "./components/AdminDashboard";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
    return (
        <BrowserRouter>
            <Routes>
                {/* Public Auth Routes */}
                <Route path="/" element={<Login />} />
                <Route path="/signup" element={<Signup />} />

                {/* Core Traveler Routes */}
                <Route
                    path="/dashboard"
                    element={
                        <ProtectedRoute>
                            <Dashboard />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/my-trips"
                    element={
                        <ProtectedRoute>
                            <MyTripsPage />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/trip/:id"
                    element={
                        <ProtectedRoute>
                            <TripDetailsPage />
                        </ProtectedRoute>
                    }
                />

                
                {/* AI Features Routes */}
                <Route
                    path="/ai-planner"
                    element={
                        <ProtectedRoute>
                            <AiTripPlanner />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/budget-assistant"
                    element={
                        <ProtectedRoute>
                            <AiBudgetAssistant />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/recommendations"
                    element={
                        <ProtectedRoute>
                            <AiDestinationRecommendations />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/plan-trip"
                    element={
                        <ProtectedRoute>
                            <TripPlan />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/destinations"
                    element={
                        <ProtectedRoute>
                            <DestinationsPage />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/destination/:name"
                    element={
                        <ProtectedRoute>
                            <DestinationDetails />
                        </ProtectedRoute>
                    }
                />

                {/* Milestone 1 & 4 Profile Management */}
                <Route
                    path="/profile"
                    element={
                        <ProtectedRoute>
                            <Profile />
                        </ProtectedRoute>
                    }
                />

                {/* Milestone 4 Analytics Dashboard */}
                <Route
                    path="/analytics"
                    element={
                        <ProtectedRoute>
                            <AnalyticsDashboard />
                        </ProtectedRoute>
                    }
                />

                {/* Milestone 4 Admin Dashboard */}
                <Route
                    path="/admin" element={<ProtectedRoute requiredRole="ROLE_ADMIN"><AdminDashboard /></ProtectedRoute>}
                />
            </Routes>
        </BrowserRouter>
    );
}

export default App;