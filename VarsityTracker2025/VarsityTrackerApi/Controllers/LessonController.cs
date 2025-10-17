using Azure.Data.Tables;
using Azure.Storage.Blobs;
using Azure;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using System.Globalization;
using VarsityTrackerApi.Models.Access;
using VarsityTrackerApi.Models.Lesson;
using System.Reflection;
using VarsityTrackerApi.Models.Module;
using VarsityTrackerApi.Models.Report;

namespace VarsityTrackerApi.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class LessonController : ControllerBase
    {
        private readonly TableClient _lecturerTable;
        private readonly string _connectionString;
        private readonly TableClient _studentTable;
        private readonly TableClient _lessonTable;
        private readonly TableClient _moduleTable;
        private readonly TableClient _waitingList;
        private readonly TableClient _reportsTable;
        private readonly TableClient _studentModuleTable;
        private readonly TableClient _lessonListTable;
        private readonly BlobServiceClient _blobServiceClient;
        private readonly string _containerName = "qrcodes";

        public LessonController(IOptions<AzureTableStorageSettings> storageOptions)
        {
            _connectionString = storageOptions.Value.ConnectionString;
            _lecturerTable = new TableClient(_connectionString, "Lecturers");
            _studentTable = new TableClient(_connectionString, "Students");
            _lessonTable = new TableClient(_connectionString, "Lessons");
            _moduleTable = new TableClient(_connectionString, "Modules");
            _blobServiceClient = new BlobServiceClient(_connectionString);
            _waitingList = new TableClient(_connectionString, "WaitingList");
            _reportsTable = new TableClient(_connectionString, "Reports");
            _studentModuleTable = new TableClient(_connectionString, "StudentModules");
            _lessonListTable = new TableClient(_connectionString, "LessonList");
        }

        [HttpPost("create_lesson")]
        public async Task<IActionResult> Create_Lesson(LessonModel lesson)
        {
            try
            {
                // Validate that the date is not empty
                if (lesson.date == default)
                {
                    return BadRequest("Lesson date is required and cannot be empty.");
                }

                lesson.date = DateTime.SpecifyKind(lesson.date, DateTimeKind.Utc);

                // Check if the date falls on a weekend (Saturday and Sunday)
                if (lesson.date.DayOfWeek == DayOfWeek.Saturday || lesson.date.DayOfWeek == DayOfWeek.Sunday)
                {
                    return BadRequest("Lesson date cannot be scheduled on a weekend (Saturday or Sunday).");
                }

                // Check if the lesson date is being made in the past
                if (lesson.date.Date < DateTime.UtcNow.Date)
                {
                    return BadRequest("Lesson date cannot be made in the past. Please select today or a future date.");
                }

                // Check if a module with the same code already exists
                await foreach (var existingLesson in _lessonTable.QueryAsync<Lesson>())
                {
                    if (existingLesson.date == lesson.date && existingLesson.moduleCode == lesson.moduleCode)
                    {
                        return BadRequest($"Lesson with ID: {existingLesson.lessonID} already exists in the system for the {lesson.date}.");
                    }
                }

                var lessons = new List<Lesson>();
                await foreach(var existing in _lessonTable.QueryAsync<Lesson>())
                {
                    if (lesson.date == default)
                    {
                        return BadRequest("Lesson date is required and cannot be empty.");
                    }

                    // Ensure the date is explicitly marked as UTC
                    lesson.date = DateTime.SpecifyKind(lesson.date, DateTimeKind.Utc);

                    if (existing.moduleCode == lesson.moduleCode)
                    {
                        lessons.Add(existing);
                    }
                }

                var specifiedDate = DateTime.SpecifyKind(lesson.date, DateTimeKind.Utc);
                var newLesson = new Lesson
                {
                    PartitionKey = "Lessons",
                    RowKey = Guid.NewGuid().ToString(),
                    lessonID = lesson.moduleCode + "-LES-" + lessons.Count,
                    lecturerID = lesson.lecturerID,
                    moduleCode = lesson.moduleCode,
                    courseCode = lesson.courseCode,
                    date = specifiedDate,
                    started = false,
                    finished = false
                };

                await _lessonTable.AddEntityAsync(newLesson);
                return Ok($"Lesson with code: {newLesson.lessonID} created successfully.");
            }
            catch (RequestFailedException ex)
            {
                return StatusCode(500, $"Error saving lesson: {ex.Message}");
            }
        }

        [HttpPost("clockin/{studentNumber}")]
        public async Task<IActionResult> StudentList(string studentNumber)
        {
            // Find the student
            Students student = null;
            await foreach (var s in _studentTable.QueryAsync<Students>(s => s.studentNumber == studentNumber.ToUpper()))
            {
                student = s;
                break;
            }

            if (student == null)
                return NotFound("Student not found.");

            var now = DateTime.UtcNow;
            var today = now.Date;

            // Add to waiting list
            var studentList = new StudentList
            {
                PartitionKey = "StudentList",
                RowKey = Guid.NewGuid().ToString(),
                StudentID = student.studentNumber,
                ClockInTime = now,
                ClockOutTime = null
            };

            await _waitingList.AddEntityAsync(studentList);

            // Find an active lesson that started today
            Lesson lesson = null;
            var todayStart = DateTime.UtcNow.Date;
            var todayEnd = todayStart.AddDays(1);

            await foreach (var s in _lessonTable.QueryAsync<Lesson>(s =>
                s.started == true && s.date >= todayStart && s.date < todayEnd))
            {
                lesson = s;
                break;
            }

            // Check if the student is already in the LessonList
            LessonList existingEntry = null;
            await foreach (var entry in _lessonListTable.QueryAsync<LessonList>(l =>
                l.LessonID == lesson.lessonID && l.StudentID == student.studentNumber))
            {
                existingEntry = entry;
                break;
            }

            if (existingEntry == null)
            {
                // Add new LessonList record if none exists
                var addStudent = new LessonList
                {
                    PartitionKey = "LessonList",
                    RowKey = Guid.NewGuid().ToString(),
                    LessonID = lesson.lessonID,
                    StudentID = student.studentNumber,
                    LessonDate = lesson.date,
                    ClockInTime = now,
                    ClockOutTime = null
                };

                await _lessonListTable.AddEntityAsync(addStudent);
            }
            else
            {
                // Update existing LessonList record's clock-in time
                existingEntry.ClockInTime = now;
                existingEntry.ClockOutTime = null;  // Optional: reset clock-out time if you want

                await _lessonListTable.UpdateEntityAsync(existingEntry, existingEntry.ETag, TableUpdateMode.Replace);
            }

            return Ok($"Student with ID: {studentList.StudentID} clocked in successfully.");
        }

        [HttpPost("clockoutStudent/{studentNumber}")]
        public async Task<IActionResult> StudentListClockout(string studentNumber)
        {
            var today = DateTime.UtcNow.Date;

            StudentList recordToUpdate = null;

            await foreach (var record in _waitingList.QueryAsync<StudentList>(r =>
                r.PartitionKey == "StudentList" &&
                r.StudentID == studentNumber &&
                r.ClockInTime >= today))
            {
                recordToUpdate = record;
                break;
            }

            if (recordToUpdate.ClockInTime == null || recordToUpdate == null)
                return NotFound("No active clock-in found for today.");

            recordToUpdate.ClockOutTime = DateTime.UtcNow;

            await _waitingList.UpdateEntityAsync(recordToUpdate, recordToUpdate.ETag, TableUpdateMode.Replace);

            return Ok(new { success = true, message = "Student clocked out." });
        }

        [HttpPost("startLesson/{lessonID}")]
        public async Task<IActionResult> StartLesson(string lessonID)
        {
            // Retrieve the lesson
            Lesson lesson = null;
            await foreach (var s in _lessonTable.QueryAsync<Lesson>(s => s.lessonID == lessonID))
            {
                lesson = s;
                break;
            }

            if (lesson == null)
                return NotFound("Lesson not found.");

            var today = DateTime.UtcNow.Date;

            // Build a dictionary of students who have clocked in today
            var waitingDict = new Dictionary<string, StudentList>();
            await foreach (var wl in _waitingList.QueryAsync<StudentList>())
            {
                if (wl.ClockInTime.HasValue && wl.ClockInTime.Value.Date == today)
                {
                    waitingDict[wl.StudentID] = wl;
                }
            }

            // Get all student IDs enrolled in the lesson's module
            var eligibleStudentIDs = new HashSet<string>();
            await foreach (var f in _studentModuleTable.QueryAsync<StudentModules>(m => m.moduleCode == lesson.moduleCode))
            {
                eligibleStudentIDs.Add(f.studentNumber);
            }

            // Track already added students to prevent duplicates
            var addedStudents = new HashSet<string>();

            foreach (var studentID in eligibleStudentIDs)
            {
                if (addedStudents.Contains(studentID))
                    continue;

                // Check if student clocked in
                var isClockedIn = waitingDict.TryGetValue(studentID, out var clockedInStudent);

                var lessonListEntry = new LessonList
                {
                    PartitionKey = "LessonList",
                    RowKey = Guid.NewGuid().ToString(),
                    LessonID = lesson.lessonID,
                    StudentID = studentID,
                    LessonDate = lesson.date,
                    ClockInTime = isClockedIn ? clockedInStudent.ClockInTime : null,
                    ClockOutTime = isClockedIn ? clockedInStudent.ClockOutTime : null
                };

                await _lessonListTable.AddEntityAsync(lessonListEntry);
                addedStudents.Add(studentID);
            }

            // Update lesson as started
            Lesson recordToUpdate = null;
            await foreach (var record in _lessonTable.QueryAsync<Lesson>(r =>
                r.PartitionKey == "Lessons" && r.lessonID == lessonID))
            {
                recordToUpdate = record;
                break;
            }

            if (recordToUpdate == null)
                return NotFound("No active lesson for today.");

            recordToUpdate.started = true;
            recordToUpdate.startedTime = DateTime.UtcNow;

            await _lessonTable.UpdateEntityAsync(recordToUpdate, recordToUpdate.ETag, TableUpdateMode.Replace);

            return Ok(new { success = true, message = "Lesson has started and students have been registered." });
        }

        [HttpPost("endLesson/{lessonID}")]
        public async Task<IActionResult> EndLesson(string lessonID)
        {
            // Find the lesson
            Lesson lesson = null;
            await foreach (var s in _lessonTable.QueryAsync<Lesson>(s => s.lessonID == lessonID))
            {
                lesson = s;
                break;
            }

            if (lesson == null)
                return NotFound("Lesson not found.");

            // Process only students in this lesson
            var lessonStudents = new List<LessonList>();
            await foreach (var existing in _lessonListTable.QueryAsync<LessonList>(l => l.LessonID == lessonID))
            {
                lessonStudents.Add(existing);
            }

            foreach (var student in lessonStudents)
            {
                // If student has not clocked out, set ClockOutTime to now
                if (student.ClockInTime != null && student.ClockOutTime == null)
                {
                    student.ClockOutTime = DateTime.UtcNow;
                    await _lessonListTable.UpdateEntityAsync(student, student.ETag, TableUpdateMode.Replace);
                }

                // Determine status based on presence
                string status = student.ClockInTime != null ? "Present" : "Absent";

                var report = new Reports
                {
                    PartitionKey = "LessonList",
                    RowKey = Guid.NewGuid().ToString(),
                    reportID = $"{lesson.lessonID}-Report",
                    lessonID = lesson.lessonID,
                    studentNumber = student.StudentID,
                    status = status,
                    moduleCode = lesson.moduleCode
                };

                // Avoid duplicate reports 
                await _reportsTable.AddEntityAsync(report);

                // Remove from LessonList
                await _lessonListTable.DeleteEntityAsync(student.PartitionKey, student.RowKey);
            }

            // Mark lesson as finished
            Lesson recordToUpdate = null;
            await foreach (var record in _lessonTable.QueryAsync<Lesson>(r =>
                r.PartitionKey == "Lessons" &&
                r.lessonID == lessonID))
            {
                recordToUpdate = record;
                break;
            }

            if (recordToUpdate == null)
                return NotFound("Lesson record could not be found for update.");

            recordToUpdate.finished = true;

            await _lessonTable.UpdateEntityAsync(recordToUpdate, recordToUpdate.ETag, TableUpdateMode.Replace);

            return Ok(new { success = true, message = "Lesson has ended and student statuses recorded." });
        }

        [HttpGet("all_lecturer_lessons")]
        public async Task<IActionResult> GetLessonsByLecturer(string lecturerID)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(lecturerID))
                {
                    return BadRequest("Lecturer ID is required.");
                }

                var lessonsList = new List<Lesson>();

                var filter = TableClient.CreateQueryFilter<Lesson>(m => m.lecturerID == lecturerID);

                await foreach (var module in _lessonTable.QueryAsync<Lesson>(filter))
                {
                    lessonsList.Add(module);
                }

                return Ok(lessonsList);
            }
            catch (RequestFailedException ex)
            {
                return StatusCode(500, $"Error retrieving Lesson: {ex.Message}");
            }
        }

        [HttpGet("display_report")]
        public async Task<IActionResult> GetReportByID(string ReportID)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(ReportID))
                {
                    return BadRequest("Report ID is required.");
                }

                var reportList = new List<Reports>();

                var filter = TableClient.CreateQueryFilter<Reports>(m => m.reportID == ReportID);

                await foreach (var report in _reportsTable.QueryAsync<Reports>(filter))
                {
                    reportList.Add(report);
                }

                return Ok(reportList);
            }
            catch (RequestFailedException ex)
            {
                return StatusCode(500, $"Error retrieving Report: {ex.Message}");
            }
        }

        [HttpGet("all_reports")]
        public async Task<IActionResult> GetAllReports()
        {
            try
            {
                var reportsList = new List<Reports>();

                await foreach (var reports in _reportsTable.QueryAsync<Reports>())
                {
                    reportsList.Add(reports);
                }

                return Ok(reportsList);
            }
            catch (RequestFailedException ex)
            {
                return StatusCode(500, $"Error retrieving modules: {ex.Message}");
            }
        }

        [HttpGet("student_timetable/{studentNumber}")]
        public async Task<IActionResult> GetStudentTimetable(string studentNumber)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(studentNumber))
                    return BadRequest("Student number is required.");

                // Step 1: Get all modules for this student
                var studentModules = new List<StudentModules>();
                var filterModules = TableClient.CreateQueryFilter<StudentModules>(m => m.studentNumber == studentNumber);
                await foreach (var module in _studentModuleTable.QueryAsync<StudentModules>(filterModules))
                {
                    studentModules.Add(module);
                }

                if (studentModules.Count == 0)
                    return NotFound("No modules found for this student.");

                var moduleCodes = studentModules.Select(m => m.moduleCode).ToHashSet();

                // Step 2: Collect lessons for these modules
                var lessons = new List<Lesson>();
                await foreach (var lesson in _lessonTable.QueryAsync<Lesson>())
                {
                    if (moduleCodes.Contains(lesson.moduleCode))
                    {
                        lessons.Add(lesson);
                    }
                }

                if (lessons.Count == 0)
                    return NotFound("No lessons found for this student’s modules.");

                // Step 3: Order lessons by Date (and time if applicable)
                var timetable = lessons
                    .OrderBy(l => l.date) // ensures chronological order
                    .ToList();

                return Ok(timetable);
            }
            catch (RequestFailedException ex)
            {
                return StatusCode(500, $"Error retrieving timetable: {ex.Message}");
            }
        }

        [HttpGet("lecturer_timetable/{lecturerID}")]
        public async Task<IActionResult> GetLecturerTimetable(string lecturerID)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(lecturerID))
                    return BadRequest("Lecturer ID is required.");

                // Step 1: Get all lessons for this lecturer
                var lecturerLessons = new List<Lesson>();
                var filter = TableClient.CreateQueryFilter<Lesson>(l => l.lecturerID == lecturerID);

                await foreach (var lesson in _lessonTable.QueryAsync<Lesson>(filter))
                {
                    lecturerLessons.Add(lesson);
                }

                if (!lecturerLessons.Any())
                    return NotFound("No lessons found for this lecturer.");

                // Step 2: Order lessons by date/time
                var timetable = lecturerLessons
                    .OrderBy(l => l.date)
                    .ToList();

                return Ok(timetable);
            }
            catch (RequestFailedException ex)
            {
                return StatusCode(500, $"Error retrieving lecturer timetable: {ex.Message}");
            }
        }

        [HttpPut("update_report_status")]
        public async Task<IActionResult> UpdateReportStatus(string reportID, string studentNumber, string newStatus)
        {
            if (string.IsNullOrWhiteSpace(reportID) || string.IsNullOrWhiteSpace(studentNumber) || string.IsNullOrWhiteSpace(newStatus))
                return BadRequest("Report ID, student number, and new status are required.");

            try
            {
                // Find the specific report for this student
                Reports reportToUpdate = null;
                await foreach (var report in _reportsTable.QueryAsync<Reports>(r => r.reportID == reportID && r.studentNumber == studentNumber))
                {
                    reportToUpdate = report;
                    break;
                }

                if (reportToUpdate == null)
                    return NotFound($"Report for student {studentNumber} with ID {reportID} not found.");

                // Update the status
                reportToUpdate.status = newStatus;

                // Update in Azure Table Storage
                await _reportsTable.UpdateEntityAsync(reportToUpdate, reportToUpdate.ETag, TableUpdateMode.Replace);

                return Ok(new { success = true, message = $"Report status for student {studentNumber} updated to '{newStatus}'." });
            }
            catch (RequestFailedException ex)
            {
                return StatusCode(500, $"Error updating report: {ex.Message}");
            }
        }
    }
}
