package com.ssafy.a410.common.config;

import io.sentry.Sentry;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;

@Configuration
public class SentryConfiguration {
    private final String NO_DSN = "NO_DSN";

    @Value("${sentry.cdn:NO_DSN}")
    private String sentryDsn;

    @PostConstruct
    public void init() {
        if (!NO_DSN.equals(sentryDsn)) {
            Sentry.init(options -> {
                options.setDsn(sentryDsn);
            });
        }
    }
}
