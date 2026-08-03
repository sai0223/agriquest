package com.agriquest.agriquest_backend.controller;

import com.agriquest.agriquest_backend.entity.*;
import com.agriquest.agriquest_backend.service.DiaryService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/diary")
@RequiredArgsConstructor
public class DiaryController {

    private final DiaryService diaryService;

    public record CreateEntryRequest(
            @NotNull Long farmerId,
            @NotBlank String crop,
            @NotBlank String dayStage,
            String photoUrl,
            String notes
    ) {}

    @GetMapping("/entries")
    public ResponseEntity<List<FarmDiaryEntry>> getAllEntries() {
        return ResponseEntity.ok(diaryService.getAllEntries());
    }

    @GetMapping("/entries/{id}")
    public ResponseEntity<FarmDiaryEntry> getEntry(@PathVariable Long id) {
        return ResponseEntity.ok(diaryService.getEntry(id));
    }

    @GetMapping("/farmer/{farmerId}")
    public ResponseEntity<List<FarmDiaryEntry>> getFarmerEntries(@PathVariable Long farmerId) {
        return ResponseEntity.ok(diaryService.getEntriesByFarmer(farmerId));
    }

    @PostMapping("/entries")
    public ResponseEntity<FarmDiaryEntry> createEntry(@Valid @RequestBody CreateEntryRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED).body(
                diaryService.createEntry(req.farmerId(), req.crop(), req.dayStage(),
                        req.photoUrl(), req.notes()));
    }
}
