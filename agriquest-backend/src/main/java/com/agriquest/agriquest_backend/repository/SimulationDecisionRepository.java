package com.agriquest.agriquest_backend.repository;

import com.agriquest.agriquest_backend.entity.SimulationDecision;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface SimulationDecisionRepository extends JpaRepository<SimulationDecision, Long> {
    List<SimulationDecision> findBySimulationId(Long simulationId);
    List<SimulationDecision> findBySimulationIdOrderByDecidedAtAsc(Long simulationId);
}
