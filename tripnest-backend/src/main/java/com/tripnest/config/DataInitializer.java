package com.tripnest.config;

import com.tripnest.model.Destination;
import com.tripnest.model.User;
import com.tripnest.repository.DestinationRepository;
import com.tripnest.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.*;

@Component
public class DataInitializer implements CommandLineRunner {

    @Autowired
    private DestinationRepository destinationRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        // Initialize Default Admin User
        User existingAdmin = userRepository.findByEmail("admin@tripnest.com");
        if (existingAdmin == null) {
            User admin = new User();
            admin.setName("Platform Administrator");
            admin.setEmail("admin@tripnest.com");
            admin.setPassword(passwordEncoder.encode("Admin@123"));
            admin.setAge(30);
            admin.setRole("ROLE_ADMIN");
            admin.setBio("Lead System Administrator for TripNest Travel Platform");
            admin.setPhoneNumber("+91 9876543210");
            admin.setTravelPreferences("Heritage, Hill Stations, Coastal Escapes, Adventure");
            admin.setFavoriteDestinations("Goa, Manali, Ooty, Varanasi, Munnar");
            userRepository.save(admin);
            System.out.println("✅ Initialized Administrator account: admin@tripnest.com / Admin@123");
        } else {
            existingAdmin.setRole("ROLE_ADMIN");
            userRepository.save(existingAdmin);
        }

        // Grant Admin to sakanasri07@gmail.com if present
        User sakiUser = userRepository.findByEmail("sakanasri07@gmail.com");
        if (sakiUser != null) {
            sakiUser.setRole("ROLE_ADMIN");
            if (sakiUser.getTravelPreferences() == null || sakiUser.getTravelPreferences().trim().isEmpty()) {
                sakiUser.setTravelPreferences("Hill Stations, Adventure, Beaches, Nature");
            }
            userRepository.save(sakiUser);
        }

        // Seed comprehensive sample destinations into DB
        List<Destination> sampleDestinations = Arrays.asList(
                new Destination(null, "Goa", "India",
                        "Famous for pristine sandy beaches, vibrant nightlife, water sports, and Portuguese colonial architecture.",
                        "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=600",
                        "November – February", "₹15,000 – ₹35,000", "Beach & Nightlife"),

                new Destination(null, "Ooty", "India",
                        "Known as the Queen of Hill Stations, featuring serene tea gardens, Nilgiri Toy Train, and lush botanical gardens.",
                        "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=600",
                        "October – June", "₹10,000 – ₹25,000", "Hill Station & Nature"),

                new Destination(null, "Manali", "India",
                        "High-altitude Himalayan resort town known for snow-capped mountain vistas, paragliding, and Solang Valley adventures.",
                        "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600",
                        "October – June", "₹20,000 – ₹45,000", "Adventure & Mountains"),

                new Destination(null, "Kerala Backwaters", "India",
                        "Experience tranquil houseboat cruises through palm-fringed backwaters, spice plantations, and Ayurvedic wellness.",
                        "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=600",
                        "September – March", "₹18,000 – ₹40,000", "Relaxation & Nature"),

                new Destination(null, "Jaipur", "India",
                        "The iconic Pink City featuring majestic palaces like Hawa Mahal, Amer Fort, vibrant bazaars, and royal heritage.",
                        "https://images.unsplash.com/photo-1477587458883-47145ed94245?w=600",
                        "October – March", "₹12,000 – ₹30,000", "Heritage & Culture"),

                new Destination(null, "Varanasi", "India",
                        "One of the world's oldest living cities, celebrated for holy Ganga Ghats, sacred Kashi Vishwanath temple, and evening aarti.",
                        "https://images.unsplash.com/photo-1561361513-2d000a50f0dc?w=600",
                        "October – March", "₹8,000 – ₹22,000", "Temples & Pilgrimage"),

                new Destination(null, "Ladakh", "India",
                        "Breathtaking high-altitude landscapes, crystal-clear Pangong Lake, Buddhist monasteries, and thrilling mountain passes.",
                        "https://images.unsplash.com/photo-1581793745862-99fde7fa73d2?w=600",
                        "May – September", "₹25,000 – ₹55,000", "Adventure & Mountains"),

                new Destination(null, "Munnar", "India",
                        "Idyllic rolling emerald tea plantations, mist-covered valleys, Anamudi peak, and cool mountain breezes.",
                        "https://images.unsplash.com/photo-1596176530529-78163a4f7af2?w=600",
                        "September – May", "₹10,000 – ₹26,000", "Hill Station & Nature"),

                new Destination(null, "Rishikesh", "India",
                        "The Yoga Capital of the World, famous for white-water Ganga river rafting, bungee jumping, ashrams, and serene ghats.",
                        "https://images.unsplash.com/photo-1544717305-2782549b5136?w=600",
                        "September – May", "₹10,000 – ₹28,000", "Adventure & Wellness"),

                new Destination(null, "Madurai", "India",
                        "The cultural capital of Tamil Nadu, famous for the magnificent 2,500-year-old Meenakshi Amman Temple and royal palaces.",
                        "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=600",
                        "October – March", "₹8,000 – ₹20,000", "Temples & Pilgrimage"),

                new Destination(null, "Andaman Islands", "India",
                        "Tropical paradise of crystal azure waters, white sand beaches, coral reef scuba diving, and Cellular Jail history.",
                        "https://images.unsplash.com/photo-1589394815804-964ed0be2eb5?w=600",
                        "October – May", "₹25,000 – ₹55,000", "Beach & Coastal"),

                new Destination(null, "Udaipur", "India",
                        "The Venice of the East, known for Lake Pichola, City Palace, romantic sunsets, and royal Rajput heritage.",
                        "https://images.unsplash.com/photo-1615836245337-f5b9b2303f10?w=600",
                        "September – March", "₹15,000 – ₹38,000", "Heritage & Culture"),

                new Destination(null, "Coorg", "India",
                        "The Scotland of India, blanketed in aromatic coffee estates, spice plantations, Abbey Falls, and cool highland greenery.",
                        "https://images.unsplash.com/photo-1590490360182-c33d57733427?w=600",
                        "October – June", "₹12,000 – ₹28,000", "Hill Station & Nature"),

                new Destination(null, "Hampi", "India",
                        "UNESCO World Heritage open-air museum of giant granite boulders, the 14th-century Vijayanagara Empire ruins, and temples.",
                        "https://images.unsplash.com/photo-1600100397608-f010f443905b?w=600",
                        "October – March", "₹8,000 – ₹22,000", "Historical Places & Heritage"),

                new Destination(null, "Pondicherry", "India",
                        "Charming coastal union territory with French colonial quarters, pastel villas, seaside promenade, and Auroville.",
                        "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=600",
                        "October – March", "₹10,000 – ₹26,000", "Beach & Coastal")
        );

        List<Destination> existing = destinationRepository.findAll();
        Set<String> existingNames = new HashSet<>();
        for (Destination d : existing) {
            if (d.getName() != null) existingNames.add(d.getName().trim().toLowerCase());
        }

        List<Destination> toAdd = new ArrayList<>();
        for (Destination sample : sampleDestinations) {
            if (!existingNames.contains(sample.getName().trim().toLowerCase())) {
                toAdd.add(sample);
            }
        }

        if (!toAdd.isEmpty()) {
            destinationRepository.saveAll(toAdd);
            System.out.println("✅ Seeded " + toAdd.size() + " new destinations into database catalog.");
        }
    }
}
