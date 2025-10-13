using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using System.ComponentModel.DataAnnotations;
using Microsoft.Extensions.Logging;

namespace Wilproject.Pages
{
    public class CalendarModel : PageModel
    {
        private readonly ILogger<CalendarModel> _logger;

        public CalendarModel(ILogger<CalendarModel> logger)
        {
            _logger = logger;
        }

        [BindProperty]
        public CreateEventModel NewEvent { get; set; } = new();

        // Properties for potential server-side event operations
        public List<CalendarEvent> Events { get; set; } = new();
        public EventStatistics Statistics { get; set; } = new();
        public string CurrentUserId { get; set; } = "";

        public void OnGet()
        {
            _logger.LogInformation("Calendar page accessed");
            InitializeUserContext();
            Statistics = GetEventStatistics();
        }

        // API endpoint to get events
        public async Task<IActionResult> OnGetEventsAsync()
        {
            try
            {
                // This would load from Firebase in the client-side
                // Server-side can be used for additional validation/processing
                return new JsonResult(new { success = true, events = Events, statistics = Statistics });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error loading events");
                return new JsonResult(new { success = false, message = "Error loading events" });
            }
        }

        // POST handler for creating events
        public async Task<IActionResult> OnPostCreateAsync()
        {
            if (!ModelState.IsValid)
            {
                _logger.LogWarning("Invalid event creation attempt");
                return new JsonResult(new { success = false, message = "Invalid event data" });
            }

            try
            {
                _logger.LogInformation("Server-side event creation: {EventTitle}", NewEvent.Title);
                
                // Server-side validation and logging
                // The actual creation will be handled by Firebase on client-side
                
                return new JsonResult(new { success = true, message = "Event creation validated" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating event");
                return new JsonResult(new { success = false, message = "Event creation failed" });
            }
        }

        // POST handler for updating events
        public async Task<IActionResult> OnPostUpdateAsync(string eventId)
        {
            try
            {
                _logger.LogInformation("Server-side event update: {EventId}", eventId);
                
                if (string.IsNullOrEmpty(eventId))
                {
                    return new JsonResult(new { success = false, message = "Invalid event ID" });
                }

                // Server-side validation passed
                return new JsonResult(new { success = true, message = "Event update validated" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating event");
                return new JsonResult(new { success = false, message = "Update failed" });
            }
        }

        // POST handler for deleting events
        public async Task<IActionResult> OnPostDeleteAsync(string eventId)
        {
            try
            {
                _logger.LogInformation("Server-side event deletion: {EventId}", eventId);
                
                if (string.IsNullOrEmpty(eventId))
                {
                    return new JsonResult(new { success = false, message = "Invalid event ID" });
                }

                // Server-side validation passed
                return new JsonResult(new { success = true, message = "Event deletion validated" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting event");
                return new JsonResult(new { success = false, message = "Deletion failed" });
            }
        }

        // GET handler for event statistics
        public async Task<IActionResult> OnGetStatisticsAsync()
        {
            try
            {
                var stats = GetEventStatistics();
                return new JsonResult(new { success = true, statistics = stats });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting event statistics");
                return new JsonResult(new { success = false, message = "Statistics unavailable" });
            }
        }

        // Helper methods
        private void InitializeUserContext()
        {
            CurrentUserId = User?.FindFirst("sub")?.Value ?? User?.FindFirst("id")?.Value ?? "";
            _logger.LogDebug("User context initialized for calendar: {UserId}", CurrentUserId);
        }

        private EventStatistics GetEventStatistics()
        {
            // This would calculate from Firebase data
            // For now, return empty stats for new users
            return new EventStatistics
            {
                TotalEvents = 0,
                TodayEvents = 0,
                UpcomingEvents = 0,
                OverdueEvents = 0
            };
        }

        // Validation helper for event operations
        public bool ValidateEventOperation(string operation, string? eventId = null)
        {
            if (string.IsNullOrEmpty(CurrentUserId))
            {
                _logger.LogWarning("Event operation attempted without valid user context");
                return false;
            }

            if (operation.Equals("update", StringComparison.OrdinalIgnoreCase) || 
                operation.Equals("delete", StringComparison.OrdinalIgnoreCase))
            {
                if (string.IsNullOrEmpty(eventId))
                {
                    _logger.LogWarning("Event {Operation} attempted without event ID", operation);
                    return false;
                }
            }

            return true;
        }
    }

    // Data models
    public class CreateEventModel
    {
        [Required(ErrorMessage = "Event title is required")]
        [StringLength(200, ErrorMessage = "Title cannot exceed 200 characters")]
        public string Title { get; set; } = "";

        [StringLength(1000, ErrorMessage = "Description cannot exceed 1000 characters")]
        public string Description { get; set; } = "";

        [Required(ErrorMessage = "Start date is required")]
        public DateTime Start { get; set; }

        public DateTime? End { get; set; }

        public bool AllDay { get; set; } = false;

        public string Category { get; set; } = "other";

        public string Priority { get; set; } = "medium";
    }

    public class CalendarEvent
    {
        public string Id { get; set; } = "";
        public string Title { get; set; } = "";
        public string Description { get; set; } = "";
        public DateTime Start { get; set; }
        public DateTime? End { get; set; }
        public bool AllDay { get; set; } = false;
        public string Category { get; set; } = "other";
        public string Priority { get; set; } = "medium";
        public string UserId { get; set; } = "";
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    }

    public class EventStatistics
    {
        public int TotalEvents { get; set; }
        public int TodayEvents { get; set; }
        public int UpcomingEvents { get; set; }
        public int OverdueEvents { get; set; }
    }

    public enum EventCategory
    {
        Meeting,
        Project,
        Personal,
        Deadline,
        Other
    }

    public enum EventPriority
    {
        Low,
        Medium,
        High
    }
}