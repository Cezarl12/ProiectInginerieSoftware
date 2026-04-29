using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace SportMap.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddActivities : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "Status",
                table: "Locations",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AlterColumn<int>(
                name: "Type",
                table: "Activities",
                type: "int",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(20)",
                oldMaxLength: 20);

            migrationBuilder.AlterColumn<string>(
                name: "Title",
                table: "Activities",
                type: "nvarchar(100)",
                maxLength: 100,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(200)",
                oldMaxLength: 200);

            migrationBuilder.AlterColumn<string>(
                name: "Sport",
                table: "Activities",
                type: "nvarchar(50)",
                maxLength: 50,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(100)",
                oldMaxLength: 100);

            migrationBuilder.AddColumn<string>(
                name: "Description",
                table: "Activities",
                type: "nvarchar(500)",
                maxLength: 500,
                nullable: true);

            migrationBuilder.InsertData(
                table: "Locations",
                columns: new[] { "Id", "Address", "CreatedAt", "Latitude", "Longitude", "Name", "Status" },
                values: new object[,]
                {
                    { 1, "Str. General Magheru 1, Oradea", new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 47.051099999999998, 21.9239, "Stadionul Municipal Iuliu Bodola", 1 },
                    { 2, "Str. Politehnicii 1, Oradea", new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 47.062800000000003, 21.911300000000001, "Baza Olimpică de Natație Oradea", 1 },
                    { 3, "Calea Bihorului 100, Oradea", new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 47.055100000000003, 21.9331, "Pista de Ciclism Parcul Brătianu", 1 },
                    { 4, "Calea Sântandrei 77, Oradea", new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 47.071199999999997, 21.928699999999999, "Complexul de Tenis Lotus", 1 },
                    { 5, "Calea Borșului 35, Oradea", new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 47.062100000000001, 21.907299999999999, "XT Gold Arena", 1 },
                    { 6, "Str. Universității 1, Oradea", new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 47.046900000000001, 21.933199999999999, "Sala de Sport a Universității", 1 },
                    { 7, "Str. General Magheru 1, Oradea", new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 47.051200000000001, 21.924099999999999, "Pista de Atletism Iuliu Bodola", 1 },
                    { 8, "Str. Menumorut 3, Oradea", new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 47.052100000000003, 21.920100000000001, "Sala Sporturilor Oradea", 1 },
                    { 9, "Piața Unirii 4, Oradea", new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 47.047800000000002, 21.9194, "Centrul Fitness SportMap Park", 1 },
                    { 10, "Str. Republicii 22, Oradea", new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 47.046500000000002, 21.918900000000001, "Sala de Box Crișul", 1 }
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                table: "Locations",
                keyColumn: "Id",
                keyValue: 1);

            migrationBuilder.DeleteData(
                table: "Locations",
                keyColumn: "Id",
                keyValue: 2);

            migrationBuilder.DeleteData(
                table: "Locations",
                keyColumn: "Id",
                keyValue: 3);

            migrationBuilder.DeleteData(
                table: "Locations",
                keyColumn: "Id",
                keyValue: 4);

            migrationBuilder.DeleteData(
                table: "Locations",
                keyColumn: "Id",
                keyValue: 5);

            migrationBuilder.DeleteData(
                table: "Locations",
                keyColumn: "Id",
                keyValue: 6);

            migrationBuilder.DeleteData(
                table: "Locations",
                keyColumn: "Id",
                keyValue: 7);

            migrationBuilder.DeleteData(
                table: "Locations",
                keyColumn: "Id",
                keyValue: 8);

            migrationBuilder.DeleteData(
                table: "Locations",
                keyColumn: "Id",
                keyValue: 9);

            migrationBuilder.DeleteData(
                table: "Locations",
                keyColumn: "Id",
                keyValue: 10);

            migrationBuilder.DropColumn(
                name: "Status",
                table: "Locations");

            migrationBuilder.DropColumn(
                name: "Description",
                table: "Activities");

            migrationBuilder.AlterColumn<string>(
                name: "Type",
                table: "Activities",
                type: "nvarchar(20)",
                maxLength: 20,
                nullable: false,
                oldClrType: typeof(int),
                oldType: "int");

            migrationBuilder.AlterColumn<string>(
                name: "Title",
                table: "Activities",
                type: "nvarchar(200)",
                maxLength: 200,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(100)",
                oldMaxLength: 100);

            migrationBuilder.AlterColumn<string>(
                name: "Sport",
                table: "Activities",
                type: "nvarchar(100)",
                maxLength: 100,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(50)",
                oldMaxLength: 50);
        }
    }
}
