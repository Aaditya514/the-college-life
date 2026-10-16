package com.thecollegelife.repository;

import com.thecollegelife.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface UserRepository extends JpaRepository<User, UUID> {
    Optional<User> findByEmail(String email);
    Optional<User> findByPublicPseudonym(String publicPseudonym);
    boolean existsByEmail(String email);
}
