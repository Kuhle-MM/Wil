using Azure.Data.Tables;
using Azure;

namespace VarsityTrackerApi.Models.Pinging
{
    public class Pinging : ITableEntity
    {
        public string PartitionKey { get; set; } = "Pings";
        public string RowKey { get; set; } = Guid.NewGuid().ToString();

        public string StudentID { get; set; }
        public string LessonID { get; set; }
        public int TotalPings { get; set; }
        public int EspNumber { get; set; }

        public DateTimeOffset? Timestamp { get; set; }
        public ETag ETag { get; set; }
    }
}
