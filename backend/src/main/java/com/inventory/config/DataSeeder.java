package com.inventory.config;

import com.inventory.model.Role;
import com.inventory.model.User;
import com.inventory.repository.RoleRepository;
import com.inventory.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.HashSet;
import java.util.Set;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataSeeder implements CommandLineRunner {

    private final RoleRepository roleRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        // 1. Criar roles se necessário
        if (roleRepository.count() == 0) {
            roleRepository.save(new Role(null, Role.ERole.ROLE_ADMIN));
            roleRepository.save(new Role(null, Role.ERole.ROLE_MANAGER));
            roleRepository.save(new Role(null, Role.ERole.ROLE_USER));
            log.info("Roles iniciais criados.");
        }

        // 2. Criar usuário admin se não existir (apenas admin, sem produtos)
        if (!userRepository.existsByUsername("admin")) {
            User admin = new User();
            admin.setUsername("admin");
            admin.setEmail("admin@smartstock.com");
            admin.setPassword(passwordEncoder.encode("admin123"));
            admin.setFullName("Administrador");
            Set<Role> roles = new HashSet<>();
            roles.add(roleRepository.findByName(Role.ERole.ROLE_ADMIN).orElseThrow());
            admin.setRoles(roles);
            userRepository.save(admin);
            log.info("Usuário admin criado (admin / admin123). Nenhum produto foi adicionado.");
        }
    }
}