package com.agriquest.agriquest_backend.repository;

import com.agriquest.agriquest_backend.entity.FarmSimulation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface FarmSimulationRepository extends JpaRepository<FarmSimulation, Long> {
    List<FarmSimulation> findByUserId(Long userId);
    Optional<FarmSimulation> findByIdAndUserId(Long id, Long userId);
    List<FarmSimulation> findByUserIdAndStatus(Long userId, FarmSimulation.SimulationStatus status);
}
