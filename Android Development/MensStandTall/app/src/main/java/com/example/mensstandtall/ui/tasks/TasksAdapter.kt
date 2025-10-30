package com.example.mensstandtall.ui.tasks

import android.view.LayoutInflater
import android.view.ViewGroup
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

    class TaskViewHolder(private val binding: ItemTaskBinding) :
        RecyclerView.ViewHolder(binding.root) {

        fun bind(task: Task) {
            binding.tvTaskTitle.text = task.title
            binding.tvTaskDescription.text = task.description
            binding.tvTaskProject.text = task.projectName
            binding.tvTaskStatus.text = task.status
            binding.tvTaskPriority.text = task.priority

            val dateFormat = SimpleDateFormat("MM/dd/yyyy", Locale.getDefault())
            binding.tvDueDate.text = "Due: ${dateFormat.format(Date(task.dueDate))}"

            val statusColor = when (task.status) {
                "Completed" -> android.graphics.Color.parseColor("#48BB78")
                "In Progress" -> android.graphics.Color.parseColor("#F6AD55")
                "To Do" -> android.graphics.Color.parseColor("#4299E1")
                else -> android.graphics.Color.parseColor("#718096")
            }
            binding.tvTaskStatus.setTextColor(statusColor)

            val priorityColor = when (task.priority) {
                "Low" -> android.graphics.Color.parseColor("#48BB78")
                "Medium" -> android.graphics.Color.parseColor("#F6AD55")
                "High" -> android.graphics.Color.parseColor("#F56565")
                else -> android.graphics.Color.parseColor("#718096")
            }
            binding.tvTaskPriority.setTextColor(priorityColor)
        }
    }

    class TaskDiffCallback : DiffUtil.ItemCallback<Task>() {
        override fun areItemsTheSame(oldItem: Task, newItem: Task) = oldItem.id == newItem.id
        override fun areContentsTheSame(oldItem: Task, newItem: Task) = oldItem == newItem
    }
}
