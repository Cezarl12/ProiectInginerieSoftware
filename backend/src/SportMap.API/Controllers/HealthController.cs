using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SportMap.Infrastructure.Data;
using Swashbuckle.AspNetCore.Annotations;

namespace SportMap.API.Controllers;

/// <summary>Monitorizarea stării serviciului și a bazei de date.</summary>
[ApiController]
[Route("api/health")]
[Tags("Health")]
public class HealthController : ControllerBase
{
    private readonly SportMapDbContext _context;

    public HealthController(SportMapDbContext context)
    {
        _context = context;
    }

    /// <summary>Verifică dacă API-ul și baza de date sunt funcționale.</summary>
    [HttpGet]
    [SwaggerOperation(
        Summary = "Health check",
        Description = "Verifică conectivitatea cu baza de date. Returnează 503 dacă DB nu răspunde. " +
                      "Util pentru load balancers, uptime monitoring și CI/CD readiness probes.")]
    [SwaggerResponse(200, "Serviciu funcțional")]
    [SwaggerResponse(503, "Baza de date indisponibilă")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status503ServiceUnavailable)]
    public async Task<IActionResult> Get()
    {
        try
        {
            await _context.Database.ExecuteSqlRawAsync("SELECT 1");
        }
        catch
        {
            return StatusCode(503, new { status = "unhealthy", database = "down" });
        }

        return Ok(new
        {
            status = "healthy",
            database = "up",
            timestamp = DateTime.UtcNow,
            service = "SportMap.API"
        });
    }
}
