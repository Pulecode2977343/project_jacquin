<?php
// admin_migrate_teachers.php
// Script to migrate from 1:1 teacher assignment to Many-to-Many
include_once 'config/connection.php';
header('Content-Type: text/plain');

try {
    $pdo->beginTransaction();

    // 1. Create table if not exists
    $sql = "
    CREATE TABLE IF NOT EXISTS schedule_teachers (
        id_assignment INT AUTO_INCREMENT PRIMARY KEY,
        id_schedule INT NOT NULL,
        id_teacher INT NOT NULL,
        assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX (id_schedule),
        INDEX (id_teacher),
        FOREIGN KEY (id_schedule) REFERENCES schedules(id_schedule) ON DELETE CASCADE,
        FOREIGN KEY (id_teacher) REFERENCES usuario(id_usuario) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    ";
    $pdo->exec($sql);
    echo "Table 'schedule_teachers' created or already exists.\n";

    // 2. Migrate existing data
    // Only migrate if table is empty to avoid duplicates on re-run
    $check = $pdo->query("SELECT COUNT(*) FROM schedule_teachers")->fetchColumn();
    if ($check == 0) {
        // Select existing assignments where teacher_id IS NOT NULL
        // Note: We need to check if 'teacher_id' column still exists in 'schedules'
        // We will assume it does for now.
        $sqlMigrate = "
            INSERT INTO schedule_teachers (id_schedule, id_teacher)
            SELECT id_schedule, teacher_id
            FROM schedules
            WHERE teacher_id IS NOT NULL
        ";
        $count = $pdo->exec($sqlMigrate);
        echo "Migrated $count existing assignments.\n";
    } else {
        echo "Data already exists in 'schedule_teachers', skipping migration.\n";
    }

    $pdo->commit();
    echo "Migration completed successfully.";

} catch (Exception $e) {
    $pdo->rollBack();
    echo "Error: " . $e->getMessage();
}
?>
