using Microsoft.AspNetCore.Mvc;

// For more information on enabling Web API for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace AttendanceTrackerAPI.Controllers
{

    

    [Route("api/[controller]")]
    [ApiController]
    public class AttendanceReportGenerationController : ControllerBase
    {

        private static List<Student> studentsArray = new();
        private static List<AttendanceRecord> attendanceRecords = new();


        //// GET: api/<AttendanceReportGenerationController>
        //[HttpGet]
        //public IEnumerable<string> Get()
        //{
        //    return new string[] { "value1", "value2" };
        //}

        //// GET api/<AttendanceReportGenerationController>/5
        //[HttpGet("{id}")]
        //public string GetStudent()
        //{
        //    return null;
        //}

        // POST api/<AttendanceReportGenerationController>
        [HttpPost]
        public IActionResult Post([FromBody]string studentCardId)
        {
                // Add default student
                var student = new Student
                {
                    StudentId = 1,
                    Name = "Default",
                    Surname = "Student",
                    StudentCardId = "C7:86:FD:4E",
                    Module = "Software Engineering",
                    RegistrationDate = DateOnly.FromDateTime(DateTime.Today),
                    Qualification = "BSc Computer Science",
                    Email = "default@student.edu"
                };

                studentsArray.Add(student);

                student = studentsArray.FirstOrDefault(s => s.StudentCardId == studentCardId);

            if (student == null)
            {
                return NotFound("Student Could Not Be Found");
            }

            var attendanceRecord = new AttendanceRecord
            {
                recordId = attendanceRecords.Count + 1,
                StudentId = student.StudentId,
                Student = student,
                LessonDate = DateTime.Today,
                CheckInTime = DateTime.Now
            };

            attendanceRecords.Add(attendanceRecord);

            return Ok(attendanceRecords);
        }

        [HttpGet("report")]
        public List<AttendanceRecord> GetAttendanceReport()
        {
            return attendanceRecords;
        }
        //// PUT api/<AttendanceReportGenerationController>/5
        //[HttpPut("{id}")]
        //public void Put(int id, [FromBody]string value)
        //{
        //}

        //// DELETE api/<AttendanceReportGenerationController>/5
        //[HttpDelete("{id}")]
        //public void Delete(int id)
        //{
        //}
    }
}
