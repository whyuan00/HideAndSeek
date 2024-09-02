package com.ssafy.a410.auth.service;

import com.ssafy.a410.common.constant.MilliSecOf;
import com.ssafy.a410.socket.controller.dto.SubscriptionTokenResp;
import com.ssafy.a410.socket.domain.Subscribable;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.util.Date;
import java.util.Map;

@Service
public class JWTService {
    private static final long EXPIRATION_AFTER = 10L * MilliSecOf.SECONDS;
    private final SecretKey secretKey;
    private final String issuer;

    public JWTService(@Value("${jwt.secret}") String rawSecretKey, @Value("${jwt.issuer}") String issuer) {
        secretKey = Keys.hmacShaKeyFor(Decoders.BASE64.decode(rawSecretKey));
        this.issuer = issuer;
    }

    public String generateToken(JWTType type, Map<String, Object> payload, long expirationAfter) {
        Claims claims = Jwts.claims()
                .add(payload)
                .add("type", type) // 타입 덮어쓰기
                .build();

        long now = System.currentTimeMillis();
        return Jwts.builder()
                .issuer(issuer) // 발급자
                .claims(claims) // 내용
                .issuedAt(new Date(now)) // 발급 시간
                .expiration(new Date(now + expirationAfter)) // 만료 시간
                .signWith(secretKey) // 서명
                .compact();
    }

    public String generateSubscriptionToken(Subscribable subscribable, String clientId) {
        Map<String, Object> payload = Map.of(
                SubscriptionTokenResp.DESTINATION_KEY, subscribable.getTopic(),
                SubscriptionTokenResp.CLIENT_ID_KEY, clientId
        );
        return generateToken(JWTType.TEMPORARY, payload, EXPIRATION_AFTER);
    }

    public String getUuidFromToken(String token) {
        return (String) getClaims(token).get("uuid");
    }

    public Claims getClaims(String token) {
        return Jwts.parser().verifyWith(secretKey).build().parseSignedClaims(token).getPayload();
    }
}
