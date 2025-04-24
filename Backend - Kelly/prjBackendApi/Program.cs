
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using prjBackendApi.Models;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace prjBackendApi
{
    public class Program
    {
        public static async Task Main(string[] args)
        {
            var builder = WebApplication.CreateBuilder(args);
            builder.Services.AddDbContext<DbAttendanceContext>(options =>
            options.UseSqlServer("Server=Kelly\\SQLEXPRESS;Initial Catalog=DbAttendanceSystem;Integrated Security=True;Encrypt=False;"));

            #region SET UP
            builder.Services.AddIdentity<IdentityUser, IdentityRole>()
            .AddEntityFrameworkStores<DbAttendanceContext>()
            .AddDefaultTokenProviders();
            #endregion

            // Add services to the container.
            builder.Services.AddAuthorization();

            // Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
            builder.Services.AddEndpointsApiExplorer();
            builder.Services.AddSwaggerGen();

            #region
            builder.Services.AddSwaggerGen(options =>
            {
                options.SwaggerDoc("v1", new OpenApiInfo { Title = "Attendance System API", Version = "v1" });
                options.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
                {
                    Name = "Authorization",
                    Type = SecuritySchemeType.Http,
                    Scheme = "Bearer",
                    BearerFormat = "JWT",
                    In = ParameterLocation.Header,
                    Description = "Enter your valid token in the text input below. \n\nExample: \"abcdef12345\""
                });
                options.AddSecurityRequirement(new OpenApiSecurityRequirement
                {
                    {
                        new OpenApiSecurityScheme
                        {
                            Reference = new OpenApiReference
                            {
                                Type = ReferenceType.SecurityScheme,
                                Id = "Bearer"
                            }
                        },
                        new string[]{ }
                    }
                });
            });
            #endregion

            var app = builder.Build();

            #region Create Roles
            using (var scope = app.Services.CreateScope())
            {
                var roleManager = scope.ServiceProvider.GetRequiredService<RoleManager<IdentityRole>>();
                await EnsureRolesAsync(roleManager);
            }
            #endregion

            // Configure the HTTP request pipeline.
            if (app.Environment.IsDevelopment())
            {
                app.UseSwagger();
                app.UseSwaggerUI();
            }

            app.UseHttpsRedirection();
            app.UseAuthentication();
            app.UseAuthorization();

            #region 
            app.MapPost("/register", async (Registration model, UserManager<IdentityUser> userManager, RoleManager<IdentityRole> roleManager) =>
            {
                // Check if email ends with the required domain
                if (!model.Email.EndsWith("@vcconnect.edu.za", StringComparison.OrdinalIgnoreCase))
                {
                    return Results.BadRequest(new { Error = "Only emails ending with '@vcconnect.edu.za' are allowed." });
                }

                var user = new IdentityUser { UserName = model.Username, Email = model.Email };
                var result = await userManager.CreateAsync(user, model.Password);

                if (result.Succeeded)
                {
                    await userManager.AddToRoleAsync(user, model.Role);
                    return Results.Created($"/users/{user.UserName}", user);
                }

                return Results.BadRequest(result.Errors);
            }).WithName("RegisterUser").WithOpenApi();
            #endregion
            #region
            app.MapPost("/login", async (Login model, SignInManager<IdentityUser> signInManager, UserManager<IdentityUser> userManager) =>
            {
                var user = await userManager.FindByNameAsync(model.Username);
                if (user != null)
                {
                    var result = await signInManager.PasswordSignInAsync(model.Username, model.Password, false, false);
                    if (result.Succeeded)
                    {
                        var token = GenerateJwtToken(user, userManager);
                        return Results.Ok(new
                        {
                            Token = token
                        });
                    }
                }
                return Results.Unauthorized();
            }).WithName("LoginUser").WithOpenApi();

            app.MapGet("/lecturer", [Authorize(Roles = "Lecturer")] () => "Welcome Lecturer").WithName("LecturerEndpoint").WithOpenApi();
            app.MapGet("/student", [Authorize(Roles = "Student")] () => "Welcome Student").WithName("StudentEndpoint").WithOpenApi();
            app.MapGet("/admin", [Authorize(Roles = "Admin")] () => "Welcome Admin").WithName("AdminEndpoint").WithOpenApi();
            #endregion

            app.Run();
        }

        #region 
        private static string GenerateJwtToken(IdentityUser user, UserManager<IdentityUser> userManager)
        {
            var userRoles = userManager.GetRolesAsync(user).Result;
            var claims = new List<Claim>
            {
                new Claim(JwtRegisteredClaimNames.Sub, user.UserName),
                new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
            };

            claims.AddRange(userRoles.Select(role => new Claim(ClaimTypes.Role, role)));
            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes("VYsu7r+bQRqTB23UN+7RzGpY6yKx2EE/"));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var token = new JwtSecurityToken(
                issuer: "AttendanceAPI",
                audience: "AttendanceAPI",
                claims: claims,
                expires: DateTime.Now.AddMinutes(30),
                signingCredentials: creds
                );
            return new JwtSecurityTokenHandler().WriteToken(token);
        }
        #endregion
        #region
        public static async Task EnsureRolesAsync(RoleManager<IdentityRole> roleManager)
        {
            var roles = new[]
            {
                "Student",
                "Lecturer",
                "Admin"
            };
            foreach (var role in roles)
            {
                if (!await roleManager.RoleExistsAsync(role))
                {
                    await roleManager.CreateAsync(new IdentityRole(role));
                }
            }
        }
        #endregion
    }
}
