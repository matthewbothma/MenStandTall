package com.example.mensstandtall.ui.dashboard

import android.graphics.Color
import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import androidx.fragment.app.Fragment
import androidx.lifecycle.ViewModelProvider
import androidx.lifecycle.lifecycleScope
import com.example.mensstandtall.R
import androidx.navigation.fragment.findNavController
import com.example.mensstandtall.databinding.FragmentDashboardBinding
import com.example.mensstandtall.repository.AuthRepository
import com.github.mikephil.charting.data.PieData
import com.github.mikephil.charting.data.PieDataSet
import com.github.mikephil.charting.data.PieEntry
import kotlinx.coroutines.launch

class DashboardFragment : Fragment() {

    private var _binding: FragmentDashboardBinding? = null
    private val binding get() = _binding!!
    private lateinit var viewModel: DashboardViewModel
    private val authRepository = AuthRepository()

    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View {
        _binding = FragmentDashboardBinding.inflate(inflater, container, false)

        binding.btnNewProject.setOnClickListener {
            findNavController().navigate(R.id.action_dashboardFragment_to_newProjectFragment)
        }

        binding.btnAddTask.setOnClickListener {
            findNavController().navigate(R.id.action_dashboardFragment_to_newTaskFragment)
        }

        return binding.root
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)

        viewModel = ViewModelProvider(this)[DashboardViewModel::class.java]

        setupUserGreeting()
        setupCharts()
        observeData()
    }

    private fun setupUserGreeting() {
        val currentUser = authRepository.currentUser
        val displayName = currentUser?.displayName ?: "User"

        val hour = java.util.Calendar.getInstance().get(java.util.Calendar.HOUR_OF_DAY)
        val greeting = when (hour) {
            in 0..11 -> "Good Morning"
            in 12..16 -> "Good Afternoon"
            else -> "Good Evening"
        }

        binding.tvGreeting.text = "$greeting, $displayName!"
    }

    private fun observeData() {
        viewLifecycleOwner.lifecycleScope.launch {
            viewModel.dashboardStats.collect { stats ->
                binding.tvActiveProjects.text = stats.activeProjects.toString()
                binding.tvCompletedTasks.text = stats.completedTasks.toString()
                binding.tvTeamMembers.text = stats.teamMembers.toString()
                binding.tvUpcomingEvents.text = stats.upcomingEvents.toString()

                updateTaskDistributionChart(stats)
            }
        }
    }

    private fun setupCharts() {
        binding.pieChart.apply {
            description.isEnabled = false
            setUsePercentValues(true)
            isRotationEnabled = true
            setDrawHoleEnabled(true)
            holeRadius = 65f
            transparentCircleRadius = 70f
            setHoleColor(Color.WHITE)
            setDrawCenterText(true)
            centerText = "Tasks"
            setCenterTextSize(14f)
            legend.isEnabled = true
            legend.textColor = Color.DKGRAY
        }
    }

    private fun updateTaskDistributionChart(stats: DashboardStats) {
        val entries = mutableListOf<PieEntry>()

        if (stats.completedTasksCount + stats.inProgressTasksCount + stats.todoTasksCount == 0) {
            binding.pieChart.clear()
            return
        }

        if (stats.completedTasksCount > 0) {
            entries.add(PieEntry(stats.completedTasksCount.toFloat(), "Completed"))
        }
        if (stats.inProgressTasksCount > 0) {
            entries.add(PieEntry(stats.inProgressTasksCount.toFloat(), "In Progress"))
        }
        if (stats.todoTasksCount > 0) {
            entries.add(PieEntry(stats.todoTasksCount.toFloat(), "To Do"))
        }

        val dataSet = PieDataSet(entries, "").apply {
            colors = listOf(
                Color.parseColor("#48BB78"), // Green
                Color.parseColor("#FF8C69"), // Orange
                Color.parseColor("#A0AEC0")  // Gray
            )
            sliceSpace = 3f
            valueTextSize = 12f
            valueTextColor = Color.WHITE
        }

        binding.pieChart.data = PieData(dataSet)
        binding.pieChart.invalidate()
    }

    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
    }
}

