using Microsoft.AspNetCore.Mvc;
using Wilproject.Configuration;

namespace Wilproject.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ConfigController : ControllerBase
    {
        private readonly FirebaseConfig _firebaseConfig;

        public ConfigController(IConfiguration configuration)
        {
            _firebaseConfig = new FirebaseConfig();
            configuration.GetSection("Firebase").Bind(_firebaseConfig);
        }

        [HttpGet("firebase")]
        public IActionResult GetFirebaseConfig()
        {
            // Only return config if user is authenticated (you can add more security here)
            return Ok(new
            {
                apiKey = _firebaseConfig.ApiKey,
                authDomain = _firebaseConfig.AuthDomain,
                projectId = _firebaseConfig.ProjectId,
                storageBucket = _firebaseConfig.StorageBucket,
                messagingSenderId = _firebaseConfig.MessagingSenderId,
                appId = _firebaseConfig.AppId,
                measurementId = _firebaseConfig.MeasurementId
            });
        }
    }
}