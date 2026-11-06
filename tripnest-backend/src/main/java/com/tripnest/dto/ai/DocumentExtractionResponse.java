package com.tripnest.dto.ai;

import java.util.HashMap;
import java.util.Map;

public class DocumentExtractionResponse {
    private boolean success;
    private String documentType; // Ticket, Hotel Voucher, Boarding Pass, Booking Confirmation
    private String bookingReference;
    private String providerName; // Airline, Hotel chain, IRCTC
    private String transportNumber; // Flight 6E-204, Train 12626
    private String travelDate;
    private String departureTime;
    private String arrivalTime;
    private String hotelCheckIn;
    private String hotelCheckOut;
    private String origin;
    private String destination;
    private Double totalAmount;
    private String seatOrRoom;
    private String passengerOrGuest;
    private String notes;
    private String extractionMethod; // "AI_VISION", "REGEX_PARSER", "STRUCTURED_OCR"
    private Map<String, String> rawFields = new HashMap<>();

    public DocumentExtractionResponse() {}

    public boolean isSuccess() { return success; }
    public void setSuccess(boolean success) { this.success = success; }

    public String getDocumentType() { return documentType; }
    public void setDocumentType(String documentType) { this.documentType = documentType; }

    public String getBookingReference() { return bookingReference; }
    public void setBookingReference(String bookingReference) { this.bookingReference = bookingReference; }

    public String getProviderName() { return providerName; }
    public void setProviderName(String providerName) { this.providerName = providerName; }

    public String getTransportNumber() { return transportNumber; }
    public void setTransportNumber(String transportNumber) { this.transportNumber = transportNumber; }

    public String getTravelDate() { return travelDate; }
    public void setTravelDate(String travelDate) { this.travelDate = travelDate; }

    public String getDepartureTime() { return departureTime; }
    public void setDepartureTime(String departureTime) { this.departureTime = departureTime; }

    public String getArrivalTime() { return arrivalTime; }
    public void setArrivalTime(String arrivalTime) { this.arrivalTime = arrivalTime; }

    public String getHotelCheckIn() { return hotelCheckIn; }
    public void setHotelCheckIn(String hotelCheckIn) { this.hotelCheckIn = hotelCheckIn; }

    public String getHotelCheckOut() { return hotelCheckOut; }
    public void setHotelCheckOut(String hotelCheckOut) { this.hotelCheckOut = hotelCheckOut; }

    public String getOrigin() { return origin; }
    public void setOrigin(String origin) { this.origin = origin; }

    public String getDestination() { return destination; }
    public void setDestination(String destination) { this.destination = destination; }

    public Double getTotalAmount() { return totalAmount; }
    public void setTotalAmount(Double totalAmount) { this.totalAmount = totalAmount; }

    public String getSeatOrRoom() { return seatOrRoom; }
    public void setSeatOrRoom(String seatOrRoom) { this.seatOrRoom = seatOrRoom; }

    public String getPassengerOrGuest() { return passengerOrGuest; }
    public void setPassengerOrGuest(String passengerOrGuest) { this.passengerOrGuest = passengerOrGuest; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }

    public String getExtractionMethod() { return extractionMethod; }
    public void setExtractionMethod(String extractionMethod) { this.extractionMethod = extractionMethod; }

    public Map<String, String> getRawFields() { return rawFields; }
    public void setRawFields(Map<String, String> rawFields) { this.rawFields = rawFields; }
}