package com.example.mensstandtall.ui.calendar

import android.graphics.Color
import android.view.LayoutInflater
import android.view.ViewGroup
import androidx.recyclerview.widget.RecyclerView
import com.example.mensstandtall.databinding.ItemDayBinding
import com.example.mensstandtall.models.Project
import java.text.SimpleDateFormat
import java.util.*

class CalendarAdapter(
    private val onDayClick: (String) -> Unit
) : RecyclerView.Adapter<CalendarAdapter.DayViewHolder>() {

    var days: List<String> = emptyList()
    var projects: List<Project> = emptyList()
    var monthYear: String = ""

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): DayViewHolder {
        val binding = ItemDayBinding.inflate(LayoutInflater.from(parent.context), parent, false)
        return DayViewHolder(binding)
    }

    override fun onBindViewHolder(holder: DayViewHolder, position: Int) {
        holder.bind(days[position])
    }

    override fun getItemCount() = days.size

    inner class DayViewHolder(private val binding: ItemDayBinding) :
        RecyclerView.ViewHolder(binding.root) {

        fun bind(dayStr: String) {
            binding.tvDay.text = dayStr
            binding.root.setBackgroundColor(Color.TRANSPARENT)

            if (dayStr.isNotEmpty()) {
                val date = SimpleDateFormat("MMMM yyyy", Locale.getDefault()).parse(monthYear)
                val calendar = Calendar.getInstance()
                calendar.time = date!!
                calendar.set(Calendar.DAY_OF_MONTH, dayStr.toInt())
                val dateKey = SimpleDateFormat("yyyy-MM-dd", Locale.getDefault()).format(calendar.time)

                // highlight day if project exists
                if (projects.any { it.deadline.startsWith(dateKey) }) {
                    binding.root.setBackgroundColor(Color.parseColor("#FFE6E6"))
                }

                binding.root.setOnClickListener {
                    onDayClick(dayStr)
                }
            } else {
                binding.root.setOnClickListener(null)
            }
        }
    }
}
