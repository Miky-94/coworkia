package com.coworkia.mvp_api.controller;

import com.coworkia.mvp_api.dto.response.PosteDto;
import com.coworkia.mvp_api.dto.response.ZoneDto;
import com.coworkia.mvp_api.service.ZoneService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/zones")
public class ZoneController {

    private final ZoneService zoneService;

    public ZoneController(ZoneService zoneService) {
        this.zoneService = zoneService;
    }

    @GetMapping
    public List<ZoneDto> findAll() {
        return zoneService.findAll();
    }

    @GetMapping("/{id}/postes")
    public List<PosteDto> findPostes(@PathVariable Long id) {
        return zoneService.findPostesByZone(id);
    }
}