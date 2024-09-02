package com.ssafy.a410.auth.model.repository;

import com.ssafy.a410.auth.model.entity.AuthInfoEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface AuthInfoRepository extends JpaRepository<AuthInfoEntity, Integer> {
    Optional<AuthInfoEntity> findByLoginId(String loginId);
}
