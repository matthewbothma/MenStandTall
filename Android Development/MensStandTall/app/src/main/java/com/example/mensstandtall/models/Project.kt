package com.example.mensstandtall.models

data class Project(
    val id: String = "",
    val name: String = "",
    val description: String = "",
    val status: String = "Active",
    val priority: String = "Low",
    val progress: Int = 0,
    val dueDate: Long = 0,
    val createdDate: Long = System.currentTimeMillis(),
    val assignedTo: String = "",
    val createdBy: String = ""
)
