package com.coworkia.mvp_api.repository;

import com.coworkia.mvp_api.entity.Poste;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface PosteRepository extends JpaRepository<Poste, Long> {

    // Postes d'une zone, triés par numéro
    @Query("""
        select poste
        from Poste poste
        where poste.zone.id = :zoneId
        order by poste.numero
        """)
    List<Poste> findByZoneId(@Param("zoneId") Long zoneId);
}