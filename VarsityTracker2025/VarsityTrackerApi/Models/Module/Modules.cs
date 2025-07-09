using Azure;
using Azure.Data.Tables;
using System.ComponentModel.DataAnnotations;

namespace VarsityTrackerApi.Models.Module
{
    public class Modules: ITableEntity
    {
        [Key]
        public string code { get; set; }
        public string moduleName { get; set; }
        public int NQF { get; set; }
        public int credits { get; set; }
        public string courseCode { get; set; }
        public int year { get; set; }
        //ITableEntity implementation
        public string? PartitionKey
        { get; set; }
        public string? RowKey { get; set; }
        public ETag ETag { get; set; }
        public DateTimeOffset? Timestamp { get; set; }
    }
}
