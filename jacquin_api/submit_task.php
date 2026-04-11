<?php
// submit_task.php
require_once 'config/cors.php';
header("Content-Type: application/json; charset=UTF-8");

require_once __DIR__ . '/config/connection.php';
require_once __DIR__ . '/helpers/PathHelper.php';

try {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        throw new Exception("Method not allowed");
    }

    $assignmentId = $_POST['assignment_id'] ?? null;
    $studentId = $_POST['student_id'] ?? null;
    $text = $_POST['text_content'] ?? '';

    if (!$assignmentId || !$studentId) {
        throw new Exception("Missing assignment_id or student_id");
    }

    $fileUrl = null;

    // Handle File Upload
    if (isset($_FILES['file']) && $_FILES['file']['error'] === UPLOAD_ERR_OK) {
        $baseDir = PathHelper::getUploadBaseDir();
        $uploadDir = $baseDir . 'uploads' . DIRECTORY_SEPARATOR . 'submissions' . DIRECTORY_SEPARATOR;
        PathHelper::ensureDir($uploadDir);

        $fileName = time() . '_' . basename($_FILES['file']['name']);
        $targetPath = $uploadDir . $fileName;

        if (move_uploaded_file($_FILES['file']['tmp_name'], $targetPath)) {
            $fileUrl = 'uploads/submissions/' . $fileName; // Relative path for web
        } else {
            throw new Exception("Failed to upload file");
        }
    }

    // Check if submission already exists
    $stmt = $pdo->prepare("SELECT id FROM student_submissions WHERE assignment_id = ? AND student_id = ?");
    $stmt->execute([$assignmentId, $studentId]);
    $existing = $stmt->fetch();

    if ($existing) {
        // Update
        $sql = "UPDATE student_submissions SET submission_text = ?, submitted_at = NOW(), status = 'submitted'";
        $params = [$text];

        if ($fileUrl) {
            $sql .= ", submission_url = ?";
            $params[] = $fileUrl;
        }

        $sql .= " WHERE id = ?";
        $params[] = $existing['id'];

        $stmt = $pdo->prepare($sql);
        $stmt->execute($params);
    } else {
        // Insert
        $sql = "INSERT INTO student_submissions (assignment_id, student_id, submission_text, submission_url, status, submitted_at) VALUES (?, ?, ?, ?, 'submitted', NOW())";
        $stmt = $pdo->prepare($sql);
        $stmt->execute([$assignmentId, $studentId, $text, $fileUrl]);
    }

    echo json_encode(["success" => true, "message" => "Tarea entregada correctamente", "file_url" => $fileUrl]);

} catch (Exception $e) {
    echo json_encode(["success" => false, "message" => $e->getMessage()]);
}
?>