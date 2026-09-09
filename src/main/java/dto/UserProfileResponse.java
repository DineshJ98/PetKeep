package dto;

import com.petkeep.models.Pet;

public class UserProfileResponse {
	private String id;
	private String username;
	private Pet pet;

	public UserProfileResponse(String id, String username, Pet pet) {
		this.id = id;
		this.username = username;
		this.pet = pet;
	}

	public String getId() {
		return id;
	}

	public void setId(String id) {
		this.id = id;
	}

	public String getUsername() {
		return username;
	}

	public void setUsername(String username) {
		this.username = username;
	}

	public Pet getPet() {
		return pet;
	}

	public void setPet(Pet pet) {
		this.pet = pet;
	}

}
