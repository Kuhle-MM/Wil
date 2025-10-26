using Azure;
using Azure.Data.Tables;

namespace VarsityTrackerApi.Models
{
    public class Attendance : ITableEntity
    {
        public string PartitionKey { get; set; }
        public string RowKey { get; set; }
        public string lessonID { get; set; }
        public string studentID { get; set; }
        public DateTime timestamp { get; set; }
        public ETag ETag { get; set; }
        public DateTimeOffset? Timestamp { get; set; }
    }
}
