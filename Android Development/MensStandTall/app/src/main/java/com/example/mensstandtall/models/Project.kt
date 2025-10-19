package com.example.mensstandtall.models

data class Project(
    val id: String = "",
    val authorEmail: String = "",
    val authorName: String = "",
    val createdAt: String = "",
    val updatedAt: String = "",
    val deadline: String = "",
    val description: String = "",
    val name: String = "",
    val priority: String = "",
    val progress: Int = 0,
    val status: String = "",
    val userId: String = ""
)

