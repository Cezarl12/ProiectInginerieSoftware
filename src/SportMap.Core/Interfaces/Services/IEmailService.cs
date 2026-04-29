namespace SportMap.Core.Interfaces.Services;

public interface IEmailService
{
    Task SendEmailConfirmationAsync(string toEmail, string username, string confirmationLink);
}
