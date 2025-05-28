namespace StudentAPI.Models
{
    public class AttendanceRecord
    {
        public int RecordId { get; set; }
        public int StudentId { get; set; }
        //public Student Student { get; set; }

        public DateTime LessonDate { get; set; } = DateTime.Today;
        public DateTime CheckInTime { get; set; }
        public DateTime? CheckOutTime { get; set; }
    }
}
