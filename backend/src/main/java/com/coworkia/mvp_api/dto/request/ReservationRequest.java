package com.coworkia.mvp_api.dto.request;

import jakarta.validation.constraints.NotNull;

import java.time.LocalDateTime;

public record ReservationRequest(
        @NotNull Long posteId,
        @NotNull LocalDateTime debut,
        @NotNull LocalDateTime fin) {
}