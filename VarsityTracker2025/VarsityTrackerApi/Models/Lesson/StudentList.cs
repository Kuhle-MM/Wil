using Azure;
using Azure.Data.Tables;

namespace VarsityTrackerApi.Models.Lesson
{
    public class StudentList : ITableEntity
    {
        public string? StudentID { get; set; }
        public DateTime? ClockInTime { get; set; }
        public DateTime? ClockOutTime { get; set; }
        //ITableEntity implementation
        public string? PartitionKey { get; set; }
        public string? RowKey { get; set; }
        public ETag ETag { get; set; }
        public DateTimeOffset? Timestamp { get; set; }
    }

     public class QRScanRequest
 {
     public string? QRText { get; set; }
     public string? StudentID { get; set; }
 }
}
