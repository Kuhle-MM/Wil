using Microsoft.AspNetCore.Mvc;

namespace WilPWA.Controllers
{
    public class LecturerController : Controller
    {
        public IActionResult Dashboard()
        {
            return View();
        }
        public IActionResult Card()
        {
            return View();
        }
        public IActionResult Progress()
        {
            return View();
        }
        public IActionResult Report()
        {
            return View();
        }
    }
}
