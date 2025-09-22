//using Microsoft.AspNetCore.Mvc;
//using YourNamespace.Pages;

//namespace Wilproject.Controller
//{
//    [Route("api/[controller]")]
//    [ApiController]
//    public class ProjectsController : ControllerBase
//    {
//        // List of all projects (normally fetched from DB/API)
//        public IActionResult Index()
//        {
//            var projects = new List<Project>
//        {
//            new Project { Id = 1, Name = "Education Program", Description = "Building schools in rural areas", Progress = 60 }
//        };
//            return View(projects);
//        }

//        // ✅ VIEW project details
//        public IActionResult Details(int id)
//        {
//            // fetch project by id (from DB/API)
//            var project = new Project { Id = id, Name = "Education Program", Description = "Building schools in rural areas", Progress = 60 };
//            return View(project);
//        }

//        // ✅ EDIT project
//        [HttpGet]
//        public IActionResult Edit(int id)
//        {
//            var project = new Project { Id = id, Name = "Education Program", Description = "Building schools in rural areas", Progress = 60 };
//            return View(project);
//        }

//        [HttpPost]
//        public IActionResult Edit(Project project)
//        {
//            if (ModelState.IsValid)
//            {
//                // update project in DB/API
//                return RedirectToAction("Index");
//            }
//            return View(project);
//        }

//        // ✅ DELETE project
//        [HttpPost]
//        public IActionResult Delete(int id)
//        {
//            // delete project in DB/API
//            return RedirectToAction("Index");
//        }
//    }
//}
