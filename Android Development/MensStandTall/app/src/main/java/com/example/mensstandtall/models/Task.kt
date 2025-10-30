package com.example.mensstandtall.models

data class Task(
    val id: String = "",
    val title: String = "",
    val description: String = "",
    val status: String = "To Do",
    val priority: String = "Low",
    val projectId: String = "",
    val projectName: String = "",
    val dueDate: Long = 0,
    val createdDate: Long = System.currentTimeMillis(),
    val assignedTo: String = "",
    val createdBy: String = ""
)
