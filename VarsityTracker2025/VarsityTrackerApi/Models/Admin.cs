using Azure;
using System.ComponentModel.DataAnnotations;

namespace VarsityTrackerApi.Models
{
    public class Admin
    {
        [Key]
        public string adminID { get; set; }
        public string? adminEmail { get; set; }
        public string? phoneNumber { get; set; }
        public string? firstName { get; set; }
        public string? lastName { get; set; }
        public string? password { get; set; }

        //ITableEntity implementation
        public string? PartitionKey { get; set; }
        public string? RowKey { get; set; }
        public ETag ETag { get; set; }
        public DateTimeOffset? Timestamp { get; set; }
    }
}
