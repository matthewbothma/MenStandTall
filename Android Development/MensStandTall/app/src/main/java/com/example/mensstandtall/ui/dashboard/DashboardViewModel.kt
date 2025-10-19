package com.example.mensstandtall.ui.dashboard

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.mensstandtall.repository.ProjectRepository
import com.example.mensstandtall.repository.TaskRepository
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.combine
import kotlinx.coroutines.launch

data class DashboardStats(
    val activeProjects: Int = 0,
    val completedTasks: Int = 0,
    val teamMembers: Int = 2,
    val upcomingEvents: Int = 0,
    val completedTasksCount: Int = 0,
    val inProgressTasksCount: Int = 0,
    val todoTasksCount: Int = 0
)

class DashboardViewModel : ViewModel() {

    private val projectRepository = ProjectRepository()
    private val taskRepository = TaskRepository()

    private val _dashboardStats = MutableStateFlow(DashboardStats())
    val dashboardStats: StateFlow<DashboardStats> = _dashboardStats

    init {
        loadDashboardData()
    }

    private fun loadDashboardData() {
        viewModelScope.launch {
            combine(
                projectRepository.getProjects(),
                taskRepository.getTasks()
            ) { projects, tasks ->

                val activeProjects = projects.count { it.status.equals("Active", true) }
                val completedTasks = tasks.count { it.status.equals("Completed", true) }
                val inProgressTasks = tasks.count { it.status.equals("In Progress", true) }
                val todoTasks = tasks.count { it.status.equals("To Do", true) }

                DashboardStats(
                    activeProjects = activeProjects,
                    completedTasks = completedTasks,
                    teamMembers = 2,
                    upcomingEvents = 0,
                    completedTasksCount = completedTasks,
                    inProgressTasksCount = inProgressTasks,
                    todoTasksCount = todoTasks
                )
            }.collect { stats ->
                _dashboardStats.value = stats
            }
        }
    }
}

