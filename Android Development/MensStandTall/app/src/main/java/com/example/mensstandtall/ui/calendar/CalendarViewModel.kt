package com.example.mensstandtall.ui.calendar

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.mensstandtall.models.Project
import com.example.mensstandtall.repository.ProjectRepository
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.launch

class CalendarViewModel : ViewModel() {
    private val repository = ProjectRepository()

    // Expose projects as StateFlow
    private val _projects = MutableStateFlow<List<Project>>(emptyList())
    val projects: StateFlow<List<Project>> = _projects

    init {
        loadProjects()
    }

    private fun loadProjects() {
        viewModelScope.launch {
            repository.getProjects().collect { projectList ->
                _projects.value = projectList
            }
        }
    }
}

