using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using System.ComponentModel.DataAnnotations;

namespace Wilproject.Pages
{
    public enum ProjectStatus
    {
        Planning,
        Active,
        Completed,
        OnHold
    }

    public class Project
    {
        public string Id { get; set; } = "";
        public string Name { get; set; } = "";
        public DateTime Deadline { get; set; }
        public string Description { get; set; } = "";
        public ProjectStatus Status { get; set; } = ProjectStatus.Planning;
        public int Progress { get; set; } = 0; // Progress as percentage (0-100)
        public string UserId { get; set; } = "";
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
        public List<string> Tags { get; set; } = new();
        public string Priority { get; set; } = "Medium";
    }

    public class ProjectsModel : PageModel
    {
        private readonly ILogger<ProjectsModel> _logger;

        public ProjectsModel(ILogger<ProjectsModel> logger)
        {
            _logger = logger;
        }

        [BindProperty]
        public CreateProjectModel NewProject { get; set; } = new();
        
        [BindProperty]
        public UpdateProjectModel UpdateProject { get; set; } = new();

        public List<Project> Projects { get; set; } = new();
        public string CurrentUserId { get; set; } = "";

        public void OnGet()
        {
            _logger.LogInformation("Projects page accessed");
            // Projects will be loaded via JavaScript/Firebase
            Projects = new List<Project>(); // Start with empty list
        }

        // API endpoint to get projects
        public async Task<IActionResult> OnGetProjectsAsync()
        {
            try
            {
                // This would load from Firebase in the client-side
                // Server-side can be used for additional validation/processing
                return new JsonResult(new { success = true, projects = Projects });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error loading projects");
                return new JsonResult(new { success = false, message = "Error loading projects" });
            }
        }

        // Create new project
        public async Task<IActionResult> OnPostAsync()
        {
            if (!ModelState.IsValid)
            {
                _logger.LogWarning("Invalid project creation attempt");
                return Page();
            }

            try
            {
                _logger.LogInformation("Server-side project creation: {ProjectName}", NewProject.Name);
                
                // Server-side validation and logging
                // The actual creation will be handled by Firebase on client-side
                
                TempData["SuccessMessage"] = "Project creation initiated successfully!";
                return RedirectToPage();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating project");
                ModelState.AddModelError("", "An error occurred while creating the project.");
                return Page();
            }
        }

        // Update project
        public async Task<IActionResult> OnPostUpdateAsync()
        {
            try
            {
                _logger.LogInformation("Server-side project update: {ProjectId}", UpdateProject.Id);
                
                if (string.IsNullOrEmpty(UpdateProject.Id) || string.IsNullOrEmpty(UpdateProject.Name))
                {
                    return new JsonResult(new { success = false, message = "Invalid project data" });
                }

                // Server-side validation passed
                return new JsonResult(new { success = true, message = "Project update validated" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating project");
                return new JsonResult(new { success = false, message = "Update failed" });
            }
        }

        // Delete project
        public async Task<IActionResult> OnPostDeleteAsync(string projectId)
        {
            try
            {
                _logger.LogInformation("Server-side project deletion: {ProjectId}", projectId);
                
                if (string.IsNullOrEmpty(projectId))
                {
                    return new JsonResult(new { success = false, message = "Invalid project ID" });
                }

                // Server-side validation passed
                return new JsonResult(new { success = true, message = "Project deletion validated" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting project");
                return new JsonResult(new { success = false, message = "Deletion failed" });
            }
        }

        // Update project status
        public async Task<IActionResult> OnPostUpdateStatusAsync(string projectId, string status)
        {
            try
            {
                _logger.LogInformation("Status update for project {ProjectId} to {Status}", projectId, status);
                
                if (string.IsNullOrEmpty(projectId) || string.IsNullOrEmpty(status))
                {
                    return new JsonResult(new { success = false, message = "Invalid data" });
                }

                if (!Enum.TryParse<ProjectStatus>(status, out _))
                {
                    return new JsonResult(new { success = false, message = "Invalid status" });
                }

                return new JsonResult(new { success = true, message = "Status update validated" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating project status");
                return new JsonResult(new { success = false, message = "Status update failed" });
            }
        }

        // Get project statistics
        public async Task<IActionResult> OnGetStatsAsync()
        {
            try
            {
                // This would calculate from Firebase data
                var stats = new
                {
                    total = 0,
                    active = 0,
                    completed = 0,
                    planning = 0,
                    overdue = 0
                };

                return new JsonResult(new { success = true, stats });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting project stats");
                return new JsonResult(new { success = false, message = "Stats unavailable" });
            }
        }
    }

    // Data models
    public class CreateProjectModel
    {
        [Required(ErrorMessage = "Project name is required")]
        [StringLength(200, ErrorMessage = "Project name cannot exceed 200 characters")]
        public string Name { get; set; } = "";

        [Required(ErrorMessage = "Deadline is required")]
        [DataType(DataType.Date)]
        public DateTime Deadline { get; set; }

        [Required(ErrorMessage = "Description is required")]
        [StringLength(1000, ErrorMessage = "Description cannot exceed 1000 characters")]
        public string Description { get; set; } = "";

        public ProjectStatus Status { get; set; } = ProjectStatus.Planning;

        [Range(0, 100, ErrorMessage = "Progress must be between 0 and 100")]
        public int Progress { get; set; } = 0;

        public string Priority { get; set; } = "Medium";

        public List<string> Tags { get; set; } = new();
    }

    public class UpdateProjectModel
    {
        [Required]
        public string Id { get; set; } = "";

        [Required(ErrorMessage = "Project name is required")]
        [StringLength(200, ErrorMessage = "Project name cannot exceed 200 characters")]
        public string Name { get; set; } = "";

        [Required(ErrorMessage = "Deadline is required")]
        [DataType(DataType.Date)]
        public DateTime Deadline { get; set; }

        [Required(ErrorMessage = "Description is required")]
        [StringLength(1000, ErrorMessage = "Description cannot exceed 1000 characters")]
        public string Description { get; set; } = "";

        public ProjectStatus Status { get; set; } = ProjectStatus.Planning;

        [Range(0, 100, ErrorMessage = "Progress must be between 0 and 100")]
        public int Progress { get; set; } = 0;

        public string Priority { get; set; } = "Medium";

        public List<string> Tags { get; set; } = new();
    }
}