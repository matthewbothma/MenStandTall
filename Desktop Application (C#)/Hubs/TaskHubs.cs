using Microsoft.AspNetCore.SignalR;

namespace Wilproject.Hubs
{
    public class TaskHubs : Hub
    {
        public async Task AddTask(Task task)
        {
            await Clients.All.SendAsync("TaskAdded", task);
        }
    }
}