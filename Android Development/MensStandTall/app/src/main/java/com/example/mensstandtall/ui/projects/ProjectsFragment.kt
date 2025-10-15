package com.example.mensstandtall.ui.projects

import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import androidx.fragment.app.Fragment
import androidx.lifecycle.ViewModelProvider
import androidx.lifecycle.lifecycleScope
import androidx.recyclerview.widget.LinearLayoutManager
import com.example.mensstandtall.databinding.FragmentProjectsBinding
import kotlinx.coroutines.launch

class ProjectsFragment : Fragment() {
    private var _binding: FragmentProjectsBinding? = null
    private val binding get() = _binding!!
    private lateinit var viewModel: ProjectsViewModel
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

        viewModel = ViewModelProvider(this)[ProjectsViewModel::class.java]

        setupRecyclerView()
        observeProjects()
    }

    private fun setupRecyclerView() {
        adapter = ProjectsAdapter()
        binding.recyclerViewProjects.apply {
            layoutManager = LinearLayoutManager(requireContext())
            adapter = this@ProjectsFragment.adapter
        }
    }

    private fun observeProjects() {
        viewLifecycleOwner.lifecycleScope.launch {
            viewModel.projects.collect { projects ->
                adapter.submitList(projects)
                binding.tvEmptyState.visibility = if (projects.isEmpty()) View.VISIBLE else View.GONE
            }
        }

        viewLifecycleOwner.lifecycleScope.launch {
            viewModel.stats.collect { stats ->
                binding.tvTotalProjects.text = stats.total.toString()
                binding.tvActiveProjects.text = stats.active.toString()
                binding.tvCompletedProjects.text = stats.completed.toString()
            }
        }
    }

    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
    }
}
