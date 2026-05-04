using Microsoft.OpenApi.Models;
using Swashbuckle.AspNetCore.SwaggerGen;

namespace SportMap.API.Swagger;

internal sealed class TagDescriptionsDocumentFilter : IDocumentFilter
{
    public void Apply(OpenApiDocument swaggerDoc, DocumentFilterContext context)
    {
        swaggerDoc.Tags =
        [
            new OpenApiTag { Name = "Auth",       Description = "Înregistrare, autentificare, refresh token și logout" },
            new OpenApiTag { Name = "Users",       Description = "Gestionarea profilelor utilizatorilor" },
            new OpenApiTag { Name = "Activities",  Description = "Creare, listare și gestionare activități sportive" },
            new OpenApiTag { Name = "Health",      Description = "Monitorizarea stării serviciului" }
        ];
    }
}
