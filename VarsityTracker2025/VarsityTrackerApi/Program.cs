using QRCoder; //(Rasheed, 2024)
using System.Drawing;
using System.Drawing.Imaging;
using VarsityTrackerApi.Models;
using ZXing;
using ZXing.Windows.Compatibility;
namespace VarsityTrackerApi
{
    public class Program
    {
        public static void Main(string[] args)
        {
            var builder = WebApplication.CreateBuilder(args);

            // Add services to the container.
            builder.Services.AddControllers();
            builder.Services.Configure<AzureTableStorageSettings>(
                builder.Configuration.GetSection("AzureTableStorage"));
            builder.Services.AddEndpointsApiExplorer();
            builder.Services.AddSwaggerGen();

            var app = builder.Build();

            // Configure the HTTP request pipeline.
            if (app.Environment.IsDevelopment())
            {
                app.UseSwagger();
                app.UseSwaggerUI();
            }

            app.UseHttpsRedirection();
            app.UseAuthorization();

            app.MapControllers();

            app.MapGet("/GenerateQRCode", (string text) =>
            {
                var guid = Guid.NewGuid().ToString();
                QRCodeGenerator qrGenerator = new QRCodeGenerator();
                QRCodeData qrCodeData = qrGenerator.CreateQrCode(text + "\r\n" + guid, QRCodeGenerator.ECCLevel.Q);
                QrCode qrCode = new QrCode(qrCodeData);
                Bitmap qrCodeImage = qrCode.GetGraphic(20);

                Bitmap logoImage = new Bitmap(@"wwwroot/image/TempLogo.jpg");

                using (Bitmap qrCodeAsBitmap = qrCode.GetGraphic(20, Color.Black, Color.WhiteSmoke, logoImage))
                {
                    using (MemoryStream ms = new MemoryStream())
                    {
                        qrCodeAsBitmap.Save(ms, ImageFormat.Png);
                        string base64String = Convert.ToBase64String(ms.ToArray());
                        var data = "data:image/png;base64," + base64String;
                        return data;
                    }
                }
            })
            .WithName("GetQrCode")
            .WithOpenApi(); // Ensure OpenAPI support is properly configured

            app.MapPost("/DecodeQRCode", async (QRCodeRequest request) =>
            {
                if (string.IsNullOrWhiteSpace(request.Base64Image))
                {
                    return Results.BadRequest("No image data provided.");
                }

                var base64Data = request.Base64Image.Contains(",")
                    ? request.Base64Image.Split(',')[1]
                    : request.Base64Image;

                try
                {
                    byte[] imageBytes = Convert.FromBase64String(base64Data);
                    using var ms = new MemoryStream(imageBytes);
                    using var bitmap = new Bitmap(ms);

                    var reader = new BarcodeReader();
                    var result = reader.Decode(bitmap);

                    return result != null
                        ? Results.Ok(new { text = result.Text })
                        : Results.BadRequest("Could not decode the QR code.");
                }
                catch (Exception ex)
                {
                    return Results.Problem("Error decoding image: " + ex.Message);
                }
            })
            .WithName("DecodeQRCode")
            .WithOpenApi(); // Ensure OpenAPI support is properly configured

            app.Run();
        }
    }
}
