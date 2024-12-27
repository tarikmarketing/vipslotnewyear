// save_data.php - Veri kaydetme API'si
<?php
header('Content-Type: application/json');
require_once 'config.php';

// POST verilerini al
$data = json_decode(file_get_contents('php://input'), true);
$username = $conn->real_escape_string($data['username']);
$prize = $conn->real_escape_string($data['prize']);
$attempts = intval($data['attempts']);

$sql = "INSERT INTO users (username, prize, attempts) 
        VALUES ('$username', '$prize', '$attempts')";

if ($conn->query($sql) === TRUE) {
    echo json_encode(["success" => true]);
} else {
    echo json_encode(["error" => $conn->error]);
}

$conn->close();
?>