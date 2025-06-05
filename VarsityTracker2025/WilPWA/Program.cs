using WilPWA.Models;
using WilPWA.Services;
using static WilPWA.Services.AccountServices;

namespace WilPWA
{
    public class Program
    {
        public static void Main(string[] args)
        {
            var builder = WebApplication.CreateBuilder(args);

            // Add services to the container.
            builder.Services.AddControllersWithViews();
            builder.Services.AddProgressiveWebApp();

            // Add Session support
            builder.Services.AddDistributedMemoryCache();
            builder.Services.AddSession();

            builder.Services.AddScoped<StudentServices>();

            // Register AccountServices
            builder.Services.AddScoped<AccountServices>();

            // Register HttpClient with base API URL
            builder.Services.AddHttpClient<AccountServices>(client =>
            {
                client.BaseAddress = new Uri("https://localhost:7276/");
            });
            builder.Services.AddHttpClient<StudentServices>(client =>
            {
                client.BaseAddress = new Uri("https://localhost:7276/");
            });

            var app = builder.Build();

            // Configure the HTTP request pipeline.
            if (!app.Environment.IsDevelopment())
            {
                app.UseExceptionHandler("/Home/Error");
                app.UseHsts();
            }

            app.UseHttpsRedirection();
            app.UseStaticFiles();

            app.UseRouting();

            // Add session middleware before authorization
            app.UseSession();

            app.UseAuthorization();

            app.MapControllerRoute(
                name: "default",
                pattern: "{controller=Home}/{action=Index}/{id?}");

            app.Run();
        }
    }
}
