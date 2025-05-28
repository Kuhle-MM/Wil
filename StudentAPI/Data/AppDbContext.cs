using Microsoft.EntityFrameworkCore;
using StudentAPI.Models;
using System.Collections.Generic;

namespace StudentAPI.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

        public DbSet<ClockingRecord> ClockingRecords { get; set; }
    }
}
