package com.example.mensstandtall.ui.projects

import android.view.LayoutInflater
import android.view.ViewGroup
import androidx.recyclerview.widget.DiffUtil
import androidx.recyclerview.widget.ListAdapter
import androidx.recyclerview.widget.RecyclerView
import com.example.mensstandtall.databinding.ItemProjectBinding
import com.example.mensstandtall.models.Project
import java.text.SimpleDateFormat
import java.util.*

class ProjectsAdapter : ListAdapter<Project, ProjectsAdapter.ProjectViewHolder>(ProjectDiffCallback()) {

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): ProjectViewHolder {
        val binding = ItemProjectBinding.inflate(LayoutInflater.from(parent.context), parent, false)
        return ProjectViewHolder(binding)
    }

    override fun onBindViewHolder(holder: ProjectViewHolder, position: Int) {
        holder.bind(getItem(position))
    }

    class ProjectViewHolder(private val binding: ItemProjectBinding) :
        RecyclerView.ViewHolder(binding.root) {

        fun bind(project: Project) {
            binding.tvProjectName.text = project.name
            binding.tvProjectDescription.text = project.description
            binding.tvProjectStatus.text = project.status
            binding.tvProjectProgress.text = "${project.progress}%"
            binding.progressBar.progress = project.progress

            val dateFormat = SimpleDateFormat("MM/dd/yyyy", Locale.getDefault())
            binding.tvDueDate.text = "Due: ${dateFormat.format(Date(project.dueDate))}"

            val statusColor = when (project.status) {
                "Active" -> android.graphics.Color.parseColor("#48BB78")
                "Completed" -> android.graphics.Color.parseColor("#4299E1")
                else -> android.graphics.Color.parseColor("#F56565")
            }
            binding.tvProjectStatus.setTextColor(statusColor)
        }
    }

    class ProjectDiffCallback : DiffUtil.ItemCallback<Project>() {
        override fun areItemsTheSame(oldItem: Project, newItem: Project) = oldItem.id == newItem.id
        override fun areContentsTheSame(oldItem: Project, newItem: Project) = oldItem == newItem
    }
}
