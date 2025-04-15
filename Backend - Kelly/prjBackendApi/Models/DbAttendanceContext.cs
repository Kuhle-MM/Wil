using System;
using System.Collections.Generic;
using System.Reflection.Metadata;
using System.Security.Claims;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace prjBackendApi.Models
{
    public partial class DbAttendanceContext : IdentityDbContext<IdentityUser, IdentityRole, string, IdentityUserClaim<string>, 
                                        IdentityUserRole<string>, IdentityUserLogin<string>, IdentityRoleClaim<string>,
                                        IdentityUserToken<string>>
    {
        public DbAttendanceContext()
        {

        }

        public DbAttendanceContext(DbContextOptions<DbAttendanceContext> options)
        : base(options)
        {
        }

        protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
        #warning To protect potentially sensitive information in your connection string, you should move it out of source code. You can avoid scaffolding the connection string by using the Name= syntax to read it from configuration - see https://go.microsoft.com/fwlink/?linkid=2131148. For more guidance on storing connection strings, see https://go.microsoft.com/fwlink/?LinkId=723263.
        => optionsBuilder.UseSqlServer("Server=Kelly\\SQLEXPRESS;Initial Catalog=DbAttendanceSystem;Integrated Security=True;Encrypt=False;");
        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            //Define primary key for IdentityUserLogin<string>
            modelBuilder.Entity<IdentityUserLogin<string>>().HasKey(login => new { login.LoginProvider, login.ProviderKey });

            //Define primary keys for other Identity entities if needed
            modelBuilder.Entity<IdentityUserRole<string>>().HasKey(role => new { role.UserId, role.RoleId });
            modelBuilder.Entity<IdentityUserToken<string>>().HasKey(token => new { token.UserId, token.LoginProvider, token.Name });
            OnModelCreatingPartial(modelBuilder);
        }

        partial void OnModelCreatingPartial(ModelBuilder modelBuilder);
    }

}
