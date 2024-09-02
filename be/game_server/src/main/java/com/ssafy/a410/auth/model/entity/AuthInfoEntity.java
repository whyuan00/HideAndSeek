package com.ssafy.a410.auth.model.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Getter
@Builder
@AllArgsConstructor
@NoArgsConstructor
@Table(name = "auth_info")
public class AuthInfoEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private int id;

    @OneToOne
    @JoinColumn(name = "user_profile_id", nullable = false)
    private UserProfileEntity userProfile;

    @Column(name = "login_id", unique = true, nullable = false)
    private String loginId;

    @Column(name = "hashed_password", nullable = false)
    private String hashedPassword;

    @Column(name = "salt", nullable = false)
    private String salt;
}
