package com.subscribely.sub_management.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.subscribely.sub_management.entity.Product;

public interface ProductRepository extends JpaRepository<Product, Long> {

}