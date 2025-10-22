package com.example.mensstandtall.ui.tasks

import android.view.LayoutInflater
import android.view.ViewGroup
import androidx.core.graphics.toColorInt
import androidx.recyclerview.widget.DiffUtil
import androidx.recyclerview.widget.ListAdapter
import androidx.recyclerview.widget.RecyclerView
import com.example.mensstandtall.databinding.ItemTaskBinding
import com.example.mensstandtall.models.Task
import java.text.SimpleDateFormat
import java.util.*

class TasksAdapter : ListAdapter<Task, TasksAdapter.TaskViewHolder>(TaskDiffCallback()) {

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): TaskViewHolder {
        val binding = ItemTaskBinding.inflate(LayoutInflater.from(parent.context), parent, false)
        return TaskViewHolder(binding)
    }

    override fun onBindViewHolder(holder: TaskViewHolder, position: Int) {
        holder.bind(getItem(position))
    }

    inner class TaskViewHolder(private val binding: ItemTaskBinding) :
        RecyclerView.ViewHolder(binding.root) {

        fun bind(task: Task) {
            // Set basic info
            binding.tvTaskTitle.text = task.name
            binding.tvTaskDescription.text = task.description
            binding.tvTaskProject.text = task.projectId

            // Set status text and color
            binding.tvTaskStatus.text = task.status
            val statusColor = when (task.status) {
                "Completed" -> "#48BB78".toColorInt()   // Green
                "In Progress" -> "#F6AD55".toColorInt() // Orange
                "To Do" -> "#4299E1".toColorInt()       // Blue
                else -> "#718096".toColorInt()          // Gray
            }
            binding.tvTaskStatus.setTextColor(statusColor)

            // Set priority text and color
            binding.tvTaskPriority.text = task.priority
            val priorityColor = when (task.priority) {
                "Low" -> "#48BB78".toColorInt()
                "Medium" -> "#F6AD55".toColorInt()
                "High" -> "#F56565".toColorInt()
                else -> "#718096".toColorInt()
            }
            binding.tvTaskPriority.setTextColor(priorityColor)

            // Set due date
            val deadlineText = if (task.deadline.isNotEmpty()) {
                try {
                    val sdf = SimpleDateFormat("yyyy-MM-dd", Locale.getDefault())
                    val date = sdf.parse(task.deadline)
                    SimpleDateFormat("MM/dd/yyyy", Locale.getDefault()).format(date!!)
                } catch (_: Exception) {
                    task.deadline
                }
            } else {
                "No deadline"
            }
            binding.tvDueDate.text = "Due: $deadlineText"
        }
    }

    class TaskDiffCallback : DiffUtil.ItemCallback<Task>() {
        override fun areItemsTheSame(oldItem: Task, newItem: Task) = oldItem.id == newItem.id
        override fun areContentsTheSame(oldItem: Task, newItem: Task) = oldItem == newItem
    }
}
