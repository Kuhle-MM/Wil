using Azure.Data.Tables;
using System.ComponentModel.DataAnnotations;

namespace VarsityTrackerApi.Models.Access
{
    public class LoginModel
    {
        public string email { get; set; }
        public string password { get; set; }
    }
}
