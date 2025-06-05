using Microsoft.AspNetCore.Mvc;
using WilPWA.Models;
using WilPWA.Services;

namespace WilPWA.Controllers
{
    public class LecturerController : Controller
    {
        private readonly AccountServices _accountServices;

        public LecturerController(AccountServices accountServices)
        {
            _accountServices = accountServices;
        }
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

        public IActionResult Attendance()
        {
            return View();
        }


        [HttpPost]
        public async Task<IActionResult> ClockIn(string LecturerID)
        {
            LecturerID = LoggedInUser.UserID;
            var (success, message) = await _accountServices.ClockInLecturerAsync(LecturerID);

            if (success)
                ViewBag.Success = "Successfully clocked in!";
            else
                ViewBag.Error = message;

            UserAttendance.UserID = LecturerID;
            UserAttendance.ClockInTime = DateTime.Now;
            return View("Attendance");
        }

        [HttpPost]
        public async Task<IActionResult> ClockOut(string LecturerID)
        {
            LecturerID = LoggedInUser.UserID.ToLower();
            var (success, message) = await _accountServices.ClockOutLecturerAsync(LecturerID);
            if (success)
                ViewBag.Success = "Successfully clocked out!";
            else
                ViewBag.Error = message;

            UserAttendance.ClockOutTime = DateTime.Now;
            return View("Attendance");
        }
    }
}
