package com.coworkia.mvp_api.dto.response;

import java.time.LocalDate;

public record DailyOccupationDto(LocalDate date, String zoneNom, long occupied, int capacity) {
}
