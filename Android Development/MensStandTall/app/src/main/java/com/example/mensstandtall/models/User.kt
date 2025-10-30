package com.example.mensstandtall.models

data class User(
    val id: String = "",
    val email: String = "",
    val displayName: String = "",
    val role: String = "Project Manager",
    val photoUrl: String = "",
    val createdAt: Long = System.currentTimeMillis()
)
