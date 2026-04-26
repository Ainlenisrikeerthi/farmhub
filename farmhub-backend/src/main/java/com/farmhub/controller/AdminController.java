package com.farmhub.controller;

import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin("*")
public class AdminController {

    @GetMapping("/dashboard")
    public String dashboard() {
        return "Welcome Admin";
    }
}
