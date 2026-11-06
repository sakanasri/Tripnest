package com.tripnest.service;

import com.tripnest.model.Document;
import com.tripnest.model.Trip;
import com.tripnest.repository.DocumentRepository;
import com.tripnest.repository.TripRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.List;
import java.util.UUID;

@Service
public class DocumentService {

    private final Path fileStorageLocation;

    @Autowired
    private DocumentRepository documentRepository;

    @Autowired
    private TripRepository tripRepository;

    @Autowired
    private NotificationService notificationService;

    public DocumentService() {
        this.fileStorageLocation = Paths.get("uploads/documents").toAbsolutePath().normalize();
        try {
            Files.createDirectories(this.fileStorageLocation);
        } catch (Exception ex) {
            throw new RuntimeException("Could not create the directory where the uploaded files will be stored.", ex);
        }
    }

    public Document storeFile(MultipartFile file, Integer tripId, String documentName, String documentType) {
        Trip trip = tripRepository.findById(tripId)
                .orElseThrow(() -> new RuntimeException("Trip not found with id " + tripId));

        String originalFileName = StringUtils.cleanPath(file.getOriginalFilename() != null ? file.getOriginalFilename() : "file");
        String uniqueFileName = UUID.randomUUID().toString() + "_" + originalFileName;

        try {
            if (uniqueFileName.contains("..")) {
                throw new RuntimeException("Filename contains invalid path sequence " + originalFileName);
            }

            Path targetLocation = this.fileStorageLocation.resolve(uniqueFileName);
            Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);

            String fileUrl = "/documents/download/" + uniqueFileName;

            Document doc = new Document(
                    (documentName != null && !documentName.trim().isEmpty()) ? documentName.trim() : originalFileName,
                    (documentType != null && !documentType.trim().isEmpty()) ? documentType.trim() : "Other",
                    uniqueFileName,
                    file.getContentType(),
                    file.getSize(),
                    fileUrl,
                    trip
            );

            Document savedDoc = documentRepository.save(doc);

            // Notify only the trip owner
            if (trip.getUser() != null) {
                String msg = "📁 New Document Uploaded: " + savedDoc.getDocumentName() + " (" + savedDoc.getDocumentType() + ") for trip to " + trip.getDestination();
                notificationService.createNotification(msg, trip.getUser().getId());
            }

            return savedDoc;

        } catch (IOException ex) {
            throw new RuntimeException("Could not store file " + originalFileName + ". Please try again!", ex);
        }
    }

    public List<Document> getDocumentsByTripId(Integer tripId) {
        return documentRepository.findByTripId(tripId);
    }

    public Resource loadFileAsResource(String fileName) {
        try {
            Path filePath = this.fileStorageLocation.resolve(fileName).normalize();
            Resource resource = new UrlResource(filePath.toUri());
            if (resource.exists()) {
                return resource;
            } else {
                throw new RuntimeException("File not found " + fileName);
            }
        } catch (MalformedURLException ex) {
            throw new RuntimeException("File not found " + fileName, ex);
        }
    }

    public void deleteDocument(Integer documentId) {
        Document doc = documentRepository.findById(documentId)
                .orElseThrow(() -> new RuntimeException("Document not found with id " + documentId));

        try {
            Path filePath = this.fileStorageLocation.resolve(doc.getFileName()).normalize();
            Files.deleteIfExists(filePath);
        } catch (IOException ignored) {
        }

        documentRepository.deleteById(documentId);
    }
}
