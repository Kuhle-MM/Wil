using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using StudentAPI.Data;
using StudentAPI.Models;
using System;

namespace StudentAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ClockingController : ControllerBase
    {
        private readonly AppDbContext _context;

        public ClockingController(AppDbContext context)
        {
            _context = context;
        }

        [HttpPost("tap")]
        public async Task<IActionResult> Tap([FromBody] ClockingRecord record)
        {
            record.Timestamp = DateTime.UtcNow;
            _context.ClockingRecords.Add(record);
            await _context.SaveChangesAsync();
            return Ok(new { message = "Clocking recorded successfully." });
        }

        [HttpGet("history/{studentId}")]
        public async Task<IActionResult> GetHistory(string studentId)
        {
            var history = await _context.ClockingRecords
                .Where(r => r.StudentId == studentId)
                .OrderByDescending(r => r.Timestamp)
                .ToListAsync();
            return Ok(history);
        }
    }
}
