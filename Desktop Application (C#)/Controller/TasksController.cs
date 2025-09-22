using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using Wilproject.Hubs;

namespace Wilproject.Controller
{
    [Route("api/[controller]")]
    [ApiController]
    public class TasksController : ControllerBase
    {
        private readonly IHubContext<TaskHubs> _hubContext;

        public TasksController(IHubContext<TaskHubs> hubContext)
        {
            _hubContext = hubContext;
        }

        [HttpPost]
        public async Task<IActionResult> Post([FromBody] Task task)
        {
            // Here you would typically save the task to a database

            await _hubContext.Clients.All.SendAsync("TaskAdded", task);
            return Ok(task);
        }
    }
}