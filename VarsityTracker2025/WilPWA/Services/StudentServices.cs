using Azure.Data.Tables;
using WilPWA.Models;
using System.Linq;
using Azure;

namespace WilPWA.Services
{
    public class StudentServices
    {
        private readonly string _connectionString = "DefaultEndpointsProtocol=https;AccountName=varsitytracker2025;AccountKey=IoMAe5Cg0FPFVvAWa9UPYHt/HCQFWkUwtwqb6JOILkGVfEsifPkLW9zZgZbVLCYH73MUu1mDV8l7+AStIIUA6Q==;EndpointSuffix=core.windows.net";
        private readonly string _tableName = "Students"; // Table name in Azure


        // Get the TableClient to interact with Azure Table Storage
        private TableClient GetTableClient()
        {
            var serviceClient = new TableServiceClient(_connectionString);
            return serviceClient.GetTableClient(_tableName);
        }

        // Get all students
        public async Task<List<Students>> GetAllStudentsAsync()
        {
            var tableClient = GetTableClient();
            var students = new List<Students>();

            // Use QueryAsync to fetch all students asynchronously
            await foreach (var entity in tableClient.QueryAsync<Students>())
            {
                students.Add(entity);
            }

            return students;
        }

        // Simulate the card tap (clock-in)
        public async Task<Students> SimulateCardTapAsync(string studentNumber, string RowKey)
        {
            var tableClient = GetTableClient();

            try
            {
                // Fetch the student using both PartitionKey and RowKey (which are studentNumber in this case)
                var student = await tableClient.GetEntityAsync<Students>(studentNumber, RowKey);

                // Return the student if found
                return student.Value;
            }
            catch (RequestFailedException ex)
            {
                // Handle the case where the student doesn't exist or there's an error
                Console.WriteLine($"Error fetching student {studentNumber}: {ex.Message}");
                return null;
            }
        }
    }
}