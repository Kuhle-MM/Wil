using Azure;
using Azure.Data.Tables;
using System.ComponentModel.DataAnnotations;

namespace VarsityTrackerApi.Models.Module
{
    public class StudentModules : ITableEntity
    {
        [Key]
        public string studentNumber { get; set; }
        public string moduleCode { get; set; }
        //ITableEntity implementation
        public string? PartitionKey
        { get; set; }
        public string? RowKey { get; set; }
        public ETag ETag { get; set; }
        public DateTimeOffset? Timestamp { get; set; }
    }
}
