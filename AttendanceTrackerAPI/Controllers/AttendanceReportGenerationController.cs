using AttendanceTrackerAPI.Models;
using Microsoft.AspNetCore.Mvc;
using System.Data;

// For more information on enabling Web API for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace AttendanceTrackerAPI.Controllers
{

    [Route("api/[controller]")]
    [ApiController]
    public class AttendanceReportGenerationController : ControllerBase
    {

        private static List<Student> attendanceRecord = new();

        private static List<Student> studentsArray = new()
    {
        new Student
        {
            StudentId = 1,
            Name = "Alice",
            Surname = "Nguyen",
            StudentCardId = "C1:23:AA:4F",
            Module = "Data Structures",
            RegistrationDate = DateOnly.FromDateTime(DateTime.Today),
            Qualification = "BSc Computer Science",
            Email = "alice.nguyen@student.edu"
        },
        new Student
        {
            StudentId = 2,
            Name = "Kuhle",
            Surname = "Mlinganiso",
            StudentCardId = "97:16:4A:4F",
            Module = "Operating Systems",
            RegistrationDate = DateOnly.FromDateTime(DateTime.Today),
            Qualification = "BSc Information Systems",
            Email = "Kuhle.Mlinganiso@student.edu"
        },
        new Student
        {
            StudentId = 3,
            Name = "Chloe",
            Surname = "Smith",
            StudentCardId = "05:8B:7A:E3:CA:92:00",
            Module = "Software Engineering",
            RegistrationDate = DateOnly.FromDateTime(DateTime.Today),
            Qualification = "BSc Computer Science",
            Email = "chloe.smith@student.edu"
        },
        new Student
        {
            StudentId = 4,
            Name = "David",
            Surname = "Oluwaseun",
            StudentCardId = "A8:77:DC:1B",
            Module = "Artificial Intelligence",
            RegistrationDate = DateOnly.FromDateTime(DateTime.Today),
            Qualification = "BSc Data Science",
            Email = "david.oluwaseun@student.edu"
        },
        new Student
        {
            StudentId = 5,
            Name = "Emma",
            Surname = "Pieterse",
            StudentCardId = "B5:34:EF:3D",
            Module = "Cybersecurity",
            RegistrationDate = DateOnly.FromDateTime(DateTime.Today),
            Qualification = "BSc IT",
            Email = "emma.pieterse@student.edu"
        }
    };

        [HttpGet("RetrieveStudent")]
        public IActionResult RetrieveStudent([FromQuery] string studentCardId)
        {
            try
            {
                var student = new Student();


                student = studentsArray.FirstOrDefault(s => s.StudentCardId == studentCardId);

                if (student == null)
                {
                    return NotFound("Student could not be found");
                }

                return Ok(student);
            }
            catch(Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, new
                {
                    message = "An error occurred while fetching users from the database.",
                    error = ex.Message
                });
            }
            
        }

        [HttpGet("GetListAttendingStudents")]
        public IActionResult GetListAttendingStudents()
        {
            try
            {
                var student = attendanceRecord.ToList();

                if (student == null)
                {
                    return NotFound("Student could not be found");
                }

                return Ok(student);
            }
            catch(Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, new
                {
                    message = "An error occurred while fetching users from the database.",
                    error = ex.Message
                });
            }

        }

        //[HttpPost("StartLessonPeriod")]
        //public IActionResult StartLessonPeriod(Lecturer lecturer, Module module)
        //{

        //    //setting the start Time
        //    startTime = DateTime.UtcNow;


        //    return
        //}


        [HttpGet("CheckIfStudentExists")]
        public IActionResult CheckIfStudentExists([FromQuery] string studentCardId)
        {

            try
            {

                var student = studentsArray.FirstOrDefault(s => s.StudentCardId == studentCardId);//Replace the Array with the database
                
                bool exists = student != null;

                return Ok(new { exists });
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, new
                {
                    message = "An error occurred while fetching users from the database.",
                    error = ex.Message
                });
            }

        }


        [HttpPut("AddStudentToList")]
        public IActionResult AddStudentToList([FromBody] string studentCardId)
        {
            var student = new Student();

            student = studentsArray.FirstOrDefault(s => s.StudentCardId == studentCardId);

            if (student == null)
            {
                return NotFound(new { message = "Student not found." });
            }

            //replace to be database
            if (!attendanceRecord.Contains(student))
            {
                attendanceRecord.Add(student);
            }else
            {
                return Conflict(new { message = "Student is already on the list" });
            }

                // add save to database



                return Ok("Student Successfully added");
        }

        [HttpDelete("DeleteList")]
        public IActionResult DeleteAttendanceRecord(string lectureCardId)
        {

            // check if this is the lecturer responsible for the lecture

            // delete the table
            attendanceRecord.Clear();


            return Ok();
        }

   
    }
}
