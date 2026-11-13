package com.coworkia.mvp_api.service;

import com.coworkia.mvp_api.dto.response.AuthResponse;
import com.coworkia.mvp_api.dto.request.LoginRequest;
import com.coworkia.mvp_api.entity.User;
import com.coworkia.mvp_api.exception.ApiException;
import com.coworkia.mvp_api.repository.UserRepository;
import com.coworkia.mvp_api.security.JwtService;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthService(UserRepository userRepository,
                       PasswordEncoder passwordEncoder,
                       JwtService jwtService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    public AuthResponse login(LoginRequest request) {
        // Même message d'erreur que l'email soit inconnu ou le mot de passe faux
        User user = userRepository.findByEmail(request.email())
                .filter(u -> passwordEncoder.matches(request.password(), u.getMotDePasse()))
                .orElseThrow(() -> new ApiException(HttpStatus.UNAUTHORIZED, "Invalid credentials"));

        String role = user.getRole().name();
        return new AuthResponse(jwtService.generateToken(user.getEmail(), role), user.getEmail(), role);
    }
}