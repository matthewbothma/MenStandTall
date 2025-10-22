package com.example.mensstandtall.ui.projects

import android.view.LayoutInflater
import android.view.ViewGroup
import androidx.recyclerview.widget.DiffUtil
import androidx.recyclerview.widget.ListAdapter
import androidx.recyclerview.widget.RecyclerView
import com.example.mensstandtall.R
import com.example.mensstandtall.databinding.ItemProjectBinding
import com.example.mensstandtall.models.Project
import java.text.SimpleDateFormat
import java.util.*

class ProjectsAdapter(
    private val onItemClicked: (Project) -> Unit,
    private val onEditClicked: (Project) -> Unit,
    private val onDeleteClicked: (Project) -> Unit,
    private val onGroupClicked: (Project) -> Unit
) : ListAdapter<Project, ProjectsAdapter.ProjectViewHolder>(ProjectDiffCallback()) {

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): ProjectViewHolder {
        val binding = ItemProjectBinding.inflate(LayoutInflater.from(parent.context), parent, false)
        return ProjectViewHolder(binding)
    }

    override fun onBindViewHolder(holder: ProjectViewHolder, position: Int) {
        holder.bind(getItem(position))
    }

    inner class ProjectViewHolder(private val binding: ItemProjectBinding) :
        RecyclerView.ViewHolder(binding.root) {

        fun bind(project: Project) {
            binding.tvProjectTitle.text = project.name
            binding.tvAssignedUser.text = if (project.authorName.isNotEmpty()) project.authorName else "Unknown User"
            binding.tvProjectDescription.text = project.description
            binding.tvProjectStatus.text = project.status
            binding.tvProgressPercentage.text = "${project.progress}%"
            binding.progressBar.progress = project.progress

            // Format and display the due date
            val outputFormat = SimpleDateFormat("MM/dd/yyyy", Locale.getDefault())
            val inputFormat = SimpleDateFormat("yyyy-MM-dd", Locale.getDefault())
            binding.tvDueDate.text = try {
                val date = inputFormat.parse(project.deadline)
                "Due: ${outputFormat.format(date!!)}"
            } catch (e: Exception) {
                "Due: N/A"
            }

            // Set click listeners
            itemView.setOnClickListener { onItemClicked(project) }
            binding.ivView.setOnClickListener { onItemClicked(project) }
            binding.ivEdit.setOnClickListener { onEditClicked(project) }
            binding.ivGroup.setOnClickListener { onGroupClicked(project) }
        }
    }

    class ProjectDiffCallback : DiffUtil.ItemCallback<Project>() {
        override fun areItemsTheSame(oldItem: Project, newItem: Project) = oldItem.id == newItem.id
        override fun areContentsTheSame(oldItem: Project, newItem: Project) = oldItem == newItem
    }
}
