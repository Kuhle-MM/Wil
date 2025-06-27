using Azure;
using Azure.Data.Tables;
using Azure.Storage.Blobs;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using VarsityTrackerApi.Models;
using System.Globalization;

namespace VarsityTrackerApi.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class ModuleController : ControllerBase
    {
        private readonly TableClient _lecturerTable;
        private readonly string _connectionString;
        private readonly TableClient _studentTable;
        private readonly TableClient _adminTable;
        private readonly TableClient _moduleTable;
        private readonly BlobServiceClient _blobServiceClient;
        private readonly string _containerName = "qrcodes";

        public ModuleController(IOptions<AzureTableStorageSettings> storageOptions)
        {
            _connectionString = storageOptions.Value.ConnectionString;
            _lecturerTable = new TableClient(_connectionString, "Lecturers");
            _studentTable = new TableClient(_connectionString, "Students");
            _adminTable = new TableClient(_connectionString, "Admins");
            _moduleTable = new TableClient(_connectionString, "Modules");
            _blobServiceClient = new BlobServiceClient(_connectionString);
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
    }
}
/*References 
  - Symmons, D. (2023). Is there a way to capitalize first letters of each word in a parameter string? - Microsoft Q&A. [online] Microsoft.com. Available at: https://learn.microsoft.com/en-us/answers/questions/1189474/is-there-a-way-to-capitalize-first-letters-of-each [Accessed 27 Jun. 2025].
  - 
 */