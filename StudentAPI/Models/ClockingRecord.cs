namespace StudentAPI.Models
{
    public class ClockingRecord
    {
        public int Id { get; set; }
        public string StudentId { get; set; }
        public DateTime Timestamp { get; set; }
        public string ActionType { get; set; } 
    }
}
