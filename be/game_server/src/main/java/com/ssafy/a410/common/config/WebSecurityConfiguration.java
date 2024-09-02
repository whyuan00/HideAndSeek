package com.ssafy.a410.common.config;

import com.ssafy.a410.auth.filter.HTTPJWTAuthFilter;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;


@Slf4j
@EnableWebSecurity
@Configuration
public class WebSecurityConfiguration {
    // 로그인 하지 않아도 접근 가능한 경로
    private final Pattern[] anonymousAllowedPatterns = {
            // CommonController
            // Only to match '/'
            Pattern.compile("^/$"),
            // AuthController
            // Only to match '/api/auth/guest/sign-up'
            Pattern.compile("^/api/auth/guest/sign-up$"),
            Pattern.compile("^/api/auth/sign-up$"),
            Pattern.compile("^/api/auth/login$"),
            // Match '/ws' and '/ws' with query parameters
            Pattern.compile("^/ws(\\?.*)?$"),
    };

    private final List<String> allowedOrigins;

    public WebSecurityConfiguration(@Value("#{'${security.allowed-origins}'.split(';')}") List<String> allowedOrigins) {
        this.allowedOrigins = allowedOrigins;
    }


    @Bean
    public SecurityFilterChain filterChain(HttpSecurity security) throws Exception {
        security
                .addFilterBefore(httpJWTAuthFilter(), UsernamePasswordAuthenticationFilter.class)
                .authorizeHttpRequests(registry -> registry
                        .requestMatchers("/error").permitAll()
                        .requestMatchers(request -> {
                            String path = request.getServletPath();
                            return isAnonymousAllowedPath(path);
                        }).permitAll()
                        .anyRequest().authenticated()
                ).csrf(AbstractHttpConfigurer::disable)
                .cors(cors -> cors.configurationSource(request -> {
                    var corsConfiguration = new org.springframework.web.cors.CorsConfiguration();
                    corsConfiguration.setAllowedOrigins(allowedOrigins);
                    corsConfiguration.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
                    corsConfiguration.setAllowedHeaders(List.of("*"));
                    return corsConfiguration;
                }));
        return security.build();
    }

    public boolean isAnonymousAllowedPath(String path) {
        for (Pattern pattern : anonymousAllowedPatterns) {
            Matcher matcher = pattern.matcher(path);
            if (matcher.matches()) {
                return true;
            }
        }
        return false;
    }

    @Bean
    public HTTPJWTAuthFilter httpJWTAuthFilter() {
        return new HTTPJWTAuthFilter();
    }
}
