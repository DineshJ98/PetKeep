package com.petkeep.controller;

import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.petkeep.models.Role;
import com.petkeep.models.User;
import com.petkeep.repositories.UserRepo;
import com.petkeep.services.JWTService;
import com.petkeep.services.PetService;

import jakarta.servlet.http.HttpServletResponse;

@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {

	@Autowired
	private UserRepo userRepository;
	@Autowired
	private PasswordEncoder passwordEncoder;
	@Autowired
	private AuthenticationManager authManager;
	@Autowired
	private JWTService jwtService;
	@Autowired
	private PetService petService;

	@PostMapping("/register")
	public ResponseEntity<String> register(@RequestBody Map<String, String> request) {

		try {
			Role userRole = Role.valueOf(request.get("role").toUpperCase());

			User user = new User(request.get("username"), passwordEncoder.encode(request.get("password")), userRole);
			userRepository.save(user);

			return ResponseEntity.ok(user.toString());
		} catch (IllegalArgumentException ex) {
			ex.printStackTrace();
			return ResponseEntity.badRequest().body("Invalid role provided. Chose USER, ADMIN or MANAGER");
		}
	}

	@PostMapping("/login")
	public ResponseEntity<User> login(@RequestBody Map<String, String> request, HttpServletResponse response) {
		authManager.authenticate(
				new UsernamePasswordAuthenticationToken(request.get("username"), request.get("password")));

		User user = userRepository.findByUsername(request.get("username")).orElseThrow();

		String token = jwtService.generateToken(user);

		ResponseCookie cookie = ResponseCookie.from("jwt_token", token).httpOnly(true).secure(false).sameSite("Lax")
				.path("/").maxAge(24 * 60 * 60).build();
		response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());

		return ResponseEntity.ok(user);
	}

	@GetMapping("/profile")
	public ResponseEntity<User> getCurrentUserProfile() {
		Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

		if (authentication == null || !authentication.isAuthenticated()) {
			return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
		}

		User currentUser = (User) authentication.getPrincipal();

		User decayedUser = petService.getUserWithDecayedPet(currentUser.getId());

		return ResponseEntity.ok(decayedUser);
	}

}
