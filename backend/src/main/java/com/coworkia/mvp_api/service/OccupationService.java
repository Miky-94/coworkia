package com.coworkia.mvp_api.service;

import com.coworkia.mvp_api.dto.response.DailyOccupationDto;
import com.coworkia.mvp_api.dto.response.ZoneOccupationDto;
import com.coworkia.mvp_api.entity.Reservation;
import com.coworkia.mvp_api.entity.Zone;
import com.coworkia.mvp_api.exception.ApiException;
import com.coworkia.mvp_api.repository.ReservationRepository;
import com.coworkia.mvp_api.repository.ZoneRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@Transactional(readOnly = true)
public class OccupationService {

    private static final int MAX_DAYS = 90;

    private final ReservationRepository reservationRepository;
    private final ZoneRepository zoneRepository;

    public OccupationService(ReservationRepository reservationRepository, ZoneRepository zoneRepository) {
        this.reservationRepository = reservationRepository;
        this.zoneRepository = zoneRepository;
    }

    // Occupation en temps réel : postes réservés à cet instant, par zone
    public List<ZoneOccupationDto> current() {
        Map<Long, Long> occupiedByZone = reservationRepository.findActiveAt(LocalDateTime.now()).stream()
                .map(Reservation::getPoste)
                .distinct()
                .collect(Collectors.groupingBy(poste -> poste.getZone().getId(), Collectors.counting()));

        return zoneRepository.findAll().stream()
                .map(zone -> new ZoneOccupationDto(zone.getId(), zone.getNom(),
                        occupiedByZone.getOrDefault(zone.getId(), 0L), zone.getCapacite()))
                .toList();
    }

    // Historique : postes réservés par jour et par zone (un poste réservé plusieurs fois le même jour compte une fois)
    public List<DailyOccupationDto> history(LocalDate from, LocalDate to) {
        if (to.isBefore(from) || ChronoUnit.DAYS.between(from, to) > MAX_DAYS) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Invalid period");
        }

        Map<DayZone, Long> occupiedByDayAndZone = reservationRepository
                .findConfirmedStartingBetween(from.atStartOfDay(), to.plusDays(1).atStartOfDay()).stream()
                .collect(Collectors.groupingBy(
                        reservation -> new DayZone(reservation.getDebut().toLocalDate(),
                                reservation.getPoste().getZone().getId()),
                        Collectors.mapping(reservation -> reservation.getPoste().getId(),
                                Collectors.collectingAndThen(Collectors.toSet(), poste -> (long) poste.size()))));

        List<Zone> zones = zoneRepository.findAll();
        List<DailyOccupationDto> result = new ArrayList<>();
        for (LocalDate day = from; !day.isAfter(to); day = day.plusDays(1)) {
            for (Zone zone : zones) {
                long occupied = occupiedByDayAndZone.getOrDefault(new DayZone(day, zone.getId()), 0L);
                result.add(new DailyOccupationDto(day, zone.getNom(), occupied, zone.getCapacite()));
            }
        }
        return result;
    }

    // Clé de regroupement : un jour + une zone
    private record DayZone(LocalDate day, Long zoneId) {
    }
}