using Azure;
using Azure.Data.Tables;
using System.ComponentModel.DataAnnotations;

namespace VarsityTrackerApi.Models
{
    public class Lesson: ITableEntity
    {
        [Key]
        public string lessonID { get; set; }
        public DateTime date { get; set; }
        public string courseCode { get; set; }
        public string moduleCode { get; set; }
        public string lecturerID { get; set; }
        public bool started = false;
        public bool finished = false;
        //ITableEntity implementation
        public string? PartitionKey
        { get; set; }
        public string? RowKey { get; set; }
        public ETag ETag { get; set; }
        public DateTimeOffset? Timestamp { get; set; }
    }
}
