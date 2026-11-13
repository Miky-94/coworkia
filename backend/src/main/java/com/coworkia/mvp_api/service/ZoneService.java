package com.coworkia.mvp_api.service;

import com.coworkia.mvp_api.dto.response.PosteDto;
import com.coworkia.mvp_api.dto.response.ZoneDto;
import com.coworkia.mvp_api.repository.PosteRepository;
import com.coworkia.mvp_api.repository.ReservationRepository;
import com.coworkia.mvp_api.repository.ZoneRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.coworkia.mvp_api.exception.ApiException;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@Transactional(readOnly = true)
public class ZoneService {

    private final ZoneRepository zoneRepository;
    private final PosteRepository posteRepository;
    private final ReservationRepository reservationRepository;

    public ZoneService(ZoneRepository zoneRepository,
                       PosteRepository posteRepository,
                       ReservationRepository reservationRepository) {
        this.zoneRepository = zoneRepository;
        this.posteRepository = posteRepository;
        this.reservationRepository = reservationRepository;
    }

    public List<ZoneDto> findAll() {
        return zoneRepository.findAll().stream()
                .map(zone -> new ZoneDto(zone.getId(), zone.getCode(), zone.getNom(), zone.getCapacite()))
                .toList();
    }

    public List<PosteDto> findPostesByZone(Long zoneId) {
        if (!zoneRepository.existsById(zoneId)) {
            throw new ApiException(HttpStatus.NOT_FOUND, "Zone not found");
        }

        // Ids des postes réservés à l'instant présent
        Set<Long> occupiedIds = reservationRepository.findActiveAt(LocalDateTime.now()).stream()
                .map(reservation -> reservation.getPoste().getId())
                .collect(Collectors.toSet());

        return posteRepository.findByZoneId(zoneId).stream()
                .map(poste -> new PosteDto(poste.getId(), poste.getNumero(), occupiedIds.contains(poste.getId())))
                .toList();
    }
}