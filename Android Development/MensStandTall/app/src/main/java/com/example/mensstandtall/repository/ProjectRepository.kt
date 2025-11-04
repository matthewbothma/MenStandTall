package com.example.mensstandtall.repository

import com.example.mensstandtall.models.Project
import com.google.firebase.auth.FirebaseAuth
import com.google.firebase.firestore.FirebaseFirestore
import com.google.firebase.firestore.Query
import kotlinx.coroutines.channels.awaitClose
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.callbackFlow
import kotlinx.coroutines.tasks.await
import java.text.SimpleDateFormat
import java.util.*

class ProjectRepository {

    private val firestore = FirebaseFirestore.getInstance()
    private val projectsCollection = firestore.collection("projects")
    private val auth = FirebaseAuth.getInstance()

    // ✅ Listen for all projects in real time
    fun getProjects(): Flow<List<Project>> = callbackFlow {
        val listener = projectsCollection
            .orderBy("createdAt", Query.Direction.DESCENDING)
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

    // ✅ Add a new project to Firestore (matches website)
    suspend fun addProject(project: Project): Result<String> {
        return try {
            val currentUser = auth.currentUser
            val userId = currentUser?.uid ?: ""
            val authorName = currentUser?.displayName ?: ""
            val authorEmail = currentUser?.email ?: ""

            val dateFormat = SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSS'Z'", Locale.getDefault())
            val now = dateFormat.format(Date())

            val newProject = hashMapOf(
                "name" to project.name,
                "description" to project.description,
                "priority" to project.priority,
                "deadline" to project.deadline,
                "status" to project.status.ifEmpty { "Active" },
                "progress" to project.progress,
                "authorName" to authorName,
                "authorEmail" to authorEmail,
                "userId" to userId,
                "createdAt" to now,
                "updatedAt" to now
            )

            val docRef = projectsCollection.add(newProject).await()
            Result.success(docRef.id)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    // ✅ Update project fields
    suspend fun updateProject(projectId: String, updates: Map<String, Any>): Result<Unit> {
        return try {
            val updatedMap = updates.toMutableMap()
            val dateFormat = SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSS'Z'", Locale.getDefault())
            updatedMap["updatedAt"] = dateFormat.format(Date())

            projectsCollection.document(projectId).update(updatedMap).await()
            Result.success(Unit)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    // ✅ Delete project
    suspend fun deleteProject(projectId: String): Result<Unit> {
        return try {
            projectsCollection.document(projectId).delete().await()
            Result.success(Unit)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
}



