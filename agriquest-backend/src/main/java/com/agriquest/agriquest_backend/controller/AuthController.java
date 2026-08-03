package com.agriquest.agriquest_backend.controller;

import com.agriquest.agriquest_backend.entity.User;
import com.agriquest.agriquest_backend.service.AuthService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    public record RegisterRequest(
            @NotBlank String name,
            @Email @NotBlank String email,
            @NotBlank @Size(min = 6) String password,
            @NotBlank String role
    ) {}

    public record LoginRequest(
            @Email @NotBlank String email,
            @NotBlank String password
    ) {}

    @PostMapping("/register")
    public ResponseEntity<Map<String, Object>> register(@Valid @RequestBody RegisterRequest req) {
        User.Role role = User.Role.valueOf(req.role().toUpperCase());
        User user = authService.register(req.name(), req.email(), req.password(), role);
        return ResponseEntity.status(HttpStatus.CREATED).body(toMap(user));
    }

    @PostMapping("/login")
    public ResponseEntity<Map<String, Object>> login(@Valid @RequestBody LoginRequest req) {
        User user = authService.login(req.email(), req.password());
        return ResponseEntity.ok(toMap(user));
    }

    @GetMapping("/user/{id}")
    public ResponseEntity<Map<String, Object>> getUser(@PathVariable Long id) {
        User user = authService.getById(id);
        return ResponseEntity.ok(toMap(user));
    }

    private Map<String, Object> toMap(User u) {
        return Map.of(
                "id", u.getId(),
                "name", u.getName(),
                "email", u.getEmail(),
                "role", u.getRole(),
                "xp", u.getXp(),
                "level", u.getLevel(),
                "greenPoints", u.getGreenPoints(),
                "streakDays", u.getStreakDays()
        );
    }
}
