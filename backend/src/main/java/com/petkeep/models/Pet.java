package com.petkeep.models;

import java.time.LocalDateTime;

public class Pet {
	private String name;
	private LocalDateTime bornAt;
	private LocalDateTime energyLastUpdateAt;
	private LocalDateTime cleanlinessLastUpdateAt;
	private int energy;
	private int cleanliness;
	private String avatarUrl;
	private String generationStatus;

	public Pet() {
	}

	public Pet(String name, LocalDateTime bornAt, int energy, int cleanliness) {
		super();
		this.name = name;
		this.bornAt = bornAt;
		this.energyLastUpdateAt = bornAt;
		this.cleanlinessLastUpdateAt = bornAt;
		this.energy = energy;
		this.cleanliness = cleanliness;
		this.avatarUrl = null;
		this.generationStatus = null;
	}

	public String getName() {
		return name;
	}

	public void setName(String name) {
		this.name = name;
	}

	public LocalDateTime getBornAt() {
		return bornAt;
	}

	public void setBornAt(LocalDateTime bornAt) {
		this.bornAt = bornAt;
	}

	public int getEnergy() {
		return energy;
	}

	public void setEnergy(int energy) {
		this.energy = energy;
	}

	public int getCleanliness() {
		return cleanliness;
	}

	public void setCleanliness(int cleanliness) {
		this.cleanliness = cleanliness;
	}

	public LocalDateTime getEnergyLastUpdateAt() {
		return energyLastUpdateAt;
	}

	public void setEnergyLastUpdateAt(LocalDateTime energyLastUpdateAt) {
		this.energyLastUpdateAt = energyLastUpdateAt;
	}

	public LocalDateTime getCleanlinessLastUpdateAt() {
		return cleanlinessLastUpdateAt;
	}

	public void setCleanlinessLastUpdateAt(LocalDateTime cleanlinessLastUpdateAt) {
		this.cleanlinessLastUpdateAt = cleanlinessLastUpdateAt;
	}
	

	public String getAvatarUrl() {
		return avatarUrl;
	}

	public void setAvatarUrl(String avatarUrl) {
		this.avatarUrl = avatarUrl;
	}

	public String getGenerationStatus() {
		return generationStatus;
	}

	public void setGenerationStatus(String generationStatus) {
		this.generationStatus = generationStatus;
	}

	@Override
	public String toString() {
		return "Pet [name=" + name + ", bornAt=" + bornAt + ", energyLastUpdateAt=" + energyLastUpdateAt
				+ ", cleanlinessLastUpdateAt=" + cleanlinessLastUpdateAt + ", energy=" + energy + ", cleanliness="
				+ cleanliness + ", avatarUrl=" + avatarUrl + ", generationStatus=" + generationStatus + "]";
	}
	
}
