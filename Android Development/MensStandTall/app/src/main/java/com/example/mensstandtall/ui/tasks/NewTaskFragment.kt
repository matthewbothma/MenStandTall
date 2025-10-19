package com.example.mensstandtall.ui.tasks

import android.app.DatePickerDialog
import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.ArrayAdapter
import android.widget.Toast
import androidx.fragment.app.Fragment
import androidx.fragment.app.viewModels
import androidx.lifecycle.lifecycleScope
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

    override fun onCreateView(
        inflater: LayoutInflater, container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View {
        _binding = FragmentNewTaskBinding.inflate(inflater, container, false)
        return binding.root
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)

        setupDropdowns()
        setupDatePicker()

        binding.btnCreateTask.setOnClickListener {
            createTask()
        }
    }

    private fun setupDropdowns() {
        val statusAdapter = ArrayAdapter(
            requireContext(),
            android.R.layout.simple_spinner_dropdown_item,
            listOf("To Do", "In Progress", "Completed")
        )
        binding.spinnerStatus.adapter = statusAdapter

        val priorityAdapter = ArrayAdapter(
            requireContext(),
            android.R.layout.simple_spinner_dropdown_item,
            listOf("Low", "Medium", "High")
        )
        binding.spinnerPriority.adapter = priorityAdapter
    }

    private fun setupDatePicker() {
        binding.etDueDate.setOnClickListener {
            val calendar = Calendar.getInstance()
            val datePicker = DatePickerDialog(
                requireContext(),
                { _, year, month, day ->
                    calendar.set(year, month, day)
                    selectedDueDate = calendar.timeInMillis
                    val sdf = SimpleDateFormat("yyyy-MM-dd", Locale.getDefault()) // match string format
                    binding.etDueDate.setText(sdf.format(calendar.time))
                },
                calendar.get(Calendar.YEAR),
                calendar.get(Calendar.MONTH),
                calendar.get(Calendar.DAY_OF_MONTH)
            )
            datePicker.show()
        }
    }

    private fun createTask() {
        val name = binding.etTaskTitle.text.toString().trim() // model expects 'name'
        val description = binding.etTaskDescription.text.toString().trim()
        val status = binding.spinnerStatus.selectedItem.toString()
        val priority = binding.spinnerPriority.selectedItem.toString()
        val projectId = "" // optional, or get from another field if needed

        if (name.isEmpty()) {
            Toast.makeText(requireContext(), "Please enter task title", Toast.LENGTH_SHORT).show()
            return
        }

        // Convert selectedDueDate to string format for your model
        val sdf = SimpleDateFormat("yyyy-MM-dd", Locale.getDefault())
        val deadlineString = if (selectedDueDate != 0L) sdf.format(Date(selectedDueDate)) else ""

        val task = Task(
            name = name,
            description = description,
            status = status,
            priority = priority,
            projectId = projectId,
            deadline = deadlineString,
            createdAt = sdf.format(Date()), // current date
            updatedAt = sdf.format(Date())
        )

        binding.progressBar.visibility = View.VISIBLE
        binding.btnCreateTask.isEnabled = false

        lifecycleScope.launch {
            val result = viewModel.addTask(task)
            binding.progressBar.visibility = View.GONE
            binding.btnCreateTask.isEnabled = true

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

