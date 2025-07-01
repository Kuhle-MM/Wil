using Microsoft.AspNetCore.Mvc;
using Azure.Data.Tables;
using Microsoft.Extensions.Options;
using VarsityTrackerApi.Models.Access;
using VarsityTrackerApi.Models.Report.AttendanceRecord;

namespace VarsityTrackerApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class StudentClockingController : ControllerBase
    {
        private readonly TableClient _studentTable;
        private readonly TableClient _attendanceTable;
        private readonly TableClient _lecturerTable;

        public StudentClockingController(IOptions<AzureTableStorageSettings> storageOptions)
        {
            var connectionString = storageOptions.Value.ConnectionString;

            // Student data stored in "Students" table
            _studentTable = new TableClient(connectionString, "Students");
            _studentTable.CreateIfNotExists();

            // Attendance records stored in separate "Attendances" table
            _lecturerTable = new TableClient(connectionString, "Lecturers");
            _lecturerTable.CreateIfNotExists();

            // Attendance records stored in separate "Attendances" table
            _attendanceTable = new TableClient(connectionString, "Attendances");
            _attendanceTable.CreateIfNotExists();
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
    }
}
