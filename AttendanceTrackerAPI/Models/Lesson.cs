using System.ComponentModel.DataAnnotations;

namespace AttendanceTrackerAPI.Models
{
    public class Lesson
    {

        public int LessonId { get; set; }
        [Required]
        public string LecturerId { get; set; }
        [Required]
        public string ModuleCode { get; set; }
        [Required]
        public DateTime StartTime { get; set; }
        public DateTime? EndTime { get; set; }
        
    }
}
