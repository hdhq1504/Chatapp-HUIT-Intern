package com.starwars.backend.core.domain;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.JoinTable;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.Getter;
import lombok.Setter;

import org.hibernate.annotations.GenericGenerator;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import com.starwars.backend.common.enums.UserStatus;
import com.starwars.backend.entrypoint.dto.response.RegisterResponse;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Collection;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@EqualsAndHashCode(callSuper = true)
@Getter
@Setter
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "_user")
public class User extends BaseEntity implements UserDetails {
    @Id
    @GeneratedValue(generator = "uuid2")
    @GenericGenerator(name = "uuid2", strategy = "uuid2")
    private UUID id;

    private String name;
    private String email;
    private String phone;
    private String password;
    private String avatar;

    @Enumerated(EnumType.STRING)
    private UserStatus status;

    @Builder.Default
    private LocalDateTime lastLogin = LocalDateTime.now();

    private String activationKey;
    private String resetPasswordKey;
    private LocalDateTime activationExpiredDate;
    private LocalDateTime nextActivationTime;

    @Builder.Default
    private Boolean activated = false;

    @Builder.Default
    private Boolean banned = false;

    @ManyToMany(fetch = FetchType.EAGER, cascade = CascadeType.ALL)
    @JoinTable(name = "users_roles", joinColumns = @JoinColumn(name = "user_id", referencedColumnName = "id"), inverseJoinColumns = @JoinColumn(name = "role_id", referencedColumnName = "id"))
    private Set<Role> roles;

    @OneToMany(fetch = FetchType.EAGER, mappedBy = "user")
    private Set<Token> tokens;

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        List<GrantedAuthority> authorities = new ArrayList<>();
        if (roles != null) {
            for (Role role : roles) {
                authorities.add(new SimpleGrantedAuthority(role.getName()));
            }
        }
        return authorities;
    }

    @Override
    public String getUsername() {
        return email;
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return true;
    }

    public RegisterResponse toDto() {
        return RegisterResponse.builder()
                .id(this.id.toString())
                .name(this.name)
                .email(this.email)
                .roles(this.getRoles().stream().map(Role::getName).collect(Collectors.toSet()))
                .build();
    }

    @Override
    public String toString() {
        return "User{"
                + "id="
                + id
                + ", lastname='"
                + name
                + '\''
                + ", email='"
                + email
                + '\''
                + ", password='"
                + password
                + '\''
                + ", roles="
                + rolesToString()
                + ", tokens="
                + tokens
                + '}';
    }

    private String rolesToString() {
        if (roles == null)
            return "null";
        return roles.stream().map(Role::getName).collect(Collectors.joining(", "));
    }

    public void addRole(Role role) {
        if (roles == null) {
            roles = new HashSet<>();
        }
        if (!roles.contains(role)) {
            roles.add(role);
        }
    }

}
