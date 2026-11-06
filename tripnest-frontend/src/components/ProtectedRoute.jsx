import { Navigate } from "react-router-dom";

function ProtectedRoute({ children, requiredRole }) {
    const token = localStorage.getItem("token");
    const userStr = localStorage.getItem("user");

    // 1. Strict Authentication Check: Must have token and user in localStorage
    if (!token || !userStr) {
        return <Navigate to="/" replace />;
    }

    let user = null;
    try {
        user = JSON.parse(userStr);
    } catch (e) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        return <Navigate to="/" replace />;
    }

    // 2. Token Expiration Validation
    try {
        const payloadBase64 = token.split(".")[1];
        if (payloadBase64) {
            const payload = JSON.parse(atob(payloadBase64));
            if (payload.exp && payload.exp * 1000 < Date.now()) {
                localStorage.removeItem("token");
                localStorage.removeItem("user");
                return <Navigate to="/?session=expired" replace />;
            }
        }
    } catch (e) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        return <Navigate to="/" replace />;
    }

    // 3. Role-Based Authorisation Check
    if (requiredRole) {
        const userRole = user.role ? (user.role.startsWith("ROLE_") ? user.role : `ROLE_${user.role}`) : "ROLE_TRAVELER";
        const targetRole = requiredRole.startsWith("ROLE_") ? requiredRole : `ROLE_${requiredRole}`;

        if (userRole !== targetRole) {
            console.warn(`Access Denied: Requires ${targetRole}, but user has ${userRole}`);
            return <Navigate to="/dashboard" replace />;
        }
    }

    return children;
}

export default ProtectedRoute;