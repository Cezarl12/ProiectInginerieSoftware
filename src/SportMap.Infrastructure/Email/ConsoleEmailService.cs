using Microsoft.Extensions.Logging;
using SportMap.Core.Interfaces.Services;

namespace SportMap.Infrastructure.Email;

public class ConsoleEmailService : IEmailService
{
    private readonly ILogger<ConsoleEmailService> _logger;

    public ConsoleEmailService(ILogger<ConsoleEmailService> logger)
    {
        _logger = logger;
    }

    public Task SendEmailConfirmationAsync(string toEmail, string username, string confirmationLink)
    {
        _logger.LogWarning(
            "[DEV EMAIL] Confirmation email for {Username} <{Email}>: {Link}",
            username, toEmail, confirmationLink);

        return Task.CompletedTask;
    }
}
