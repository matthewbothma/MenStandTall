package com.example.mensstandtall.ui.projects

import android.view.LayoutInflater
import android.view.ViewGroup
import android.widget.PopupMenu
import android.widget.Toast
import androidx.recyclerview.widget.DiffUtil
import androidx.recyclerview.widget.ListAdapter
import androidx.recyclerview.widget.RecyclerView
import com.example.mensstandtall.R
import com.example.mensstandtall.databinding.ItemProjectBinding
import com.example.mensstandtall.models.Project
import java.text.SimpleDateFormat
import java.util.*

class ProjectsAdapter(
    private val onUpdateStatus: (Project, String) -> Unit,
    private val onDeleteProject: (Project) -> Unit
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
            binding.tvProjectName.text = project.name
            binding.tvProjectDescription.text = project.description
            binding.tvProjectStatus.text = project.status

            val dateFormat = SimpleDateFormat("MM/dd/yyyy", Locale.getDefault())
            val deadlineDate = try {
                SimpleDateFormat("yyyy-MM-dd", Locale.getDefault()).parse(project.deadline)
            } catch (e: Exception) { null }
            binding.tvDueDate.text = "Due: ${deadlineDate?.let { dateFormat.format(it) } ?: "N/A"}"

            val statusColor = when (project.status) {
                "Active" -> android.graphics.Color.parseColor("#48BB78")
                "Completed" -> android.graphics.Color.parseColor("#4299E1")
                else -> android.graphics.Color.parseColor("#F56565")
            }
            binding.tvProjectStatus.setTextColor(statusColor)

            // ✅ Popup menu (status change + delete)
            binding.ivMenu.setOnClickListener {
                val popup = PopupMenu(binding.root.context, binding.ivMenu)
                popup.menuInflater.inflate(R.menu.project_item_menu, popup.menu)

                popup.setOnMenuItemClickListener { item ->
                    when (item.itemId) {
                        R.id.action_edit_status_active -> {
                            if (project.status != "Active") onUpdateStatus(project, "Active")
                            true
                        }
                        R.id.action_edit_status_completed -> {
                            if (project.status != "Completed") onUpdateStatus(project, "Completed")
                            true
                        }
                        R.id.action_edit_status_on_hold -> {
                            if (project.status != "On Hold") onUpdateStatus(project, "On Hold")
                            true
                        }
                        R.id.action_delete -> {
                            // Confirm delete
                            androidx.appcompat.app.AlertDialog.Builder(binding.root.context)
                                .setTitle("Delete Project")
                                .setMessage("Are you sure you want to delete '${project.name}'?")
                                .setPositiveButton("Delete") { _, _ ->
                                    onDeleteProject(project)
                                }
                                .setNegativeButton("Cancel", null)
                                .show()
                            true
                        }
                        else -> false
                    }
                }

                popup.show()
            }
        }
    }

    class ProjectDiffCallback : DiffUtil.ItemCallback<Project>() {
        override fun areItemsTheSame(oldItem: Project, newItem: Project) = oldItem.id == newItem.id
        override fun areContentsTheSame(oldItem: Project, newItem: Project) = oldItem == newItem
    }
}



