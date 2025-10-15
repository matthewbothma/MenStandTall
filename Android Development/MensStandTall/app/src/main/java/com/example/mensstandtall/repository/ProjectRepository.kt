package com.example.mensstandtall.repository

import com.google.firebase.firestore.FirebaseFirestore
import com.google.firebase.firestore.Query
import com.example.mensstandtall.models.Project
import kotlinx.coroutines.channels.awaitClose
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.callbackFlow
import kotlinx.coroutines.tasks.await

class ProjectRepository {
    private val firestore = FirebaseFirestore.getInstance()
    private val projectsCollection = firestore.collection("projects")

    fun getProjects(): Flow<List<Project>> = callbackFlow {
        val listener = projectsCollection
            .orderBy("createdDate", Query.Direction.DESCENDING)
            .addSnapshotListener { snapshot, error ->
                if (error != null) {
                    close(error)
                    return@addSnapshotListener
                }

                val projects = snapshot?.documents?.mapNotNull {
                    it.toObject(Project::class.java)?.copy(id = it.id)
                } ?: emptyList()

                trySend(projects)
            }

        awaitClose { listener.remove() }
    }

    suspend fun addProject(project: Project): Result<String> {
        return try {
            val docRef = projectsCollection.add(project).await()
            Result.success(docRef.id)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun updateProject(projectId: String, updates: Map<String, Any>): Result<Unit> {
        return try {
            projectsCollection.document(projectId).update(updates).await()
            Result.success(Unit)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun deleteProject(projectId: String): Result<Unit> {
        return try {
            projectsCollection.document(projectId).delete().await()
            Result.success(Unit)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
}
