package com.coworkia.mvp_api.service;

import com.coworkia.mvp_api.dto.response.ReservationDto;
import com.coworkia.mvp_api.dto.request.ReservationRequest;
import com.coworkia.mvp_api.entity.Poste;
import com.coworkia.mvp_api.entity.Reservation;
import com.coworkia.mvp_api.entity.ReservationStatus;
import com.coworkia.mvp_api.entity.User;
import com.coworkia.mvp_api.repository.PosteRepository;
import com.coworkia.mvp_api.repository.ReservationRepository;
import com.coworkia.mvp_api.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.coworkia.mvp_api.exception.ApiException;

import java.time.LocalDateTime;
import java.util.List;

@Service
@Transactional
public class ReservationService {

    private final ReservationRepository reservationRepository;
    private final PosteRepository posteRepository;
    private final UserRepository userRepository;

    public ReservationService(ReservationRepository reservationRepository,
                              PosteRepository posteRepository,
                              UserRepository userRepository) {
        this.reservationRepository = reservationRepository;
        this.posteRepository = posteRepository;
        this.userRepository = userRepository;
    }

    public ReservationDto create(String email, ReservationRequest request) {
        if (!request.fin().isAfter(request.debut()) || request.fin().isBefore(LocalDateTime.now())) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Invalid time slot");
        }

        Poste poste = posteRepository.findById(request.posteId())
                .filter(Poste::isActif)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Poste not found"));

        // Refuse la réservation si le poste est déjà pris sur ce créneau
        if (reservationRepository.existsOverlap(poste.getId(), request.debut(), request.fin())) {
            throw new ApiException(HttpStatus.CONFLICT, "Poste already reserved");
        }

        Reservation reservation = new Reservation();
        reservation.setUser(findUser(email));
        reservation.setPoste(poste);
        reservation.setDebut(request.debut());
        reservation.setFin(request.fin());
        reservation.setStatut(ReservationStatus.CONFIRMEE);

        return toDto(reservationRepository.save(reservation));
    }

    @Transactional(readOnly = true)
    public List<ReservationDto> findMine(String email) {
        return reservationRepository.findByUserId(findUser(email).getId()).stream()
                .map(this::toDto)
                .toList();
    }

    public void cancel(String email, Long reservationId) {
        Reservation reservation = reservationRepository.findById(reservationId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Reservation not found"));

        // Seul le propriétaire peut annuler sa réservation
        if (!reservation.getUser().getEmail().equals(email)) {
            throw new ApiException(HttpStatus.FORBIDDEN, "Not your reservation");
        }
        reservation.setStatut(ReservationStatus.ANNULEE);
    }

    private User findUser(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ApiException(HttpStatus.UNAUTHORIZED, "User not found"));
    }

    private ReservationDto toDto(Reservation reservation) {
        return new ReservationDto(reservation.getId(),
                reservation.getPoste().getNumero(),
                reservation.getPoste().getZone().getNom(),
                reservation.getDebut(),
                reservation.getFin(),
                reservation.getStatut().name());
    }
}