package com.example.mensstandtall.repository

import com.google.firebase.firestore.FirebaseFirestore
import com.google.firebase.firestore.Query
import com.example.mensstandtall.models.Project
import kotlinx.coroutines.channels.awaitClose
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.callbackFlow
import kotlinx.coroutines.tasks.await
import java.text.SimpleDateFormat
import java.util.*

class ProjectRepository {
    private val firestore = FirebaseFirestore.getInstance()
    private val projectsCollection = firestore.collection("projects")

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

    // ✅ Add a new project to Firestore
    suspend fun addProject(project: Project): Result<String> {
        return try {
            val dateFormat = SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSS'Z'", Locale.getDefault())
            val now = dateFormat.format(Date())

            val newProject = project.copy(
                createdAt = now,
                updatedAt = now
            )

            val docRef = projectsCollection.add(newProject).await()
            Result.success(docRef.id)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    // ✅ Update existing project
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

    // ✅ Search for projects by name or description
    fun searchProjects(query: String): Flow<List<Project>> = callbackFlow {
        // This is a simplified search. For more complex scenarios, consider a dedicated search service.
        val listener = projectsCollection
            .orderBy("name")
            .startAt(query)
            .endAt(query + '\uf8ff')
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

    // ✅ Filter projects by status
    fun filterProjectsByStatus(status: String): Flow<List<Project>> = callbackFlow {
        val listener = projectsCollection
            .whereEqualTo("status", status)
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
}
