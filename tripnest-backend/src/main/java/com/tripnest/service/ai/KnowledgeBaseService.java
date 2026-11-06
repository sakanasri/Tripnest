package com.tripnest.service.ai;

import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class KnowledgeBaseService {

    public static class DestinationInfo {
        private String name;
        private String country;
        private String climate;
        private String category;
        private List<String> interests;
        private double latitude;
        private double longitude;
        private String bestTimeToVisit;
        private String estimatedBudget;
        private String imageUrl;
        private String description;
        private List<AttractionInfo> attractions = new ArrayList<>();

        public DestinationInfo(String name, String country, String climate, String category,
                               List<String> interests, double latitude, double longitude,
                               String bestTimeToVisit, String estimatedBudget, String imageUrl, String description) {
            this.name = name;
            this.country = country;
            this.climate = climate;
            this.category = category;
            this.interests = interests;
            this.latitude = latitude;
            this.longitude = longitude;
            this.bestTimeToVisit = bestTimeToVisit;
            this.estimatedBudget = estimatedBudget;
            this.imageUrl = imageUrl;
            this.description = description;
        }

        public String getName() { return name; }
        public String getCountry() { return country; }
        public String getClimate() { return climate; }
        public String getCategory() { return category; }
        public List<String> getInterests() { return interests; }
        public double getLatitude() { return latitude; }
        public double getLongitude() { return longitude; }
        public String getBestTimeToVisit() { return bestTimeToVisit; }
        public String getEstimatedBudget() { return estimatedBudget; }
        public String getImageUrl() { return imageUrl; }
        public String getDescription() { return description; }
        public List<AttractionInfo> getAttractions() { return attractions; }
        public void addAttraction(AttractionInfo a) { this.attractions.add(a); }
    }

    public static class AttractionInfo {
        private String name;
        private String type;
        private String timeSlot;
        private int durationMinutes;
        private double estimatedCostInr;
        private String notes;
        private double latitude;
        private double longitude;

        public AttractionInfo(String name, String type, String timeSlot, int durationMinutes,
                              double estimatedCostInr, String notes, double latitude, double longitude) {
            this.name = name;
            this.type = type;
            this.timeSlot = timeSlot;
            this.durationMinutes = durationMinutes;
            this.estimatedCostInr = estimatedCostInr;
            this.notes = notes;
            this.latitude = latitude;
            this.longitude = longitude;
        }

        public String getName() { return name; }
        public String getType() { return type; }
        public String getTimeSlot() { return timeSlot; }
        public int getDurationMinutes() { return durationMinutes; }
        public double getEstimatedCostInr() { return estimatedCostInr; }
        public String getNotes() { return notes; }
        public double getLatitude() { return latitude; }
        public double getLongitude() { return longitude; }
    }

    private final Map<String, DestinationInfo> destinations = new LinkedHashMap<>();
    private final Map<String, double[]> cityCoordinates = new HashMap<>();

    public KnowledgeBaseService() {
        initCoordinates();
        initDestinations();
    }

    private void initCoordinates() {
        // Tamil Nadu
        cityCoordinates.put("chennai", new double[]{13.0827, 80.2707});
        cityCoordinates.put("coimbatore", new double[]{11.0168, 76.9558});
        cityCoordinates.put("madurai", new double[]{9.9252, 78.1198});
        cityCoordinates.put("trichy", new double[]{10.7905, 78.7047});
        cityCoordinates.put("tiruchirappalli", new double[]{10.7905, 78.7047});
        cityCoordinates.put("salem", new double[]{11.6643, 78.1460});
        cityCoordinates.put("tirunelveli", new double[]{8.7139, 77.7567});
        cityCoordinates.put("tiruppur", new double[]{11.1085, 77.3411});
        cityCoordinates.put("tirupur", new double[]{11.1085, 77.3411});
        cityCoordinates.put("erode", new double[]{11.3410, 77.7172});
        cityCoordinates.put("vellore", new double[]{12.9165, 79.1325});
        cityCoordinates.put("thanjavur", new double[]{10.7870, 79.1378});
        cityCoordinates.put("tanjore", new double[]{10.7870, 79.1378});
        cityCoordinates.put("dindigul", new double[]{10.3673, 77.9803});
        cityCoordinates.put("hosur", new double[]{12.7409, 77.8253});
        cityCoordinates.put("kanyakumari", new double[]{8.0883, 77.5385});
        cityCoordinates.put("rameswaram", new double[]{9.2876, 79.3129});
        cityCoordinates.put("kodaikanal", new double[]{10.2381, 77.4892});
        cityCoordinates.put("ooty", new double[]{11.4102, 76.6950});
        cityCoordinates.put("udagamandalam", new double[]{11.4102, 76.6950});
        cityCoordinates.put("coonoor", new double[]{11.3530, 76.7959});
        cityCoordinates.put("pondicherry", new double[]{11.9416, 79.8083});
        cityCoordinates.put("puducherry", new double[]{11.9416, 79.8083});

        // Karnataka
        cityCoordinates.put("bangalore", new double[]{12.9716, 77.5946});
        cityCoordinates.put("bengaluru", new double[]{12.9716, 77.5946});
        cityCoordinates.put("mysore", new double[]{12.2958, 76.6394});
        cityCoordinates.put("mysuru", new double[]{12.2958, 76.6394});
        cityCoordinates.put("mangalore", new double[]{12.9141, 74.8560});
        cityCoordinates.put("mangaluru", new double[]{12.9141, 74.8560});
        cityCoordinates.put("coorg", new double[]{12.4244, 75.7382});
        cityCoordinates.put("madikeri", new double[]{12.4244, 75.7382});
        cityCoordinates.put("hampi", new double[]{15.3350, 76.4600});
        cityCoordinates.put("hubli", new double[]{15.3647, 75.1240});
        cityCoordinates.put("belgaum", new double[]{15.8497, 74.4977});
        cityCoordinates.put("udupi", new double[]{13.3409, 74.7421});
        cityCoordinates.put("chikmagalur", new double[]{13.3161, 75.7720});
        cityCoordinates.put("gokarna", new double[]{14.5479, 74.3188});

        // Kerala
        cityCoordinates.put("kochi", new double[]{9.9312, 76.2673});
        cityCoordinates.put("cochin", new double[]{9.9312, 76.2673});
        cityCoordinates.put("trivandrum", new double[]{8.5241, 76.9366});
        cityCoordinates.put("thiruvananthapuram", new double[]{8.5241, 76.9366});
        cityCoordinates.put("munnar", new double[]{10.0889, 77.0595});
        cityCoordinates.put("alleppey", new double[]{9.4981, 76.3388});
        cityCoordinates.put("alappuzha", new double[]{9.4981, 76.3388});
        cityCoordinates.put("kerala", new double[]{9.4981, 76.3388});
        cityCoordinates.put("kerala backwaters", new double[]{9.4981, 76.3388});
        cityCoordinates.put("kozhikode", new double[]{11.2588, 75.7804});
        cityCoordinates.put("calicut", new double[]{11.2588, 75.7804});
        cityCoordinates.put("wayanad", new double[]{11.6854, 76.1320});
        cityCoordinates.put("varkala", new double[]{8.7379, 76.7163});

        // Andhra Pradesh & Telangana
        cityCoordinates.put("hyderabad", new double[]{17.3850, 78.4867});
        cityCoordinates.put("visakhapatnam", new double[]{17.6868, 83.2185});
        cityCoordinates.put("vizag", new double[]{17.6868, 83.2185});
        cityCoordinates.put("vijayawada", new double[]{16.5062, 80.6480});
        cityCoordinates.put("tirupati", new double[]{13.6288, 79.4192});
        cityCoordinates.put("warangal", new double[]{17.9689, 79.5941});

        // Goa & Maharashtra
        cityCoordinates.put("goa", new double[]{15.2993, 74.1240});
        cityCoordinates.put("panaji", new double[]{15.4909, 73.8278});
        cityCoordinates.put("mumbai", new double[]{19.0760, 72.8777});
        cityCoordinates.put("bombay", new double[]{19.0760, 72.8777});
        cityCoordinates.put("pune", new double[]{18.5204, 73.8567});
        cityCoordinates.put("nagpur", new double[]{21.1458, 79.0882});
        cityCoordinates.put("nashik", new double[]{19.9975, 73.7898});
        cityCoordinates.put("shirdi", new double[]{19.7645, 74.4762});
        cityCoordinates.put("mahabaleshwar", new double[]{17.9237, 73.6586});
        cityCoordinates.put("lonavala", new double[]{18.7557, 73.4091});

        // Northern & Central India
        cityCoordinates.put("delhi", new double[]{28.6139, 77.2090});
        cityCoordinates.put("new delhi", new double[]{28.6139, 77.2090});
        cityCoordinates.put("noida", new double[]{28.5355, 77.3910});
        cityCoordinates.put("gurgaon", new double[]{28.4595, 77.0266});
        cityCoordinates.put("gurugram", new double[]{28.4595, 77.0266});
        cityCoordinates.put("jaipur", new double[]{26.9124, 75.7873});
        cityCoordinates.put("udaipur", new double[]{24.5854, 73.7125});
        cityCoordinates.put("jodhpur", new double[]{26.2389, 73.0243});
        cityCoordinates.put("jaisalmer", new double[]{26.9157, 70.9083});
        cityCoordinates.put("agra", new double[]{27.1767, 78.0081});
        cityCoordinates.put("varanasi", new double[]{25.3176, 82.9739});
        cityCoordinates.put("kashi", new double[]{25.3176, 82.9739});
        cityCoordinates.put("lucknow", new double[]{26.8467, 80.9462});
        cityCoordinates.put("kanpur", new double[]{26.4499, 80.3319});
        cityCoordinates.put("amritsar", new double[]{31.6340, 74.8723});
        cityCoordinates.put("chandigarh", new double[]{30.7333, 76.7794});
        cityCoordinates.put("manali", new double[]{32.2432, 77.1892});
        cityCoordinates.put("shimla", new double[]{31.1048, 77.1734});
        cityCoordinates.put("dharamshala", new double[]{32.2190, 76.3234});
        cityCoordinates.put("mcleodganj", new double[]{32.2426, 76.3213});
        cityCoordinates.put("rishikesh", new double[]{30.0869, 78.2676});
        cityCoordinates.put("haridwar", new double[]{29.9457, 78.1642});
        cityCoordinates.put("dehradun", new double[]{30.3165, 78.0322});
        cityCoordinates.put("mussoorie", new double[]{30.4598, 78.0644});
        cityCoordinates.put("nainital", new double[]{29.3919, 79.4542});
        cityCoordinates.put("ladakh", new double[]{34.1526, 77.5771});
        cityCoordinates.put("leh", new double[]{34.1526, 77.5771});
        cityCoordinates.put("srinagar", new double[]{34.0837, 74.7973});
        cityCoordinates.put("bhopal", new double[]{23.2599, 77.4126});
        cityCoordinates.put("indore", new double[]{22.7196, 75.8577});

        // Gujarat & East & Northeast
        cityCoordinates.put("ahmedabad", new double[]{23.0225, 72.5714});
        cityCoordinates.put("surat", new double[]{21.1702, 72.8311});
        cityCoordinates.put("kolkata", new double[]{22.5726, 88.3639});
        cityCoordinates.put("darjeeling", new double[]{27.0410, 88.2663});
        cityCoordinates.put("gangtok", new double[]{27.3389, 88.6065});
        cityCoordinates.put("shillong", new double[]{25.5788, 91.8933});
        cityCoordinates.put("guwahati", new double[]{26.1445, 91.7362});
        cityCoordinates.put("bhubaneswar", new double[]{20.2961, 85.8245});
        cityCoordinates.put("puri", new double[]{19.8135, 85.8312});
        cityCoordinates.put("patna", new double[]{25.5941, 85.1376});
        cityCoordinates.put("ranchi", new double[]{23.3441, 85.3096});
        cityCoordinates.put("andaman", new double[]{11.6234, 92.7265});
        cityCoordinates.put("port blair", new double[]{11.6234, 92.7265});
        cityCoordinates.put("havelock", new double[]{11.9761, 92.9876});
    }

    private void initDestinations() {
        // 1. Goa - Beach & Nightlife
        DestinationInfo goa = new DestinationInfo(
                "Goa", "India", "Coastal / Beach", "Beach & Nightlife",
                Arrays.asList("Beaches", "Nightlife", "Water Sports", "Relaxation", "Food", "Shopping"),
                15.2993, 74.1240, "November - February", "Rs. 15,000 - Rs. 35,000",
                "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=600",
                "Famous for pristine sandy beaches, vibrant nightlife, water sports, and Portuguese colonial architecture."
        );
        goa.addAttraction(new AttractionInfo("Calangute & Baga Beach", "Beach & Water Sports", "Morning", 180, 500, "Parasailing, jet ski, sunbathing, beach shacks", 15.5439, 73.7553));
        goa.addAttraction(new AttractionInfo("Aguada Fort & Lighthouse", "Historical Sightseeing", "Afternoon", 120, 100, "17th-century Portuguese fortress with sweeping ocean views", 15.4925, 73.7736));
        goa.addAttraction(new AttractionInfo("Basilica of Bom Jesus", "Heritage & Culture", "Morning", 90, 50, "UNESCO World Heritage site holding mortal remains of St. Francis Xavier", 15.5009, 73.9116));
        goa.addAttraction(new AttractionInfo("Anjuna Flea Market", "Shopping & Vibes", "Evening", 120, 200, "Bohemian beachside flea market with handmade crafts, spices, and music", 15.5804, 73.7428));
        destinations.put("goa", goa);

        // 2. Ooty - Hill Station & Nature
        DestinationInfo ooty = new DestinationInfo(
                "Ooty", "India", "Cool / Mountain", "Hill Station & Nature",
                Arrays.asList("Nature", "Relaxation", "Sightseeing", "Food", "Hill Stations"),
                11.4102, 76.6950, "October - June", "Rs. 10,000 - Rs. 25,000",
                "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=600",
                "Known as the Queen of Hill Stations, featuring serene tea gardens, Nilgiri Toy Train, and lush botanical gardens."
        );
        ooty.addAttraction(new AttractionInfo("Government Botanical Garden", "Nature & Botanical", "Morning", 120, 80, "Lush 55-acre landscaped terraced gardens founded in 1848", 11.4172, 76.7112));
        ooty.addAttraction(new AttractionInfo("Ooty Lake & Boating", "Relaxation & Family", "Afternoon", 90, 250, "Scenic artificial lake with paddle boating and eucalyptus-lined paths", 11.4064, 76.6896));
        ooty.addAttraction(new AttractionInfo("Doddabetta Peak", "Mountain Viewpoint", "Morning", 120, 60, "Highest mountain peak in Nilgiri Hills at 2,637m with panoramic telescope view", 11.4011, 76.7360));
        ooty.addAttraction(new AttractionInfo("Nilgiri Mountain Railway (Toy Train)", "Heritage Ride", "Afternoon", 180, 200, "UNESCO World Heritage meter-gauge steam train traversing tunnels and bridges", 11.4070, 76.7020));
        destinations.put("ooty", ooty);

        // 3. Manali - Adventure & Mountains
        DestinationInfo manali = new DestinationInfo(
                "Manali", "India", "Cool / Mountain", "Adventure & Mountains",
                Arrays.asList("Adventure", "Nature", "Mountains", "Temples", "Trekking"),
                32.2432, 77.1892, "October - June", "Rs. 20,000 - Rs. 45,000",
                "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600",
                "High-altitude Himalayan resort town known for snow-capped mountain vistas, paragliding, and Solang Valley adventures."
        );
        manali.addAttraction(new AttractionInfo("Solang Valley", "Adventure Sports", "Morning", 240, 1500, "Hub for paragliding, zorbing, ATV quad biking, and skiing in winter", 32.3160, 77.1575));
        manali.addAttraction(new AttractionInfo("Hadimba Devi Temple", "Heritage & Temples", "Afternoon", 90, 50, "Pagoda-style wooden temple built in 1553 set amid towering deodar forests", 32.2483, 77.1802));
        manali.addAttraction(new AttractionInfo("Atal Tunnel & Sissu Valley", "Scenic Highway", "Morning", 240, 800, "World-record high-altitude tunnel leading to dramatic Lahaul landscapes", 32.4172, 77.1643));
        destinations.put("manali", manali);

        // 4. Kerala Backwaters - Relaxation & Tropical Nature
        DestinationInfo kerala = new DestinationInfo(
                "Kerala Backwaters", "India", "Tropical", "Relaxation & Nature",
                Arrays.asList("Nature", "Relaxation", "Food", "Culture", "Tropical"),
                9.4981, 76.3388, "September - March", "Rs. 18,000 - Rs. 40,000",
                "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=600",
                "Tranquil houseboat cruises through palm-fringed backwaters, spice plantations, and Ayurvedic wellness."
        );
        kerala.addAttraction(new AttractionInfo("Alleppey Houseboat Cruise", "Relaxation & Scenic", "Morning", 300, 3500, "Day cruise through palm-lined canals with traditional Keralite sadhya lunch", 9.4981, 76.3388));
        kerala.addAttraction(new AttractionInfo("Marari Beach", "Coastal & Serene", "Evening", 120, 100, "Quiet coconut-fringed white sand beach ideal for relaxation and sunset walks", 9.6015, 76.2995));
        destinations.put("kerala backwaters", kerala);
        destinations.put("kerala", kerala);

        // 5. Jaipur - Royal Heritage & Bazaars
        DestinationInfo jaipur = new DestinationInfo(
                "Jaipur", "India", "Heritage / Moderate", "Heritage & Culture",
                Arrays.asList("Heritage", "Historical places", "Shopping", "Food", "Sightseeing", "Culture"),
                26.9124, 75.7873, "October - March", "Rs. 12,000 - Rs. 30,000",
                "https://images.unsplash.com/photo-1477587458883-47145ed94245?w=600",
                "The iconic Pink City featuring majestic palaces like Hawa Mahal, Amer Fort, vibrant bazaars, and royal heritage."
        );
        jaipur.addAttraction(new AttractionInfo("Amer Fort & Palace", "Heritage & Architecture", "Morning", 210, 500, "Stunning hillside Rajput fortress with Sheesh Mahal (Mirror Palace)", 26.9855, 75.8513));
        jaipur.addAttraction(new AttractionInfo("Hawa Mahal (Palace of Winds)", "Sightseeing & Photo", "Morning", 60, 200, "Iconic pink sandstone facade featuring 953 ornate jharokhas", 26.9239, 75.8267));
        jaipur.addAttraction(new AttractionInfo("City Palace & Jantar Mantar", "Royal Heritage & Science", "Afternoon", 150, 400, "Living royal residence alongside UNESCO astronomical observatory", 26.9258, 75.8236));
        destinations.put("jaipur", jaipur);

        // 6. Varanasi - Temples & Spiritual Pilgrimage
        DestinationInfo varanasi = new DestinationInfo(
                "Varanasi", "India", "Heritage / Moderate", "Temples & Pilgrimage",
                Arrays.asList("Temples", "Historical places", "Culture", "Food", "Spiritual"),
                25.3176, 82.9739, "October - March", "Rs. 8,000 - Rs. 22,000",
                "https://images.unsplash.com/photo-1561361513-2d000a50f0dc?w=600",
                "One of the world's oldest living cities, celebrated for holy Ganga Ghats, sacred Kashi Vishwanath temple, and grand evening aarti."
        );
        varanasi.addAttraction(new AttractionInfo("Kashi Vishwanath Jyotirlinga Temple", "Temples & Spiritual", "Morning", 120, 100, "Sacred Shiva shrine and spiritual epicenter of India", 25.3109, 83.0107));
        varanasi.addAttraction(new AttractionInfo("Dashashwamedh Ghat Evening Aarti", "Culture & Devotion", "Evening", 90, 0, "Mesmerizing multi-priest synchronized fire ritual on the River Ganga", 25.3080, 83.0100));
        varanasi.addAttraction(new AttractionInfo("Sunrise Boat Ride on River Ganga", "Sightseeing & Peaceful", "Morning", 90, 300, "Peaceful morning rowing cruise along the ancient stone steps and palaces", 25.3050, 83.0080));
        destinations.put("varanasi", varanasi);

        // 7. Ladakh - High-Altitude Adventure & Monasteries
        DestinationInfo ladakh = new DestinationInfo(
                "Ladakh", "India", "Cool / Mountain", "Adventure & Mountains",
                Arrays.asList("Adventure", "Nature", "Mountains", "Temples", "Sightseeing"),
                34.1526, 77.5771, "May - September", "Rs. 25,000 - Rs. 60,000",
                "https://images.unsplash.com/photo-1581793745862-99fde7fa73d2?w=600",
                "Breathtaking high-altitude cold desert, crystal-clear Pangong Lake, dramatic mountain passes, and ancient Buddhist Gompas."
        );
        ladakh.addAttraction(new AttractionInfo("Pangong Tso High Altitude Lake", "Nature & Adventure", "Full Day", 360, 1200, "World's highest saltwater lake changing colors from turquoise to deep blue", 33.7595, 78.6674));
        ladakh.addAttraction(new AttractionInfo("Khardung La Mountain Pass", "Adventure Drive", "Morning", 150, 400, "Iconic Himalayan motorable pass perched at 17,982 ft", 34.2787, 77.6047));
        ladakh.addAttraction(new AttractionInfo("Thiksey Monastery", "Temples & Heritage", "Morning", 120, 50, "12-storey hilltop monastery complex resembling Lhasa's Potala Palace", 34.0578, 77.6669));
        destinations.put("ladakh", ladakh);
        destinations.put("leh", ladakh);

        // 8. Munnar - Hill Station & Tea Gardens
        DestinationInfo munnar = new DestinationInfo(
                "Munnar", "India", "Cool / Mountain", "Hill Station & Nature",
                Arrays.asList("Nature", "Relaxation", "Hill Stations", "Food", "Sightseeing"),
                10.0889, 77.0595, "September - May", "Rs. 10,000 - Rs. 26,000",
                "https://images.unsplash.com/photo-1596176530529-78163a4f7af2?w=600",
                "Idyllic rolling emerald tea plantations, mist-covered valleys, Anamudi peak, and cool mountain breezes."
        );
        munnar.addAttraction(new AttractionInfo("Eravikulam National Park", "Nature & Wildlife", "Morning", 180, 200, "Home to the endangered Nilgiri Tahr and rolling shola grass hills", 10.1500, 77.0600));
        munnar.addAttraction(new AttractionInfo("Mattupetty Dam & Echo Point", "Scenic Lake", "Afternoon", 120, 150, "Picturesque reservoir surrounded by tea hills, with speed boating", 10.1054, 77.1246));
        destinations.put("munnar", munnar);

        // 9. Rishikesh - Adventure & Yoga / Wellness
        DestinationInfo rishikesh = new DestinationInfo(
                "Rishikesh", "India", "Cool / Mountain", "Adventure & Wellness",
                Arrays.asList("Adventure", "Relaxation", "Temples", "Nature", "Water Sports"),
                30.0869, 78.2676, "September - May", "Rs. 10,000 - Rs. 28,000",
                "https://images.unsplash.com/photo-1544717305-2782549b5136?w=600",
                "The Yoga Capital of the World, famous for white-water Ganga river rafting, bungee jumping, ashrams, and serene ghats."
        );
        rishikesh.addAttraction(new AttractionInfo("Ganga White Water River Rafting", "Adventure Sports", "Morning", 240, 1200, "Thrilling 16km river expedition through Grade III rapids", 30.1340, 78.3240));
        rishikesh.addAttraction(new AttractionInfo("Triveni Ghat Evening Aarti", "Spiritual & Peace", "Evening", 90, 0, "Spiritual convergence of Ganga, Yamuna and Saraswati with floating diyas", 30.1030, 78.2970));
        destinations.put("rishikesh", rishikesh);

        // 10. Madurai - Ancient Temples & South Indian Heritage
        DestinationInfo madurai = new DestinationInfo(
                "Madurai", "India", "Heritage / Moderate", "Temples & Pilgrimage",
                Arrays.asList("Temples", "Historical places", "Food", "Culture", "Shopping"),
                9.9252, 78.1198, "October - March", "Rs. 8,000 - Rs. 20,000",
                "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=600",
                "The cultural capital of Tamil Nadu, famous for the magnificent 2,500-year-old Meenakshi Amman Temple and world-famous street food."
        );
        madurai.addAttraction(new AttractionInfo("Meenakshi Sundareswarar Temple", "Temples & Architecture", "Morning", 180, 50, "Historic masterpiece featuring 14 towering sculpted Gopurams and Hall of 1000 Pillars", 9.9195, 78.1193));
        madurai.addAttraction(new AttractionInfo("Thirumalai Nayakkar Palace", "Royal Heritage", "Afternoon", 90, 50, "17th-century palace fusion of Dravidian and Islamic architectural arches", 9.9150, 78.1235));
        destinations.put("madurai", madurai);

        // 11. Andaman Islands - Pristine Beaches & Marine Adventure
        DestinationInfo andaman = new DestinationInfo(
                "Andaman Islands", "India", "Coastal / Beach", "Beach & Coastal",
                Arrays.asList("Beaches", "Adventure", "Relaxation", "Nature", "Water Sports"),
                11.6234, 92.7265, "October - May", "Rs. 25,000 - Rs. 55,000",
                "https://images.unsplash.com/photo-1589394815804-964ed0be2eb5?w=600",
                "Tropical paradise of crystal azure waters, white sand beaches, coral reef scuba diving, and Cellular Jail history."
        );
        andaman.addAttraction(new AttractionInfo("Radhanagar Beach (Havelock)", "Beach & Sunset", "Evening", 180, 0, "Ranked among Asia's best beaches with powder-soft white sand and turquoise sea", 11.9833, 92.9500));
        andaman.addAttraction(new AttractionInfo("Elephant Beach Coral Scuba & Snorkel", "Water Adventure", "Morning", 240, 2500, "Vibrant underwater coral reefs, sea walking, and tropical fish exploration", 12.0080, 92.9540));
        destinations.put("andaman", andaman);
        destinations.put("andaman islands", andaman);

        // 12. Udaipur - City of Lakes & Royal Palaces
        DestinationInfo udaipur = new DestinationInfo(
                "Udaipur", "India", "Heritage / Moderate", "Heritage & Culture",
                Arrays.asList("Heritage", "Historical places", "Relaxation", "Food", "Sightseeing"),
                24.5854, 73.7125, "September - March", "Rs. 15,000 - Rs. 38,000",
                "https://images.unsplash.com/photo-1615836245337-f5b9b2303f10?w=600",
                "The Venice of the East, known for Lake Pichola, City Palace, romantic sunsets, and royal Rajput heritage."
        );
        udaipur.addAttraction(new AttractionInfo("City Palace Udaipur", "Royal Architecture", "Morning", 180, 400, "Majestic palace complex overlooking Lake Pichola with mirrored courtyards", 24.5764, 73.6835));
        udaipur.addAttraction(new AttractionInfo("Lake Pichola Boat Cruise", "Scenic & Romantic", "Evening", 90, 500, "Sunset boat cruise around Jag Mandir and the Lake Palace", 24.5760, 73.6790));
        destinations.put("udaipur", udaipur);

        // 13. Coorg - Coffee Plantations & Misty Waterfalls
        DestinationInfo coorg = new DestinationInfo(
                "Coorg", "India", "Cool / Mountain", "Hill Station & Nature",
                Arrays.asList("Nature", "Relaxation", "Hill Stations", "Food", "Adventure"),
                12.4244, 75.7382, "October - June", "Rs. 12,000 - Rs. 28,000",
                "https://images.unsplash.com/photo-1590490360182-c33d57733427?w=600",
                "The Scotland of India, blanketed in aromatic coffee estates, spice plantations, Abbey Falls, and cool highland greenery."
        );
        coorg.addAttraction(new AttractionInfo("Abbey Falls", "Nature & Waterfalls", "Morning", 90, 50, "Roaring waterfall cascading through lush spice estates and coffee bushes", 12.4542, 75.7186));
        coorg.addAttraction(new AttractionInfo("Raja's Seat Sunset Viewpoint", "Scenic Hilltop", "Evening", 90, 30, "Seasonal flower garden offering breathtaking sunset vistas over Western Ghats", 12.4214, 75.7350));
        destinations.put("coorg", coorg);

        // 14. Hampi - Ancient UNESCO Ruins & Monuments
        DestinationInfo hampi = new DestinationInfo(
                "Hampi", "India", "Heritage / Moderate", "Historical Places & Heritage",
                Arrays.asList("Historical places", "Heritage", "Temples", "Sightseeing", "Adventure"),
                15.3350, 76.4600, "October - March", "Rs. 8,000 - Rs. 22,000",
                "https://images.unsplash.com/photo-1600100397608-f010f443905b?w=600",
                "UNESCO World Heritage open-air museum of giant granite boulders, the 14th-century Vijayanagara Empire ruins, and Virupaksha Temple."
        );
        hampi.addAttraction(new AttractionInfo("Virupaksha Temple", "Temples & Ancient", "Morning", 120, 50, "Seventh-century working Shiva temple with carved tower and sacred elephant", 15.3353, 76.4601));
        hampi.addAttraction(new AttractionInfo("Vijaya Vittala Temple & Stone Chariot", "Sculpted Architecture", "Afternoon", 150, 40, "Iconic carved stone chariot and musical granite pillars", 15.3400, 76.4750));
        destinations.put("hampi", hampi);

        // 15. Pondicherry - French Colonial Coastal Heritage
        DestinationInfo pondicherry = new DestinationInfo(
                "Pondicherry", "India", "Coastal / Beach", "Beach & Coastal",
                Arrays.asList("Beaches", "Relaxation", "Food", "Culture", "Shopping"),
                11.9416, 79.8083, "October - March", "Rs. 10,000 - Rs. 26,000",
                "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=600",
                "Charming coastal union territory with French colonial quarters, pastel villas, seaside promenade, and Auroville."
        );
        pondicherry.addAttraction(new AttractionInfo("Promenade Beach & White Town", "Coastal Walk & Cafes", "Evening", 150, 0, "Stroll along Rock Beach and vibrant French quarter cafes", 11.9333, 79.8333));
        pondicherry.addAttraction(new AttractionInfo("Auroville Matrimandir", "Spiritual & Architecture", "Morning", 180, 0, "Universal township center featuring golden geodesic meditation sphere", 12.0070, 79.8107));
        destinations.put("pondicherry", pondicherry);
        destinations.put("puducherry", pondicherry);
    }

    public DestinationInfo getDestination(String name) {
        if (name == null) return null;
        String clean = name.trim().toLowerCase();
        for (Map.Entry<String, DestinationInfo> entry : destinations.entrySet()) {
            if (clean.contains(entry.getKey()) || entry.getKey().contains(clean)) {
                return entry.getValue();
            }
        }
        return null;
    }

    public double[] getCoordinates(String placeName, double[] fallback) {
        if (placeName == null || placeName.trim().isEmpty()) {
            return (fallback != null) ? fallback : new double[]{13.0827, 80.2707};
        }
        String clean = placeName.trim().toLowerCase();
        for (Map.Entry<String, double[]> entry : cityCoordinates.entrySet()) {
            if (clean.contains(entry.getKey()) || entry.getKey().contains(clean)) {
                return entry.getValue();
            }
        }
        return (fallback != null) ? fallback : new double[]{13.0827, 80.2707};
    }

    public Map<String, DestinationInfo> getAllDestinations() {
        return destinations;
    }

    public Map<String, double[]> getAllCityCoordinates() {
        return cityCoordinates;
    }
}