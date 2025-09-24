using Wilproject.Configuration;

namespace Wilproject
{
    public class Program
    {
        public static void Main(string[] args)
        {
            var builder = WebApplication.CreateBuilder(args);

            // Add services to the container.
            builder.Services.AddControllers();
            builder.Services.AddSignalR();
            builder.Services.AddRazorPages();
            
            // Register Firebase configuration
            builder.Services.Configure<FirebaseConfig>(
                builder.Configuration.GetSection("Firebase"));

            var app = builder.Build();

            // Configure the HTTP request pipeline.
            if (!app.Environment.IsDevelopment())
            {
                app.UseExceptionHandler("/Error");
                // The default HSTS value is 30 days. You may want to change this for production scenarios, see https://aka.ms/aspnetcore-hsts.
                app.UseHsts();
            }

            app.UseHttpsRedirection();
            app.UseStaticFiles();
            app.UseRouting();
            app.UseAuthorization();

            app.MapRazorPages();
            app.MapControllers();
            app.MapHub<Hubs.TaskHubs>("/taskHubs");

            app.Run();
        }
    }
}
