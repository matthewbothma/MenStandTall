package com.example.mensstandtall.ui.messages

import android.view.LayoutInflater
import android.view.ViewGroup
import androidx.recyclerview.widget.RecyclerView
import com.example.mensstandtall.databinding.ItemMessageBinding
import com.example.mensstandtall.models.Message

class MessageAdapter(private val messages: List<Message>) :
    RecyclerView.Adapter<MessageAdapter.MessageViewHolder>() {

    inner class MessageViewHolder(private val binding: ItemMessageBinding) :
        RecyclerView.ViewHolder(binding.root) {

        fun bind(message: Message) {
            binding.tvTitle.text = message.title
            binding.tvContent.text = message.content
            binding.tvAuthor.text = "By ${message.authorName}"
            binding.tvTimestamp.text = message.timestamp
        }
    }

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): MessageViewHolder {
        val binding = ItemMessageBinding.inflate(LayoutInflater.from(parent.context), parent, false)
        return MessageViewHolder(binding)
    }

    override fun onBindViewHolder(holder: MessageViewHolder, position: Int) {
        holder.bind(messages[position])
    }

    override fun getItemCount(): Int = messages.size
}
