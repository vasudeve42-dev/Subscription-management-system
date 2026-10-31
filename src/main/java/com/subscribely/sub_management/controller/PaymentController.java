package com.subscribely.sub_management.controller;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import com.subscribely.sub_management.dto.PaymentRequest;
import com.subscribely.sub_management.entity.Invoice;
import com.subscribely.sub_management.entity.Payment;
import com.subscribely.sub_management.repository.InvoiceRepository;
import com.subscribely.sub_management.repository.PaymentRepository;

@RestController
@RequestMapping("/api/payments")
@CrossOrigin(origins = "*")
public class PaymentController {

    private final PaymentRepository paymentRepository;
    private final InvoiceRepository invoiceRepository;

    public PaymentController(
            PaymentRepository paymentRepository,
            InvoiceRepository invoiceRepository) {
        this.paymentRepository = paymentRepository;
        this.invoiceRepository = invoiceRepository;
    }

    // Record a payment
    @PostMapping
    public Payment recordPayment(@RequestBody PaymentRequest request) {

        Invoice invoice = invoiceRepository.findById(request.getInvoiceId())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Invoice not found"));

        if (request.getAmount() == null ||
                request.getAmount().compareTo(BigDecimal.ZERO) <= 0) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST, "Payment amount must be greater than zero");
        }

        List<Payment> existingPayments =
                paymentRepository.findByInvoice_Id(invoice.getId());

        BigDecimal totalPaid = existingPayments.stream()
                .map(Payment::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal remainingAmount =
                invoice.getAmount().subtract(totalPaid);

        if (request.getAmount().compareTo(remainingAmount) > 0) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Payment exceeds the remaining invoice amount");
        }

        Payment payment = new Payment();
        payment.setInvoice(invoice);
        payment.setAmount(request.getAmount());
        payment.setPaymentMethod(request.getPaymentMethod());
        payment.setPaymentDate(
                request.getPaymentDate() != null
                        ? request.getPaymentDate()
                        : LocalDate.now());
        payment.setNote(request.getNote());

        Payment savedPayment = paymentRepository.save(payment);

        BigDecimal updatedTotal = totalPaid.add(request.getAmount());

        if (updatedTotal.compareTo(invoice.getAmount()) >= 0) {
            invoice.setStatus("PAID");
        } else {
            invoice.setStatus("PARTIALLY_PAID");
        }

        invoiceRepository.save(invoice);

        return savedPayment;
    }

    // Get all payments
    @GetMapping
    public List<Payment> getAllPayments() {
        return paymentRepository.findAll();
    }

    // Get payment by ID
    @GetMapping("/{id}")
    public Payment getPaymentById(@PathVariable Long id) {
        return paymentRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Payment not found"));
    }

    // Get payments for a particular invoice
    @GetMapping("/invoice/{invoiceId}")
    public List<Payment> getPaymentsByInvoice(@PathVariable Long invoiceId) {
        return paymentRepository.findByInvoice_Id(invoiceId);
    }
}