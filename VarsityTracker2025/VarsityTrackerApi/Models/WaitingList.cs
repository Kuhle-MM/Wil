using Azure;
using Azure.Data.Tables;
using System.ComponentModel.DataAnnotations;

namespace VarsityTrackerApi.Models
{
    public class WaitingList: ITableEntity
    {
        [Key]
        public string LessonID { get; set; }
        public string? StudentID { get; set; }
        public string? ModuleCode { get; set; }
        public DateTime LessonDate { get; set; }
        public DateTime? ClockInTime { get; set; }
        public DateTime? ClockOutTime { get; set; }
        //ITableEntity implementation
        public string? PartitionKey
        { get; set; }
        public string? RowKey { get; set; }
        public ETag ETag { get; set; }
        public DateTimeOffset? Timestamp { get; set; }
    }
}
