package com.example.mensstandtall.ui.projects

import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.Toast
import androidx.fragment.app.Fragment
import androidx.fragment.app.viewModels
import androidx.lifecycle.lifecycleScope
import androidx.navigation.fragment.findNavController
import androidx.recyclerview.widget.LinearLayoutManager
import com.example.mensstandtall.R
import com.example.mensstandtall.databinding.FragmentProjectsBinding
import kotlinx.coroutines.flow.collectLatest
import kotlinx.coroutines.launch

class ProjectsFragment : Fragment() {

    private var _binding: FragmentProjectsBinding? = null
    private val binding get() = _binding!!
    private val viewModel: ProjectsViewModel by viewModels()
    private lateinit var adapter: ProjectsAdapter

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

        // Set up RecyclerView with callbacks
        adapter = ProjectsAdapter(
            onUpdateStatus = { project, newStatus ->
                viewLifecycleOwner.lifecycleScope.launch {
                    val result = viewModel.updateProjectStatus(project, newStatus)
                    result.onFailure { e ->
                        Toast.makeText(requireContext(), "Error: ${e.message}", Toast.LENGTH_LONG).show()
                    }
                }
            }
        )

        binding.recyclerViewProjects.layoutManager = LinearLayoutManager(requireContext())
        binding.recyclerViewProjects.adapter = adapter

        viewLifecycleOwner.lifecycleScope.launch {
            viewModel.projects.collectLatest { list ->
                adapter.submitList(list)
                binding.tvEmptyState.visibility = if (list.isEmpty()) View.VISIBLE else View.GONE
            }
        }

        viewLifecycleOwner.lifecycleScope.launch {
            viewModel.stats.collectLatest { stats ->
                binding.tvTotalProjects.text = stats.total.toString()
                binding.tvActiveProjects.text = stats.active.toString()
                binding.tvCompletedProjects.text = stats.completed.toString()
            }
        }

        binding.fabAddProject.setOnClickListener {
            findNavController().navigate(R.id.action_projectsFragment_to_newProjectFragment)
        }
    }

    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
    }
}










