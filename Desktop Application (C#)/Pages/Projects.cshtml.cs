using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using System.Collections.Generic;

namespace YourNamespace.Pages
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
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public DateTime Deadline { get; set; }
        public string Description { get; set; } = string.Empty;
        public ProjectStatus Status { get; set; } = ProjectStatus.Planning;
        public int Progress { get; set; } = 0; // Progress as percentage (0-100)
    }

    public class ProjectsModel : PageModel
    {
        public List<Project> Projects { get; set; } = new List<Project>();

        public void OnGet()
        {
            // Example: Load existing projects (this can be from a database)
            Projects.Add(new Project 
            { 
                Id = 1,
                Name = "Education Program", 
                Deadline = DateTime.Parse("2025-08-30"), 
                Description = "Building schools in rural areas",
                Status = ProjectStatus.Active,
                Progress = 60
            });
            
            Projects.Add(new Project 
            { 
                Id = 2,
                Name = "Community Outreach", 
                Deadline = DateTime.Parse("2025-12-15"), 
                Description = "Engaging with local communities to provide support and resources",
                Status = ProjectStatus.Active,
                Progress = 35
            });
            
            Projects.Add(new Project 
            { 
                Id = 3,
                Name = "Leadership Development", 
                Deadline = DateTime.Parse("2025-11-10"), 
                Description = "Training programs for developing leadership skills",
                Status = ProjectStatus.Completed,
                Progress = 100
            });
        }

        public IActionResult OnPost(string projectName, string projectDeadline, string projectDescription)
        {
            if (!string.IsNullOrEmpty(projectName) && !string.IsNullOrEmpty(projectDeadline) && !string.IsNullOrEmpty(projectDescription))
            {
                // Parse the deadline
                if (DateTime.TryParse(projectDeadline, out DateTime deadline))
                {
                    Projects.Add(new Project
                    {
                        Id = Projects.Count + 1,
                        Name = projectName,
                        Deadline = deadline,
                        Description = projectDescription,
                        Status = ProjectStatus.Planning,
                        Progress = 0
                    });
                }
            }
            return RedirectToPage(); // Redirect to the same page to display the updated list
        }
    }
}