package com.agriquest.agriquest_backend.controller;

import com.agriquest.agriquest_backend.entity.*;
import com.agriquest.agriquest_backend.service.SimulationService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/simulation")
@RequiredArgsConstructor
public class SimulationController {

    private final SimulationService simulationService;

    public record StartRequest(@NotNull Long userId, @NotBlank String crop) {}
    public record DecideRequest(@NotBlank String choiceKey, @NotBlank String choiceValue) {}

    @PostMapping("/start")
    public ResponseEntity<FarmSimulation> start(@Valid @RequestBody StartRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(simulationService.startSimulation(req.userId(), req.crop()));
    }

    @PostMapping("/{id}/decide")
    public ResponseEntity<SimulationService.DecisionResult> decide(
            @PathVariable Long id,
            @Valid @RequestBody DecideRequest req) {
        return ResponseEntity.ok(simulationService.makeDecision(id, req.choiceKey(), req.choiceValue()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<FarmSimulation> getSimulation(@PathVariable Long id) {
        return ResponseEntity.ok(simulationService.getSimulation(id));
    }

    @GetMapping("/{id}/history")
    public ResponseEntity<List<SimulationDecision>> getHistory(@PathVariable Long id) {
        return ResponseEntity.ok(simulationService.getHistory(id));
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<FarmSimulation>> getUserSimulations(@PathVariable Long userId) {
        return ResponseEntity.ok(simulationService.getUserSimulations(userId));
    }

    @GetMapping("/stage-options")
    public ResponseEntity<Map<String, List<String>>> getStageOptions() {
        return ResponseEntity.ok(simulationService.getStageOptions());
    }
}
