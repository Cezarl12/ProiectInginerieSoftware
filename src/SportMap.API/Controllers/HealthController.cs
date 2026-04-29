using Microsoft.AspNetCore.Mvc;
using Swashbuckle.AspNetCore.Annotations;

namespace SportMap.API.Controllers;

/// <summary>Monitorizarea stării serviciului.</summary>
[ApiController]
[Route("api/health")]
[Tags("Health")]
public class HealthController : ControllerBase
{
    /// <summary>Verifică dacă API-ul este pornit și funcționează.</summary>
    [HttpGet]
    [SwaggerOperation(
        Summary = "Health check",
        Description = "Returnează starea curentă a serviciului și timestamp-ul UTC. " +
                      "Util pentru load balancers, uptime monitoring și CI/CD readiness probes.")]
    [SwaggerResponse(200, "Serviciu funcțional")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public IActionResult Get() => Ok(new
    {
        status = "healthy",
        timestamp = DateTime.UtcNow,
        service = "SportMap.API"
    });
}
