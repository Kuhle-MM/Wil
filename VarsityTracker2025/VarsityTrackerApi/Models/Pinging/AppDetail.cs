using Azure.Data.Tables;
using Azure;

namespace VarsityTrackerApi.Models.Pinging
{
    public class AppDetail : ITableEntity
    {
        public string PartitionKey { get; set; } = "AppDetails";
        public string RowKey { get; set; } = Guid.NewGuid().ToString();
        public string StudentNumber { get; set; }
        public int LessonNumber { get; set; }
        public string HashNumber { get; set; }
        public DateTimeOffset? Timestamp { get; set; }
        public int PingNumber { get; set; }
        public int EspNumber { get; set; }

        public DateTimeOffset? TimestampProperty { get; set; }
        public ETag ETag { get; set; }
    }
}
