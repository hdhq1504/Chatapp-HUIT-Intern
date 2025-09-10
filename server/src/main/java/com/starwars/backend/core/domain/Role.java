package com.starwars.backend.core.domain;

import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.Table;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "roles")
public class Role {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    public long id;

    public String name;
    private String description;

    @ManyToMany(fetch = FetchType.EAGER, mappedBy = "roles")
    private List<User> users;

    @Override
    public String toString() {
        return "Role{"
                + "id="
                + id
                + ", name='"
                + name
                + '\''
                + ", description='"
                + description
                + '\''
                + '}';
    }
}