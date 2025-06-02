﻿using System.Net.Http;
using System.Text.Json;
using System.Threading.Tasks;
using Azure.Data.Tables;
using Microsoft.Extensions.Options;
using WilPWA.Models;

namespace WilPWA.Services
{
    public class AccountServices
    {
        private readonly HttpClient _httpClient;

        public AccountServices(HttpClient httpClient)
        {
            _httpClient = httpClient;
        }

        public async Task<(bool Success, string Message, string Role)> LoginStudentAsync(string email, string password)
        {
            var loginModel = new LoginModel { email = email, password = password };
            var response = await _httpClient.PostAsJsonAsync("Access/login_student", loginModel);

            if (response.IsSuccessStatusCode)
            {
                var json = await response.Content.ReadAsStringAsync();
                using var doc = JsonDocument.Parse(json);
                var message = doc.RootElement.GetProperty("message").GetString();
                return (true, message, "Student");
            }
            else
            {
                var error = await response.Content.ReadAsStringAsync();
                return (false, error, null);
            }
        }

        public async Task<(bool Success, string Message, string Role)> LoginLecturerAsync(string email, string password)
        {
            var loginModel = new LoginModel { email = email, password = password };
            var response = await _httpClient.PostAsJsonAsync("Access/login_lecturer", loginModel);

            if (response.IsSuccessStatusCode)
            {
                var json = await response.Content.ReadAsStringAsync();
                using var doc = JsonDocument.Parse(json);
                var message = doc.RootElement.GetProperty("message").GetString();
                return (true, message, "Lecturer");
            }
            else
            {
                var error = await response.Content.ReadAsStringAsync();
                return (false, error, null);
            }
        }

        public async Task<(bool Success, string Message, string Role)> LoginAdminAsync(string email, string password)
        {
            var loginModel = new LoginModel { email = email, password = password };
            var response = await _httpClient.PostAsJsonAsync("Access/login_admin", loginModel);

            if (response.IsSuccessStatusCode)
            {
                var json = await response.Content.ReadAsStringAsync();
                using var doc = JsonDocument.Parse(json);
                var message = doc.RootElement.GetProperty("message").GetString();
                return (true, message, "Admin");
            }
            else
            {
                var error = await response.Content.ReadAsStringAsync();
                return (false, error, null);
            }
        }
    }
}