package com.subscribely.sub_management.controller;

import java.time.LocalDate;
import java.util.List;

import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;

import com.subscribely.sub_management.entity.*;
import com.subscribely.sub_management.dto.SubscriptionRequest;
import com.subscribely.sub_management.repository.*;

@RestController
@RequestMapping("/api/subscriptions")
@CrossOrigin(origins = "*")
public class SubscriptionController {

    private final SubscriptionRepository subscriptionRepository;
    private final CustomerRepository customerRepository;
    private final ProductRepository productRepository;
    private final PlanRepository planRepository;

    public SubscriptionController(
            SubscriptionRepository subscriptionRepository,
            CustomerRepository customerRepository,
            ProductRepository productRepository,
            PlanRepository planRepository) {

        this.subscriptionRepository = subscriptionRepository;
        this.customerRepository = customerRepository;
        this.productRepository = productRepository;
        this.planRepository = planRepository;
    }

    // Create subscription
    @PostMapping
    public Subscription createSubscription(
            @RequestBody SubscriptionRequest request) {

        Customer customer = customerRepository
                .findById(request.getCustomerId())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Customer not found"));

        Product product = productRepository
                .findById(request.getProductId())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Product not found"));

        Plan plan = planRepository
                .findById(request.getPlanId())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Plan not found"));

        if (!plan.isActive()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST, "Plan is inactive");
        }

        LocalDate start = request.getStartDate() != null
                ? request.getStartDate() : LocalDate.now();

        Subscription subscription = new Subscription();

        subscription.setCustomer(customer);
        subscription.setProduct(product);
        subscription.setPlan(plan);
        subscription.setStartDate(start);

        subscription.setEndDate(
                start.plusDays(plan.getDurationDays()));

        subscription.setStatus("ACTIVE");

        return subscriptionRepository.save(subscription);
    }

    // Get all subscriptions
    @GetMapping
    public List<Subscription> getAllSubscriptions() {
        return subscriptionRepository.findAll();
    }

    // Get subscription by ID
    @GetMapping("/{id}")
    public ResponseEntity<Subscription> getSubscription(
            @PathVariable Long id) {

        return subscriptionRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // Cancel subscription
    @PutMapping("/{id}/cancel")
    public Subscription cancelSubscription(@PathVariable Long id) {

        Subscription subscription = subscriptionRepository
                .findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Subscription not found"));

        subscription.setStatus("CANCELLED");

        return subscriptionRepository.save(subscription);
    }

    // Delete subscription
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteSubscription(
            @PathVariable Long id) {

        if (!subscriptionRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }

        subscriptionRepository.deleteById(id);

        return ResponseEntity.noContent().build();
    }
}