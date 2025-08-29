using Azure.Data.Tables;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using VarsityTrackerApi.Models.Access;
using VarsityTrackerApi.Models.Lesson;
using VarsityTrackerApi.Models.Module;
using VarsityTrackerApi.Models.Report.AttendanceRecord;

namespace VarsityTrackerApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class StudentClockingController : ControllerBase
    {
        private readonly TableClient _studentTable;
        private readonly TableClient _studentModuleTable;
        private readonly TableClient _attendanceTable;
        private readonly TableClient _lecturerTable;
        private readonly TableClient _lessonTable;

        public StudentClockingController(IOptions<AzureTableStorageSettings> storageOptions)
        {
            var connectionString = storageOptions.Value.ConnectionString;

            // Student data stored in "Students" table
            _studentTable = new TableClient(connectionString, "Students");
            _studentTable.CreateIfNotExists();

            // Attendance records stored in separate "Lecturers" table
            _lecturerTable = new TableClient(connectionString, "Lecturers");
            _lecturerTable.CreateIfNotExists();

            // Attendance records stored in separate "Attendances" table
            _attendanceTable = new TableClient(connectionString, "Attendances");
            _attendanceTable.CreateIfNotExists();

            // Attendance records stored in separate "StudentModules" table
            _studentModuleTable = new TableClient(connectionString, "StudentModules");
            _studentModuleTable.CreateIfNotExists();

            // Attendance records stored in separate "Attendances" table
            _lessonTable = new TableClient(connectionString, "Lessons");
            _lessonTable.CreateIfNotExists();
        }

        [HttpPost("clockin/{studentNumber}")]
        public async Task<IActionResult> ClockIn(string studentNumber)
        {
            Students student = null;
            await foreach (var s in _studentTable.QueryAsync<Students>(s => s.studentNumber == studentNumber.ToUpper()))
            {
                student = s;
                break;
            }

            if (student == null)
                return NotFound("Student not found.");

            var today = DateTime.UtcNow.Date;

            // Prevent multiple clock-ins for the same day
            await foreach (var record in _attendanceTable.QueryAsync<AttendanceRecord>(r =>
                r.PartitionKey == "Attendance" &&
                r.StudentNumber == studentNumber &&
                r.ClockInTime >= today))
            {
                return BadRequest("Student already clocked in today.");
            }

            var attendance = new AttendanceRecord
            {
                PartitionKey = "Attendance",
                RowKey = Guid.NewGuid().ToString(),
                StudentNumber = student.studentNumber,
                StudentEmail = student.studentEmail,
                ClockInTime = DateTime.UtcNow,
                ClockOutTime = null,
                Status = "Present"
            };

            await _attendanceTable.AddEntityAsync(attendance);
            return Ok("Clock-in recorded.");
        }


        [HttpPost("clockout/{studentNumber}")]
        public async Task<IActionResult> ClockOut(string studentNumber)
        {
            var today = DateTime.UtcNow.Date;

            AttendanceRecord recordToUpdate = null;

            await foreach (var record in _attendanceTable.QueryAsync<AttendanceRecord>(r =>
                r.PartitionKey == "Attendance" &&
                r.StudentNumber == studentNumber &&
                r.ClockInTime >= today))
            {
                recordToUpdate = record;
                break;
            }

            if (recordToUpdate == null)
                return NotFound("No active clock-in found for today.");

            recordToUpdate.ClockOutTime = DateTime.UtcNow;

            await _attendanceTable.UpdateEntityAsync(recordToUpdate, recordToUpdate.ETag, TableUpdateMode.Replace);

            return Ok("Clock-out recorded.");
        }

        [HttpGet("report/{studentNumber}")]
        public async Task<IActionResult> GetAttendanceReport(string studentNumber)
        {
            var report = new List<AttendanceRecord>();

            await foreach (var record in _attendanceTable.QueryAsync<AttendanceRecord>(r =>
                r.PartitionKey == "Attendance" &&
                r.StudentNumber == studentNumber))
            {
                report.Add(record);
            }

            if (!report.Any())
                return NotFound("No attendance records found for this student.");

            return Ok(report);
        }

        [HttpGet("report/getAll")]
        public async Task<List<AttendanceRecord>> GetAllUsersAsync()
        {
            var attendance = new List<AttendanceRecord>();
            await foreach (var newAttendance in _attendanceTable.QueryAsync<AttendanceRecord>())
            {
                attendance.Add(newAttendance);
            }
            return attendance;
        }

        [HttpPost("lecturer/clockin/{lecturerID}")]
        public async Task<IActionResult> ClockInLecturer(string lecturerID)
        {
            Lecturers lecturer = null;
            await foreach (var s in _lecturerTable.QueryAsync<Lecturers>(s => s.lecturerID == lecturerID.ToLower()))
            {
                lecturer = s;
                break;
            }

            if (lecturer == null)
                return NotFound("Student not found.");

            var today = DateTime.UtcNow.Date;

            // Prevent multiple clock-ins for the same day
            await foreach (var record in _attendanceTable.QueryAsync<AttendanceRecord>(r =>
                r.PartitionKey == "Attendance" &&
                r.StudentNumber == lecturerID &&
                r.ClockInTime >= today))
            {
                return BadRequest("Student already clocked in today.");
            }

            var attendance = new AttendanceRecord
            {
                PartitionKey = "Attendance",
                RowKey = Guid.NewGuid().ToString(),
                StudentNumber = lecturer.lecturerID,
                StudentEmail = lecturer.lecturerEmail,
                ClockInTime = DateTime.UtcNow,
                ClockOutTime = null,
                Status = "Present"
            };

            await _attendanceTable.AddEntityAsync(attendance);
            return Ok("Clock-in recorded.");
        }


        [HttpPost("lecturer/clockout/{lecturerID}")]
        public async Task<IActionResult> ClockOutLecturer(string lecturerID)
        {
            var today = DateTime.UtcNow.Date;

            AttendanceRecord recordToUpdate = null;

            await foreach (var record in _attendanceTable.QueryAsync<AttendanceRecord>(r =>
                r.PartitionKey == "Attendance" &&
                r.StudentNumber == lecturerID &&
                r.ClockInTime >= today))
            {
                recordToUpdate = record;
                break;
            }

            if (recordToUpdate == null)
                return NotFound("No active clock-in found for today.");

            recordToUpdate.ClockOutTime = DateTime.UtcNow;

            await _attendanceTable.UpdateEntityAsync(recordToUpdate, recordToUpdate.ETag, TableUpdateMode.Replace);

            return Ok("Clock-out recorded.");
        }

        [HttpGet("progress/{studentNumber}")]
        public async Task<IActionResult> GetWeeklyProgress(string studentNumber)
        {
            var now = DateTime.UtcNow;

            // Start of the current week (Monday) and end of week
            var startOfWeek = now.Date.AddDays(-(int)now.DayOfWeek + (int)DayOfWeek.Monday);
            var endOfWeek = startOfWeek.AddDays(5);

            // Step 1: Get all lessons scheduled for this student this week
            var studentModules = new List<StudentModules>();
            var filterModules = TableClient.CreateQueryFilter<StudentModules>(m => m.studentNumber == studentNumber);
            await foreach (var module in _studentModuleTable.QueryAsync<StudentModules>(filterModules))
            {
                studentModules.Add(module);
            }

            var moduleCodes = studentModules.Select(m => m.moduleCode).ToHashSet();

            var scheduledLessons = new List<Lesson>();
            await foreach (var lesson in _lessonTable.QueryAsync<Lesson>(l =>
                l.date >= startOfWeek && l.date < endOfWeek))
            {
                if (moduleCodes.Contains(lesson.moduleCode))
                    scheduledLessons.Add(lesson);
            }

            // Step 2: Get all attendance records for this student this week
            var attendanceRecords = new List<AttendanceRecord>();
            await foreach (var record in _attendanceTable.QueryAsync<AttendanceRecord>(r =>
                r.PartitionKey == "Attendance" &&
                r.StudentNumber == studentNumber &&
                r.ClockInTime >= startOfWeek &&
                r.ClockInTime < endOfWeek))
            {
                attendanceRecords.Add(record);
            }

            // Step 3: Calculate weekly attendance progress
            int totalLessons = scheduledLessons.Count;
            // Step 3: Calculate weekly attendance progress with time check
            int attended = 0;

            foreach (var lesson in scheduledLessons)
            {
                // Check if there is any attendance record that overlaps this lesson's time
                bool attendedThisLesson = attendanceRecords.Any(record =>
                    record.ClockInTime.HasValue &&
                    record.ClockInTime.Value.Date == lesson.date.Date // same day
                );

                if (attendedThisLesson)
                    attended++;
            }

            double percentage = totalLessons > 0 ? (double)attended / totalLessons * 100 : 0;

            var progressReport = new
            {
                StudentNumber = studentNumber,
                WeekStart = startOfWeek,
                WeekEnd = endOfWeek,
                TotalLessons = totalLessons,
                Attended = attended,
                AttendancePercentage = Math.Round(percentage, 2)
            };

            return Ok(progressReport);
        }
    }
}
