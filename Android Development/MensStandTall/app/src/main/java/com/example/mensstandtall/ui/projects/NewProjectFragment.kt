package com.example.mensstandtall.ui.projects

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
import com.example.mensstandtall.databinding.FragmentNewProjectBinding
import com.example.mensstandtall.models.Project
import kotlinx.coroutines.launch
import java.text.SimpleDateFormat
import java.util.*

class NewProjectFragment : Fragment() {

    private var _binding: FragmentNewProjectBinding? = null
    private val binding get() = _binding!!
    private val viewModel: ProjectsViewModel by viewModels()
    private var selectedDeadline: String = ""

    override fun onCreateView(
        inflater: LayoutInflater, container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View {
        _binding = FragmentNewProjectBinding.inflate(inflater, container, false)
        return binding.root
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)

        // Dropdowns
        val statusAdapter = ArrayAdapter(
            requireContext(),
            android.R.layout.simple_spinner_dropdown_item,
            listOf("Active", "Completed", "On Hold")
        )
        binding.spinnerStatus.adapter = statusAdapter

        val priorityAdapter = ArrayAdapter(
            requireContext(),
            android.R.layout.simple_spinner_dropdown_item,
            listOf("Low", "Medium", "High")
        )
        binding.spinnerPriority.adapter = priorityAdapter

        // Date picker
        binding.etDueDate.setOnClickListener {
            val calendar = Calendar.getInstance()
            val datePicker = DatePickerDialog(
                requireContext(),
                { _, year, month, day ->
                    calendar.set(year, month, day)
                    val displayFormat = SimpleDateFormat("dd MMM yyyy", Locale.getDefault())
                    val saveFormat = SimpleDateFormat("yyyy-MM-dd", Locale.getDefault())
                    binding.etDueDate.setText(displayFormat.format(calendar.time))
                    selectedDeadline = saveFormat.format(calendar.time)
                },
                calendar.get(Calendar.YEAR),
                calendar.get(Calendar.MONTH),
                calendar.get(Calendar.DAY_OF_MONTH)
            )
            datePicker.show()
        }

        // Save button
        binding.btnCreateProject.setOnClickListener {
            val name = binding.etProjectName.text.toString().trim()
            val description = binding.etProjectDescription.text.toString().trim()
            val status = binding.spinnerStatus.selectedItem.toString()
            val priority = binding.spinnerPriority.selectedItem.toString()

            if (name.isEmpty()) {
                Toast.makeText(requireContext(), "Enter project name", Toast.LENGTH_SHORT).show()
                return@setOnClickListener
            }

            if (selectedDeadline.isEmpty()) {
                Toast.makeText(requireContext(), "Select a deadline", Toast.LENGTH_SHORT).show()
                return@setOnClickListener
            }

            val project = Project(
                name = name,
                description = description,
                status = status,
                priority = priority,
                deadline = selectedDeadline,
                createdAt = SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSS'Z'", Locale.getDefault())
                    .format(Date())
            )

            binding.progressBar.visibility = View.VISIBLE
            binding.btnCreateProject.isEnabled = false

            lifecycleScope.launch {
                val result = viewModel.addProject(project)
                binding.progressBar.visibility = View.GONE
                binding.btnCreateProject.isEnabled = true

                result.onSuccess {
                    Toast.makeText(requireContext(), "Project created successfully", Toast.LENGTH_SHORT).show()
                    parentFragmentManager.popBackStack()
                }.onFailure { e ->
                    Toast.makeText(requireContext(), "Error: ${e.message}", Toast.LENGTH_LONG).show()
                }
            }
        }
    }

    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
    }
}





