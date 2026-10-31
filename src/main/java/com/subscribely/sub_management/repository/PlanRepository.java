package com.subscribely.sub_management.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.subscribely.sub_management.entity.Plan;

public interface PlanRepository extends JpaRepository<Plan, Long> {

}