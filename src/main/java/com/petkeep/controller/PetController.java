package com.petkeep.controller;

import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.petkeep.models.User;
import com.petkeep.services.PetService;

@RestController
@RequestMapping("/api/v1/pet")
public class PetController {

	@Autowired
	private PetService petService;

	@PostMapping("/generate")
	@PreAuthorize("hasRole('USER')")
	public ResponseEntity<String> generatePet(@RequestBody Map<String, String> request) {
		String userId = request.get("userId");
		String prompt = request.get("prompt");
		String petName = request.get("petName");
		return ResponseEntity.ok(petService.generatePet(userId, prompt, petName));
	}

	@PostMapping("/action")
	@PreAuthorize("hasRole('USER')")
	public ResponseEntity<User> action(@RequestBody Map<String, String> request, @RequestParam String action) {
		String userId = request.get("userId");
		int level = Integer.parseInt(request.get("level"));
		return ResponseEntity.ok(petService.action(userId, action, level));
	}
	
	@DeleteMapping("/{id}")
	@PreAuthorize("hasRole('USER')")
	public ResponseEntity<User> deletePet(@PathVariable String id){
		return ResponseEntity.ok(petService.deletePet(id));
	}

}
