package com.starwars.backend.dataprovider.repository;

import java.util.Optional;
import java.util.UUID;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.starwars.backend.core.domain.User;
import com.starwars.backend.common.enums.UserStatus;

public interface UserRepository extends JpaRepository<User, UUID> {
    Optional<User> findByEmail(String email);

    Optional<User> findByPhone(String phone);

    Optional<User> findByEmailAndActivationKey(String email, String key);

    Optional<User> findByPhoneAndActivationKey(String phone, String key);

    Optional<User> findByEmailAndActivated(String email, boolean activated);

    Optional<User> findByPhoneAndActivated(String phone, boolean activated);

    Optional<User> findByActivationKeyAndEmail(String activationKey, String email);

    Optional<User> findByResetPasswordKeyAndEmail(String key, String email);

    @Query("SELECT u FROM User u WHERE u.email = :emailOrPhone OR u.phone = :emailOrPhone")
    Optional<User> findByEmailOrPhone(@Param("emailOrPhone") String emailOrPhone);

    List<User> findByStatus(UserStatus status);
}
