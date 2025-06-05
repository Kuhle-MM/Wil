using Microsoft.AspNetCore.Mvc;

namespace WilPWA.Controllers
{
    public class AdminController : Controller
    {
        public IActionResult Dashboard()
        {
            return View();
        }

        public IActionResult Create()
        {
            return View();
        }
    }
}
