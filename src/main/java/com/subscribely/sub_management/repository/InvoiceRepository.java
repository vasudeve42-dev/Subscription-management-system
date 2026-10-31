package com.subscribely.sub_management.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.subscribely.sub_management.entity.Invoice;

public interface InvoiceRepository extends JpaRepository<Invoice, Long> {

}
