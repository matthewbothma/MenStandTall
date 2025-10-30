package com.example.mensstandtall.ui.messages

import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.ArrayAdapter
import android.widget.Toast
import androidx.fragment.app.Fragment
import androidx.fragment.app.viewModels
import androidx.lifecycle.lifecycleScope
import com.example.mensstandtall.databinding.FragmentNewMessageBinding
import com.example.mensstandtall.models.Message
import kotlinx.coroutines.launch

class NewMessageFragment : Fragment() {

    private var _binding: FragmentNewMessageBinding? = null
    private val binding get() = _binding!!
    private val viewModel: MessagesViewModel by viewModels()

    override fun onCreateView(
        inflater: LayoutInflater, container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View {
        _binding = FragmentNewMessageBinding.inflate(inflater, container, false)
        return binding.root
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)

        val categoryAdapter = ArrayAdapter(
            requireContext(),
            android.R.layout.simple_spinner_dropdown_item,
            listOf("General", "Support", "Feedback")
        )
        binding.spinnerCategory.adapter = categoryAdapter

        val priorityAdapter = ArrayAdapter(
            requireContext(),
            android.R.layout.simple_spinner_dropdown_item,
            listOf("Low", "Medium", "High")
        )
        binding.spinnerPriority.adapter = priorityAdapter

        val statusAdapter = ArrayAdapter(
            requireContext(),
            android.R.layout.simple_spinner_dropdown_item,
            listOf("Unread", "Read")
        )
        binding.spinnerStatus.adapter = statusAdapter

        binding.btnSendMessage.setOnClickListener {
            val title = binding.etMessageTitle.text.toString().trim()
            val content = binding.etMessageContent.text.toString().trim()
            val category = binding.spinnerCategory.selectedItem.toString()
            val priority = binding.spinnerPriority.selectedItem.toString()
            val status = binding.spinnerStatus.selectedItem.toString()

            if (title.isEmpty() || content.isEmpty()) {
                Toast.makeText(requireContext(), "Please fill in all fields", Toast.LENGTH_SHORT).show()
                return@setOnClickListener
            }

            val message = Message(
                title = title,
                content = content,
                category = category,
                priority = priority,
                status = status,
                authorName = "Anonymous", // Replace with logged-in user later
                authorEmail = "unknown@example.com"
            )

            binding.progressBar.visibility = View.VISIBLE
            binding.btnSendMessage.isEnabled = false

            lifecycleScope.launch {
                val result = viewModel.addMessage(message)
                binding.progressBar.visibility = View.GONE
                binding.btnSendMessage.isEnabled = true

                result.onSuccess {
                    Toast.makeText(requireContext(), "Message sent", Toast.LENGTH_SHORT).show()
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
