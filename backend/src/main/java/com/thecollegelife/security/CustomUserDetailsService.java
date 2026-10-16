package com.thecollegelife.security;

import com.thecollegelife.entity.User;
import com.thecollegelife.repository.UserRepository;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
public class CustomUserDetailsService implements UserDetailsService {

    private final UserRepository userRepository;

    public CustomUserDetailsService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    @Transactional(readOnly = true)
    public UserDetails loadUserByUsername(String emailOrPseudonym) throws UsernameNotFoundException {
        User user = userRepository.findByEmail(emailOrPseudonym)
                .or(() -> userRepository.findByPublicPseudonym(emailOrPseudonym))
                .orElseThrow(() -> new UsernameNotFoundException("User not found with email or pseudonym: " + emailOrPseudonym));

        return UserPrincipal.create(user);
    }

    @Transactional(readOnly = true)
    public UserDetails loadUserById(UUID id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with id: " + id));

        return UserPrincipal.create(user);
    }
}
