package com.example.mensstandtall.ui.tasks

import android.graphics.Color
import android.view.LayoutInflater
import android.view.ViewGroup
import androidx.recyclerview.widget.DiffUtil
import androidx.recyclerview.widget.ListAdapter
import androidx.recyclerview.widget.RecyclerView
import com.example.mensstandtall.databinding.ItemTaskBinding
import com.example.mensstandtall.models.Task
import java.text.SimpleDateFormat
import java.util.*

class TasksAdapter(
    private val onStatusChange: (task: Task, newStatus: String) -> Unit,
    private val onDeleteTask: (task: Task) -> Unit
) : ListAdapter<Task, TasksAdapter.TaskViewHolder>(TaskDiffCallback()) {

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): TaskViewHolder {
        val binding = ItemTaskBinding.inflate(LayoutInflater.from(parent.context), parent, false)
        return TaskViewHolder(binding, onStatusChange, onDeleteTask)
    }

    override fun onBindViewHolder(holder: TaskViewHolder, position: Int) {
        holder.bind(getItem(position))
    }

    class TaskViewHolder(
        private val binding: ItemTaskBinding,
        private val onStatusChange: (task: Task, newStatus: String) -> Unit,
        private val onDeleteTask: (task: Task) -> Unit
    ) : RecyclerView.ViewHolder(binding.root) {

        fun bind(task: Task) {
            binding.tvTaskTitle.text = task.name
            binding.tvTaskDescription.text = task.description
            binding.tvTaskProject.text = task.projectId
            binding.tvTaskStatus.text = task.status
            binding.tvTaskPriority.text = task.priority

            val dateFormat = SimpleDateFormat("MM/dd/yyyy", Locale.getDefault())
            val deadlineText = if (task.deadline.isNotEmpty()) {
                try {
                    val sdf = SimpleDateFormat("yyyy-MM-dd", Locale.getDefault())
                    dateFormat.format(sdf.parse(task.deadline)!!)
                } catch (e: Exception) {
                    task.deadline
                }
            } else "No deadline"
            binding.tvDueDate.text = "Due: $deadlineText"

            // Status color
            val statusColor = when (task.status) {
                "Completed" -> Color.parseColor("#48BB78")
                "In Progress" -> Color.parseColor("#F6AD55")
                "To Do" -> Color.parseColor("#4299E1")
                else -> Color.parseColor("#718096")
            }
            binding.tvTaskStatus.setTextColor(statusColor)

            // Priority color
            val priorityColor = when (task.priority) {
                "Low" -> Color.parseColor("#48BB78")
                "Medium" -> Color.parseColor("#F6AD55")
                "High" -> Color.parseColor("#F56565")
                else -> Color.parseColor("#718096")
            }
            binding.tvTaskPriority.setTextColor(priorityColor)

            // 3-dot menu click → opens dialog with Change Status / Delete
            binding.ivMenu.setOnClickListener {
                TaskStatusDialog.show(
                    binding.root.context,
                    task,
                    onStatusSelected = { newStatus ->
                        onStatusChange(task, newStatus)
                    },
                    onDelete = { deletedTask ->
                        onDeleteTask(deletedTask)
                    }
                )
            }
        }
    }

    class TaskDiffCallback : DiffUtil.ItemCallback<Task>() {
        override fun areItemsTheSame(oldItem: Task, newItem: Task) = oldItem.id == newItem.id
        override fun areContentsTheSame(oldItem: Task, newItem: Task) = oldItem == newItem
    }
}





