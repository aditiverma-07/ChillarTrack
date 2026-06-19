package com.chillartrack;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class ChillarTrackApplication {
    public static void main(String[] args) {
        SpringApplication.run(ChillarTrackApplication.class, args);
    }
}
