package com.webybook.config;

import com.webybook.entity.Role;
import com.webybook.repository.RoleRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RoleDataInitializer {

    @Bean
    CommandLineRunner initializeRoles(RoleRepository roleRepository) {
        return args -> {
            createIfMissing(roleRepository, "CUSTOMER", "Khách hàng");
            createIfMissing(roleRepository, "ADMIN", "Quản trị viên");
        };
    }

    private void createIfMissing(RoleRepository roleRepository, String name, String description) {
        if (roleRepository.findByName(name).isEmpty()) {
            Role role = Role.forName(name);
            role.setDescription(description);
            roleRepository.save(role);
        }
    }
}
