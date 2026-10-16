package com.thecollegelife.dto;

import jakarta.validation.constraints.NotBlank;

public class LoginRequestDto {

    @NotBlank(message = "Email or pseudonym is required")
    private String login;

    @NotBlank(message = "Password is required")
    private String password;

    public LoginRequestDto() {
    }

    public LoginRequestDto(String login, String password) {
        this.login = login;
        this.password = password;
    }

    public String getLogin() {
        return login;
    }

    public void setLogin(String login) {
        this.login = login;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    @Override
    public String toString() {
        return "LoginRequestDto{" +
                "login='" + login + '\'' +
                ", password='[PROTECTED]'" +
                '}';
    }
}
