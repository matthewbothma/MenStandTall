using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using System.Collections.Generic;

namespace YourNamespace.Pages
{
    public class Project
    {
        public string Name { get; set; }
        public string Deadline { get; set; }
        public string Description { get; set; } // New property for description
    }

    public class ProjectsModel : PageModel
    {
        public List<Project> Projects { get; set; } = new List<Project>();

        public void OnGet()
        {
            // Example: Load existing projects (this can be from a database)
            //Projects.Add(new Project { Name = "Project A", Deadline = "2023-09-30", Description = "Description for Project A" });
           // Projects.Add(new Project { Name = "Project B", Deadline = "2023-10-15", Description = "Description for Project B" });
        }

        public IActionResult OnPost(string projectName, string projectDeadline, string projectDescription)
        {
            if (!string.IsNullOrEmpty(projectName) && !string.IsNullOrEmpty(projectDeadline) && !string.IsNullOrEmpty(projectDescription))
            {
                Projects.Add(new Project
                {
                    Name = projectName,
                    Deadline = projectDeadline,
                    Description = projectDescription
                });
            }
            return RedirectToPage(); // Redirect to the same page to display the updated list
        }
    }
}