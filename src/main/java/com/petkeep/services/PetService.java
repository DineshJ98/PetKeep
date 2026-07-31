package com.petkeep.services;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

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

	public String generatePet(String userId, String type, String petName) {
		User currentUser = userRepo.findById(userId).orElseThrow();
		if (currentUser.getPet() != null) {
			return "already have a pet";
		}
		currentUser.setPet(new Pet(petName, LocalDateTime.now(), 100, 100));
		userRepo.save(currentUser);

		String normalizedtype = (type != null) ? type.toLowerCase().trim() : "";

		switch (normalizedtype) {
		case "dog":
			return "🐕";
		case "cat":
			return "🐈";
		case "rabbit":
			return "🐇";
		}
		return "👾";
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
				pet.setCleanlinessLastUpdateAt(
						pet.getCleanlinessLastUpdateAt().plusMinutes(cleanlinessDecayPoints));
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
