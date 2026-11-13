package com.coworkia.mvp_api.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "poste")
@Getter
@Setter
@NoArgsConstructor
public class Poste {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "zone_id")
    private Zone zone;

    @Column(nullable = false, unique = true)
    private String numero;

    @Column(nullable = false)
    private boolean actif = true;
}
