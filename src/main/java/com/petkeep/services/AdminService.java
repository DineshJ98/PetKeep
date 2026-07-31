package com.petkeep.services;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.petkeep.models.User;
import com.petkeep.repositories.UserRepo;

@Service
public class AdminService {

	@Autowired
	private UserRepo userRepo;

	public List<User> getAllUsers() {
		return userRepo.findAll();
	}

	public User toggleBlockUser(String id) {
		if (!userRepo.existsById(id)) {
			throw new IllegalAccessError("User with " + id + " not exist...");
		}
		User user = userRepo.findById(id).orElseThrow();
		boolean blockState = user.isAccountNonLocked();
		user.setBlocked(!blockState);
		return userRepo.save(user);
	}

	public boolean deleteUser(String id) {
		if (!userRepo.existsById(id)) {
			throw new IllegalAccessError("User with " + id + " is not exists...");
		}
		userRepo.deleteById(id);
		return true;
	}

}
