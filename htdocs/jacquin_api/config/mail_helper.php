<?php
function sendEmailNotification($to, $subject, $body)
{
    // 1. Log to file (Reliable for Development)
    $logEntry = "[" . date('Y-m-d H:i:s') . "] TO: $to | SUBJECT: $subject | BODY: $body" . PHP_EOL;
    @file_put_contents(__DIR__ . '/../../email_logs.txt', $logEntry, FILE_APPEND);

    // 2. Try PHP mail() - Might fail or stick in queue on Localhost
    $headers = "From: no-reply@jacquin.com\r\n";
    $headers .= "Content-Type: text/html; charset=UTF-8\r\n";

    // Suppress errors to avoids breaking API responses
    @mail($to, $subject, $body, $headers);

    return true; // Always return true for dev flow
}
?>