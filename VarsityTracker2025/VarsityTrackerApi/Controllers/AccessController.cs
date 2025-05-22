using Azure;
using Azure.Data.Tables;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using System.Net.Http;
using System.Net.Mail;
using System.Text;
using VarsityTrackerApi.Models;

namespace VarsityTrackerApi.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class AccessController : ControllerBase
    {
        private readonly TableClient _lecturerTable;
        private readonly string _connectionString;
        private readonly TableClient _studentTable;
        private readonly TableClient _LogTable;

        public AccessController(IOptions<AzureTableStorageSettings> storageOptions)
        {
            _connectionString = storageOptions.Value.ConnectionString;
            _lecturerTable = new TableClient(_connectionString, "Lecturers");
            _studentTable = new TableClient(_connectionString, "Students");
            _LogTable = new TableClient(_connectionString, "FirstLoggedIn");
        }

        [HttpPost("create")]
        public async Task<IActionResult> Create_User(UserModel user)
        {
            if (user == null)
                return BadRequest("User cannot be null.");

            string role = user.role?.Trim().ToLower();

            if (role == "lecturer")
            {
                try
                {
                    await foreach (var existingLecturer in _lecturerTable.QueryAsync<Lecturers>())
                    {
                        if (existingLecturer.lecturerEmail == user.email)
                        {
                            return BadRequest($"{user.email} already exists in the system.");
                        }
                    }

                    var lecturer = new Lecturers
                    {
                        PartitionKey = "Lecturers",
                        RowKey = Guid.NewGuid().ToString(),
                        lecturerEmail = user.email,
                        password = PasswordHelper.HashPassword(user.password),
                        firstName = user.firstName,
                        lastName = user.lastName,
                        qualification = string.Empty,
                        phoneNumber = user.phoneNumber,
                        lecturerID = string.Empty,
                        role = "Lecturer"
                    };

                    await _studentTable.AddEntityAsync(lecturer);
                    return Ok($"Lecturer with email: {user.email} created successfully.");
                }
                catch (RequestFailedException ex)
                {
                    return StatusCode(500, $"Error saving Lecturer: {ex.Message}");
                }
            }
            else if (role == "student")
            {
                try
                {
                    // Check if a student with the same email already exists
                    await foreach (var existingStudent in _studentTable.QueryAsync<Students>())
                    {
                        if (existingStudent.studentEmail == user.email)
                        {
                            return BadRequest($"{user.email} already exists in the system.");
                        }
                    }

                    var student = new Students
                    {
                        PartitionKey = "Students",
                        RowKey = Guid.NewGuid().ToString(),
                        studentEmail = user.email.ToLower(),
                        password = PasswordHelper.HashPassword(user.password),
                        firstName = user.firstName,
                        lastName = user.lastName,
                        phoneNumber = user.phoneNumber,
                        studentNumber = user.email.Substring(0, 10).ToUpper(),
                        role = "Student"
                    };

                    await _studentTable.AddEntityAsync(student);
                    return Ok($"Student with email: {user.email} created successfully.");
                }
                catch (RequestFailedException ex)
                {
                    return StatusCode(500, $"Error saving Student: {ex.Message}");
                }
            }
            else
            {
                return BadRequest("Invalid role. Must be either 'Student' or 'Lecturer'.");
            }
        }

        [HttpPost("login_student")]
        public async Task<IActionResult> Login_Student(LoginModel user)
        {
            Students foundStudent = null;

            // Search for the student by email
            await foreach (var s in _studentTable.QueryAsync<Students>())
            {
                if (s.studentEmail == user.email)
                {
                    foundStudent = s;
                    break;
                }
            }

            // Email not found
            if (foundStudent == null)
                return NotFound("User not found.");

            // Check password
            bool passwordValid;
            try
            {
                passwordValid = PasswordHelper.VerifyPassword(user.password, foundStudent.password);
            }
            catch
            {
                return BadRequest("Stored password format is invalid.");
            }

            if (!passwordValid)
                return BadRequest("Incorrect password.");

            // Login successful
            return Ok("User logged in.");
        }

        [HttpPost("login_lecturer")]
        public async Task<IActionResult> Login_lecturer(LoginModel user)
        {
            Lecturers foundLecturer = null;

            // Search for the student by email
            await foreach (var s in _lecturerTable.QueryAsync<Lecturers>())
            {
                if (s.lecturerEmail == user.email)
                {
                    foundLecturer = s;
                    break;
                }
            }

            // Email not found
            if (foundLecturer == null)
                return NotFound("User not found.");

            // Check password
            bool passwordValid;
            try
            {
                passwordValid = PasswordHelper.VerifyPassword(user.password, foundLecturer.password);
            }
            catch
            {
                return BadRequest("Stored password format is invalid.");
            }

            if (!passwordValid)
                return BadRequest("Incorrect password.");

            // Login successful
            return Ok("User logged in.");
        }

        [HttpGet("get_details_students")]
        public async Task<IActionResult> getStudentDetaills(string id)
        {
            await foreach (var existingStudent in _studentTable.QueryAsync<Students>())
            {
                if (existingStudent.studentNumber == id)
                {
                    return Ok($"Email: {existingStudent.studentEmail}" +
                        $"\n\nETAG: {existingStudent.ETag}" +
                        $"\n\nPartition Key: {existingStudent.PartitionKey}" +
                        $"\n\nRow Key: {existingStudent.RowKey}" +
                        $"\n\nRole: {existingStudent.role}");
                }
            }
            return BadRequest($"Student with id:{id} does not exist");
        }

        [HttpGet("get_details_lecturer")]
        public async Task<IActionResult> getLecturerDetaills(string id)
        {
            await foreach (var existingLecturer in _lecturerTable.QueryAsync<Lecturers>())
            {
                if (existingLecturer.lecturerID == id)
                {
                    return Ok($"Email: {existingLecturer.lecturerID}" +
                        $"\n\nETAG: {existingLecturer.ETag}" +
                        $"\n\nPartition Key: {existingLecturer.PartitionKey}" +
                        $"\n\nRow Key: {existingLecturer.RowKey}" +
                        $"\n\nRole: {existingLecturer.role}");
                }
            }
            return BadRequest($"Lecturer with id:{id} does not exist");
        }

        [HttpPut("update_student/{studentNum}")]
        public async Task<IActionResult> UpdateStudent(string studentNum, [FromBody] Students user)
        {

            await foreach (var student in _studentTable.QueryAsync<Students>())
            {
                if (student.studentNumber == studentNum)
                {
                    // Update properties
                    student.firstName = user.firstName;
                    student.lastName = user.lastName;
                    student.phoneNumber = user.phoneNumber;

                    await _studentTable.UpdateEntityAsync(student, student.ETag, TableUpdateMode.Replace);
                    return NoContent(); // 204 Success
                }
            }

            return NotFound("Student not found.");
        }

        [HttpPut("update_lecturer/{id}")]
        public async Task<IActionResult> UpdateLecturer(string id, [FromBody] Lecturers user)
        {

            await foreach (var lecturer in _lecturerTable.QueryAsync<Lecturers>())
            {
                if (lecturer.lecturerID == id)
                {
                    // Update properties
                    lecturer.firstName = user.firstName;
                    lecturer.lastName = user.lastName;
                    lecturer.phoneNumber = user.phoneNumber;
                    lecturer.qualification = user.qualification;

                    await _studentTable.UpdateEntityAsync(lecturer, lecturer.ETag, TableUpdateMode.Replace);
                    return NoContent(); // 204 Success
                }
            }

            return NotFound("Lecturer not found.");
        }

        //private static string CreateRandomPassword(int passwordLength)
        //{
        //    string allowedChars = "abcdefghijkmnopqrstuvwxyzABCDEFGHJKLMNOPQRSTUVWXYZ0123456789!@$?_-";
        //    char[] chars = new char[passwordLength];
        //    Random rd = new Random();

        //    for (int i = 0; i < passwordLength; i++)
        //    {
        //        chars[i] = allowedChars[rd.Next(0, allowedChars.Length)];
        //    }

        //    return new string(chars);
        //}

        //private static void SendDetails(string email, string password)
        //{
        //    try
        //    {

        //        SmtpClient mySmtpClient = new SmtpClient("pro.turbo-smtp.com");

        //        // set smtp-client with basicAuthentication
        //        mySmtpClient.UseDefaultCredentials = false;
        //        System.Net.NetworkCredential basicAuthenticationInfo = new
        //           System.Net.NetworkCredential("varsitystudent123@gmail.com", "Varsity2025");
        //        mySmtpClient.Credentials = basicAuthenticationInfo;

        //        // add from,to mailaddresses
        //        MailAddress from = new MailAddress("varsitystudent123@gmail.com", "VarsityTracker");
        //        MailAddress to = new MailAddress(email, "User");
        //        MailMessage myMail = new System.Net.Mail.MailMessage(from, to);

        //        // add ReplyTo
        //        MailAddress replyTo = new MailAddress("reply@example.com");
        //        myMail.ReplyToList.Add(replyTo);

        //        // set subject and encoding
        //        myMail.Subject = "Account details";
        //        myMail.SubjectEncoding = System.Text.Encoding.UTF8;

        //        // set body-message and encoding
        //        myMail.Body = $"<b>Password:{password} </b><br>Email: {email} <b></b> Please use these credentials to log in and ensure password is changed.";
        //        myMail.BodyEncoding = System.Text.Encoding.UTF8;
        //        // text or html
        //        myMail.IsBodyHtml = true;

        //        mySmtpClient.Send(myMail);
        //    }

        //    catch (SmtpException ex)
        //    {
        //        throw new ApplicationException
        //          ("SmtpException has occured: " + ex.Message);
        //    }
        //    catch (Exception ex)
        //    {
        //        throw ex;
        //    }
        //}
    }
}
