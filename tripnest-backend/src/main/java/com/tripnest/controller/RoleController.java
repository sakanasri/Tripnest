package com.tripnest.controller;

import com.tripnest.model.Role;
import com.tripnest.service.RoleService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/roles")
public class RoleController {

    @Autowired
    private RoleService roleService;

    @PostMapping("/add")
    public Role addRole(@RequestBody Role role) {
        return roleService.saveRole(role);
    }

    @GetMapping("/all")
    public List<Role> getAllRoles() {
        return roleService.getAllRoles();
    }
}