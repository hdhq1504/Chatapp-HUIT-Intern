package com.starwars.backend.common;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;

import com.starwars.backend.core.domain.User;

import java.util.List;
import java.util.Map;

public class SecurityUtils {
    public static String getCurrentUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        Object principal = authentication.getPrincipal();
        if (principal instanceof User user) {
            return user.getId().toString();
        }
        throw new IllegalStateException("Principal is not an instance of User");
    }

    public static String getCurrentUserEmail() {
        @SuppressWarnings("unchecked")
        var principal =
                (Map<String, String>)
                        SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        return principal.get("email");
    }

    public static String getCurrentUserName() {
        @SuppressWarnings("unchecked")
        var principal =
                (Map<String, String>)
                        SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        return principal.get("name");
    }

    public static List<String> getCurrentUserRoles() {
        return SecurityContextHolder.getContext().getAuthentication().getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .toList();
    }

    public static boolean isRecruiter() {
        return getCurrentUserRoles().contains(UserRole.MERCHANT.toString());
    }

    public static boolean isAdmin() {
        return getCurrentUserRoles().contains(UserRole.ADMIN.toString());
    }

    public static boolean isUser() {
        List<String> roles = getCurrentUserRoles();
        return !roles.contains(UserRole.ADMIN.toString()) && !roles.contains(UserRole.MERCHANT.toString());
    }

}
