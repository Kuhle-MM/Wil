using Azure;
using Azure.Data.Tables;
using Azure.Storage.Blobs;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using System.Globalization;
using System.Reflection;
using VarsityTrackerApi.Models.Access;
using VarsityTrackerApi.Models.Module;

namespace VarsityTrackerApi.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class ModuleController : ControllerBase
    {
        private readonly TableClient _lecturerTable;
        private readonly string _connectionString;
        private readonly TableClient _studentTable;
        private readonly TableClient _moduleTable;
        private readonly TableClient _lecturerModuleTable;
        private readonly TableClient _studentModuleTable;

        public ModuleController(IOptions<AzureTableStorageSettings> storageOptions)
        {
            _connectionString = storageOptions.Value.ConnectionString;
            _lecturerTable = new TableClient(_connectionString, "Lecturers");
            _studentTable = new TableClient(_connectionString, "Students");
            _moduleTable = new TableClient(_connectionString, "Modules");
            _lecturerModuleTable = new TableClient(_connectionString, "LecturerModules");
            _studentModuleTable = new TableClient(_connectionString, "StudentModules");
        }

        [HttpPost("create_module")]
        public async Task<IActionResult> Create_Module(ModuleModel module)
        {
            try
            {
                // Check if a module with the same code already exists
                await foreach (var existingModule in _moduleTable.QueryAsync<Modules>())
                {
                    if (existingModule.code == module.code.ToUpper())
                    {
                        return BadRequest($"{module.code.ToUpper()} already exists in the system.");
                    }
                }
                var newModule = new Modules
                {
                    PartitionKey = "Modules ",
                    RowKey = Guid.NewGuid().ToString(),
                    code = module.code.ToUpper(),
                    moduleName = CultureInfo.InvariantCulture.TextInfo.ToTitleCase(module.moduleName), //(Symmons, 2023)
                    NQF = module.NQF,
                    credits = module.credits,
                    courseCode = module.courseCode.ToUpper(),
                    year = module.year
                };

                await _moduleTable.AddEntityAsync(newModule);
                return Ok($"Module with code: {module.code} created successfully.");
            }
            catch (RequestFailedException ex)
            {
                return StatusCode(500, $"Error saving module: {ex.Message}");
            }
        }

        [HttpPost("lecturer_add_module")]
        public async Task<IActionResult> Add_Module_Lecturer(LecturerModuleModel module)
        {
            try
            {
                Lecturers lecturer = null;
                //checks if the lecturer exists in the system.
                await foreach (var s in _lecturerTable.QueryAsync<Lecturers>(s => s.lecturerID == module.lecturerID.ToLower()))
                {
                    lecturer = s;
                    break;
                }

                if (lecturer == null)
                    return NotFound("Lecturer not found.");

                Modules modules = null;
                //checks if the module exists in the system.
                await foreach (var s in _moduleTable.QueryAsync<Modules>(s => s.code == module.moduleCode.ToUpper()))
                {
                    modules = s;
                    break;
                }

                if (modules == null)
                    return NotFound("Module not found.");

                // Check if a lecturer already has the module code assigned to them
                await foreach (var existingModule in _lecturerModuleTable.QueryAsync<LecturerModules>())
                {
                    if (existingModule.lecturerID == module.lecturerID && existingModule.moduleCode == module.moduleCode)
                    {
                        return BadRequest($"{module.lecturerID} already exists has module {module.moduleCode} assigned to them.");
                    }
                }
                var newModule = new LecturerModules
                {
                    PartitionKey = "Lecturers_Modules",
                    RowKey = Guid.NewGuid().ToString(),
                    lecturerID = module.lecturerID.ToLower(),
                    moduleCode = module.moduleCode.ToUpper()
                };

                await _lecturerModuleTable.AddEntityAsync(newModule);
                return Ok($"Module with code: {module.moduleCode} added successfully to lecturer {lecturer.firstName + " " + lecturer.lastName}'s profile.");
            }
            catch (RequestFailedException ex)
            {
                return StatusCode(500, $"Error saving module to lecturer profile: {ex.Message}.");
            }
        }

        [HttpPost("student_add_module")]
        public async Task<IActionResult> Add_Module_Lecturer(StudentModuleModel module)
        {
            try
            {
                Students student = null;
                //checks if the lecturer exists in the system.
                await foreach (var s in _studentTable.QueryAsync<Students>(s => s.studentNumber == module.studentNumber.ToUpper()))
                {
                    student = s;
                    break;
                }

                if (student == null)
                    return NotFound("Student not found.");

                Modules modules = null;
                //checks if the module exists in the system.
                await foreach (var s in _moduleTable.QueryAsync<Modules>(s => s.code == module.moduleCode.ToUpper()))
                {
                    modules = s;
                    break;
                }

                if (modules == null)
                    return NotFound("Module not found.");

                // Check if a lecturer already has the module code assigned to them
                await foreach (var existingModule in _studentModuleTable.QueryAsync<StudentModules>())
                {
                    if (existingModule.studentNumber == module.studentNumber.ToUpper() && existingModule.moduleCode == module.moduleCode.ToUpper())
                    {
                        return BadRequest($"{module.studentNumber.ToUpper()} already exists has module {module.moduleCode} assigned to them.");
                    }
                }
                var newModule = new StudentModules
                {
                    PartitionKey = "Students_Modules",
                    RowKey = Guid.NewGuid().ToString(),
                    studentNumber = module.studentNumber.ToUpper(),
                    moduleCode = module.moduleCode.ToUpper()
                };

                await _studentModuleTable.AddEntityAsync(newModule);
                return Ok($"Module with code: {module.moduleCode} added successfully to student: {student.firstName + " " + student.lastName}'s profile.");
            }
            catch (RequestFailedException ex)
            {
                return StatusCode(500, $"Error saving module: {ex.Message}");
            }
        }
    }
}
/*References 
  - Symmons, D. (2023). Is there a way to capitalize first letters of each word in a parameter string? - Microsoft Q&A. [online] Microsoft.com. Available at: https://learn.microsoft.com/en-us/answers/questions/1189474/is-there-a-way-to-capitalize-first-letters-of-each [Accessed 27 Jun. 2025].
  - 
 */