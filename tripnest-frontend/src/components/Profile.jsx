import { useState, useEffect } from "react";
import Navbar from "./Navbar";
import Footer from "./Footer";
import API from "../services/api";

function Profile() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saveLoading, setSaveLoading] = useState(false);
    const [message, setMessage] = useState({ type: "", text: "" });

    // Profile Edit Form State
    const [profileData, setProfileData] = useState({
        name: "",
        email: "",
        age: "",
        phoneNumber: "",
        bio: "",
        travelPreferences: "",
        favoriteDestinations: "",
    });

    // Password Change State
    const [passwordData, setPasswordData] = useState({
        oldPassword: "",
        newPassword: "",
        confirmPassword: "",
    });
    const [passwordLoading, setPasswordLoading] = useState(false);

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            setLoading(true);
            const localUser = JSON.parse(localStorage.getItem("user") || "{}");
            const res = await API.get(`/users/profile?email=${encodeURIComponent(localUser.email || "")}`);
            const data = res.data;
            setUser(data);
            setProfileData({
                name: data.name || "",
                email: data.email || "",
                age: data.age || "",
                phoneNumber: data.phoneNumber || "",
                bio: data.bio || "",
                travelPreferences: data.travelPreferences || "Beach & Coastline, Hill Stations, Adventure",
                favoriteDestinations: data.favoriteDestinations || "Goa, Manali, Ooty",
            });
        } catch (error) {
            console.error("Fetch profile error:", error);
            const fallbackUser = JSON.parse(localStorage.getItem("user") || "{}");
            setUser(fallbackUser);
            setProfileData({
                name: fallbackUser.name || "",
                email: fallbackUser.email || "",
                age: fallbackUser.age || "",
                phoneNumber: fallbackUser.phoneNumber || "",
                bio: fallbackUser.bio || "",
                travelPreferences: fallbackUser.travelPreferences || "Beach & Coastline, Adventure",
                favoriteDestinations: fallbackUser.favoriteDestinations || "Goa, Manali",
            });
        } finally {
            setLoading(false);
        }
    };

    const handleProfileSubmit = async (e) => {
        e.preventDefault();
        try {
            setSaveLoading(true);
            setMessage({ type: "", text: "" });
            const payload = {
                ...user,
                ...profileData,
                age: profileData.age ? parseInt(profileData.age) : 0,
            };
            const res = await API.put("/users/profile", payload);
            setUser(res.data);
            localStorage.setItem("user", JSON.stringify(res.data));
            setMessage({ type: "success", text: "🎉 Profile updated successfully!" });
        } catch (error) {
            console.error("Update profile error:", error);
            setMessage({ type: "danger", text: "Failed to update profile. Please try again." });
        } finally {
            setSaveLoading(false);
        }
    };

    const handlePasswordChange = async (e) => {
        e.preventDefault();
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            setMessage({ type: "danger", text: "New passwords do not match!" });
            return;
        }
        if (passwordData.newPassword.length < 6) {
            setMessage({ type: "danger", text: "New password must be at least 6 characters long." });
            return;
        }

        try {
            setPasswordLoading(true);
            setMessage({ type: "", text: "" });
            const res = await API.put("/users/change-password", {
                email: user?.email,
                oldPassword: passwordData.oldPassword,
                newPassword: passwordData.newPassword,
            });

            if (res.data.status === "error") {
                setMessage({ type: "danger", text: res.data.message });
            } else {
                setMessage({ type: "success", text: "🔒 Password changed successfully!" });
                setPasswordData({ oldPassword: "", newPassword: "", confirmPassword: "" });
            }
        } catch (error) {
            console.error("Password change error:", error);
            setMessage({ type: "danger", text: "Error changing password. Ensure current password is correct." });
        } finally {
            setPasswordLoading(false);
        }
    };

    const preferenceOptions = [
        "Beach & Coastline", "Hill Stations", "Adventure & Trekking", 
        "Heritage & Palaces", "Wildlife & Safari", "Food & Culinary", 
        "Spiritual & Wellness", "Budget Backpacking", "Luxury Resorts"
    ];

    const togglePreference = (pref) => {
        const current = profileData.travelPreferences
            ? profileData.travelPreferences.split(",").map(p => p.trim()).filter(Boolean)
            : [];
        let updated;
        if (current.includes(pref)) {
            updated = current.filter(p => p !== pref);
        } else {
            updated = [...current, pref];
        }
        setProfileData({ ...profileData, travelPreferences: updated.join(", ") });
    };

    if (loading) {
        return (
            <div className="page-wrapper">
                <Navbar />
                <div className="container text-center py-5">
                    <div className="spinner-border text-primary" role="status"></div>
                    <p className="mt-2 text-muted">Loading profile settings...</p>
                </div>
                <Footer />
            </div>
        );
    }

    const currentPrefs = profileData.travelPreferences
        ? profileData.travelPreferences.split(",").map(p => p.trim()).filter(Boolean)
        : [];

    return (
        <div className="page-wrapper">
            <Navbar />

            <div className="container py-5 min-vh-100">
                <div className="row g-4">
                    {/* Left Column: Profile Card */}
                    <div className="col-lg-4">
                        <div className="card shadow-sm border-0 rounded-4 p-4 text-center mb-4">
                            <div className="mx-auto mb-3 d-flex align-items-center justify-content-center rounded-circle bg-primary text-white fs-1 fw-bold" style={{ width: "90px", height: "90px" }}>
                                {user?.name ? user.name.charAt(0).toUpperCase() : "👤"}
                            </div>
                            <h3 className="fw-bold mb-1">{user?.name || "Traveler"}</h3>
                            <p className="text-muted mb-2">{user?.email}</p>
                            <div>
                                <span className="badge bg-primary px-3 py-2 rounded-pill fs-6">
                                    {user?.role === "ROLE_ADMIN" ? "🛡️ Administrator" : user?.role === "ROLE_GROUP_ADMIN" ? "👥 Group Admin" : "🧳 Traveler"}
                                </span>
                            </div>

                            <hr className="my-4" />

                            <div className="text-start">
                                <h6 className="fw-bold text-muted text-uppercase small mb-3">Traveler Bio</h6>
                                <p className="text-secondary small mb-3">
                                    {user?.bio || "No bio added yet. Tell other travelers about your travel passions!"}
                                </p>

                                <h6 className="fw-bold text-muted text-uppercase small mb-2">Contact</h6>
                                <p className="small mb-1">📞 {user?.phoneNumber || "Not provided"}</p>
                                <p className="small mb-0">🎂 Age: {user?.age || "Not specified"}</p>
                            </div>
                        </div>

                        {/* Quick Stats */}
                        <div className="card shadow-sm border-0 rounded-4 p-4 bg-gradient-primary text-white">
                            <h5 className="fw-bold mb-3">🌴 Explorer Status</h5>
                            <div className="d-flex justify-content-between mb-2">
                                <span>Verified Member</span>
                                <strong>✅ Yes</strong>
                            </div>
                            <div className="d-flex justify-content-between mb-2">
                                <span>Favorite Spots</span>
                                <strong>{profileData.favoriteDestinations.split(",").length} Listed</strong>
                            </div>
                            <div className="d-flex justify-content-between">
                                <span>Travel Badges</span>
                                <strong>🌟 Globe Trotter</strong>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Edit Profile & Password */}
                    <div className="col-lg-8">
                        {message.text && (
                            <div className={`alert alert-${message.type} alert-dismissible fade show rounded-4 shadow-sm mb-4`} role="alert">
                                {message.text}
                                <button type="button" className="btn-close" onClick={() => setMessage({ type: "", text: "" })}></button>
                            </div>
                        )}

                        {/* Edit Profile Form */}
                        <div className="card shadow-sm border-0 rounded-4 p-4 p-md-5 mb-4">
                            <div className="d-flex justify-content-between align-items-center mb-4 pb-2 border-bottom">
                                <div>
                                    <h3 className="fw-bold mb-1">⚙️ Profile Settings</h3>
                                    <p className="text-muted mb-0 small">Update your personal details and travel preferences</p>
                                </div>
                            </div>

                            <form onSubmit={handleProfileSubmit}>
                                <div className="row g-3 mb-3">
                                    <div className="col-md-6">
                                        <label className="form-label fw-bold">Full Name</label>
                                        <input
                                            type="text"
                                            className="form-control form-control-lg"
                                            value={profileData.name}
                                            onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div className="col-md-6">
                                        <label className="form-label fw-bold">Email Address</label>
                                        <input
                                            type="email"
                                            className="form-control form-control-lg bg-light"
                                            value={profileData.email}
                                            disabled
                                        />
                                    </div>
                                </div>

                                <div className="row g-3 mb-3">
                                    <div className="col-md-6">
                                        <label className="form-label fw-bold">Age</label>
                                        <input
                                            type="number"
                                            className="form-control form-control-lg"
                                            value={profileData.age}
                                            onChange={(e) => setProfileData({ ...profileData, age: e.target.value })}
                                        />
                                    </div>
                                    <div className="col-md-6">
                                        <label className="form-label fw-bold">Phone Number</label>
                                        <input
                                            type="text"
                                            className="form-control form-control-lg"
                                            placeholder="+91 9876543210"
                                            value={profileData.phoneNumber}
                                            onChange={(e) => setProfileData({ ...profileData, phoneNumber: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div className="mb-3">
                                    <label className="form-label fw-bold">About You / Travel Bio</label>
                                    <textarea
                                        className="form-control"
                                        rows="3"
                                        placeholder="Share your travel experiences and wanderlust stories..."
                                        value={profileData.bio}
                                        onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                                    ></textarea>
                                </div>

                                <div className="mb-3">
                                    <label className="form-label fw-bold">Favorite Destinations (Comma Separated)</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        placeholder="e.g. Goa, Manali, Kerala Backwaters, Paris"
                                        value={profileData.favoriteDestinations}
                                        onChange={(e) => setProfileData({ ...profileData, favoriteDestinations: e.target.value })}
                                    />
                                </div>

                                <div className="mb-4">
                                    <label className="form-label fw-bold d-block">Travel Preferences & Interests</label>
                                    <div className="d-flex flex-wrap gap-2 mt-2">
                                        {preferenceOptions.map((pref) => {
                                            const isSelected = currentPrefs.includes(pref);
                                            return (
                                                <button
                                                    type="button"
                                                    key={pref}
                                                    className={`btn btn-sm rounded-pill px-3 py-1.5 transition ${isSelected ? "btn-primary text-white" : "btn-outline-secondary"}`}
                                                    onClick={() => togglePreference(pref)}
                                                >
                                                    {isSelected ? "✓ " : "+ "}{pref}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>

                                <button type="submit" className="btn btn-primary btn-lg px-4" disabled={saveLoading}>
                                    {saveLoading ? "💾 Saving..." : "💾 Save Profile Changes"}
                                </button>
                            </form>
                        </div>

                        {/* Change Password Form */}
                        <div className="card shadow-sm border-0 rounded-4 p-4 p-md-5">
                            <h4 className="fw-bold mb-2">🔒 Change Password</h4>
                            <p className="text-muted small mb-4">Ensure your account uses a secure password</p>

                            <form onSubmit={handlePasswordChange}>
                                <div className="mb-3">
                                    <label className="form-label fw-bold">Current Password</label>
                                    <input
                                        type="password"
                                        className="form-control"
                                        placeholder="Enter current password"
                                        value={passwordData.oldPassword}
                                        onChange={(e) => setPasswordData({ ...passwordData, oldPassword: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="row g-3 mb-4">
                                    <div className="col-md-6">
                                        <label className="form-label fw-bold">New Password</label>
                                        <input
                                            type="password"
                                            className="form-control"
                                            placeholder="Min 6 characters"
                                            value={passwordData.newPassword}
                                            onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div className="col-md-6">
                                        <label className="form-label fw-bold">Confirm New Password</label>
                                        <input
                                            type="password"
                                            className="form-control"
                                            placeholder="Re-enter new password"
                                            value={passwordData.confirmPassword}
                                            onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                                            required
                                        />
                                    </div>
                                </div>
                                <button type="submit" className="btn btn-dark btn-lg px-4" disabled={passwordLoading}>
                                    {passwordLoading ? "Updating..." : "Update Password"}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>

            <Footer />
        </div>
    );
}

export default Profile;
