using Azure;
using Azure.Data.Tables;
using System.ComponentModel.DataAnnotations;

namespace VarsityTrackerApi.Models
{
    public class Students : ITableEntity
    {
        [Key]
        public string studentNumber { get; set; }
        public string? studentEmail { get; set; }
        public string? phoneNumber { get; set; }
        public string? firstName { get; set; }
        public string? lastName { get; set; }
        public string? password { get; set; }
        public string? role { get; set; }

        //ITableEntity implementation
        public string? PartitionKey { get; set; }
        public string? RowKey { get; set; }
        public ETag ETag { get; set; }
        public DateTimeOffset? Timestamp { get; set; }
    }
}
