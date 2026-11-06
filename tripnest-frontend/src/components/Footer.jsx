import "../styles/Footer.css";

function Footer() {
    return (
        <footer className="footer">
            <div className="footer-content">
                <h2>TripNest</h2>
                <p>Your Travel Partner</p>

                <div className="footer-links">
                    <a href="#">Home</a>
                    <a href="#">Destinations</a>
                    <a href="#">Trip Planner</a>
                    <a href="#">Login</a>
                </div>

                <p className="copyright">
                    © 2026 TripNest. All Rights Reserved.
                </p>
            </div>
        </footer>
    );
}

export default Footer;