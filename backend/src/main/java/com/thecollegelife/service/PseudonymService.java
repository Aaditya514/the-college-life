package com.thecollegelife.service;

import com.thecollegelife.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.Random;

@Service
public class PseudonymService {

    private final UserRepository userRepository;
    private final Random random = new Random();

    private static final String[] PREFIXES = {
        "Midnight", "Hostel 4", "Back Row", "Library", "Bench Five",
        "Third Floor", "Terrace", "Canteen", "Lab Seven", "Gate Four",
        "Bunk Bed", "Chai Tapri", "Last Semester", "Overthinking", "Reluctant",
        "Curious", "Silent", "Lost", "Quiet", "Day Scholar"
    };

    private static final String[] NOUNS = {
        "Philosopher", "Scholar", "Scribe", "Ghost", "Dreamer",
        "Survivor", "Chronicler", "Poet", "Coder", "Wanderer",
        "Observer", "Thinker", "Artist", "Night Owl", "Storyteller",
        "Listener", "Idealist", "Rebel", "Strategist", "Architect"
    };

    public PseudonymService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public String generateUniquePseudonym() {
        for (int attempts = 0; attempts < 100; attempts++) {
            String prefix = PREFIXES[random.nextInt(PREFIXES.length)];
            String noun = NOUNS[random.nextInt(NOUNS.length)];
            String candidate = prefix + " " + noun;

            if (userRepository.findByPublicPseudonym(candidate).isEmpty()) {
                return candidate;
            }

            // If collision, append a 2-digit number
            int suffix = 10 + random.nextInt(90);
            candidate = prefix + " " + noun + " " + suffix;
            if (userRepository.findByPublicPseudonym(candidate).isEmpty()) {
                return candidate;
            }
        }
        return "Campus Wanderer " + (100 + random.nextInt(900));
    }
}
