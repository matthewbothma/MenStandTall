package com.example.mensstandtall.ui.tasks

import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
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
    private lateinit var todoAdapter: TasksAdapter
    private lateinit var inProgressAdapter: TasksAdapter
    private lateinit var completedAdapter: TasksAdapter

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

        setupViews()
        observeViewModel()

        binding.btnAddTask.setOnClickListener {
            findNavController().navigate(R.id.action_tasksFragment_to_newTaskFragment)
        }
    }

    private fun setupViews() {
        // Setup Adapters
        todoAdapter = TasksAdapter()
        inProgressAdapter = TasksAdapter()
        completedAdapter = TasksAdapter()

        // Setup RecyclerViews
        binding.colToDo.rvTasks.apply {
            layoutManager = LinearLayoutManager(context)
            adapter = todoAdapter
        }
        binding.colInProgress.rvTasks.apply {
            layoutManager = LinearLayoutManager(context)
            adapter = inProgressAdapter
        }
        binding.colCompleted.rvTasks.apply {
            layoutManager = LinearLayoutManager(context)
            adapter = completedAdapter
        }

        // Set column titles
        binding.colToDo.tvColumnTitle.text = getString(R.string.to_do)
        binding.colInProgress.tvColumnTitle.text = getString(R.string.in_progress)
        binding.colCompleted.tvColumnTitle.text = getString(R.string.completed)

        // Set statistic titles
        binding.statToDo.tvStatisticTitle.text = getString(R.string.to_do)
        binding.statInProgress.tvStatisticTitle.text = getString(R.string.in_progress)
        binding.statCompleted.tvStatisticTitle.text = getString(R.string.completed)
        binding.statTotal.tvStatisticTitle.text = getString(R.string.total_tasks)
    }

    private fun observeViewModel() {
        viewLifecycleOwner.lifecycleScope.launch {
            viewModel.tasks.collectLatest { tasks ->
                todoAdapter.submitList(tasks.filter { it.status == "To Do" })
                inProgressAdapter.submitList(tasks.filter { it.status == "In Progress" })
                completedAdapter.submitList(tasks.filter { it.status == "Completed" })
            }
        }

        viewLifecycleOwner.lifecycleScope.launch {
            viewModel.stats.collectLatest { stats ->
                // Update statistic cards
                binding.statToDo.tvStatisticValue.text = stats.todo.toString()
                binding.statInProgress.tvStatisticValue.text = stats.inProgress.toString()
                binding.statCompleted.tvStatisticValue.text = stats.completed.toString()
                binding.statTotal.tvStatisticValue.text = stats.total.toString()

                // Update Kanban counts
                binding.colToDo.tvTaskCount.text = stats.todo.toString()
                binding.colInProgress.tvTaskCount.text = stats.inProgress.toString()
                binding.colCompleted.tvTaskCount.text = stats.completed.toString()
            }
        }
    }

    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
    }
}
