package com.example.mensstandtall.repository

import com.google.firebase.auth.FirebaseAuth
import com.google.firebase.auth.GoogleAuthProvider
import com.google.firebase.firestore.FirebaseFirestore
import com.example.mensstandtall.models.User
import kotlinx.coroutines.tasks.await

class AuthRepository {
    private val auth = FirebaseAuth.getInstance()
    private val firestore = FirebaseFirestore.getInstance()

    val currentUser get() = auth.currentUser

    suspend fun signInWithEmail(email: String, password: String): Result<User> {
        return try {
            val result = auth.signInWithEmailAndPassword(email, password).await()
            val user = result.user ?: return Result.failure(Exception("User not found"))

            val userDoc = firestore.collection("users").document(user.uid).get().await()
            val userData = userDoc.toObject(User::class.java) ?: User(
                id = user.uid,
                email = user.email ?: "",
                displayName = user.displayName ?: ""
            )
            Result.success(userData)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun signUpWithEmail(email: String, password: String, displayName: String): Result<User> {
        return try {
            val result = auth.createUserWithEmailAndPassword(email, password).await()
            val user = result.user ?: return Result.failure(Exception("User creation failed"))

            val userData = User(
                id = user.uid,
                email = email,
                displayName = displayName
            )

            firestore.collection("users").document(user.uid).set(userData).await()
            Result.success(userData)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun signInWithGoogle(idToken: String): Result<User> {
        return try {
            val credential = GoogleAuthProvider.getCredential(idToken, null)
            val result = auth.signInWithCredential(credential).await()
            val user = result.user ?: return Result.failure(Exception("User not found"))

            val userDoc = firestore.collection("users").document(user.uid).get().await()

            val userData = if (userDoc.exists()) {
                userDoc.toObject(User::class.java) ?: User()
            } else {
                User(
                    id = user.uid,
                    email = user.email ?: "",
                    displayName = user.displayName ?: "",
                    photoUrl = user.photoUrl?.toString() ?: ""
                ).also {
                    firestore.collection("users").document(user.uid).set(it).await()
                }
            }

            Result.success(userData)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    fun signOut() {
        auth.signOut()
    }
}
