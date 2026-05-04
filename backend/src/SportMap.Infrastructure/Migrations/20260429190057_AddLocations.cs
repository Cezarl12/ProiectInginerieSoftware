using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SportMap.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddLocations : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Details",
                table: "Locations");

            migrationBuilder.DropColumn(
                name: "MainPhotoUrl",
                table: "Locations");

            migrationBuilder.DropColumn(
                name: "SecondaryPhotoUrls",
                table: "Locations");

            migrationBuilder.AlterColumn<string>(
                name: "Name",
                table: "Locations",
                type: "nvarchar(100)",
                maxLength: 100,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(200)",
                oldMaxLength: 200);

            migrationBuilder.AlterColumn<decimal>(
                name: "Longitude",
                table: "Locations",
                type: "decimal(9,6)",
                nullable: false,
                oldClrType: typeof(double),
                oldType: "float");

            migrationBuilder.AlterColumn<decimal>(
                name: "Latitude",
                table: "Locations",
                type: "decimal(9,6)",
                nullable: false,
                oldClrType: typeof(double),
                oldType: "float");

            migrationBuilder.AlterColumn<string>(
                name: "Address",
                table: "Locations",
                type: "nvarchar(200)",
                maxLength: 200,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(400)",
                oldMaxLength: 400);

            migrationBuilder.AddColumn<bool>(
                name: "HasLights",
                table: "Locations",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<int>(
                name: "ProposedByUserId",
                table: "Locations",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Sports",
                table: "Locations",
                type: "nvarchar(255)",
                maxLength: 255,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "Surface",
                table: "Locations",
                type: "nvarchar(50)",
                maxLength: 50,
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "UpdatedAt",
                table: "Locations",
                type: "datetime2",
                nullable: true);

            migrationBuilder.UpdateData(
                table: "Locations",
                keyColumn: "Id",
                keyValue: 1,
                columns: new[] { "HasLights", "Latitude", "Longitude", "ProposedByUserId", "Sports", "Surface", "UpdatedAt" },
                values: new object[] { true, 47.051100m, 21.923900m, null, "football", "grass", null });

            migrationBuilder.UpdateData(
                table: "Locations",
                keyColumn: "Id",
                keyValue: 2,
                columns: new[] { "HasLights", "Latitude", "Longitude", "ProposedByUserId", "Sports", "Surface", "UpdatedAt" },
                values: new object[] { true, 47.062800m, 21.911300m, null, "swimming", null, null });

            migrationBuilder.UpdateData(
                table: "Locations",
                keyColumn: "Id",
                keyValue: 3,
                columns: new[] { "Latitude", "Longitude", "ProposedByUserId", "Sports", "Surface", "UpdatedAt" },
                values: new object[] { 47.055100m, 21.933100m, null, "cycling", "asphalt", null });

            migrationBuilder.UpdateData(
                table: "Locations",
                keyColumn: "Id",
                keyValue: 4,
                columns: new[] { "HasLights", "Latitude", "Longitude", "ProposedByUserId", "Sports", "Surface", "UpdatedAt" },
                values: new object[] { true, 47.071200m, 21.928700m, null, "tennis", "clay", null });

            migrationBuilder.UpdateData(
                table: "Locations",
                keyColumn: "Id",
                keyValue: 5,
                columns: new[] { "HasLights", "Latitude", "Longitude", "ProposedByUserId", "Sports", "Surface", "UpdatedAt" },
                values: new object[] { true, 47.062100m, 21.907300m, null, "basketball,handball", "hardcourt", null });

            migrationBuilder.UpdateData(
                table: "Locations",
                keyColumn: "Id",
                keyValue: 6,
                columns: new[] { "HasLights", "Latitude", "Longitude", "ProposedByUserId", "Sports", "Surface", "UpdatedAt" },
                values: new object[] { true, 47.046900m, 21.933200m, null, "volleyball,basketball,badminton", "hardcourt", null });

            migrationBuilder.UpdateData(
                table: "Locations",
                keyColumn: "Id",
                keyValue: 7,
                columns: new[] { "Latitude", "Longitude", "ProposedByUserId", "Sports", "Surface", "UpdatedAt" },
                values: new object[] { 47.051200m, 21.924100m, null, "athletics", "tartan", null });

            migrationBuilder.UpdateData(
                table: "Locations",
                keyColumn: "Id",
                keyValue: 8,
                columns: new[] { "HasLights", "Latitude", "Longitude", "ProposedByUserId", "Sports", "Surface", "UpdatedAt" },
                values: new object[] { true, 47.052100m, 21.920100m, null, "handball", "hardcourt", null });

            migrationBuilder.UpdateData(
                table: "Locations",
                keyColumn: "Id",
                keyValue: 9,
                columns: new[] { "HasLights", "Latitude", "Longitude", "ProposedByUserId", "Sports", "Surface", "UpdatedAt" },
                values: new object[] { true, 47.047800m, 21.919400m, null, "fitness", null, null });

            migrationBuilder.UpdateData(
                table: "Locations",
                keyColumn: "Id",
                keyValue: 10,
                columns: new[] { "HasLights", "Latitude", "Longitude", "ProposedByUserId", "Sports", "Surface", "UpdatedAt" },
                values: new object[] { true, 47.046500m, 21.918900m, null, "boxing", null, null });

            migrationBuilder.CreateIndex(
                name: "IX_Locations_Latitude_Longitude",
                table: "Locations",
                columns: new[] { "Latitude", "Longitude" });

            migrationBuilder.CreateIndex(
                name: "IX_Locations_ProposedByUserId",
                table: "Locations",
                column: "ProposedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_Locations_Status",
                table: "Locations",
                column: "Status");

            migrationBuilder.AddForeignKey(
                name: "FK_Locations_Users_ProposedByUserId",
                table: "Locations",
                column: "ProposedByUserId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Locations_Users_ProposedByUserId",
                table: "Locations");

            migrationBuilder.DropIndex(
                name: "IX_Locations_Latitude_Longitude",
                table: "Locations");

            migrationBuilder.DropIndex(
                name: "IX_Locations_ProposedByUserId",
                table: "Locations");

            migrationBuilder.DropIndex(
                name: "IX_Locations_Status",
                table: "Locations");

            migrationBuilder.DropColumn(
                name: "HasLights",
                table: "Locations");

            migrationBuilder.DropColumn(
                name: "ProposedByUserId",
                table: "Locations");

            migrationBuilder.DropColumn(
                name: "Sports",
                table: "Locations");

            migrationBuilder.DropColumn(
                name: "Surface",
                table: "Locations");

            migrationBuilder.DropColumn(
                name: "UpdatedAt",
                table: "Locations");

            migrationBuilder.AlterColumn<string>(
                name: "Name",
                table: "Locations",
                type: "nvarchar(200)",
                maxLength: 200,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(100)",
                oldMaxLength: 100);

            migrationBuilder.AlterColumn<double>(
                name: "Longitude",
                table: "Locations",
                type: "float",
                nullable: false,
                oldClrType: typeof(decimal),
                oldType: "decimal(9,6)");

            migrationBuilder.AlterColumn<double>(
                name: "Latitude",
                table: "Locations",
                type: "float",
                nullable: false,
                oldClrType: typeof(decimal),
                oldType: "decimal(9,6)");

            migrationBuilder.AlterColumn<string>(
                name: "Address",
                table: "Locations",
                type: "nvarchar(400)",
                maxLength: 400,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(200)",
                oldMaxLength: 200);

            migrationBuilder.AddColumn<string>(
                name: "Details",
                table: "Locations",
                type: "nvarchar(1000)",
                maxLength: 1000,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "MainPhotoUrl",
                table: "Locations",
                type: "nvarchar(500)",
                maxLength: 500,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "SecondaryPhotoUrls",
                table: "Locations",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.UpdateData(
                table: "Locations",
                keyColumn: "Id",
                keyValue: 1,
                columns: new[] { "Details", "Latitude", "Longitude", "MainPhotoUrl", "SecondaryPhotoUrls" },
                values: new object[] { "Stadionul Municipal Iuliu Bodola este principala arenă de fotbal din Oradea, cu o capacitate de 19.000 de locuri. Dispune de teren de gazon natural, vestiare moderne și tribune acoperite.", 47.051099999999998, 21.9239, "https://picsum.photos/seed/stadion-oradea/800/500", "[\"https://picsum.photos/seed/stadion-oradea-2/800/500\",\"https://picsum.photos/seed/stadion-oradea-3/800/500\"]" });

            migrationBuilder.UpdateData(
                table: "Locations",
                keyColumn: "Id",
                keyValue: 2,
                columns: new[] { "Details", "Latitude", "Longitude", "MainPhotoUrl", "SecondaryPhotoUrls" },
                values: new object[] { "Bazin olimpic acoperit cu 8 culoare, lungime 50m. Ideal pentru antrenamente de înot competițional și recreațional. Dispune de bazin de sărituri și saune.", 47.062800000000003, 21.911300000000001, "https://picsum.photos/seed/piscina-oradea/800/500", "[\"https://picsum.photos/seed/piscina-oradea-2/800/500\",\"https://picsum.photos/seed/piscina-oradea-3/800/500\"]" });

            migrationBuilder.UpdateData(
                table: "Locations",
                keyColumn: "Id",
                keyValue: 3,
                columns: new[] { "Details", "Latitude", "Longitude", "MainPhotoUrl", "SecondaryPhotoUrls" },
                values: new object[] { "Pistă dedicată ciclismului în Parcul Brătianu, cu o lungime de 3,5 km. Suprafață asfaltată, separată de trafic, înconjurată de vegetație. Acces liber, deschis publicului.", 47.055100000000003, 21.9331, "https://picsum.photos/seed/ciclism-oradea/800/500", "[\"https://picsum.photos/seed/ciclism-oradea-2/800/500\",\"https://picsum.photos/seed/ciclism-oradea-3/800/500\"]" });

            migrationBuilder.UpdateData(
                table: "Locations",
                keyColumn: "Id",
                keyValue: 4,
                columns: new[] { "Details", "Latitude", "Longitude", "MainPhotoUrl", "SecondaryPhotoUrls" },
                values: new object[] { "Complex cu 6 terenuri de tenis (4 zgură, 2 hard), iluminat nocturn, sală de forță și vestiare. Găzduiește turnee locale și regionale pe tot parcursul anului.", 47.071199999999997, 21.928699999999999, "https://picsum.photos/seed/tenis-oradea/800/500", "[\"https://picsum.photos/seed/tenis-oradea-2/800/500\",\"https://picsum.photos/seed/tenis-oradea-3/800/500\"]" });

            migrationBuilder.UpdateData(
                table: "Locations",
                keyColumn: "Id",
                keyValue: 5,
                columns: new[] { "Details", "Latitude", "Longitude", "MainPhotoUrl", "SecondaryPhotoUrls" },
                values: new object[] { "Sală polivalentă modernă cu o capacitate de 5.000 de locuri. Teren de baschet omologat FIBA, folosit pentru meciurile echipei CSM Oradea. Dispune de parcare, restaurant și magazine.", 47.062100000000001, 21.907299999999999, "https://picsum.photos/seed/arena-oradea/800/500", "[\"https://picsum.photos/seed/arena-oradea-2/800/500\",\"https://picsum.photos/seed/arena-oradea-3/800/500\"]" });

            migrationBuilder.UpdateData(
                table: "Locations",
                keyColumn: "Id",
                keyValue: 6,
                columns: new[] { "Details", "Latitude", "Longitude", "MainPhotoUrl", "SecondaryPhotoUrls" },
                values: new object[] { "Sală universitară cu terenuri de volei, baschet și badminton. Folosită pentru competiții studențești și antrenamente de club. Program extins în weekenduri.", 47.046900000000001, 21.933199999999999, "https://picsum.photos/seed/sala-uni-oradea/800/500", "[\"https://picsum.photos/seed/sala-uni-oradea-2/800/500\",\"https://picsum.photos/seed/sala-uni-oradea-3/800/500\"]" });

            migrationBuilder.UpdateData(
                table: "Locations",
                keyColumn: "Id",
                keyValue: 7,
                columns: new[] { "Details", "Latitude", "Longitude", "MainPhotoUrl", "SecondaryPhotoUrls" },
                values: new object[] { "Pistă de atletism cu 8 culoare, suprafață tartan omologată IAAF. Include sectoare pentru sărituri în lungime, înălțime și aruncări. Deschisă publicului în afara competițiilor.", 47.051200000000001, 21.924099999999999, "https://picsum.photos/seed/atletism-oradea/800/500", "[\"https://picsum.photos/seed/atletism-oradea-2/800/500\",\"https://picsum.photos/seed/atletism-oradea-3/800/500\"]" });

            migrationBuilder.UpdateData(
                table: "Locations",
                keyColumn: "Id",
                keyValue: 8,
                columns: new[] { "Details", "Latitude", "Longitude", "MainPhotoUrl", "SecondaryPhotoUrls" },
                values: new object[] { "Sală cu capacitate de 2.500 locuri, dedicată handbalului și altor sporturi de sală. Teren omologat EHF, iluminat profesional și sistem de sonorizare.", 47.052100000000003, 21.920100000000001, "https://picsum.photos/seed/sala-sport-oradea/800/500", "[\"https://picsum.photos/seed/sala-sport-oradea-2/800/500\",\"https://picsum.photos/seed/sala-sport-oradea-3/800/500\"]" });

            migrationBuilder.UpdateData(
                table: "Locations",
                keyColumn: "Id",
                keyValue: 9,
                columns: new[] { "Details", "Latitude", "Longitude", "MainPhotoUrl", "SecondaryPhotoUrls" },
                values: new object[] { "Centru fitness modern în inima Oradei, cu echipamente cardio și de forță de ultimă generație. Clase de grup, personal traineri certificați, saună și zone de stretching.", 47.047800000000002, 21.9194, "https://picsum.photos/seed/fitness-oradea/800/500", "[\"https://picsum.photos/seed/fitness-oradea-2/800/500\",\"https://picsum.photos/seed/fitness-oradea-3/800/500\"]" });

            migrationBuilder.UpdateData(
                table: "Locations",
                keyColumn: "Id",
                keyValue: 10,
                columns: new[] { "Details", "Latitude", "Longitude", "MainPhotoUrl", "SecondaryPhotoUrls" },
                values: new object[] { "Sala Clubului Sportiv Crișul, cu ring omologat pentru competiții naționale, saci de box, apărători și echipament complet. Antrenori cu experiență internațională.", 47.046500000000002, 21.918900000000001, "https://picsum.photos/seed/box-oradea/800/500", "[\"https://picsum.photos/seed/box-oradea-2/800/500\",\"https://picsum.photos/seed/box-oradea-3/800/500\"]" });
        }
    }
}
