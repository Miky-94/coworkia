package com.coworkia.mvp_api.controller;

import com.coworkia.mvp_api.dto.response.ReservationDto;
import com.coworkia.mvp_api.dto.request.ReservationRequest;
import com.coworkia.mvp_api.service.ReservationService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/reservations")
public class ReservationController {

    private final ReservationService reservationService;

    public ReservationController(ReservationService reservationService) {
        this.reservationService = reservationService;
    }

    // authentication.getName() renvoie l'email mis dans le token par le filtre JWT
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ReservationDto create(Authentication authentication, @Valid @RequestBody ReservationRequest request) {
        return reservationService.create(authentication.getName(), request);
    }

    @GetMapping("/me")
    public List<ReservationDto> findMine(Authentication authentication) {
        return reservationService.findMine(authentication.getName());
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void cancel(Authentication authentication, @PathVariable Long id) {
        reservationService.cancel(authentication.getName(), id);
    }
}