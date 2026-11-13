package com.coworkia.mvp_api.dto.response;

import java.time.LocalDateTime;

public record ReservationDto(Long id, String posteNumero, String zoneNom,
                             LocalDateTime debut, LocalDateTime fin, String statut) {
}