package com.agriquest.agriquest_backend.repository;

import com.agriquest.agriquest_backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    boolean existsByEmail(String email);

    @Query("SELECT u FROM User u ORDER BY u.xp DESC")
    List<User> findAllOrderByXpDesc();

    @Query("SELECT u FROM User u WHERE u.role = 'FARMER' ORDER BY u.greenPoints DESC")
    List<User> findFarmersOrderByGreenPoints();
}
