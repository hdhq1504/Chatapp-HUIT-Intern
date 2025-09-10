package com.starwars.backend.configuration;

import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import com.starwars.backend.core.domain.Role;
import com.starwars.backend.dataprovider.repository.RoleRepository;

@Component
@RequiredArgsConstructor
public class DataInitializer {

    private final RoleRepository roleRepository;

    @PostConstruct
    public void initRoles() {
        createRoleIfNotExists("ADMIN", "Quản trị hệ thống");
        createRoleIfNotExists("MERCHANT", "Cửa hàng");
        createRoleIfNotExists("USER", "Người dùng");
    }

    private void createRoleIfNotExists(String roleName, String description) {
        roleRepository.findByName(roleName).ifPresentOrElse(
                role -> {
                },
                () -> {
                    Role role = Role.builder()
                            .name(roleName)
                            .description(description)
                            .build();
                    roleRepository.save(role);
                    System.out.println("Đã tạo role: " + roleName);
                });
    }
}
