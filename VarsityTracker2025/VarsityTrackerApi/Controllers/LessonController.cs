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
        private readonly TableClient _lecturerModuleTable;
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
            _lecturerModuleTable = new TableClient(_connectionString, "LecturerModules");
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
                    if(existing.moduleCode == lesson.moduleCode)
                    {
                        lessons.Add(existing);
                    }
                    
                }

                var newLesson = new Lesson
                {
                    PartitionKey = "Lessons",
                    RowKey = Guid.NewGuid().ToString(),
                    lessonID = lesson.moduleCode + "-LES-" + lessons.Count,
                    lecturerID = lesson.lecturerID,
                    moduleCode = lesson.moduleCode,
                    courseCode = lesson.courseCode,
                    date = lesson.date,
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
            Students student = null;
            await foreach (var s in _studentTable.QueryAsync<Students>(s => s.studentNumber == studentNumber.ToUpper()))
            {
                student = s;
                break;
            }

            if (student == null)
                return NotFound("Student not found.");

            var today = DateTime.UtcNow.Date;
            var studentList = new StudentList
            {
                PartitionKey = "StudentList",
                RowKey = Guid.NewGuid().ToString(),
                StudentID = student.studentNumber,
                ClockInTime = DateTime.UtcNow,
                ClockOutTime = null
            };

            await _waitingList.AddEntityAsync(studentList);
            return Ok($"Student with ID: {studentList.StudentID} added successfully to waiting list.");
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
            Lesson lesson = null;
            await foreach (var s in _lessonTable.QueryAsync<Lesson>(s => s.lessonID == lessonID))
            {
                lesson = s;
                break;
            }
            if (lesson == null)
                return NotFound("Lesson not found.");
            await foreach (var existing in _waitingList.QueryAsync<StudentList>())
            {
                await foreach (var f in _studentModuleTable.QueryAsync<StudentModules>())
                {
                    if(f.studentNumber == existing.StudentID)
                    {
                        var addStudent = new LessonList
                        {
                            PartitionKey = "LessonList",
                            RowKey = Guid.NewGuid().ToString(),
                            LessonID = lesson.lessonID,
                            StudentID = existing.StudentID,
                            LessonDate = lesson.date,
                            ClockInTime = existing.ClockInTime,
                            ClockOutTime = existing.ClockOutTime
                        };

                        await _lessonListTable.AddEntityAsync(addStudent);
                    }
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

            recordToUpdate.started = true;

            await _lessonTable.UpdateEntityAsync(recordToUpdate, recordToUpdate.ETag, TableUpdateMode.Replace);

            return Ok(new { success = true, message = "Lesson has started" });
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

            await foreach (var existing in _lessonListTable.QueryAsync<LessonList>())
            {
                if(lesson.lessonID == existing.LessonID)
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
