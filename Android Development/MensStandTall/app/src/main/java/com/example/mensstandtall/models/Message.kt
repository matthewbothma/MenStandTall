package com.example.mensstandtall.models

data class Message(
    val id: String = "",
    val title: String = "",
    val content: String = "",
    val authorName: String = "",
    val authorEmail: String = "",
    val category: String = "",
    val priority: String = "",
    val status: String = "",
    val read: Boolean = false,
    val timestamp: String = ""
)
