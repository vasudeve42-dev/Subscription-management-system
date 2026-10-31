package com.subscribely.sub_management.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.subscribely.sub_management.entity.Customer;

public interface CustomerRepository
        extends JpaRepository<Customer, Long> {

}