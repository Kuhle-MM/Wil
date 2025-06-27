using Microsoft.AspNetCore.Mvc;

namespace VarsityTrackerApi.Controllers
{
    public class ReportController : Controller
    {
        public IActionResult Index()
        {
            return View();
        }
    }
}
