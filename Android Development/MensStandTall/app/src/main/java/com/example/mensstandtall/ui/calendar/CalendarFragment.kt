package com.example.mensstandtall.ui.calendar

import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import androidx.fragment.app.Fragment
import androidx.lifecycle.ViewModelProvider
import androidx.lifecycle.lifecycleScope
import androidx.recyclerview.widget.GridLayoutManager
import com.example.mensstandtall.databinding.FragmentCalendarBinding
import com.example.mensstandtall.models.Project
import kotlinx.coroutines.flow.collectLatest
import kotlinx.coroutines.launch
import java.text.SimpleDateFormat
import java.util.*

class CalendarFragment : Fragment() {

    private var _binding: FragmentCalendarBinding? = null
    private val binding get() = _binding!!
    private lateinit var viewModel: CalendarViewModel
    private lateinit var calendarAdapter: CalendarAdapter
    private val calendar = Calendar.getInstance()

    override fun onCreateView(
        inflater: LayoutInflater, container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View {
        _binding = FragmentCalendarBinding.inflate(inflater, container, false)
        return binding.root
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)
        viewModel = ViewModelProvider(this)[CalendarViewModel::class.java]

        calendarAdapter = CalendarAdapter { day ->
            showProjectsForDay(day)
        }

        binding.recyclerViewCalendar.layoutManager = GridLayoutManager(requireContext(), 7)
        binding.recyclerViewCalendar.adapter = calendarAdapter

        setupMonth()

        lifecycleScope.launch {
            viewModel.projects.collectLatest {
                // update the adapter so days with projects can be highlighted
                calendarAdapter.projects = it
                calendarAdapter.notifyDataSetChanged()
            }
        }

        binding.btnPrevMonth.setOnClickListener {
            calendar.add(Calendar.MONTH, -1)
            setupMonth()
        }

        binding.btnNextMonth.setOnClickListener {
            calendar.add(Calendar.MONTH, 1)
            setupMonth()
        }
    }

    private fun setupMonth() {
        val tempCal = calendar.clone() as Calendar
        tempCal.set(Calendar.DAY_OF_MONTH, 1)

        val daysInMonth = tempCal.getActualMaximum(Calendar.DAY_OF_MONTH)
        val startDayOfWeek = tempCal.get(Calendar.DAY_OF_WEEK) - 1 // Sunday = 1

        val dayList = mutableListOf<String>()
        for (i in 0 until startDayOfWeek) dayList.add("")
        for (i in 1..daysInMonth) dayList.add(i.toString())

        calendarAdapter.days = dayList
        calendarAdapter.monthYear = SimpleDateFormat("MMMM yyyy", Locale.getDefault()).format(calendar.time)
        binding.tvMonthYear.text = calendarAdapter.monthYear
        calendarAdapter.notifyDataSetChanged()
    }

    private fun showProjectsForDay(dayStr: String) {
        val day = dayStr.toIntOrNull() ?: return
        val selectedDate = Calendar.getInstance().apply {
            time = calendar.time
            set(Calendar.DAY_OF_MONTH, day)
        }
        val dateKey = SimpleDateFormat("yyyy-MM-dd", Locale.getDefault()).format(selectedDate.time)

        val projectsDue = viewModel.projects.value.filter { it.deadline.startsWith(dateKey) }

        binding.tvEventList.text = if (projectsDue.isEmpty()) {
            "No projects due on this day"
        } else {
            projectsDue.joinToString("\n") { it.name }
        }
    }

    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
    }
}




