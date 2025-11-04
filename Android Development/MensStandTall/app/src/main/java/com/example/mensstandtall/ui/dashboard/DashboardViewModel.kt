package com.example.mensstandtall.ui.dashboard

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.mensstandtall.models.Project
import com.example.mensstandtall.repository.ProjectRepository
import com.example.mensstandtall.repository.TaskRepository
import com.example.mensstandtall.repository.UserRepository
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.combine
import kotlinx.coroutines.launch
import java.text.SimpleDateFormat
import java.util.*

data class DashboardStats(
    val activeProjects: Int = 0,
    val completedTasks: Int = 0,
    val teamMembers: Int = 0,
    val upcomingProjects: Int = 0,
    val completedTasksCount: Int = 0,
    val inProgressTasksCount: Int = 0,
    val todoTasksCount: Int = 0
)

class DashboardViewModel : ViewModel() {

    private val projectRepository = ProjectRepository()
    private val taskRepository = TaskRepository()
    private val userRepository = UserRepository()

    private val _dashboardStats = MutableStateFlow(DashboardStats())
    val dashboardStats: StateFlow<DashboardStats> = _dashboardStats

    init {
        loadDashboardData()
    }

    private fun loadDashboardData() {
        viewModelScope.launch {
            combine(
                projectRepository.getProjects(),
                taskRepository.getTasks(),
                userRepository.getUsers()
            ) { projects, tasks, users ->

                val activeProjects = projects.count { it.status.equals("Active", true) }

                val completedTasks = tasks.count { it.status.equals("Completed", true) }
                val inProgressTasks = tasks.count { it.status.equals("In Progress", true) }
                val todoTasks = tasks.count { it.status.equals("To Do", true) }

                // Upcoming projects = deadline date > current date
                val sdf = SimpleDateFormat("yyyy-MM-dd", Locale.getDefault())
                val now = Date()
                val upcomingProjects = projects.count {
                    try {
                        val deadline = sdf.parse(it.deadline)
                        deadline != null && deadline.after(now)
                    } catch (e: Exception) {
                        false
                    }
                }

                DashboardStats(
                    activeProjects = activeProjects,
                    completedTasks = completedTasks,
                    teamMembers = users.size,
                    upcomingProjects = upcomingProjects,
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


