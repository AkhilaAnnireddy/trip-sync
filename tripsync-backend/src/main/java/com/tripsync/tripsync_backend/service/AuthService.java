package com.tripsync.tripsync_backend.service;

import com.tripsync.tripsync_backend.dto.AuthResponse;
import com.tripsync.tripsync_backend.dto.LoginRequest;
import com.tripsync.tripsync_backend.dto.RegisterRequest;
import com.tripsync.tripsync_backend.dto.UserDTO;

public interface AuthService {

    AuthResponse register(RegisterRequest request);

    AuthResponse login(LoginRequest request);

    UserDTO getCurrentUser(String email);
}