package com.petkeep.services;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.Base64;
import java.util.Map;
import java.util.concurrent.CompletableFuture;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import com.petkeep.models.Action;
import com.petkeep.models.Pet;
import com.petkeep.models.User;
import com.petkeep.repositories.UserRepo;

@Service
public class PetService {

	@Autowired
	private UserRepo userRepo;
	private final int MAX_LEVEL = 100;
	private final int MIN_LEVEL = 0;

	@Value("${huggingface.secret}")
	private String token;

	private final RestTemplate restTemplate = new RestTemplate();

	public String generatePet(String userId, String type, String petName) {
		User currentUser = userRepo.findById(userId).orElseThrow();
		if (currentUser.getPet() != null) {
			return "already have a pet";
		}

		Pet initialPet = new Pet(petName, LocalDateTime.now(), MAX_LEVEL, MAX_LEVEL);
		initialPet.setAvatarUrl("https://cloudflare.com");
		initialPet.setGenerationStatus("PENDING");
		currentUser.setPet(initialPet);
		userRepo.save(currentUser);

		CompletableFuture.runAsync(() -> {
			try {
				String hfModelUrl = "https://router.huggingface.co/hf-inference/models/stabilityai/stable-diffusion-3-medium-diffusers";

				HttpHeaders headers = new HttpHeaders();
				headers.setContentType(MediaType.APPLICATION_JSON);

				headers.set("Authorization", "Bearer " + token);

				headers.set("Accept", "image/png");

				String richPrompt = "Cute pixel art game sprite sticker of a mini " + type
						+ ", flat white background, isolated digital character asset, high resolution";

				Map<String, Object> requestBody = Map.of("inputs", richPrompt);
				HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);

				System.out.println(
						"[Free AI Engine] Submitting text prompt payload to Stable Diffusion 3... Target type: "
								+ type);

				ResponseEntity<byte[]> response = restTemplate.exchange(hfModelUrl, HttpMethod.POST, entity,
						byte[].class);
				byte[] imageBytes = response.getBody();

				if (imageBytes == null || imageBytes.length == 0) {
					throw new RuntimeException("Hugging Face API returned an empty binary media stream data array.");
				}

				String base64Prefix = "data:image/jpeg;base64,";
				String base64Content = Base64.getEncoder().encodeToString(imageBytes);
				String fullEmbeddedDataUrl = base64Prefix + base64Content;

				User asyncUser = userRepo.findById(userId).orElseThrow();
				asyncUser.getPet().setAvatarUrl(fullEmbeddedDataUrl);
				asyncUser.getPet().setGenerationStatus("COMPLETED");

				asyncUser.getPet().setEnergyLastUpdateAt(LocalDateTime.now());
				asyncUser.getPet().setCleanlinessLastUpdateAt(LocalDateTime.now());

				userRepo.save(asyncUser);
				System.out
						.println("[Free AI Engine] Success! Free asset string saved to MongoDB text row successfully.");

			} catch (Exception apiEx) {
				System.err.println("[Free AI Engine Error Interception Boundary Caught]: " + apiEx.getMessage());
				// Safe Fallback Routine: Prevents stuck views if resource pipelines fail
				try {
					User errorUser = userRepo.findById(userId).orElseThrow();
					errorUser.getPet().setAvatarUrl("https://githubusercontent.com");
					errorUser.getPet().setGenerationStatus("FAILED");
					userRepo.save(errorUser);
					System.out.println("[Fallback System] Safely marked companion status as FAILED in MongoDB.");
				} catch (Exception dbEx) {
					System.err.println("Fatal database crash updating error status properties: " + dbEx.getMessage());
				}
			}
		});

		return "Generation pipeline successfully initialized.";
	}

	public User deletePet(String userId) {
		User currentUser = userRepo.findById(userId).orElseThrow();
		currentUser.setPet(null);
		return userRepo.save(currentUser);
	}

	public User action(String userId, String action, int level) {
		User currentUser = userRepo.findById(userId).orElseThrow();
		Pet pet = currentUser.getPet();
		if (pet == null)
			return currentUser;

		pet = this.applyTimeDecay(pet);

		Action actionType = Action.valueOf(action.toUpperCase());
		switch (actionType) {
		case FEED:
			int newEnergy = pet.getEnergy() + level;
			pet.setEnergy(Math.min(newEnergy, MAX_LEVEL));
			pet.setEnergyLastUpdateAt(LocalDateTime.now());
			break;
		case CLEAN:
			int newClean = pet.getCleanliness() + level;
			pet.setCleanliness(Math.min(newClean, MAX_LEVEL));
			pet.setCleanlinessLastUpdateAt(LocalDateTime.now());
			break;
		}
		currentUser.setPet(pet);
		return userRepo.save(currentUser);
	}

	private Pet applyTimeDecay(Pet pet) {
		if (pet == null) {
			return pet;
		}

		LocalDateTime now = LocalDateTime.now();

		if (pet.getEnergyLastUpdateAt() != null) {

			long energyMinutes = ChronoUnit.MINUTES.between(pet.getEnergyLastUpdateAt(), now);
			int energyDecayPoints = (int) energyMinutes;

			if (energyDecayPoints > 0) {
				pet.setEnergy(Math.max(pet.getEnergy() - energyDecayPoints, MIN_LEVEL));
				pet.setEnergyLastUpdateAt(pet.getEnergyLastUpdateAt().plusMinutes(energyDecayPoints));
			}
		}

		if (pet.getCleanlinessLastUpdateAt() != null) {

			long cleanlinessMinutes = ChronoUnit.MINUTES.between(pet.getCleanlinessLastUpdateAt(), now);
			int cleanlinessDecayPoints = (int) cleanlinessMinutes;

			if (cleanlinessDecayPoints > 0) {
				pet.setCleanliness(Math.max(pet.getCleanliness() - cleanlinessDecayPoints, MIN_LEVEL));
				pet.setCleanlinessLastUpdateAt(pet.getCleanlinessLastUpdateAt().plusMinutes(cleanlinessDecayPoints));
			}
		}

		return pet;
	}

	public User getUserWithDecayedPet(String userId) {

		User currentUser = userRepo.findById(userId).orElseThrow();
		Pet pet = currentUser.getPet();

		if (pet != null) {

			LocalDateTime oldEnergyTime = pet.getEnergyLastUpdateAt();
			LocalDateTime oldCleanTime = pet.getCleanlinessLastUpdateAt();

			pet = this.applyTimeDecay(pet);

			if (pet.getEnergyLastUpdateAt().isAfter(oldEnergyTime)
					|| pet.getCleanlinessLastUpdateAt().isAfter(oldCleanTime)) {
				currentUser.setPet(pet);
				userRepo.save(currentUser);
			}

		}
		return currentUser;
	}

}
