using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SportMap.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddLocationPhotos : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
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
                columns: new[] { "Details", "MainPhotoUrl", "SecondaryPhotoUrls" },
                values: new object[] { "Stadionul Municipal Iuliu Bodola este principala arenă de fotbal din Oradea, cu o capacitate de 19.000 de locuri. Dispune de teren de gazon natural, vestiare moderne și tribune acoperite.", "https://picsum.photos/seed/stadion-oradea/800/500", "[\"https://picsum.photos/seed/stadion-oradea-2/800/500\",\"https://picsum.photos/seed/stadion-oradea-3/800/500\"]" });

            migrationBuilder.UpdateData(
                table: "Locations",
                keyColumn: "Id",
                keyValue: 2,
                columns: new[] { "Details", "MainPhotoUrl", "SecondaryPhotoUrls" },
                values: new object[] { "Bazin olimpic acoperit cu 8 culoare, lungime 50m. Ideal pentru antrenamente de înot competițional și recreațional. Dispune de bazin de sărituri și saune.", "https://picsum.photos/seed/piscina-oradea/800/500", "[\"https://picsum.photos/seed/piscina-oradea-2/800/500\",\"https://picsum.photos/seed/piscina-oradea-3/800/500\"]" });

            migrationBuilder.UpdateData(
                table: "Locations",
                keyColumn: "Id",
                keyValue: 3,
                columns: new[] { "Details", "MainPhotoUrl", "SecondaryPhotoUrls" },
                values: new object[] { "Pistă dedicată ciclismului în Parcul Brătianu, cu o lungime de 3,5 km. Suprafață asfaltată, separată de trafic, înconjurată de vegetație. Acces liber, deschis publicului.", "https://picsum.photos/seed/ciclism-oradea/800/500", "[\"https://picsum.photos/seed/ciclism-oradea-2/800/500\",\"https://picsum.photos/seed/ciclism-oradea-3/800/500\"]" });

            migrationBuilder.UpdateData(
                table: "Locations",
                keyColumn: "Id",
                keyValue: 4,
                columns: new[] { "Details", "MainPhotoUrl", "SecondaryPhotoUrls" },
                values: new object[] { "Complex cu 6 terenuri de tenis (4 zgură, 2 hard), iluminat nocturn, sală de forță și vestiare. Găzduiește turnee locale și regionale pe tot parcursul anului.", "https://picsum.photos/seed/tenis-oradea/800/500", "[\"https://picsum.photos/seed/tenis-oradea-2/800/500\",\"https://picsum.photos/seed/tenis-oradea-3/800/500\"]" });

            migrationBuilder.UpdateData(
                table: "Locations",
                keyColumn: "Id",
                keyValue: 5,
                columns: new[] { "Details", "MainPhotoUrl", "SecondaryPhotoUrls" },
                values: new object[] { "Sală polivalentă modernă cu o capacitate de 5.000 de locuri. Teren de baschet omologat FIBA, folosit pentru meciurile echipei CSM Oradea. Dispune de parcare, restaurant și magazine.", "https://picsum.photos/seed/arena-oradea/800/500", "[\"https://picsum.photos/seed/arena-oradea-2/800/500\",\"https://picsum.photos/seed/arena-oradea-3/800/500\"]" });

            migrationBuilder.UpdateData(
                table: "Locations",
                keyColumn: "Id",
                keyValue: 6,
                columns: new[] { "Details", "MainPhotoUrl", "SecondaryPhotoUrls" },
                values: new object[] { "Sală universitară cu terenuri de volei, baschet și badminton. Folosită pentru competiții studențești și antrenamente de club. Program extins în weekenduri.", "https://picsum.photos/seed/sala-uni-oradea/800/500", "[\"https://picsum.photos/seed/sala-uni-oradea-2/800/500\",\"https://picsum.photos/seed/sala-uni-oradea-3/800/500\"]" });

            migrationBuilder.UpdateData(
                table: "Locations",
                keyColumn: "Id",
                keyValue: 7,
                columns: new[] { "Details", "MainPhotoUrl", "SecondaryPhotoUrls" },
                values: new object[] { "Pistă de atletism cu 8 culoare, suprafață tartan omologată IAAF. Include sectoare pentru sărituri în lungime, înălțime și aruncări. Deschisă publicului în afara competițiilor.", "https://picsum.photos/seed/atletism-oradea/800/500", "[\"https://picsum.photos/seed/atletism-oradea-2/800/500\",\"https://picsum.photos/seed/atletism-oradea-3/800/500\"]" });

            migrationBuilder.UpdateData(
                table: "Locations",
                keyColumn: "Id",
                keyValue: 8,
                columns: new[] { "Details", "MainPhotoUrl", "SecondaryPhotoUrls" },
                values: new object[] { "Sală cu capacitate de 2.500 locuri, dedicată handbalului și altor sporturi de sală. Teren omologat EHF, iluminat profesional și sistem de sonorizare.", "https://picsum.photos/seed/sala-sport-oradea/800/500", "[\"https://picsum.photos/seed/sala-sport-oradea-2/800/500\",\"https://picsum.photos/seed/sala-sport-oradea-3/800/500\"]" });

            migrationBuilder.UpdateData(
                table: "Locations",
                keyColumn: "Id",
                keyValue: 9,
                columns: new[] { "Details", "MainPhotoUrl", "SecondaryPhotoUrls" },
                values: new object[] { "Centru fitness modern în inima Oradei, cu echipamente cardio și de forță de ultimă generație. Clase de grup, personal traineri certificați, saună și zone de stretching.", "https://picsum.photos/seed/fitness-oradea/800/500", "[\"https://picsum.photos/seed/fitness-oradea-2/800/500\",\"https://picsum.photos/seed/fitness-oradea-3/800/500\"]" });

            migrationBuilder.UpdateData(
                table: "Locations",
                keyColumn: "Id",
                keyValue: 10,
                columns: new[] { "Details", "MainPhotoUrl", "SecondaryPhotoUrls" },
                values: new object[] { "Sala Clubului Sportiv Crișul, cu ring omologat pentru competiții naționale, saci de box, apărători și echipament complet. Antrenori cu experiență internațională.", "https://picsum.photos/seed/box-oradea/800/500", "[\"https://picsum.photos/seed/box-oradea-2/800/500\",\"https://picsum.photos/seed/box-oradea-3/800/500\"]" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
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
        }
    }
}
