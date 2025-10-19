package com.example.mensstandtall.ui.tasks

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.mensstandtall.models.Task
import com.example.mensstandtall.repository.TaskRepository
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.launch

data class TaskStats(
    val total: Int = 0,
    val todo: Int = 0,
    val inProgress: Int = 0,
    val completed: Int = 0
)

class TasksViewModel : ViewModel() {
    private val repository = TaskRepository()

    private val _tasks = MutableStateFlow<List<Task>>(emptyList())
    val tasks: StateFlow<List<Task>> = _tasks

    private val _stats = MutableStateFlow(TaskStats())
    val stats: StateFlow<TaskStats> = _stats

    init {
        loadTasks()
    }

    private fun loadTasks() {
        viewModelScope.launch {
            repository.getTasks().collect { taskList ->
                _tasks.value = taskList
                _stats.value = TaskStats(
                    total = taskList.size,
                    todo = taskList.count { it.status == "To Do" },
                    inProgress = taskList.count { it.status == "In Progress" },
                    completed = taskList.count { it.status == "Completed" }
                )
            }
        }
    }
    suspend fun addTask(task: Task): Result<String> {
        return repository.addTask(task)
    }
}
