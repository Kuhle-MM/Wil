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

            if (!success && message.Contains("User not found"))
            {
                // Try Admin login
                (success, message, returnedRole) = await _accountServices.LoginAdminAsync(model.email, model.password);
            }

            if (!success)
            {
                ModelState.AddModelError(string.Empty, message);
                return View(model);
            }
            
            // Redirect to role-specific dashboard
            if (returnedRole == "Student")
            {
                LoggedInUser.UserID = model.email.Substring(0, model.email.IndexOf("@")).ToUpper();
                LoggedInUser.Email = model.email;
                LoggedInUser.Role = "Student";

                return RedirectToAction("Dashboard", "Student");
            }
                
            else if (returnedRole == "Lecturer")
            {
                LoggedInUser.UserID = model.email.Substring(0, model.email.IndexOf("@")).ToUpper();
                LoggedInUser.Email = model.email;
                LoggedInUser.Role = "Lecturer"; 

                return RedirectToAction("Dashboard", "Lecturer");
            }
            else if (returnedRole == "Admin")
            {
                LoggedInUser.UserID = model.email.Substring(0, model.email.IndexOf("@")).ToUpper();
                LoggedInUser.Email = model.email;
                LoggedInUser.Role = "Admin";

                return RedirectToAction("Dashboard", "Admin");
            }

            // Fallback
            return RedirectToAction("Index", "Home");
        }

        public IActionResult Logout()
        {
            LoggedInUser.Email = "";
            LoggedInUser.UserID = "";
            LoggedInUser.Role = "";

            return RedirectToAction("Login", "Account");
        }
    }
}