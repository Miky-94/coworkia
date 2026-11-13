package com.coworkia.mvp_api.dto.response;

public record ZoneOccupationDto(Long zoneId, String zoneNom, long occupied, int capacity) {
}
