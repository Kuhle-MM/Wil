using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace VarsityTrackerApi.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class PingingController : ControllerBase
    {
        // Temporary storage for comparison
        private static string _espPingString;
        private static DateTime _espPingTime;
        private static string _reactPingString;
        private static DateTime _reactPingTime;

        // Receives a ping string from the ESP device.
        [HttpPost("ReceiveEspPing")]
        public IActionResult ReceiveEspPing([FromBody] string espPingString)
        {
            if (string.IsNullOrWhiteSpace(espPingString))
                return BadRequest("ESP ping string cannot be empty.");

            _espPingString = espPingString;
            _espPingTime = DateTime.UtcNow;

            return Ok("ESP ping received.");
        }


        // Receives a ping string from the React frontend.
        [HttpPost("ReceiveReactPing")]
        public IActionResult ReceiveReactPing([FromBody] string reactPingString)
        {
            if (string.IsNullOrWhiteSpace(reactPingString))
                return BadRequest("React ping string cannot be empty.");

            _reactPingString = reactPingString;
            _reactPingTime = DateTime.UtcNow;

            return Ok("React ping received.");
        }

        // Compares ESP and React ping strings within a 1-minute delay.
        [HttpGet("ComparePings")]
        public IActionResult ComparePings()
        {
            if (string.IsNullOrEmpty(_espPingString) || string.IsNullOrEmpty(_reactPingString))
                return BadRequest("Both ESP and React pings must be received first.");

            // Compare timestamps
            var timeDifference = Math.Abs((_espPingTime - _reactPingTime).TotalMinutes);

            bool isMatch = _espPingString.Equals(_reactPingString, StringComparison.OrdinalIgnoreCase)
                           && timeDifference <= 1;

            return Ok(new
            {
                EspPing = _espPingString,
                ReactPing = _reactPingString,
                TimeDifferenceMinutes = timeDifference,
                Match = isMatch
            });
        }

    }
}
