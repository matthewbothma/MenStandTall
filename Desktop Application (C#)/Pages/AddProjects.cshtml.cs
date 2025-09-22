using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;

namespace Wilproject.Pages
{
    public class AddProjectModel : PageModel
    {
        [BindProperty]
        public string ProjectTitle { get; set; }

        [BindProperty]
        public string Description { get; set; }

        [BindProperty]
        public string Goals { get; set; }

        [BindProperty]
        public string Timeline { get; set; }

        [BindProperty]
        public int Progress { get; set; }

        public void OnGet()
        {
        }

        public IActionResult OnPost()
        {
            if (!ModelState.IsValid)
            {
                return Page();
            }

            // Here you would typically save the project to a database
            // For demonstration, we'll just display the project data
            TempData["ProjectAdded"] = $"Project '{ProjectTitle}' added successfully!";

            return RedirectToPage("Index"); // Redirect to the main page or project overview
        }
    }
}
