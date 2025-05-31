using Azure.Data.Tables;
using Azure;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using WilPWA.Services;
using WilPWA.Models;
using static WilPWA.Services.AccountServices;

namespace WilPWA.Controllers
{
    public class AccountController : Controller
    {
        private readonly AccountServices _accountServices;

        public AccountController(AccountServices accountServices)
        {
            _accountServices = accountServices;
        }

        public IActionResult Login()
        {
            return View();
        }

        [HttpPost]
        public async Task<IActionResult> Login(LoginModel model)
        {
            if (!ModelState.IsValid)
                return View(model);


            // Try login as Student
            var (success, message, returnedRole) = await _accountServices.LoginStudentAsync(model.email, model.password);

            if (!success && message.Contains("User not found"))
            {
                // Try Lecturer login
                (success, message, returnedRole) = await _accountServices.LoginLecturerAsync(model.email, model.password);
            }

            if (!success)
            {
                ModelState.AddModelError(string.Empty, message);
                return View(model);
            }

            // Store session values
            HttpContext.Session.SetString("Role", returnedRole);
            HttpContext.Session.SetString("Email", model.email);

            // Redirect to role-specific dashboard
            if (returnedRole == "Student")
                return RedirectToAction("Dashboard", "Student");
            else if (returnedRole == "Lecturer")
                return RedirectToAction("Dashboard", "Lecturer");

            // Fallback
            return RedirectToAction("Index", "Home");
        }
    }
}