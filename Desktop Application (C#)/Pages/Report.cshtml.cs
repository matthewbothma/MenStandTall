using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using System.ComponentModel.DataAnnotations;

namespace Wilproject.Pages
{
    public class ReportModel : PageModel
    {
        private readonly ILogger<ReportModel> _logger;

        public ReportModel(ILogger<ReportModel> logger)
        {
            _logger = logger;
        }

        [BindProperty]
        public CreateReportModel NewReport { get; set; } = new();

        // Properties for potential server-side report operations
        public List<Report> Reports { get; set; } = new();
        public ReportStatistics Statistics { get; set; } = new();
        public string CurrentUserId { get; set; } = "";

        public void OnGet()
        {
            _logger.LogInformation("Reports page accessed");
            InitializeUserContext();
            Statistics = GetReportStatistics();
        }

        // API endpoint to get reports
        public async Task<IActionResult> OnGetReportsAsync()
        {
            try
            {
                // This would load from Firebase in the client-side
                // Server-side can be used for additional validation/processing
                return new JsonResult(new { success = true, reports = Reports, statistics = Statistics });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error loading reports");
                return new JsonResult(new { success = false, message = "Error loading reports" });
            }
        }

        // POST handler for creating reports
        public async Task<IActionResult> OnPostCreateAsync()
        {
            if (!ModelState.IsValid)
            {
                _logger.LogWarning("Invalid report creation attempt");
                return new JsonResult(new { success = false, message = "Invalid report data" });
            }

            try
            {
                _logger.LogInformation("Server-side report creation: {ReportTitle}", NewReport.Title);
                
                // Server-side validation and logging
                // The actual creation will be handled by Firebase on client-side
                
                return new JsonResult(new { success = true, message = "Report creation validated" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating report");
                return new JsonResult(new { success = false, message = "Report creation failed" });
            }
        }

        // POST handler for updating reports
        public async Task<IActionResult> OnPostUpdateAsync(string reportId)
        {
            try
            {
                _logger.LogInformation("Server-side report update: {ReportId}", reportId);
                
                if (string.IsNullOrEmpty(reportId))
                {
                    return new JsonResult(new { success = false, message = "Invalid report ID" });
                }

                // Server-side validation passed
                return new JsonResult(new { success = true, message = "Report update validated" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating report");
                return new JsonResult(new { success = false, message = "Update failed" });
            }
        }

        // POST handler for deleting reports
        public async Task<IActionResult> OnPostDeleteAsync(string reportId)
        {
            try
            {
                _logger.LogInformation("Server-side report deletion: {ReportId}", reportId);
                
                if (string.IsNullOrEmpty(reportId))
                {
                    return new JsonResult(new { success = false, message = "Invalid report ID" });
                }

                // Server-side validation passed
                return new JsonResult(new { success = true, message = "Report deletion validated" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting report");
                return new JsonResult(new { success = false, message = "Deletion failed" });
            }
        }

        // GET handler for report statistics
        public async Task<IActionResult> OnGetStatisticsAsync()
        {
            try
            {
                var stats = GetReportStatistics();
                return new JsonResult(new { success = true, statistics = stats });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting report statistics");
                return new JsonResult(new { success = false, message = "Statistics unavailable" });
            }
        }

        // POST handler for file uploads
        public async Task<IActionResult> OnPostUploadFileAsync(IFormFile file)
        {
            try
            {
                if (file == null || file.Length == 0)
                {
                    return new JsonResult(new { success = false, message = "No file selected" });
                }

                // Validate file type
                var allowedExtensions = new[] { ".pdf", ".doc", ".docx", ".txt" };
                var fileExtension = Path.GetExtension(file.FileName).ToLowerInvariant();
                
                if (!allowedExtensions.Contains(fileExtension))
                {
                    return new JsonResult(new { success = false, message = "File type not allowed" });
                }

                // Validate file size (10MB limit)
                if (file.Length > 10 * 1024 * 1024)
                {
                    return new JsonResult(new { success = false, message = "File size exceeds 10MB limit" });
                }

                _logger.LogInformation("File upload validated: {FileName}", file.FileName);
                
                // In a real implementation, you would save the file to cloud storage
                // For now, just validate and return success
                return new JsonResult(new { 
                    success = true, 
                    fileName = file.FileName,
                    fileSize = file.Length,
                    message = "File upload validated" 
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error processing file upload");
                return new JsonResult(new { success = false, message = "File upload failed" });
            }
        }

        // Helper methods
        private void InitializeUserContext()
        {
            CurrentUserId = User?.FindFirst("sub")?.Value ?? User?.FindFirst("id")?.Value ?? "";
            _logger.LogDebug("User context initialized for reports: {UserId}", CurrentUserId);
        }

        private ReportStatistics GetReportStatistics()
        {
            // This would calculate from Firebase data
            // For now, return empty stats for new users
            return new ReportStatistics
            {
                TotalReports = 0,
                ImpactReports = 0,
                FinanceReports = 0,
                RecentReports = 0,
                DraftReports = 0,
                FinalReports = 0
            };
        }

        // Validation helper for report operations
        public bool ValidateReportOperation(string operation, string? reportId = null)
        {
            if (string.IsNullOrEmpty(CurrentUserId))
            {
                _logger.LogWarning("Report operation attempted without valid user context");
                return false;
            }

            if (operation.Equals("update", StringComparison.OrdinalIgnoreCase) || 
                operation.Equals("delete", StringComparison.OrdinalIgnoreCase))
            {
                if (string.IsNullOrEmpty(reportId))
                {
                    _logger.LogWarning("Report {Operation} attempted without report ID", operation);
                    return false;
                }
            }

            return true;
        }
    }

    // Data models
    public class CreateReportModel
    {
        [Required(ErrorMessage = "Report title is required")]
        [StringLength(200, ErrorMessage = "Title cannot exceed 200 characters")]
        public string Title { get; set; } = "";

        [Required(ErrorMessage = "Description is required")]
        [StringLength(2000, ErrorMessage = "Description cannot exceed 2000 characters")]
        public string Description { get; set; } = "";

        [Required(ErrorMessage = "Report date is required")]
        [DataType(DataType.Date)]
        public DateTime Date { get; set; }

        [Required(ErrorMessage = "Category is required")]
        public string Category { get; set; } = "";

        public string Priority { get; set; } = "Medium";

        public string Status { get; set; } = "Final";

        public IFormFile? File { get; set; }
    }

    public class Report
    {
        public string Id { get; set; } = "";
        public string Title { get; set; } = "";
        public string Description { get; set; } = "";
        public DateTime Date { get; set; }
        public string Category { get; set; } = "";
        public string Priority { get; set; } = "Medium";
        public string Status { get; set; } = "Final";
        public string? FileName { get; set; }
        public long? FileSize { get; set; }
        public string UserId { get; set; } = "";
        public string AuthorName { get; set; } = "";
        public string AuthorEmail { get; set; } = "";
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    }

    public class ReportStatistics
    {
        public int TotalReports { get; set; }
        public int ImpactReports { get; set; }
        public int FinanceReports { get; set; }
        public int RecentReports { get; set; }
        public int DraftReports { get; set; }
        public int FinalReports { get; set; }
    }

    public enum ReportCategory
    {
        Impact,
        Finance,
        Event,
        Progress,
        Other
    }

    public enum ReportPriority
    {
        Low,
        Medium,
        High
    }

    public enum ReportStatus
    {
        Draft,
        Final
    }
}
