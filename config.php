// config.php - Veritabanı bağlantı bilgileri
<?php
$servername = "localhost";
$username = "veritabani_kullanici_adi"; // Hosting'den alacağınız
$password = "veritabani_sifresi";       // Hosting'den alacağınız
$dbname = "veritabani_adi";             // Hosting'den alacağınız

$conn = new mysqli($servername, $username, $password, $dbname);

if ($conn->connect_error) {
    die("Bağlantı hatası: " . $conn->connect_error);
}
?>