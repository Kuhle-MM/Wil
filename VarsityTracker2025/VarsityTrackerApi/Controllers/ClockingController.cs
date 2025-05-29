using Microsoft.AspNetCore.Mvc;
using Azure.Data.Tables;
using Microsoft.Extensions.Options;
using VarsityTrackerApi.Models;

namespace VarsityTrackerApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class StudentClockingController : ControllerBase
    {
        private readonly TableClient _attendanceTable;
        private readonly TableClient _studentsTable;

        public StudentClockingController(IOptions<AzureTableStorageSettings> storageOptions)
        {
            var connectionString = storageOptions.Value.ConnectionString;
            _attendanceTable = new TableClient(connectionString, "Attendances");
            _studentsTable = new TableClient(connectionString, "Students");
            _attendanceTable.CreateIfNotExists();
        }

        [HttpPost("clockin/{studentNumber}")]
        public async Task<IActionResult> ClockIn(string studentNumber)
        {
            Students student = null;
            await foreach (var s in _studentsTable.QueryAsync<Students>(s => s.studentNumber == studentNumber.ToUpper()))
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
            var upperStudentNumber = studentNumber.ToUpper();
            AttendanceRecord recordToUpdate = null;

            // Step 1: Query by PartitionKey and StudentNumber only (safe for Azure Table Storage)
            await foreach (var record in _attendanceTable.QueryAsync<AttendanceRecord>(r =>
                r.PartitionKey == "Attendance" &&
                r.StudentNumber == upperStudentNumber))
            {
                // Step 2: In-memory filter for today's record without a clock-out
                if (record.ClockInTime >= today && record.ClockOutTime == null)
                {
                    recordToUpdate = record;
                    break;
                }
            }

            if (recordToUpdate == null)
                return NotFound("No active clock-in found for today.");

            // Step 3: Set clock-out time
            recordToUpdate.ClockOutTime = DateTime.UtcNow;

            // Step 4: Save update
            await _attendanceTable.UpdateEntityAsync(recordToUpdate, recordToUpdate.ETag, TableUpdateMode.Replace);

            return Ok("Clock-out recorded.");
        }


        [HttpGet("report/{studentNumber}")]
        public async Task<IActionResult> GetAttendanceReport(string studentNumber)
        {
            var report = new List<AttendanceRecord>();

            await foreach (var record in _attendanceTable.QueryAsync<AttendanceRecord>(r =>
                r.PartitionKey == "Attendance" &&
                r.StudentNumber == studentNumber.ToUpper()))
            {
                report.Add(record);
            }

            if (!report.Any())
                return NotFound("No attendance records found for this student.");

            return Ok(report);
        }
    }
}
