package com.petkeep.dto;

import com.petkeep.models.Role;

public class LoginUserResponse {

	private String username;
	private Role role;
	private boolean accountNonLocked;

	public LoginUserResponse(String username, Role role, boolean accountNonLocked) {
		this.username = username;
		this.role = role;
		this.accountNonLocked = accountNonLocked;
	}

	public String getUsername() {
		return username;
	}

	public void setUsername(String username) {
		this.username = username;
	}

	public Role getRole() {
		return role;
	}

	public void setRole(Role role) {
		this.role = role;
	}

	public boolean isAccountNonLocked() {
		return accountNonLocked;
	}

	public void setAccountNonLocked(boolean accountNonLocked) {
		this.accountNonLocked = accountNonLocked;
	}

}
