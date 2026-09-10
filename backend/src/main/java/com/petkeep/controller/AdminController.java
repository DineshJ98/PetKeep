package com.petkeep.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.petkeep.models.User;
import com.petkeep.services.AdminService;

@RestController
@RequestMapping("/api/v1/admin")
public class AdminController {

	@Autowired
	private AdminService adminService;

	@GetMapping("/users")
	@PreAuthorize("hasRole('ADMIN')")
	public ResponseEntity<List<User>> getAllUsers() {
		return ResponseEntity.ok(adminService.getAllUsers());
	}

	@PutMapping("/users/{id}")
	@PreAuthorize("hasRole('ADMIN')")
	public ResponseEntity<User> toggleBlockUser(@PathVariable String id) {
		return ResponseEntity.ok(adminService.toggleBlockUser(id));
	}

	@DeleteMapping("/users/{id}")
	@PreAuthorize("hasRole('ADMIN')")
	public ResponseEntity<Boolean> deleteUser(@PathVariable String id) {
		return ResponseEntity.ok(adminService.deleteUser(id));
	}

}
