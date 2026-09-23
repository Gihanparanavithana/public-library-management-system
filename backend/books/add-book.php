<?php
session_start();
require_once __DIR__ . '/../config/database.php';
header('Content-Type: application/json; charset=utf-8');
if(($_SESSION['role'] ?? '')!=='admin'){http_response_code(403);echo json_encode(['success'=>false,'message'=>'Admin access required.']);exit;}
$data=json_decode(file_get_contents('php://input'),true)??[];
$title=trim($data['title']??'');$author=trim($data['author']??'');$copies=(int)($data['total_copies']??0);
if($title===''||$author===''||$copies<1){http_response_code(422);echo json_encode(['success'=>false,'message'=>'Title, author and at least one copy are required.']);exit;}
$stmt=$pdo->prepare('INSERT INTO books(title,author,isbn,publisher,category,year_published,pages,total_copies,available_copies,cover_image,synopsis) VALUES(?,?,?,?,?,?,?,?,?,?,?)');
$stmt->execute([$title,$author,$data['isbn']??null,$data['publisher']??null,$data['category']??null,$data['year_published']??null,$data['pages']??null,$copies,$copies,$data['cover_image']??null,$data['synopsis']??null]);
echo json_encode(['success'=>true,'id'=>$pdo->lastInsertId()]);
