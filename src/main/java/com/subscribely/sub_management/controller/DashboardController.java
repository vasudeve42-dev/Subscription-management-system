package com.subscribely.sub_management.controller;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.web.bind.annotation.*;

import com.subscribely.sub_management.entity.Invoice;
import com.subscribely.sub_management.repository.CustomerRepository;
import com.subscribely.sub_management.repository.ProductRepository;
import com.subscribely.sub_management.repository.SubscriptionRepository;
import com.subscribely.sub_management.repository.InvoiceRepository;
import com.subscribely.sub_management.repository.PaymentRepository;

@RestController
@RequestMapping("/api/dashboard")
@CrossOrigin(origins = "*")
public class DashboardController {

    private final CustomerRepository customerRepository;
    private final ProductRepository productRepository;
    private final SubscriptionRepository subscriptionRepository;
    private final InvoiceRepository invoiceRepository;
    private final PaymentRepository paymentRepository;

    public DashboardController(
            CustomerRepository customerRepository,
            ProductRepository productRepository,
            SubscriptionRepository subscriptionRepository,
            InvoiceRepository invoiceRepository,
            PaymentRepository paymentRepository) {

        this.customerRepository = customerRepository;
        this.productRepository = productRepository;
        this.subscriptionRepository = subscriptionRepository;
        this.invoiceRepository = invoiceRepository;
        this.paymentRepository = paymentRepository;
    }

    @GetMapping("/summary")
    public Map<String, Object> getDashboardSummary() {

        Map<String, Object> summary = new HashMap<>();

        List<Invoice> invoices = invoiceRepository.findAll();

        BigDecimal totalRevenue = paymentRepository.findAll()
                .stream()
                .map(payment -> payment.getAmount())
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal outstandingAmount = invoices.stream()
                .filter(invoice -> !invoice.getStatus().equals("PAID"))
                .map(invoice -> invoice.getAmount().subtract(
                        paymentRepository.findByInvoice_Id(invoice.getId())
                                .stream()
                                .map(payment -> payment.getAmount())
                                .reduce(BigDecimal.ZERO, BigDecimal::add)))
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        long overdueInvoices = invoices.stream()
                .filter(invoice ->
                        !"PAID".equals(invoice.getStatus()) &&
                        invoice.getDueDate() != null &&
                        invoice.getDueDate().isBefore(LocalDate.now()))
                .count();

        long activeSubscriptions = subscriptionRepository.findAll()
                .stream()
                .filter(subscription -> "ACTIVE".equals(subscription.getStatus()))
                .count();

        summary.put("totalCustomers", customerRepository.count());
        summary.put("totalProducts", productRepository.count());
        summary.put("activeSubscriptions", activeSubscriptions);
        summary.put("totalInvoices", invoices.size());
        summary.put("totalRevenue", totalRevenue);
        summary.put("outstandingAmount", outstandingAmount);
        summary.put("overdueInvoices", overdueInvoices);

        return summary;
    }
}