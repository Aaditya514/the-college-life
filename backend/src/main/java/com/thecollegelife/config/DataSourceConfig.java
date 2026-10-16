package com.thecollegelife.config;

import com.zaxxer.hikari.HikariConfig;
import com.zaxxer.hikari.HikariDataSource;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;

import javax.sql.DataSource;
import java.net.URI;

@Configuration
public class DataSourceConfig {

    private static final Logger log = LoggerFactory.getLogger(DataSourceConfig.class);

    @Value("${spring.datasource.url:jdbc:postgresql://localhost:5432/collegelife_db}")
    private String rawUrl;

    @Value("${spring.datasource.username:postgres}")
    private String username;

    @Value("${spring.datasource.password:}")
    private String password;

    @Value("${spring.datasource.driver-class-name:org.postgresql.Driver}")
    private String driverClassName;

    @Bean
    @Primary
    public DataSource dataSource() {
        HikariConfig config = new HikariConfig();

        String jdbcUrl = rawUrl;
        String dbUser = username;
        String dbPassword = password;

        // Automatically convert cloud database URLs (Render, Railway, Heroku, Supabase, Neon)
        // e.g., postgres://user:pass@host:port/dbname -> jdbc:postgresql://host:port/dbname
        if (rawUrl != null && (rawUrl.startsWith("postgres://") || rawUrl.startsWith("postgresql://"))) {
            try {
                String clean = rawUrl.replace("jdbc:", "");
                URI uri = new URI(clean);

                String host = uri.getHost();
                int port = uri.getPort() != -1 ? uri.getPort() : 5432;
                String path = uri.getPath(); // /dbname

                jdbcUrl = "jdbc:postgresql://" + host + ":" + port + path;

                if (uri.getUserInfo() != null) {
                    String[] userInfo = uri.getUserInfo().split(":", 2);
                    if (dbUser == null || dbUser.isBlank() || "postgres".equals(dbUser)) {
                        dbUser = userInfo[0];
                    }
                    if ((dbPassword == null || dbPassword.isBlank()) && userInfo.length > 1) {
                        dbPassword = userInfo[1];
                    }
                }
                log.info("🌐 Converted Cloud Database URI to JDBC: host={}, port={}, database={}", host, port, path);
            } catch (Exception e) {
                log.warn("⚠️ Could not parse custom DB URI format, falling back to raw: {}", e.getMessage());
            }
        }

        config.setJdbcUrl(jdbcUrl);
        if (dbUser != null && !dbUser.isBlank()) {
            config.setUsername(dbUser);
        }
        if (dbPassword != null && !dbPassword.isBlank()) {
            config.setPassword(dbPassword);
        }
        config.setDriverClassName(driverClassName);
        config.setMaximumPoolSize(10);
        config.setMinimumIdle(2);
        config.setIdleTimeout(30000);
        config.setMaxLifetime(1800000);
        config.setConnectionTimeout(20000);

        return new HikariDataSource(config);
    }
}
