package com.example.mensstandtall.models

data class Task(
    val id: String = "",
    val projectId: String = "",
    val name: String = "",
    val description: String = "",
    val status: String = "",
    val priority: String = "",
    val createdAt: String = "",
    val updatedAt: String = "",
    val deadline: String = "",
    val assignedTo: String = "",
    val progress: Int = 0
)


