using Microsoft.AspNetCore.Mvc;
using WilPWA.Models;
using WilPWA.Services;

namespace WilPWA.Controllers
{
    public class StudentController : Controller
    {

        private readonly AccountServices _accountServices;
        private readonly StudentServices _studentServices;
        public StudentController(AccountServices accountServices, StudentServices studentServices)
        {
            _accountServices = accountServices;
            _studentServices = studentServices;
        }

        public IActionResult Dashboard()
        {
            return View();
        }
        public async Task<IActionResult> ReportList()
        {
            var records = await _studentServices.GetAttendanceRecordsAsync();
            return View(records);
        }
        public IActionResult SetCalendar()
        {
            return View();
        }

        public IActionResult Attendance()
        {
            return View();
        }


        [HttpPost]
        public async Task<IActionResult> ClockIn(string studentNumber)
        {
            studentNumber = LoggedInUser.UserID;
            var (success, message) = await _accountServices.ClockInAsync(studentNumber);

            if (success)
                ViewBag.Success = "Successfully clocked in!";
            else
                ViewBag.Error = message;

            UserAttendance.UserID = studentNumber;
            UserAttendance.ClockInTime = DateTime.Now;
            return View("Attendance"); 
        }

        [HttpPost]
        public async Task<IActionResult> ClockOut(string studentNumber)
        {
            studentNumber = LoggedInUser.UserID;
            var (success, message) = await _accountServices.ClockOutAsync(studentNumber);
            if (success)
                ViewBag.Success = "Successfully clocked out!";
            else
                ViewBag.Error = message;

            UserAttendance.ClockOutTime = DateTime.Now;
            return View("Attendance");
        }


        // Action to display the VirtualCard page (simulated)
        //public async Task<IActionResult> VirtualCard(string studentNumber, string RowKey)
        //{

        //    studentNumber = "ST10284732";
        //    RowKey = "5475bf10-d1ea-4935-aa2d-6a1d2f734cc3";
        //    // Fetch student info based on studentNumber
        //    var student = await _studentService.SimulateCardTapAsync(studentNumber, RowKey);

        //    if (student == null)
        //    {
        //        return View(); // If student not found, show the "Not Found" page
        //    }

        //    // Return the VirtualCard view and pass the student model to it
        //    return View(student); // Return the student object to the VirtualCard view
        //}

        //// Action to simulate card tap (clock-in) after VirtualCard view
        //[HttpPost]
        //public async Task<IActionResult> ClockIn(string studentNumber, string RowKey)
        //{
        //    var student = await _studentService.SimulateCardTapAsync(studentNumber, RowKey);

        //    if (student == null)
        //    {
        //        return View("NotFound", studentNumber); // Show "Not Found" page if student not found
        //    }

        //    // Here you can add additional logic to log the clock-in action if needed
        //    ViewBag.Message = $"Student {student.firstName} {student.lastName} clocked in successfully.";
        //    return RedirectToAction("VirtualCard", new { studentNumber = student.studentNumber }); // Redirect to VirtualCard view with the same student number
        //}

    }
}

//Welcome page

