package com.subscribely.sub_management.controller;

import java.util.List;

import org.springframework.web.bind.annotation.*;

import com.subscribely.sub_management.entity.Customer;
import com.subscribely.sub_management.repository.CustomerRepository;

@RestController
@RequestMapping("/api/customers")
@CrossOrigin(origins = "*")
public class CustomerController {

    private final CustomerRepository repository;

    public CustomerController(CustomerRepository repository) {
        this.repository = repository;
    }

    @GetMapping
    public List<Customer> getAllCustomers() {
        return repository.findAll();
    }

    @PostMapping
    public Customer addCustomer(@RequestBody Customer customer) {
        return repository.save(customer);
    }

    @GetMapping("/{id}")
    public Customer getCustomer(@PathVariable Long id) {
        return repository.findById(id).orElse(null);
    }

    @DeleteMapping("/{id}")
    public void deleteCustomer(@PathVariable Long id) {
        repository.deleteById(id);
    }

@PutMapping("/{id}")
public Customer updateCustomer(
        @PathVariable Long id,
        @RequestBody Customer customer) {

    Customer existing = repository.findById(id).orElse(null);

    if (existing == null) {
        return null;
    }

    existing.setName(customer.getName());
    existing.setEmail(customer.getEmail());
    existing.setPhone(customer.getPhone());
    existing.setCompanyName(customer.getCompanyName());
    existing.setAddress(customer.getAddress());

    return repository.save(existing);
}}