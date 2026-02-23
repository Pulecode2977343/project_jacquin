<?php
require_once '../config/cors.php';
header("Content-Type: application/json");
require_once __DIR__ . "/../config/connection.php";

// Recibir input JSON
$data = json_decode(file_get_contents("php://input"), true);

$full_name = $data["full_name"] ?? null;
$email     = $data["email"] ?? null;
$n_phone   = $data["n_phone"] ?? null;
$password  = $data["password"] ?? null;

// Validación básica
if(!$full_name || !$email || !$n_phone || !$password){
    echo json_encode(["error" => "Faltan campos"]);
    exit;
}

// Validación contraseña fuerte
$uppercase = preg_match('@[A-Z]@', $password);
$lowercase = preg_match('@[a-z]@', $password);
$number    = preg_match('@[0-9]@', $password);
$special   = preg_match('@[^\w]@', $password);

if(!$uppercase || !$lowercase || !$number || !$special || strlen($password) < 6){
    echo json_encode(["error" => "Contraseña débil"]);
    exit;
}

// 🔐 Hashear
$hash = password_hash($password, PASSWORD_BCRYPT);

// Verificar si ya existe el correo
$check = $pdo->prepare("SELECT email FROM usuario WHERE email = :email LIMIT 1");
$check->execute([":email" => $email]);

if($check->rowCount() > 0){
    echo json_encode(["error" => "Correo ya registrado"]);
    exit;
}


// Insert
try{

    $sql = "INSERT INTO usuario(full_name,email,n_phone,password,id_rol)
            VALUES(:full_name,:email,:n_phone,:password,3)";

    $stmt = $pdo->prepare($sql);
    $stmt->execute([
        ":full_name"=>$full_name,
        ":email"=>$email,
        ":n_phone"=>$n_phone,
        ":password"=>$hash,
    ]);

    echo json_encode([
        "success" => true,
        "message" => "Usuario registrado correctamente"
    ]);

}catch(PDOException $e){
    echo json_encode(["error" => "Error al registrar usuario"]);
}

