using Azure;
using Azure.Data.Tables;
using System.ComponentModel.DataAnnotations;

namespace VarsityTrackerApi.Models.Report
{
    public class Reports: ITableEntity
    {
        [Key]
        public string reportID { get; set; }
        public string lessonID { get; set; }
        public string moduleCode { get; set; }
        public string studentNumber { get; set; }
        public string status { get; set; } = "Absent";

        //ITableEntity implementation
        public string? PartitionKey
        { get; set; }
        public string? RowKey { get; set; }
        public ETag ETag { get; set; }
        public DateTimeOffset? Timestamp { get; set; }
    }
}
