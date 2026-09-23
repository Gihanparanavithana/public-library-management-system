<?php
session_start();
require_once __DIR__ . '/../config/database.php';
header('Content-Type: application/json; charset=utf-8');
$q = trim($_GET['q'] ?? '');
$category = trim($_GET['category'] ?? '');
$sql = 'SELECT id,title,author,isbn,publisher,category,year_published,pages,total_copies,available_copies,cover_image,synopsis FROM books WHERE 1=1';
$params=[];
if($q!==''){ $sql.=' AND (title LIKE ? OR author LIKE ? OR isbn LIKE ?)'; $like="%$q%"; $params=[$like,$like,$like]; }
if($category!==''){ $sql.=' AND category = ?'; $params[]=$category; }
$sql.=' ORDER BY created_at DESC';
$stmt=$pdo->prepare($sql);$stmt->execute($params);
echo json_encode(['success'=>true,'books'=>$stmt->fetchAll()]);
