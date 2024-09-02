package com.ssafy.a410.auth.model.entity;

import com.ssafy.a410.auth.domain.UserRole;
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
@Table(name = "user_profile")
public class UserProfileEntity {
    // 사용자 고유 식별자
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private int id;

    @Column(name = "uuid", unique = true, nullable = false)
    private String uuid;

    @Column(name = "nickname", unique = true, nullable = false)
    private String nickname;

    @Column(name = "role", nullable = false)
    @Enumerated(EnumType.STRING)
    private UserRole role;

    @Column(name = "catch_count", nullable = false)
    private int catchCount = 0;

    @Column(name = "survival_time_in_seconds", nullable = false)
    private long survivalTimeInSeconds = 0;

    @Column(name = "wins", nullable = false)
    private int wins = 0;

    @Column(name = "losses", nullable = false)
    private int losses = 0;

    public String getFormattedSurvivalTime() {
        long hours = survivalTimeInSeconds / 3600;
        long minutes = (survivalTimeInSeconds % 3600) / 60;
        long seconds = survivalTimeInSeconds % 60;
        return String.format("%02d:%02d:%02d", hours, minutes, seconds);
    }

    // 경기 종료 후 각 플레이어마다(로그인 한 플레이어라면 catchCount를 누적 시킨다.
    public void addCatchCount(int count){
        this.catchCount += count;
    }

    // 경기 종료 후 각 플레이어마다(로그인 한 플레이어라면 생존시간을 누적 시킨다.
    public void addSurvivalTimeInSeconds(long seconds){
        this.survivalTimeInSeconds += seconds;
    }

    public void addwins(){
        this.wins += 1;
    }

    public void addLosses(){
        this.losses += 1;
    }

}
