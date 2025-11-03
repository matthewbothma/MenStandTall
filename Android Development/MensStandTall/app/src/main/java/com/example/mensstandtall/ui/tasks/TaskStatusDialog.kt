package com.example.mensstandtall.ui.tasks

import android.content.Context
import androidx.appcompat.app.AlertDialog
import com.example.mensstandtall.models.Task

object TaskStatusDialog {

    fun show(
        context: Context,
        task: Task,
        onStatusSelected: (String) -> Unit,
        onDelete: (Task) -> Unit
    ) {
        val options = arrayOf(
            "Mark Active",
            "Mark Completed",
            "Mark On Hold",
            "Delete Task"
        )

        AlertDialog.Builder(context)
            .setTitle(task.name)
            .setItems(options) { dialog, which ->
                when (which) {
                    0 -> {
                        if (task.status != "Active") {
                            onStatusSelected("Active")
                        }
                    }
                    1 -> {
                        if (task.status != "Completed") {
                            onStatusSelected("Completed")
                        }
                    }
                    2 -> {
                        if (task.status != "On Hold") {
                            onStatusSelected("On Hold")
                        }
                    }
                    3 -> confirmDelete(context, task, onDelete)
                }
                dialog.dismiss()
            }
            .show()
    }

    private fun confirmDelete(context: Context, task: Task, onDelete: (Task) -> Unit) {
        AlertDialog.Builder(context)
            .setTitle("Delete Task")
            .setMessage("Are you sure you want to delete this task?")
            .setPositiveButton("Delete") { dialog, _ ->
                onDelete(task)
                dialog.dismiss()
            }
            .setNegativeButton("Cancel", null)
            .show()
    }
}



