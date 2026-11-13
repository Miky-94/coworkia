package com.coworkia.mvp_api.dto.response;

public record AuthResponse(String token, String email, String role) {
}