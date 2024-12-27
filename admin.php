// admin.php - Admin paneli
<?php
session_start();
if(!isset($_SESSION['admin'])) {
    header('Location: login.php');
    exit();
}

require_once 'config.php';
$result = $conn->query("SELECT * FROM users ORDER BY created_at DESC");
?>

<!DOCTYPE html>
<html>
<head>
    <title>Admin Panel</title>
    <style>
        body { font-family: Arial, sans-serif; padding: 20px; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        th, td { padding: 12px; border: 1px solid #ddd; text-align: left; }
        th { background: #f5f5f5; }
        .header { display: flex; justify-content: space-between; align-items: center; }
        .export-btn { padding: 10px 20px; background: #4CAF50; color: white; border: none; cursor: pointer; }
    </style>
</head>
<body>
    <div class="header">
        <h2>Kullanıcı Kayıtları</h2>
        <button class="export-btn" onclick="exportToExcel()">Excel'e Aktar</button>
    </div>
    <table id="userTable">
        <tr>
            <th>Kullanıcı Adı</th>
            <th>Ödül</th>
            <th>Kalan Hak</th>
            <th>Tarih</th>
        </tr>
        <?php while($row = $result->fetch_assoc()): ?>
        <tr>
            <td><?php echo htmlspecialchars($row['username']); ?></td>
            <td><?php echo htmlspecialchars($row['prize']); ?></td>
            <td><?php echo htmlspecialchars($row['attempts']); ?></td>
            <td><?php echo $row['created_at']; ?></td>
        </tr>
        <?php endwhile; ?>
    </table>

    <script>
        function exportToExcel() {
            let table = document.getElementById("userTable");
            let html = table.outerHTML;
            let url = 'data:application/vnd.ms-excel,' + encodeURIComponent(html);
            let downloadLink = document.createElement("a");
            document.body.appendChild(downloadLink);
            downloadLink.href = url;
            downloadLink.download = 'kullanici_kayitlari.xls';
            downloadLink.click();
            document.body.removeChild(downloadLink);
        }
    </script>
</body>
</html>