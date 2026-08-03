package com.agriquest.agriquest_backend.service;

import com.agriquest.agriquest_backend.entity.*;
import com.agriquest.agriquest_backend.exception.ResourceNotFoundException;
import com.agriquest.agriquest_backend.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service
@RequiredArgsConstructor
public class DiaryService {

    private final FarmDiaryEntryRepository diaryRepo;
    private final UserRepository userRepo;

    public List<FarmDiaryEntry> getAllEntries() {
        return diaryRepo.findAllByOrderByCreatedAtDesc();
    }

    public List<FarmDiaryEntry> getEntriesByFarmer(Long farmerId) {
        return diaryRepo.findByFarmerId(farmerId);
    }

    public FarmDiaryEntry getEntry(Long id) {
        return diaryRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Diary entry not found: " + id));
    }

    @Transactional
    public FarmDiaryEntry createEntry(Long farmerId, String crop, String dayStage,
                                     String photoUrl, String notes) {
        User farmer = userRepo.findById(farmerId)
                .orElseThrow(() -> new ResourceNotFoundException("Farmer not found: " + farmerId));

        FarmDiaryEntry entry = FarmDiaryEntry.builder()
                .farmer(farmer)
                .crop(crop)
                .dayStage(dayStage)
                .photoUrl(photoUrl)
                .notes(notes)
                .build();

        // Award green points to farmer for logging
        farmer.setGreenPoints(farmer.getGreenPoints() + 10);
        userRepo.save(farmer);

        return diaryRepo.save(entry);
    }
}
