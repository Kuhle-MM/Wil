using Microsoft.AspNetCore.Mvc;

namespace WilPWA.Controllers
{
    public class LecturerController : Controller
    {
        public IActionResult Dashboard()
        {
            var role = HttpContext.Session.GetString("Role");
            if (role != "Lecturer")
            {
                return RedirectToAction("Index", "Home");
            }

            return View();
        }
        public IActionResult Card()
        {
            var role = HttpContext.Session.GetString("Role");
            if (role != "Lecturer")
            {
                return RedirectToAction("Index", "Home");
            }

            return View();
        }
        public IActionResult Progress()
        {
            var role = HttpContext.Session.GetString("Role");
            if (role != "Lecturer")
            {
                return RedirectToAction("Index", "Home");
            }

            return View();
        }
        public IActionResult Report()
        {
            var role = HttpContext.Session.GetString("Role");
            if (role != "Lecturer")
            {
                return RedirectToAction("Index", "Home");
            }

            return View();
        }
    }
}
