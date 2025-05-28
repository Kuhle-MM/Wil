using Azure;
using Azure.Data.Tables;
using System;

namespace StudentAPI.Models
{
    public class AttendanceRecord
    {
        public string PartitionKey { get; set; } // e.g., "AttendanceReport"
        public string RowKey { get; set; } // e.g., StudentNumber_Date
        public string StudentNumber { get; set; }
        public string StudentEmail { get; set; }
        public DateTime ClockInTime { get; set; }
        public DateTime ClockOutTime { get; set; }
        public TimeSpan TotalDuration => ClockOutTime - ClockInTime;

        public ETag ETag { get; set; }
        public DateTimeOffset? Timestamp { get; set; }
    }
}
