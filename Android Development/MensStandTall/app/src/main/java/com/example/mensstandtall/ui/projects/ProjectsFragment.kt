package com.example.mensstandtall.ui.projects

import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.ArrayAdapter
import androidx.core.widget.doOnTextChanged
import androidx.fragment.app.Fragment
import androidx.fragment.app.viewModels
import androidx.lifecycle.lifecycleScope
import androidx.navigation.fragment.findNavController
import androidx.recyclerview.widget.GridLayoutManager
import androidx.recyclerview.widget.LinearLayoutManager
import com.example.mensstandtall.R
import com.example.mensstandtall.databinding.FragmentProjectsBinding
import kotlinx.coroutines.flow.collectLatest
import kotlinx.coroutines.launch

class ProjectsFragment : Fragment() {

    private var _binding: FragmentProjectsBinding? = null
    private val binding get() = _binding!!
    private val viewModel: ProjectsViewModel by viewModels()
    private lateinit var projectsAdapter: ProjectsAdapter

    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View {
        _binding = FragmentProjectsBinding.inflate(inflater, container, false)
        return binding.root
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)

        setupUI()
        observeViewModel()
    }

    private fun setupUI() {
        // Setup Adapter
        projectsAdapter = ProjectsAdapter(
            onItemClicked = { /* TODO: Handle project click */ },
            onEditClicked = { /* TODO: Handle edit click */ },
            onDeleteClicked = { /* TODO: Handle delete click */ },
            onGroupClicked = { /* TODO: Handle group click */ }
        )

        // Setup RecyclerView
        binding.rvProjects.apply {
            layoutManager = GridLayoutManager(context, 2)
            adapter = projectsAdapter
        }

        // Setup Click Listeners
        binding.btnAddNewProject.setOnClickListener {
            // findNavController().navigate(R.id.action_projectsFragment_to_newProjectFragment)
        }

        binding.btnRefresh.setOnClickListener {
            // viewModel.refreshProjects()
        }

        binding.ivGridView.setOnClickListener {
            binding.rvProjects.layoutManager = GridLayoutManager(context, 2)
        }

        binding.ivListView.setOnClickListener {
            binding.rvProjects.layoutManager = LinearLayoutManager(context)
        }

        binding.etSearch.doOnTextChanged { text, _, _, _ ->
            // viewModel.searchProjects(text.toString())
        }

        binding.btnClear.setOnClickListener {
            binding.etSearch.text.clear()
        }

        // Setup Spinners
        val projectsSpinnerAdapter = ArrayAdapter.createFromResource(
            requireContext(), R.array.project_filter_options, android.R.layout.simple_spinner_item
        )
        projectsSpinnerAdapter.setDropDownViewResource(android.R.layout.simple_spinner_dropdown_item)
        binding.spinnerProjects.adapter = projectsSpinnerAdapter

        val prioritiesSpinnerAdapter = ArrayAdapter.createFromResource(
            requireContext(), R.array.priority_filter_options, android.R.layout.simple_spinner_item
        )
        prioritiesSpinnerAdapter.setDropDownViewResource(android.R.layout.simple_spinner_dropdown_item)
        binding.spinnerPriorities.adapter = prioritiesSpinnerAdapter

        // Set statistic titles
        binding.statTotalProjects.tvStatisticTitle.text = getString(R.string.total_projects)
        binding.statActive.tvStatisticTitle.text = getString(R.string.active)
        binding.statCompletedProjects.tvStatisticTitle.text = getString(R.string.completed)
        binding.statOverdue.tvStatisticTitle.text = getString(R.string.overdue)
    }

    private fun observeViewModel() {
        viewLifecycleOwner.lifecycleScope.launch {
            viewModel.projects.collectLatest { projects ->
                projectsAdapter.submitList(projects)
            }
        }

        viewLifecycleOwner.lifecycleScope.launch {
            viewModel.stats.collectLatest { stats ->
                binding.statTotalProjects.tvStatisticValue.text = stats.total.toString()
                binding.statActive.tvStatisticValue.text = stats.active.toString()
                binding.statCompletedProjects.tvStatisticValue.text = stats.completed.toString()
                binding.statOverdue.tvStatisticValue.text = stats.overdue.toString()
            }
        }
    }

    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
    }
}
