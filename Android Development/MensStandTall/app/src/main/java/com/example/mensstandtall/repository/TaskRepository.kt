package com.example.mensstandtall.repository

import com.example.mensstandtall.models.Task
import com.google.firebase.firestore.FirebaseFirestore
import com.google.firebase.firestore.Query
import kotlinx.coroutines.channels.awaitClose
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.callbackFlow
import kotlinx.coroutines.tasks.await
import java.text.SimpleDateFormat
import java.util.*

class TaskRepository {

    private val firestore = FirebaseFirestore.getInstance()
    private val tasksCollection = firestore.collection("tasks")

    // ✅ Get all tasks in real time
    fun getTasks(): Flow<List<Task>> = callbackFlow {
        val listener = tasksCollection
            .orderBy("createdAt", Query.Direction.DESCENDING)
            .addSnapshotListener { snapshot, error ->
                if (error != null) {
                    close(error)
                    return@addSnapshotListener
                }

                val tasks = snapshot?.documents?.mapNotNull {
                    it.toObject(Task::class.java)?.copy(id = it.id)
                } ?: emptyList()

                trySend(tasks)
            }

        awaitClose { listener.remove() }
    }

    // ✅ Add a new task
    suspend fun addTask(task: Task): Result<String> {
        return try {
            val dateFormat = SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSS'Z'", Locale.getDefault())
            val now = dateFormat.format(Date())

            val newTask = task.copy(createdAt = now, updatedAt = now)

            val docRef = tasksCollection.add(newTask).await()
            Result.success(docRef.id)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    // ✅ Update existing task
    suspend fun updateTask(taskId: String, updates: Map<String, Any>): Result<Unit> {
        return try {
            val dateFormat = SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSS'Z'", Locale.getDefault())
            val updatedMap = updates.toMutableMap()
            updatedMap["updatedAt"] = dateFormat.format(Date())

            tasksCollection.document(taskId).update(updatedMap).await()
            Result.success(Unit)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    // ✅ Delete task
    suspend fun deleteTask(taskId: String): Result<Unit> {
        return try {
            tasksCollection.document(taskId).delete().await()
            Result.success(Unit)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
}




