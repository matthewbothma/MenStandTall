using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using System.Text.Json;

namespace Wilproject.Pages
{
    public class DashboardModel : PageModel
    {
        private readonly ILogger<DashboardModel> _logger;

        public DashboardModel(ILogger<DashboardModel> logger)
        {
            _logger = logger;
        }

        // Dashboard statistics properties
        public DashboardStats Stats { get; set; } = new();
        public List<ActivityItem> RecentActivities { get; set; } = new();
        public List<UpcomingDeadline> UpcomingDeadlines { get; set; } = new();
        public ChartData ChartData { get; set; } = new();

        public void OnGet()
        {
            _logger.LogInformation("Dashboard accessed");
            LoadDashboardData();
        }

        // API endpoint to get dashboard stats
        public async Task<IActionResult> OnGetStatsAsync()
        {
            try
            {
                await LoadDashboardDataAsync();
                return new JsonResult(new
                {
                    success = true,
                    stats = Stats,
                    activities = RecentActivities,
                    deadlines = UpcomingDeadlines,
                    chartData = ChartData
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error loading dashboard stats");
                return new JsonResult(new { success = false, message = "Error loading dashboard data" });
            }
        }

        // API endpoint to get chart data for specific period
        public async Task<IActionResult> OnGetChartDataAsync(int period = 7)
        {
            try
            {
                var chartData = await GetChartDataForPeriodAsync(period);
                return new JsonResult(new
                {
                    success = true,
                    chartData = chartData,
                    period = period
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error loading chart data for period {Period}", period);
                return new JsonResult(new { success = false, message = "Error loading chart data" });
            }
        }

        // API endpoint to refresh dashboard data
        public async Task<IActionResult> OnPostRefreshAsync()
        {
            try
            {
                await LoadDashboardDataAsync();
                return new JsonResult(new { success = true, message = "Dashboard refreshed" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error refreshing dashboard");
                return new JsonResult(new { success = false, message = "Refresh failed" });
            }
        }

        private void LoadDashboardData()
        {
            // This would typically load from database/Firebase
            // For now, we'll simulate data loading
            
            Stats = new DashboardStats
            {
                ActiveProjects = GetActiveProjectsCount(),
                CompletedTasks = GetCompletedTasksCount(),
                TeamMembers = GetTeamMembersCount(),
                UpcomingEvents = GetUpcomingEventsCount()
            };

            RecentActivities = GetRecentActivities();
            UpcomingDeadlines = GetUpcomingDeadlines();
            ChartData = GetChartData();
        }

        private async Task LoadDashboardDataAsync()
        {
            // Simulate async data loading
            await Task.Delay(100);
            LoadDashboardData();
        }

        private async Task<ChartData> GetChartDataForPeriodAsync(int days)
        {
            // Simulate async data loading
            await Task.Delay(50);
            
            // Generate empty data structure - Firebase will populate with real data
            var labels = new List<string>();
            var progressData = new List<int>();
            
            var endDate = DateTime.Now;
            var startDate = endDate.AddDays(-days + 1);
            
            // Generate labels but with zero data
            for (var date = startDate; date <= endDate; date = date.AddDays(1))
            {
                if (days <= 7)
                {
                    labels.Add(date.ToString("ddd"));
                }
                else if (days <= 30)
                {
                    labels.Add(date.ToString("MM/dd"));
                }
                else
                {
                    if (date.Day % 7 == 0 || date == startDate || date == endDate)
                    {
                        labels.Add(date.ToString("MM/dd"));
                    }
                }
                
                // Return 0 instead of random data - Firebase will provide real data
                progressData.Add(0);
            }
            
            // For 90 days, reduce data points
            if (days > 30)
            {
                var reducedLabels = new List<string>();
                var reducedData = new List<int>();
                
                for (int i = 0; i < labels.Count; i += 7)
                {
                    if (i < labels.Count)
                    {
                        reducedLabels.Add(labels[i]);
                        reducedData.Add(0); // Always start with 0
                    }
                }
                
                labels = reducedLabels;
                progressData = reducedData;
            }
            
            return new ChartData
            {
                Labels = labels.ToArray(),
                ProjectProgress = progressData.ToArray(),
                TaskDistribution = new TaskDistribution
                {
                    Completed = 0, // Firebase will update these
                    InProgress = 0,
                    Planning = 0,
                    Review = 0
                }
            };
        }

        private int GetActiveProjectsCount()
        {
            // This would query your database/Firebase
            // For now, return 0 for new users
            return 0;
        }

        private int GetCompletedTasksCount()
        {
            // This would query your database/Firebase
            return 0;
        }

        private int GetInProgressTasksCount()
        {
            // This would query your database/Firebase
            return 0;
        }

        private int GetPlanningTasksCount()
        {
            // This would query your database/Firebase
            return 0;
        }

        private int GetReviewTasksCount()
        {
            // This would query your database/Firebase
            return 0;
        }

        private int GetTeamMembersCount()
        {
            // This would query your database/Firebase
            return 1; // At least the current user
        }

        private int GetUpcomingEventsCount()
        {
            // This would query your database/Firebase
            return 0;
        }

        private List<ActivityItem> GetRecentActivities()
        {
            // This would load from database/Firebase
            // Return empty list for new users
            return new List<ActivityItem>();
        }

        private List<UpcomingDeadline> GetUpcomingDeadlines()
        {
            // This would load from database/Firebase
            return new List<UpcomingDeadline>();
        }

        private ChartData GetChartData()
        {
            // Return empty data - Firebase will populate this with real data
            return new ChartData
            {
                Labels = new string[] { "Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun" },
                ProjectProgress = new int[] { 0, 0, 0, 0, 0, 0, 0 }, // Start with zeros - Firebase will update
                TaskDistribution = new TaskDistribution
                {
                    Completed = 0,
                    InProgress = 0,
                    Planning = 0,
                    Review = 0
                }
            };
        }
    }

    // Data models
    public class DashboardStats
    {
        public int ActiveProjects { get; set; }
        public int CompletedTasks { get; set; }
        public int TeamMembers { get; set; }
        public int UpcomingEvents { get; set; }
        public string ProjectsChange { get; set; } = "+0%";
        public string TasksChange { get; set; } = "+0%";
        public string MembersChange { get; set; } = "+0 new";
        public string EventsChange { get; set; } = "None scheduled";
    }

    public class ActivityItem
    {
        public string Icon { get; set; } = "";
        public string Title { get; set; } = "";
        public string Description { get; set; } = "";
        public string TimeAgo { get; set; } = "";
        public string BackgroundColor { get; set; } = "";
    }

    public class UpcomingDeadline
    {
        public string Icon { get; set; } = "";
        public string Title { get; set; } = "";
        public string Description { get; set; } = "";
        public string TimeRemaining { get; set; } = "";
        public string BackgroundColor { get; set; } = "";
        public bool IsOverdue { get; set; }
    }

    public class ChartData
    {
        public string[] Labels { get; set; } = new string[7];
        public int[] ProjectProgress { get; set; } = new int[7];
        public TaskDistribution TaskDistribution { get; set; } = new();
    }

    public class TaskDistribution
    {
        public int Completed { get; set; }
        public int InProgress { get; set; }
        public int Planning { get; set; }
        public int Review { get; set; }
    }
}