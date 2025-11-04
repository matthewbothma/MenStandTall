using System;
using System.Reflection;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.ViewFeatures;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using Wilproject.Pages;
using Microsoft.Extensions.Logging;
using Microsoft.AspNetCore.Mvc.RazorPages;

namespace TestWILProject
{
    // Simple no-op logger used by the PageModel constructor
    internal class Test1<T> : ILogger<T>
    {
        public IDisposable BeginScope<TState>(TState state) => NullScope.Instance;
        public bool IsEnabled(LogLevel logLevel) => false;
        public void Log<TState>(LogLevel logLevel, EventId eventId, TState state, Exception? exception, Func<TState, Exception?, string> formatter) { }

        private class NullScope : IDisposable
        {
            public static NullScope Instance { get; } = new NullScope();
            public void Dispose() { }
        }
    }

    // Minimal TempData dictionary so PageModel.TempData usage works in tests
    internal class SimpleTempDataDictionary : System.Collections.Generic.Dictionary<string, object?>, ITempDataDictionary
    {
        public object? this[string key] { get => base.ContainsKey(key) ? base[key] : null; set => base[key] = value; }
        public new System.Collections.Generic.ICollection<string> Keys => base.Keys;
        public new System.Collections.Generic.ICollection<object?> Values => base.Values;
        bool System.Collections.Generic.ICollection<System.Collections.Generic.KeyValuePair<string, object?>>.IsReadOnly => false;
        public void Keep() { }
        public void Keep(string key) { }

        public void Load()
        {
            throw new NotImplementedException();
        }

        public object? Peek(string key) => base.ContainsKey(key) ? base[key] : null;
        public void Save() { }
    }

    [TestClass]
    public class ProjectsPageModelTests
    {
        private ProjectsModel CreateModel()
        {
            var logger = new Test1<ProjectsModel>();
            var model = new ProjectsModel(logger);
            // Provide TempData so OnPostAsync can set TempData safely
            model.TempData = new SimpleTempDataDictionary();
            return model;
        }

        [TestMethod]
        public void OnGet_Sets_Empty_Projects_List()
        {
            var model = CreateModel();

            model.OnGet();

            Assert.IsNotNull(model.Projects);
            Assert.AreEqual(0, model.Projects.Count);
        }

        [TestMethod]
        public async Task OnGetProjectsAsync_Returns_Json_With_Success_And_Projects()
        {
            var model = CreateModel();
            model.Projects.Add(new Project { Id = "1", Name = "P1" });

            var result = await model.OnGetProjectsAsync();
            Assert.IsInstanceOfType(result, typeof(JsonResult));
            var json = ((JsonResult)result).Value!;
            var successProp = json.GetType().GetProperty("success") ?? throw new AssertFailedException("success property not found");
            var projectsProp = json.GetType().GetProperty("projects") ?? throw new AssertFailedException("projects property not found");
            Assert.IsTrue((bool)successProp.GetValue(json)!);
            Assert.AreSame(model.Projects, projectsProp.GetValue(json));
        }

        [TestMethod]
        public async Task OnPostAsync_InvalidModel_Returns_Page()
        {
            var model = CreateModel();
            model.ModelState.AddModelError("Name", "Required");

            var result = await model.OnPostAsync();
            Assert.IsInstanceOfType(result, typeof(PageResult));
        }

        [TestMethod]
        public async Task OnPostUpdateAsync_ValidAndInvalidCases()
        {
            var model = CreateModel();

            // Invalid data (missing id/name)
            model.UpdateProject.Id = "";
            model.UpdateProject.Name = "";
            var invalid = await model.OnPostUpdateAsync();
            Assert.IsInstanceOfType(invalid, typeof(JsonResult));
            var invalidJson = ((JsonResult)invalid).Value!;
            var msgProp = invalidJson.GetType().GetProperty("success");
            Assert.IsNotNull(msgProp);
            Assert.IsFalse((bool)msgProp.GetValue(invalidJson)!);

            // Valid data
            model.UpdateProject.Id = "1";
            model.UpdateProject.Name = "Valid";
            var valid = await model.OnPostUpdateAsync();
            Assert.IsInstanceOfType(valid, typeof(JsonResult));
            var validJson = ((JsonResult)valid).Value!;
            var successProp = validJson.GetType().GetProperty("success");
            Assert.IsTrue((bool)successProp!.GetValue(validJson)!);
        }

        [TestMethod]
        public async Task OnPostDeleteAsync_ValidAndInvalidCases()
        {
            var model = CreateModel();

            // invalid id
            var invalid = await model.OnPostDeleteAsync("");
            Assert.IsInstanceOfType(invalid, typeof(JsonResult));
            var invalidJson = ((JsonResult)invalid).Value!;
            var successProp = invalidJson.GetType().GetProperty("success");
            Assert.IsFalse((bool)successProp!.GetValue(invalidJson)!);

            // valid id
            var valid = await model.OnPostDeleteAsync("abc");
            Assert.IsInstanceOfType(valid, typeof(JsonResult));
            var validJson = ((JsonResult)valid).Value!;
            var okProp = validJson.GetType().GetProperty("success");
            Assert.IsTrue((bool)okProp!.GetValue(validJson)!);
        }

        [TestMethod]
        public async Task OnPostUpdateStatusAsync_ValidAndInvalidCases()
        {
            var model = CreateModel();

            // invalid data
            var invalid = await model.OnPostUpdateStatusAsync("", "");
            Assert.IsInstanceOfType(invalid, typeof(JsonResult));
            var invJson = ((JsonResult)invalid).Value!;
            var invSuccess = invJson.GetType().GetProperty("success");
            Assert.IsFalse((bool)invSuccess!.GetValue(invJson)!);

            // invalid status
            var invalidStatus = await model.OnPostUpdateStatusAsync("1", "NotAStatus");
            Assert.IsInstanceOfType(invalidStatus, typeof(JsonResult));
            var invalidStatusJson = ((JsonResult)invalidStatus).Value!;
            var sProp = invalidStatusJson.GetType().GetProperty("success");
            Assert.IsFalse((bool)sProp!.GetValue(invalidStatusJson)!);

            // valid
            var valid = await model.OnPostUpdateStatusAsync("1", "Active");
            Assert.IsInstanceOfType(valid, typeof(JsonResult));
            var validJson = ((JsonResult)valid).Value!;
            var ok = validJson.GetType().GetProperty("success");
            Assert.IsTrue((bool)ok!.GetValue(validJson)!);
        }

        [TestMethod]
        public async Task OnGetStatsAsync_Returns_Json_With_Stats()
        {
            var model = CreateModel();

            var result = await model.OnGetStatsAsync();
            Assert.IsInstanceOfType(result, typeof(JsonResult));
            var json = ((JsonResult)result).Value!;
            var successProp = json.GetType().GetProperty("success");
            Assert.IsTrue((bool)successProp!.GetValue(json)!);
        }
    }
}