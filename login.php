// login.php - Admin giriş sayfası
<?php
session_start();

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $username = $_POST['username'];
    $password = $_POST['password'];
    
    // Burada kendi belirlediğiniz kullanıcı adı ve şifreyi kontrol edin
    if ($username === 'admin' && $password === 'sifreniz') {
        $_SESSION['admin'] = true;
        header('Location: admin.php');
        exit();
    }
}
?>

<!DOCTYPE html>
<html>
<head>
    <title>Admin Giriş</title>
    <style>
        .login-form {
            max-width: 300px;
            margin: 50px auto;
            padding: 20px;
            border: 1px solid #ddd;
        }
        input {
            width: 100%;
            padding: 8px;
            margin: 8px 0;
        }
    </style>
</head>
<body>
    <form class="login-form" method="POST">
        <h2>Admin Giriş</h2>
        <input type="text" name="username" placeholder="Kullanıcı Adı" required>
        <input type="password" name="password" placeholder="Şifre" required>
        <input type="submit" value="Giriş">
    </form>
</body>
</html>