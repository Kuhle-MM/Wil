using Azure;
using Azure.Data.Tables;
using System.ComponentModel.DataAnnotations;

namespace VarsityTrackerApi.Models.Lesson
{
    public class Lesson: ITableEntity
    {
        [Key]
        public string lessonID { get; set; }
        public DateTime date { get; set; }
        public string courseCode { get; set; }
        public string moduleCode { get; set; }
        public string lecturerID { get; set; }
        public bool started { get; set; } = false;
        public DateTime? startedTime { get; set; }
        public bool finished { get; set; } = false;
        public string? qrUrl { get; set; }
        public string? classroom { get; set; } 
        //ITableEntity implementation
        public string? PartitionKey
        { get; set; }
        public string? RowKey { get; set; }
        public ETag ETag { get; set; }
        public DateTimeOffset? Timestamp { get; set; }
    }
}
