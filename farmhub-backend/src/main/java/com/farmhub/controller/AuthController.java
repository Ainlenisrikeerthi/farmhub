package com.farmhub.controller;

import com.farmhub.dto.*;
import com.farmhub.entity.EmailVerificationToken;
import com.farmhub.entity.PasswordResetToken;
import com.farmhub.entity.Role;
import com.farmhub.entity.User;
import com.farmhub.repository.EmailVerificationTokenRepository;
import com.farmhub.repository.PasswordResetTokenRepository;
import com.farmhub.repository.UserRepository;
import com.farmhub.security.JwtService;

import org.springframework.http.*;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.security.authentication.*;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin("*")
public class AuthController {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final PasswordResetTokenRepository resetTokenRepository;
    private final EmailVerificationTokenRepository emailVerificationTokenRepository;
    private final JavaMailSender mailSender;

    public AuthController(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            AuthenticationManager authenticationManager,
            JwtService jwtService,
            PasswordResetTokenRepository resetTokenRepository,
            EmailVerificationTokenRepository emailVerificationTokenRepository,
            JavaMailSender mailSender) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
        this.jwtService = jwtService;
        this.resetTokenRepository = resetTokenRepository;
        this.emailVerificationTokenRepository = emailVerificationTokenRepository;
        this.mailSender = mailSender;
    }

    // ================= REGISTER =================
    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest request) {

        String name = request.getName() == null ? "" : request.getName().trim();
        String email = request.getEmail() == null ? "" : request.getEmail().trim().toLowerCase();
        String phone = request.getPhone() == null ? "" : request.getPhone().trim();

        if (name.length() < 3)
            return ResponseEntity.badRequest().body("Name must be at least 3 characters");

        if (!email.matches("^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$"))
            return ResponseEntity.badRequest().body("Enter a valid email address");

        if (!phone.matches("^[6-9][0-9]{9}$"))
            return ResponseEntity.badRequest().body("Enter a valid 10-digit Indian mobile number");

        if (request.getPassword() == null || request.getPassword().length() < 6)
            return ResponseEntity.badRequest().body("Password must be at least 6 characters");

        if (userRepository.existsByEmail(email))
            return ResponseEntity.badRequest().body("Email already exists");

        if (userRepository.existsByPhone(phone))
            return ResponseEntity.badRequest().body("Phone already exists");

        User user = new User();
        user.setName(name);
        user.setEmail(email);
        user.setPhone(phone);
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole(Role.USER);
        user.setEmailVerified(false);

        userRepository.save(user);

        sendVerificationEmail(user);

        return ResponseEntity.ok(
                Map.of("message", "Signup successful. Please verify your email before login."));
    }

    // ================= LOGIN =================
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody AuthRequest request) {
        try {
            String email = request.getEmail().trim().toLowerCase();

            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(email, request.getPassword()));

            User user = userRepository.findByEmail(email).orElseThrow();

            if (!user.isEmailVerified()) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body("Please verify your email before login");
            }

            UserDetails userDetails = org.springframework.security.core.userdetails.User
                    .withUsername(user.getEmail())
                    .password(user.getPassword())
                    .roles(user.getRole().name())
                    .build();

            String token = jwtService.generateToken(userDetails);

            return ResponseEntity.ok(
                    new AuthResponse(token, user.getName(), user.getEmail(), user.getRole().name()));
        } catch (BadCredentialsException ex) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid email or password");
        }
    }

    // ================= VERIFY EMAIL =================
    @GetMapping("/verify-email")
    public ResponseEntity<?> verifyEmail(@RequestParam String token) {

        EmailVerificationToken verificationToken = emailVerificationTokenRepository.findByToken(token).orElse(null);

        if (verificationToken == null)
            return ResponseEntity.badRequest().body(Map.of("message", "Invalid verification link"));

        if (verificationToken.getExpiryDate().isBefore(LocalDateTime.now()))
            return ResponseEntity.badRequest().body(Map.of("message", "Verification link expired"));

        User user = userRepository.findByEmail(verificationToken.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found"));

        user.setEmailVerified(true);
        userRepository.save(user);

        emailVerificationTokenRepository.delete(verificationToken);

        return ResponseEntity.ok(Map.of("message", "Email verified successfully. You can login now."));
    }

    // ================= RESEND =================
    @PostMapping("/resend-verification")
    public ResponseEntity<?> resendVerification(@RequestBody ForgotPasswordRequest request) {

        String email = request.getEmail() == null ? "" : request.getEmail().trim().toLowerCase();

        User user = userRepository.findByEmail(email).orElse(null);

        if (user == null)
            return ResponseEntity.ok(Map.of("message", "If this email exists, verification link has been sent"));

        if (user.isEmailVerified())
            return ResponseEntity.badRequest().body(Map.of("message", "Email is already verified"));

        emailVerificationTokenRepository.deleteByEmail(user.getEmail());

        sendVerificationEmail(user);

        return ResponseEntity.ok(Map.of("message", "Verification link resent to your email"));
    }

    // ================= SEND EMAIL =================
    private void sendVerificationEmail(User user) {

        String token = UUID.randomUUID().toString();

        EmailVerificationToken verificationToken = new EmailVerificationToken();
        verificationToken.setEmail(user.getEmail());
        verificationToken.setToken(token);
        verificationToken.setExpiryDate(LocalDateTime.now().plusHours(24));

        emailVerificationTokenRepository.save(verificationToken);

        String link = "http://localhost:5173/verify-email?token=" + token;

        // 🔥 DEBUG LOGS (IMPORTANT)
        System.out.println("====================================");
        System.out.println("Sending verification email to: " + user.getEmail());
        System.out.println("Verification link: " + link);
        System.out.println("====================================");

        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(user.getEmail());
        message.setSubject("Verify your Farm Hub account");
        message.setText(
                "Hi " + user.getName() + ",\n\n" +
                        "Click below to verify your account:\n\n" +
                        link + "\n\n" +
                        "Valid for 24 hours.\n\n" +
                        "Farm Hub");

        try {
            mailSender.send(message);
            System.out.println("EMAIL SENT SUCCESSFULLY ✅");
        } catch (Exception e) {
            System.out.println("EMAIL FAILED ❌: " + e.getMessage());
        }
    }

    // ================= FORGOT PASSWORD =================
    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@RequestBody ForgotPasswordRequest request) {

        User user = userRepository.findByEmail(request.getEmail().trim().toLowerCase()).orElse(null);

        if (user == null)
            return ResponseEntity.ok(Map.of("message", "If this email exists, reset link has been sent"));

        resetTokenRepository.deleteByEmail(user.getEmail());

        String token = UUID.randomUUID().toString();

        PasswordResetToken resetToken = new PasswordResetToken();
        resetToken.setEmail(user.getEmail());
        resetToken.setToken(token);
        resetToken.setExpiryDate(LocalDateTime.now().plusMinutes(30));

        resetTokenRepository.save(resetToken);

        String resetLink = "http://localhost:5173/reset-password?token=" + token;

        System.out.println("RESET LINK: " + resetLink);

        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(user.getEmail());
        message.setSubject("Reset Password");
        message.setText("Reset link:\n" + resetLink);

        mailSender.send(message);

        return ResponseEntity.ok(Map.of("message", "Password reset link sent"));
    }
}