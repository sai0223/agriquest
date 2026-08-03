package com.agriquest.agriquest_backend.repository;

import com.agriquest.agriquest_backend.entity.FarmDiaryEntry;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface FarmDiaryEntryRepository extends JpaRepository<FarmDiaryEntry, Long> {
    List<FarmDiaryEntry> findByFarmerId(Long farmerId);
    List<FarmDiaryEntry> findByFarmerIdAndCrop(Long farmerId, String crop);
    List<FarmDiaryEntry> findAllByOrderByCreatedAtDesc();
}
