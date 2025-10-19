package com.example.mensstandtall.ui.projects

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.mensstandtall.models.Project
import com.example.mensstandtall.repository.ProjectRepository
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.launch

data class ProjectStats(
    val total: Int = 0,
    val active: Int = 0,
    val completed: Int = 0
)

class ProjectsViewModel : ViewModel() {
    private val repository = ProjectRepository()

    private val _projects = MutableStateFlow<List<Project>>(emptyList())
    val projects: StateFlow<List<Project>> = _projects

    private val _stats = MutableStateFlow(ProjectStats())
    val stats: StateFlow<ProjectStats> = _stats

    init {
        loadProjects()
    }

    private fun loadProjects() {
        viewModelScope.launch {
            repository.getProjects().collect { projectList ->
                _projects.value = projectList
                _stats.value = ProjectStats(
                    total = projectList.size,
                    active = projectList.count { it.status == "Active" },
                    completed = projectList.count { it.status == "Completed" }
                )
            }
        }
    }
    suspend fun addProject(project: Project): Result<String> {
        return repository.addProject(project)
    }

}
