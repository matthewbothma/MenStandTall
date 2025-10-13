using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using System.ComponentModel.DataAnnotations;

namespace Wilproject.Pages
{
    public class MessagesModel : PageModel
    {
        private readonly ILogger<MessagesModel> _logger;

        public MessagesModel(ILogger<MessagesModel> logger)
        {
            _logger = logger;
        }

        [BindProperty]
        public CreateMessageModel NewMessage { get; set; } = new();

        // Properties for potential server-side message operations
        public List<Message> Messages { get; set; } = new();
        public MessageStatistics Statistics { get; set; } = new();
        public string CurrentUserId { get; set; } = "";

        public void OnGet()
        {
            _logger.LogInformation("Messages page accessed");
            InitializeUserContext();
            Statistics = GetMessageStatistics();
        }

        // API endpoint to get messages
        public async Task<IActionResult> OnGetMessagesAsync()
        {
            try
            {
                // This would load from Firebase in the client-side
                // Server-side can be used for additional validation/processing
                return new JsonResult(new { success = true, messages = Messages, statistics = Statistics });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error loading messages");
                return new JsonResult(new { success = false, message = "Error loading messages" });
            }
        }

        // POST handler for sending messages
        public async Task<IActionResult> OnPostSendAsync()
        {
            if (!ModelState.IsValid)
            {
                _logger.LogWarning("Invalid message send attempt");
                return new JsonResult(new { success = false, message = "Invalid message data" });
            }

            try
            {
                _logger.LogInformation("Server-side message send: {MessageTitle}", NewMessage.Title);
                
                // Server-side validation and logging
                // The actual sending will be handled by Firebase on client-side
                
                return new JsonResult(new { success = true, message = "Message send validated" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error sending message");
                return new JsonResult(new { success = false, message = "Message send failed" });
            }
        }

        // POST handler for saving drafts
        public async Task<IActionResult> OnPostSaveDraftAsync()
        {
            try
            {
                _logger.LogInformation("Server-side draft save for user: {UserId}", CurrentUserId);
                
                if (string.IsNullOrEmpty(NewMessage.Title) && string.IsNullOrEmpty(NewMessage.Content))
                {
                    return new JsonResult(new { success = false, message = "Nothing to save as draft" });
                }

                // Server-side validation passed
                return new JsonResult(new { success = true, message = "Draft save validated" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error saving draft");
                return new JsonResult(new { success = false, message = "Draft save failed" });
            }
        }

        // POST handler for deleting messages
        public async Task<IActionResult> OnPostDeleteAsync(string messageId)
        {
            try
            {
                _logger.LogInformation("Server-side message deletion: {MessageId}", messageId);
                
                if (string.IsNullOrEmpty(messageId))
                {
                    return new JsonResult(new { success = false, message = "Invalid message ID" });
                }

                // Server-side validation passed
                return new JsonResult(new { success = true, message = "Message deletion validated" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting message");
                return new JsonResult(new { success = false, message = "Deletion failed" });
            }
        }

        // GET handler for message statistics
        public async Task<IActionResult> OnGetStatisticsAsync()
        {
            try
            {
                var stats = GetMessageStatistics();
                return new JsonResult(new { success = true, statistics = stats });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting message statistics");
                return new JsonResult(new { success = false, message = "Statistics unavailable" });
            }
        }

        // Helper methods
        private void InitializeUserContext()
        {
            CurrentUserId = User?.FindFirst("sub")?.Value ?? User?.FindFirst("id")?.Value ?? "";
            _logger.LogDebug("User context initialized for messages: {UserId}", CurrentUserId);
        }

        private MessageStatistics GetMessageStatistics()
        {
            // This would calculate from Firebase data
            // For now, return empty stats for new users
            return new MessageStatistics
            {
                TotalMessages = 0,
                UnreadMessages = 0,
                SentMessages = 0,
                DraftMessages = 0
            };
        }

        // Validation helper for message operations
        public bool ValidateMessageOperation(string operation, string? messageId = null)
        {
            if (string.IsNullOrEmpty(CurrentUserId))
            {
                _logger.LogWarning("Message operation attempted without valid user context");
                return false;
            }

            if (operation.Equals("delete", StringComparison.OrdinalIgnoreCase) || 
                operation.Equals("read", StringComparison.OrdinalIgnoreCase))
            {
                if (string.IsNullOrEmpty(messageId))
                {
                    _logger.LogWarning("Message {Operation} attempted without message ID", operation);
                    return false;
                }
            }

            return true;
        }
    }

    // Data models
    public class CreateMessageModel
    {
        [Required(ErrorMessage = "Message title is required")]
        [StringLength(200, ErrorMessage = "Title cannot exceed 200 characters")]
        public string Title { get; set; } = "";

        [Required(ErrorMessage = "Message content is required")]
        [StringLength(2000, ErrorMessage = "Content cannot exceed 2000 characters")]
        public string Content { get; set; } = "";

        [Required(ErrorMessage = "Priority is required")]
        public string Priority { get; set; } = "Medium";

        public string Category { get; set; } = "general";

        public List<string> Recipients { get; set; } = new();
    }

    public class Message
    {
        public string Id { get; set; } = "";
        public string Title { get; set; } = "";
        public string Content { get; set; } = "";
        public string Priority { get; set; } = "Medium";
        public string Category { get; set; } = "general";
        public string AuthorId { get; set; } = "";
        public string AuthorName { get; set; } = "";
        public string AuthorEmail { get; set; } = "";
        public DateTime Timestamp { get; set; } = DateTime.UtcNow;
        public bool IsRead { get; set; } = false;
        public bool IsStarred { get; set; } = false;
        public string Status { get; set; } = "sent"; // sent, draft, deleted
        public List<string> Recipients { get; set; } = new();
    }

    public class MessageStatistics
    {
        public int TotalMessages { get; set; }
        public int UnreadMessages { get; set; }
        public int SentMessages { get; set; }
        public int DraftMessages { get; set; }
        public int ReceivedMessages { get; set; }
        public int StarredMessages { get; set; }
    }

    public enum MessagePriority
    {
        Low,
        Medium,
        High
    }

    public enum MessageCategory
    {
        General,
        Announcement,
        Meeting,
        Project,
        Personal
    }
}
