package com.coworkia.mvp_api.controller;

import com.coworkia.mvp_api.dto.response.DailyOccupationDto;
import com.coworkia.mvp_api.dto.response.ZoneOccupationDto;
import com.coworkia.mvp_api.service.OccupationService;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/occupation")
public class OccupationController {

    private final OccupationService OccupationService;

    public OccupationController(OccupationService OccupationService) {
        this.OccupationService = OccupationService;
    }

    @GetMapping("/current")
    public List<ZoneOccupationDto> current() {
        return OccupationService.current();
    }

    @GetMapping("/history")
    public List<DailyOccupationDto> history(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {
        return OccupationService.history(from, to);
    }
}