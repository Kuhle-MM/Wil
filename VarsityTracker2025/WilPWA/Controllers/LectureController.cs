using Microsoft.AspNetCore.Mvc;

namespace WilPWA.Controllers
{
    public class LectureController : Controller
    {
        public IActionResult Index()
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
