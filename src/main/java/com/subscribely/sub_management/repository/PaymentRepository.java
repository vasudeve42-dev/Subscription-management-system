package com.subscribely.sub_management.repository;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import com.subscribely.sub_management.entity.Payment;

public interface PaymentRepository extends JpaRepository<Payment, Long> {

    List<Payment> findByInvoice_Id(Long invoiceId);
}