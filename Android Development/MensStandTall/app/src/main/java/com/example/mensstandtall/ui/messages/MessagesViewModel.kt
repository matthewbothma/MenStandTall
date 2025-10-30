package com.example.mensstandtall.ui.messages

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.mensstandtall.models.Message
import com.example.mensstandtall.repository.MessageRepository
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.launch

class MessagesViewModel : ViewModel() {

    private val repo = MessageRepository()

    private val _messages = MutableStateFlow<List<Message>>(emptyList())
    val messages: StateFlow<List<Message>> = _messages

    init {
        loadMessages()
    }

    private fun loadMessages() {
        viewModelScope.launch {
            repo.getMessages().collect {
                _messages.value = it
            }
        }
    }

    suspend fun addMessage(message: Message): Result<String> {
        return repo.addMessage(message)
    }
}
