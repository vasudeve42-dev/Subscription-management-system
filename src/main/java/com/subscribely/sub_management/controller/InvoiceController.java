package com.subscribely.sub_management.controller;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;

import com.subscribely.sub_management.entity.Invoice;
import com.subscribely.sub_management.entity.Subscription;
import com.subscribely.sub_management.repository.InvoiceRepository;
import com.subscribely.sub_management.repository.SubscriptionRepository;

@RestController
@RequestMapping("/api/invoices")
@CrossOrigin(origins = "*")
public class InvoiceController {

    private final InvoiceRepository invoiceRepository;
    private final SubscriptionRepository subscriptionRepository;

    public InvoiceController(
            InvoiceRepository invoiceRepository,
            SubscriptionRepository subscriptionRepository) {

        this.invoiceRepository = invoiceRepository;
        this.subscriptionRepository = subscriptionRepository;
    }

    // Generate invoice from subscription
    @PostMapping("/generate/{subscriptionId}")
    public Invoice generateInvoice(@PathVariable Long subscriptionId) {

        Subscription subscription = subscriptionRepository
                .findById(subscriptionId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Subscription not found"));

        if (!"ACTIVE".equals(subscription.getStatus())) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Cannot generate invoice for inactive subscription");
        }

        Invoice invoice = new Invoice();

        invoice.setInvoiceNumber(
                "INV-" + UUID.randomUUID().toString()
                        .substring(0, 8).toUpperCase());

        invoice.setSubscription(subscription);

        invoice.setAmount(subscription.getPlan().getPrice());

        invoice.setIssueDate(LocalDate.now());

        invoice.setDueDate(LocalDate.now().plusDays(7));

        invoice.setStatus("UNPAID");

        return invoiceRepository.save(invoice);
    }

    // Get all invoices
    @GetMapping
    public List<Invoice> getAllInvoices() {
        return invoiceRepository.findAll();
    }

    // Get invoice by ID
    @GetMapping("/{id}")
    public ResponseEntity<Invoice> getInvoice(@PathVariable Long id) {

        return invoiceRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // Update invoice status
    @PutMapping("/{id}/status")
    public Invoice updateStatus(
            @PathVariable Long id,
            @RequestParam String status) {

        Invoice invoice = invoiceRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Invoice not found"));

        if (!status.equals("UNPAID") && !status.equals("PAID")) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST, "Invalid invoice status");
        }

        invoice.setStatus(status);

        return invoiceRepository.save(invoice);
    }
}