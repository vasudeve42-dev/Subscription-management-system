package com.subscribely.sub_management.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.subscribely.sub_management.entity.Subscription;

public interface SubscriptionRepository
        extends JpaRepository<Subscription, Long> {

}