namespace AttendanceTrackerAPI.Models
{
    public class AttendanceRecord
    {
        public int recordId;
        public int StudentId;

        public Student Student;

        public DateTime LessonDate;
        public DateTime CheckInTime;
        public DateTime? CheckOutTime;

    }
}
    