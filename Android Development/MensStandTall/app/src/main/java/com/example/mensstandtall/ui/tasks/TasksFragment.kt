package com.example.mensstandtall.ui.tasks

import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.Toast
import androidx.fragment.app.Fragment
import androidx.lifecycle.ViewModelProvider
import androidx.lifecycle.lifecycleScope
import androidx.navigation.fragment.findNavController
import androidx.recyclerview.widget.LinearLayoutManager
import com.example.mensstandtall.R
import com.example.mensstandtall.databinding.FragmentTasksBinding
import kotlinx.coroutines.flow.collectLatest
import kotlinx.coroutines.launch

class TasksFragment : Fragment() {

    private var _binding: FragmentTasksBinding? = null
    private val binding get() = _binding!!

    private lateinit var viewModel: TasksViewModel
    private lateinit var adapter: TasksAdapter

    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View {
        _binding = FragmentTasksBinding.inflate(inflater, container, false)
        return binding.root
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)

        viewModel = ViewModelProvider(this)[TasksViewModel::class.java]

        setupRecyclerView()
        observeTasks()

        binding.fabAddTask.setOnClickListener {
            findNavController().navigate(R.id.action_tasksFragment_to_newTaskFragment)
        }
    }

    private fun setupRecyclerView() {
        adapter = TasksAdapter(
            onStatusChange = { task, newStatus ->
                lifecycleScope.launch {
                    val result = viewModel.updateTaskStatus(task, newStatus)
                    result.onFailure { Toast.makeText(requireContext(), "Failed to update status", Toast.LENGTH_SHORT).show() }
                }
            }
        )

        binding.recyclerViewTasks.apply {
            layoutManager = LinearLayoutManager(requireContext())
            adapter = this@TasksFragment.adapter
        }
    }

    private fun observeTasks() {
        viewLifecycleOwner.lifecycleScope.launch {
            viewModel.tasks.collectLatest { tasks ->
                adapter.submitList(tasks)
                binding.tvEmptyState.visibility = if (tasks.isEmpty()) View.VISIBLE else View.GONE
            }
        }

        viewLifecycleOwner.lifecycleScope.launch {
            viewModel.stats.collectLatest { stats ->
                binding.tvTodoCount.text = stats.todo.toString()
                binding.tvInProgressCount.text = stats.inProgress.toString()
                binding.tvCompletedCount.text = stats.completed.toString()
                binding.tvTotalTasks.text = stats.total.toString()
            }
        }
    }

    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
    }
}


