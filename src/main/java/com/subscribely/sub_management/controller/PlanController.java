package com.subscribely.sub_management.controller;

import java.util.List;

import org.springframework.web.bind.annotation.*;

import com.subscribely.sub_management.entity.Plan;
import com.subscribely.sub_management.repository.PlanRepository;

@RestController
@RequestMapping("/api/plans")
@CrossOrigin(origins = "*")
public class PlanController {

    private final PlanRepository repository;

    public PlanController(PlanRepository repository) {
        this.repository = repository;
    }

    @GetMapping
    public List<Plan> getAllPlans() {
        return repository.findAll();
    }

    @PostMapping
    public Plan addPlan(@RequestBody Plan plan) {
        return repository.save(plan);
    }

    @GetMapping("/{id}")
    public Plan getPlan(@PathVariable Long id) {
        return repository.findById(id).orElse(null);
    }

    @PutMapping("/{id}")
    public Plan updatePlan(@PathVariable Long id,
                           @RequestBody Plan plan) {

        Plan existing = repository.findById(id).orElse(null);

        if (existing == null) {
            return null;
        }

        existing.setPlanName(plan.getPlanName());
        existing.setDescription(plan.getDescription());
        existing.setPrice(plan.getPrice());
        existing.setBillingCycle(plan.getBillingCycle());
        existing.setDurationDays(plan.getDurationDays());
        existing.setActive(plan.isActive());

        return repository.save(existing);
    }

    @DeleteMapping("/{id}")
    public void deletePlan(@PathVariable Long id) {
        repository.deleteById(id);
    }
}