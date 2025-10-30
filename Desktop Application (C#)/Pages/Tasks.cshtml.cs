using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using System.ComponentModel.DataAnnotations;

namespace Wilproject.Pages
{
    public class TasksModel : PageModel
    {
        private readonly ILogger<TasksModel> _logger;

        public TasksModel(ILogger<TasksModel> logger)
        {
            _logger = logger;
        }

        // Properties for potential server-side task operations
        [BindProperty]
        public TaskCreateModel NewTask { get; set; } = new();

        [BindProperty]
        public TaskUpdateModel UpdateTask { get; set; } = new();

        // User context properties
        public string? CurrentUserEmail { get; set; }
        public string? CurrentUserId { get; set; }

        // Page load handler
        public void OnGet()
        {
            _logger.LogInformation("Tasks page accessed");
            
            // Initialize user context if needed
            InitializeUserContext();
            
            // Set page metadata
            ViewData["Title"] = "Task Board";
            ViewData["PageDescription"] = "Manage your tasks with our modern Kanban board";
        }

        // POST handler for creating tasks (if server-side processing is needed)
        public async Task<IActionResult> OnPostCreateTaskAsync()
        {
            if (!ModelState.IsValid)
            {
                _logger.LogWarning("Invalid task creation attempt");
                return Page();
            }

            try
            {
                _logger.LogInformation("Server-side task creation requested for: {TaskName}", NewTask.Name);
                
                // Here you could add server-side validation, logging, or additional processing
                // before the client-side Firebase operation
                
                // For now, we'll let the client-side handle it, but log the attempt
                _logger.LogInformation("Task creation delegated to client-side Firebase");
                
                // Return JSON for AJAX calls or redirect for form posts
                if (Request.Headers["X-Requested-With"] == "XMLHttpRequest")
                {
                    return new JsonResult(new { success = true, message = "Task creation initiated" });
                }
                
                return RedirectToPage();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error during task creation process");
                ModelState.AddModelError("", "An error occurred while processing your request.");
                return Page();
            }
        }

        // POST handler for updating tasks
        public async Task<IActionResult> OnPostUpdateTaskAsync()
        {
            if (!ModelState.IsValid)
            {
                return Page();
            }

            try
            {
                _logger.LogInformation("Server-side task update requested for task ID: {TaskId}", UpdateTask.Id);
                
                // Server-side validation and processing can be added here
                
                return new JsonResult(new { success = true, message = "Task update initiated" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error during task update process");
                return new JsonResult(new { success = false, message = "Update failed" });
            }
        }

        // DELETE handler for removing tasks
        public async Task<IActionResult> OnPostDeleteTaskAsync(string taskId)
        {
            try
            {
                _logger.LogInformation("Server-side task deletion requested for task ID: {TaskId}", taskId);
                
                // Add any server-side cleanup or validation here
                
                return new JsonResult(new { success = true, message = "Task deletion initiated" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error during task deletion process");
                return new JsonResult(new { success = false, message = "Deletion failed" });
            }
        }

        // Helper method to initialize user context
        private void InitializeUserContext()
        {
            // This would typically get user info from authentication context
            // For now, we'll set it up for potential future use
            CurrentUserEmail = User?.Identity?.Name;
            CurrentUserId = User?.FindFirst("sub")?.Value ?? User?.FindFirst("id")?.Value;
            
            _logger.LogDebug("User context initialized for: {UserEmail}", CurrentUserEmail);
        }

        // Validation helper for task operations
        public bool ValidateTaskOperation(string operation, string? taskId = null)
        {
            if (string.IsNullOrEmpty(CurrentUserEmail))
            {
                _logger.LogWarning("Task operation attempted without valid user context");
                return false;
            }

            if (operation.Equals("update", StringComparison.OrdinalIgnoreCase) || 
                operation.Equals("delete", StringComparison.OrdinalIgnoreCase))
            {
                if (string.IsNullOrEmpty(taskId))
                {
                    _logger.LogWarning("Task {Operation} attempted without task ID", operation);
                    return false;
                }
            }

            return true;
        }
    }

    // Data models for task operations
    public class TaskCreateModel
    {
        [Required(ErrorMessage = "Task name is required")]
        [StringLength(200, ErrorMessage = "Task name cannot exceed 200 characters")]
        public string Name { get; set; } = "";

        [StringLength(1000, ErrorMessage = "Description cannot exceed 1000 characters")]
        public string Description { get; set; } = "";

        [Required(ErrorMessage = "Priority is required")]
        public string Priority { get; set; } = "Medium";

        public DateTime? DueDate { get; set; }

        public string Status { get; set; } = "To Do";

        public string Category { get; set; } = "General";
    }

    public class TaskUpdateModel
    {
        [Required]
        public string Id { get; set; } = "";

        [Required(ErrorMessage = "Task name is required")]
        [StringLength(200, ErrorMessage = "Task name cannot exceed 200 characters")]
        public string Name { get; set; } = "";

        [StringLength(1000, ErrorMessage = "Description cannot exceed 1000 characters")]
        public string Description { get; set; } = "";

        [Required(ErrorMessage = "Priority is required")]
        public string Priority { get; set; } = "Medium";

        [Required(ErrorMessage = "Status is required")]
        public string Status { get; set; } = "To Do";

        public DateTime? DueDate { get; set; }

        public string Category { get; set; } = "General";
    }
}
