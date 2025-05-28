using Microsoft.AspNetCore.Mvc;
using Azure.Data.Tables;
using Microsoft.Extensions.Options;
using StudentAPI.Models;

namespace StudentAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class StudentClockingController : ControllerBase
    {
        private readonly TableClient _studentTable;

        public StudentClockingController(IOptions<AzureTableStorageSettings> storageOptions)
        {
            var connectionString = storageOptions.Value.ConnectionString;
            _studentTable = new TableClient(connectionString, "Students");
            _studentTable.CreateIfNotExists();
        }

        [HttpPost("clockin/{studentNumber}")]
        public async Task<IActionResult> ClockIn(string studentNumber)
        {
            Students student = null;
            await foreach (var s in _studentTable.QueryAsync<Students>(s => s.StudentNumber == studentNumber.ToUpper()))
            {
                student = s;
                break;
            }

            if (student == null)
                return NotFound("Student not found.");

            var today = DateTime.UtcNow.Date;

            // Prevent multiple clock-ins for the same day
            await foreach (var record in _studentTable.QueryAsync<AttendanceRecord>(r =>
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
                StudentNumber = student.StudentNumber,
                StudentEmail = student.StudentEmail,
                ClockInTime = DateTime.UtcNow,
                ClockOutTime = null,
                Status = "Present"
            };

            await _studentTable.AddEntityAsync(attendance);
            return Ok("Clock-in recorded.");
        }

        [HttpPost("clockout/{studentNumber}")]
        public async Task<IActionResult> ClockOut(string studentNumber)
        {
            var today = DateTime.UtcNow.Date;
            AttendanceRecord recordToUpdate = null;

            await foreach (var record in _studentTable.QueryAsync<AttendanceRecord>(r =>
                r.PartitionKey == "Attendance" &&
                r.StudentNumber == studentNumber &&
                r.ClockInTime >= today &&
                r.ClockOutTime == null))
            {
                recordToUpdate = record;
                break;
            }

            if (recordToUpdate == null)
                return NotFound("No active clock-in found for today.");

            recordToUpdate.ClockOutTime = DateTime.UtcNow;
            await _studentTable.UpdateEntityAsync(recordToUpdate, recordToUpdate.ETag, TableUpdateMode.Replace);

            return Ok("Clock-out recorded.");
        }

        [HttpGet("report/{studentNumber}")]
        public async Task<IActionResult> GetAttendanceReport(string studentNumber)
        {
            var report = new List<AttendanceRecord>();

            await foreach (var record in _studentTable.QueryAsync<AttendanceRecord>(r =>
                r.PartitionKey == "Attendance" &&
                r.StudentNumber == studentNumber))
            {
                report.Add(record);
            }

            if (!report.Any())
                return NotFound("No attendance records found for this student.");

            return Ok(report);
        }
    }
}
