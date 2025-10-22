package com.example.mensstandtall.ui.projects

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.mensstandtall.models.Project
import com.example.mensstandtall.repository.ProjectRepository
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.launch
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

data class ProjectStats(
    val total: Int = 0,
    val active: Int = 0,
    val completed: Int = 0,
    val overdue: Int = 0
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
                updateStats(projectList)
            }
        }
    }

    private fun updateStats(projectList: List<Project>) {
        val sdf = SimpleDateFormat("yyyy-MM-dd", Locale.getDefault())
        val today = Date()
        _stats.value = ProjectStats(
            total = projectList.size,
            active = projectList.count { it.status == "Active" },
            completed = projectList.count { it.status == "Completed" },
            overdue = projectList.count { project ->
                project.deadline.isNotEmpty() && try {
                    sdf.parse(project.deadline)?.before(today) == true && project.status != "Completed"
                } catch (e: Exception) {
                    false
                }
            }
        )
    }

    fun addProject(project: Project) {
        viewModelScope.launch {
            repository.addProject(project)
        }
    }

    fun deleteProject(projectId: String) {
        viewModelScope.launch {
            repository.deleteProject(projectId)
        }
    }

    fun searchProjects(query: String) {
        viewModelScope.launch {
            // The implementation of this will be in the repository
            // repository.searchProjects(query).collect { _projects.value = it }
        }
    }

    fun filterProjectsByStatus(status: String) {
        viewModelScope.launch {
            // The implementation of this will be in the repository
            // repository.filterProjectsByStatus(status).collect { _projects.value = it }
        }
    }
}
