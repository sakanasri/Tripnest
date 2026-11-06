package com.tripnest.controller;

import com.tripnest.model.Document;
import com.tripnest.service.DocumentService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/documents")
@CrossOrigin(origins = "*")
public class DocumentController {

    @Autowired
    private DocumentService documentService;

    @PostMapping("/upload/{tripId}")
    public ResponseEntity<Document> uploadFile(
            @PathVariable Integer tripId,
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "documentName", required = false) String documentName,
            @RequestParam(value = "documentType", required = false) String documentType
    ) {
        Document document = documentService.storeFile(file, tripId, documentName, documentType);
        return ResponseEntity.ok(document);
    }

    @GetMapping("/trip/{tripId}")
    public ResponseEntity<List<Document>> getDocumentsByTrip(@PathVariable Integer tripId) {
        List<Document> documents = documentService.getDocumentsByTripId(tripId);
        return ResponseEntity.ok(documents);
    }

    @GetMapping("/download/{fileName:.+}")
    public ResponseEntity<Resource> downloadFile(@PathVariable String fileName, HttpServletRequest request) {
        Resource resource = documentService.loadFileAsResource(fileName);

        String contentType = null;
        try {
            contentType = request.getServletContext().getMimeType(resource.getFile().getAbsolutePath());
        } catch (IOException ex) {
        }

        if (contentType == null) {
            contentType = "application/octet-stream";
        }

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(contentType))
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + resource.getFilename() + "\"")
                .body(resource);
    }

    @DeleteMapping("/delete/{id}")
    public ResponseEntity<String> deleteDocument(@PathVariable Integer id) {
        documentService.deleteDocument(id);
        return ResponseEntity.ok("Document deleted successfully");
    }
}
