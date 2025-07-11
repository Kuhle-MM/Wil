using Azure;
using Azure.Data.Tables;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using VarsityTrackerApi.Models.Lesson;
using VarsityTrackerApi.Models.Pinging;

[ApiController]
[Route("api/[controller]")]
public class PingingController : ControllerBase
{
    private readonly TableClient _lessonListTable;
    private readonly TableClient _pingingTable;

    // Temporarily store AppDetail from Method 1
    private static AppDetail _tempAppDetail;

    public PingingController(Microsoft.Extensions.Configuration.IConfiguration config)
    {
        string connectionString = config.GetConnectionString("AzureStorage");
        _lessonListTable = new TableClient(connectionString, "LessonList");
        _pingingTable = new TableClient(connectionString, "PingingTable");

        _lessonListTable.CreateIfNotExists();
        _pingingTable.CreateIfNotExists();
    }

    // Method 1: Store AppDetails temporarily
    [HttpPost("GetAppDetails")]
    public IActionResult GetAppDetails([FromBody] AppDetail input)
    {
        _tempAppDetail = input;
        return Ok("App details stored temporarily.");
    }

    // Method 2: GetStudentNumbers for lessons matching timestamp ±1 minute
    [HttpGet("GetStudentNumbers")]
    public async Task<ActionResult<List<string>>> GetStudentNumbers()
    {
        if (_tempAppDetail == null || !_tempAppDetail.Timestamp.HasValue)
            return BadRequest("Call GetAppDetails first and ensure Timestamp is set.");

        DateTime targetTimestamp = _tempAppDetail.Timestamp.Value.UtcDateTime;
        DateTime start = targetTimestamp.AddMinutes(-1);
        DateTime end = targetTimestamp.AddMinutes(1);

        var studentIds = new HashSet<string>();

        await foreach (var entity in _lessonListTable.QueryAsync<LessonList>(
            e => e.LessonDate >= start && e.LessonDate <= end))
        {
            if (!string.IsNullOrEmpty(entity.RowKey)) // RowKey = StudentID
                studentIds.Add(entity.RowKey);
        }

        if (!studentIds.Any())
            return NotFound("No lessons matched timestamp.");

        return Ok(studentIds.ToList());
    }

    // Method 3: VerifyStudents and add ping entry
    [HttpPost("VerifyStudents")]
    public async Task<IActionResult> VerifyStudents()
    {
        if (_tempAppDetail == null || !_tempAppDetail.Timestamp.HasValue)
            return BadRequest("Call GetAppDetails first and ensure Timestamp is set.");

        DateTime targetTimestamp = _tempAppDetail.Timestamp.Value.UtcDateTime;
        DateTime start = targetTimestamp.AddMinutes(-1);
        DateTime end = targetTimestamp.AddMinutes(1);

        var matchingLessons = new List<LessonList>();

        await foreach (var entity in _lessonListTable.QueryAsync<LessonList>(
            e => e.LessonDate >= start && e.LessonDate <= end))
        {
            matchingLessons.Add(entity);
        }

        var lessonId = matchingLessons.Select(l => l.PartitionKey).FirstOrDefault();
        var studentList = matchingLessons.Select(l => l.RowKey).Where(s => s != null).ToList();

        int totalPings = studentList.Contains(_tempAppDetail.StudentID)
            ? _tempAppDetail.PingNumber
            : 0;

        var ping = new Pinging
        {
            PartitionKey = "Pings",
            RowKey = Guid.NewGuid().ToString(),
            StudentID = _tempAppDetail.StudentID,
            LessonID = lessonId ?? string.Empty,
            TotalPings = totalPings,
            EspNumber = _tempAppDetail.EspNumber
        };

        await _pingingTable.AddEntityAsync(ping);

        return Ok("Ping verification saved.");
    }
}
