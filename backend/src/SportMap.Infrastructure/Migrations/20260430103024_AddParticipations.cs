using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SportMap.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddParticipations : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Participations_ActivityId_UserId",
                table: "Participations");

            migrationBuilder.DropIndex(
                name: "IX_Participations_UserId",
                table: "Participations");

            migrationBuilder.AddColumn<string>(
                name: "Status",
                table: "Participations",
                type: "nvarchar(20)",
                maxLength: 20,
                nullable: false,
                defaultValue: "");

            migrationBuilder.CreateIndex(
                name: "IX_Participations_ActivityId",
                table: "Participations",
                column: "ActivityId");

            migrationBuilder.CreateIndex(
                name: "IX_Participations_UserId_ActivityId",
                table: "Participations",
                columns: new[] { "UserId", "ActivityId" },
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Participations_ActivityId",
                table: "Participations");

            migrationBuilder.DropIndex(
                name: "IX_Participations_UserId_ActivityId",
                table: "Participations");

            migrationBuilder.DropColumn(
                name: "Status",
                table: "Participations");

            migrationBuilder.CreateIndex(
                name: "IX_Participations_ActivityId_UserId",
                table: "Participations",
                columns: new[] { "ActivityId", "UserId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Participations_UserId",
                table: "Participations",
                column: "UserId");
        }
    }
}
