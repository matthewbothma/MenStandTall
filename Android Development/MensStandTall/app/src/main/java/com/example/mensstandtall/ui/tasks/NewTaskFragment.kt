package com.example.mensstandtall.ui.tasks

import android.app.DatePickerDialog
import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.PopupMenu
import android.widget.Toast
import androidx.fragment.app.Fragment
import androidx.fragment.app.viewModels
import androidx.lifecycle.lifecycleScope
import com.example.mensstandtall.R
import com.example.mensstandtall.databinding.FragmentNewTaskBinding
import com.example.mensstandtall.models.Task
import java.text.SimpleDateFormat
import java.util.*
import kotlinx.coroutines.launch

class NewTaskFragment : Fragment() {

    private var _binding: FragmentNewTaskBinding? = null
    private val binding get() = _binding!!
    private val viewModel: TasksViewModel by viewModels()

    private var selectedDueDate: Long = 0
    private var selectedPriority: String = "Low Priority"

    override fun onCreateView(
        inflater: LayoutInflater, container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View {
        _binding = FragmentNewTaskBinding.inflate(inflater, container, false)
        return binding.root
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)

        setupClickListeners()
    }

    private fun setupClickListeners() {
        binding.ivClose.setOnClickListener { parentFragmentManager.popBackStack() }
        binding.btnCancel.setOnClickListener { parentFragmentManager.popBackStack() }

        binding.tvDueDate.setOnClickListener { showDatePicker() }
        binding.tvPriority.setOnClickListener { showPriorityMenu(it) }

        binding.btnAddTask.setOnClickListener { createTask() }
    }

    private fun showDatePicker() {
        val calendar = Calendar.getInstance()
        val datePicker = DatePickerDialog(
            requireContext(),
            { _, year, month, day ->
                calendar.set(year, month, day)
                selectedDueDate = calendar.timeInMillis
                val sdf = SimpleDateFormat("MM/dd/yyyy", Locale.getDefault())
                binding.tvDueDate.text = sdf.format(calendar.time)
            },
            calendar.get(Calendar.YEAR),
            calendar.get(Calendar.MONTH),
            calendar.get(Calendar.DAY_OF_MONTH)
        )
        datePicker.show()
    }

    private fun showPriorityMenu(anchor: View) {
        val popup = PopupMenu(requireContext(), anchor)
        popup.menu.add("Low Priority")
        popup.menu.add("Medium Priority")
        popup.menu.add("High Priority")
        popup.setOnMenuItemClickListener { item ->
            selectedPriority = item.title.toString()
            binding.tvPriority.text = selectedPriority
            true
        }
        popup.show()
    }

    private fun createTask() {
        val name = binding.etTaskName.text.toString().trim()
        val description = binding.etDescription.text.toString().trim()
        val projectId = "" // Or get from a project selection dialog

        if (name.isEmpty()) {
            Toast.makeText(requireContext(), "Please enter a task name", Toast.LENGTH_SHORT).show()
            return
        }

        val sdf = SimpleDateFormat("yyyy-MM-dd", Locale.getDefault())
        val deadlineString = if (selectedDueDate != 0L) sdf.format(Date(selectedDueDate)) else ""

        val task = Task(
            name = name,
            description = description,
            status = "To Do",
            priority = selectedPriority,
            projectId = projectId,
            deadline = deadlineString,
            createdAt = sdf.format(Date()),
            updatedAt = sdf.format(Date())
        )

        // Consider showing a progress indicator
        lifecycleScope.launch {
            val result = viewModel.addTask(task)
            result.onSuccess {
                Toast.makeText(requireContext(), "Task created successfully", Toast.LENGTH_SHORT).show()
                parentFragmentManager.popBackStack()
            }.onFailure {
                Toast.makeText(requireContext(), "Error: ${it.message}", Toast.LENGTH_LONG).show()
            }
        }
    }

    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
    }
}
