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

            if (recordToUpdate == null)
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
        public async Task<IActionResult> endLesson(string lessonID)
        {
            Lesson lesson = null;
            await foreach (var s in _lessonTable.QueryAsync<Lesson>(s => s.lessonID == lessonID))
            {
                lesson = s;
                break;
            }

            TableClient _reports;

            await foreach (var existing in _lessonListTable.QueryAsync<LessonList>())
            {
                if (lesson.lessonID == existing.LessonID)
                {
                    await _lessonListTable.DeleteEntityAsync(existing);
                }
            }

            Lesson recordToUpdate = null;

            await foreach (var record in _lessonTable.QueryAsync<Lesson>(r =>
                r.PartitionKey == "Lessons" &&
                r.lessonID == lessonID))
            {
                recordToUpdate = record;
                break;
            }

            if (recordToUpdate == null)
                return NotFound("No active lesson for today.");

            recordToUpdate.finished = true;

            await _lessonTable.UpdateEntityAsync(recordToUpdate, recordToUpdate.ETag, TableUpdateMode.Replace);

            return Ok(new { success = true, message = "Lesson has ended" });
        }
    }
}
