namespace AttendanceTrackerAPI.Models
{
    public class Student
    {
        public int StudentId { get; set; }
        public string StudentCardId { get; set; }

        public string Name { get; set; }
        public string Surname { get; set; }
        public string Module { get; set; }
        public DateOnly RegistrationDate { get; set; }
        public string Qualification { get; set; }
        public string Email { get; set; }

    }

}
