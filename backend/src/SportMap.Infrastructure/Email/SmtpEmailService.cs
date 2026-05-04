using MailKit.Net.Smtp;
using MailKit.Security;
using Microsoft.Extensions.Options;
using MimeKit;
using SportMap.Core.Interfaces.Services;

namespace SportMap.Infrastructure.Email;

public class SmtpEmailService : IEmailService
{
    private readonly EmailSettings _settings;

    public SmtpEmailService(IOptions<EmailSettings> settings)
    {
        _settings = settings.Value;
    }

    public async Task SendEmailConfirmationAsync(string toEmail, string username, string confirmationLink)
    {
        var message = new MimeMessage();
        message.From.Add(new MailboxAddress(_settings.SenderName, _settings.SenderEmail));
        message.To.Add(new MailboxAddress(username, toEmail));
        message.Subject = "Confirm your SportMap account";

        message.Body = new TextPart("html")
        {
            Text = $"""
                <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;padding:24px;">
                    <h2 style="color:#4CAF50;">Welcome to SportMap, {username}!</h2>
                    <p>Thank you for registering. Please confirm your email address to activate your account:</p>
                    <p style="margin:28px 0;">
                        <a href="{confirmationLink}"
                           style="background:#4CAF50;color:white;padding:12px 28px;text-decoration:none;border-radius:4px;font-weight:bold;">
                            Confirm Email
                        </a>
                    </p>
                    <p style="color:#555;">Or copy this link into your browser:</p>
                    <p style="word-break:break-all;color:#333;">{confirmationLink}</p>
                    <p style="color:#555;">This link expires in <strong>24 hours</strong>.</p>
                    <hr style="margin:24px 0;border:none;border-top:1px solid #eee;"/>
                    <p style="color:#aaa;font-size:12px;">If you did not create a SportMap account, you can safely ignore this email.</p>
                </div>
                """
        };

        using var client = new SmtpClient();
        await client.ConnectAsync(_settings.SmtpHost, _settings.SmtpPort, SecureSocketOptions.Auto);

        if (!string.IsNullOrEmpty(_settings.Username))
            await client.AuthenticateAsync(_settings.Username, _settings.Password);

        await client.SendAsync(message);
        await client.DisconnectAsync(true);
    }
}
