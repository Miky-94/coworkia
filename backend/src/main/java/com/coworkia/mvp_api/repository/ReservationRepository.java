package com.coworkia.mvp_api.repository;

import com.coworkia.mvp_api.entity.Reservation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

public interface ReservationRepository extends JpaRepository<Reservation, Long> {

    // Vrai si le poste est déjà réservé sur une partie du créneau demandé
    @Query("""
        select count(reservation) > 0
        from Reservation reservation
        where reservation.poste.id = :posteId
          and reservation.statut = com.coworkia.mvp_api.entity.ReservationStatus.CONFIRMEE
          and reservation.debut < :end
          and reservation.fin > :start
        """)
    boolean existsOverlap(@Param("posteId") Long posteId,
                          @Param("start") LocalDateTime start,
                          @Param("end") LocalDateTime end);

    // Réservations d'un utilisateur, la plus récente en premier
    @Query("""
        select reservation
        from Reservation reservation
        where reservation.user.id = :userId
        order by reservation.debut desc
        """)
    List<Reservation> findByUserId(@Param("userId") Long userId);

    // Réservations en cours à un instant donné (occupation en temps réel)
    @Query("""
        select reservation
        from Reservation reservation
        join fetch reservation.poste poste
        join fetch poste.zone
        where reservation.statut = com.coworkia.mvp_api.entity.ReservationStatus.CONFIRMEE
          and reservation.debut <= :instant
          and reservation.fin > :instant
        """)
    List<Reservation> findActiveAt(@Param("instant") LocalDateTime instant);

    // Réservations confirmées qui commencent dans la période demandée
    @Query("""
    select reservation
    from Reservation reservation
    join fetch reservation.poste poste
    join fetch poste.zone
    where reservation.statut = com.coworkia.mvp_api.entity.ReservationStatus.CONFIRMEE
      and reservation.debut >= :start
      and reservation.debut < :end
    """)
    List<Reservation> findConfirmedStartingBetween(@Param("start") LocalDateTime start,
                                                   @Param("end") LocalDateTime end);
}