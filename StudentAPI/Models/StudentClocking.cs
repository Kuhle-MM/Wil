using Azure;
using Azure.Data.Tables;

namespace StudentAPI.Models
{
    public class Students : ITableEntity
    {
        public string PartitionKey { get; set; } = "Student";
        public string RowKey { get; set; }       // Use student number or email
        public string StudentNumber { get; set; }
        public string StudentEmail { get; set; }

        public ETag ETag { get; set; }
        public DateTimeOffset? Timestamp { get; set; }
    }
}
