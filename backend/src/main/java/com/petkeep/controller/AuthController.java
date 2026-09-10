package com.petkeep.controller;

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

import com.petkeep.dto.CreateUserRequest;
import com.petkeep.dto.CreateUserResponse;
import com.petkeep.dto.LoginUserRequest;
import com.petkeep.dto.LoginUserResponse;
import com.petkeep.dto.UserProfileResponse;
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
	public ResponseEntity<CreateUserResponse> register(@RequestBody CreateUserRequest request) {

		try {
			User user = new User(request.getUsername(), passwordEncoder.encode(request.getPassword()),
					request.getRole());
			userRepository.save(user);
			CreateUserResponse userResponse = new CreateUserResponse(user.getId(), user.getUsername(), user.getRole());
			return ResponseEntity.ok(userResponse);
		} catch (IllegalArgumentException ex) {
			ex.printStackTrace();
			return ResponseEntity.badRequest().body(null);
		}
	}

	@PostMapping("/login")
	public ResponseEntity<LoginUserResponse> login(@RequestBody LoginUserRequest request,
			HttpServletResponse response) {
		authManager.authenticate(new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword()));
		User user = userRepository.findByUsername(request.getUsername()).orElseThrow();
		String token = jwtService.generateToken(user);
		ResponseCookie cookie = ResponseCookie.from("jwt_token", token).httpOnly(true).secure(false).sameSite("Lax")
				.path("/").maxAge(24 * 60 * 60).build();
		response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());
		LoginUserResponse userResponse = new LoginUserResponse(user.getUsername(), user.getRole(),
				user.isAccountNonLocked());
		return ResponseEntity.ok(userResponse);
	}

	@GetMapping("/profile")
	public ResponseEntity<UserProfileResponse> getCurrentUserProfile() {
		Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
		if (authentication == null || !authentication.isAuthenticated()) {
			return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
		}
		User currentUser = (User) authentication.getPrincipal();
		User decayedUser = petService.getUserWithDecayedPet(currentUser.getId());
		UserProfileResponse userResponse = new UserProfileResponse(decayedUser.getId(), decayedUser.getUsername(),
				decayedUser.getPet());
		return ResponseEntity.ok(userResponse);
	}

}
