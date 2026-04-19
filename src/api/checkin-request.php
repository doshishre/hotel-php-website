<?php
/**
 * Hotel QR Check-in System — PHP API
 * POST /api/checkin-request
 * GET  /api/hotel/{hotelId}
 */

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

// ── DB Config ──────────────────────────────────────────────
define('DB_HOST', 'shreyanshhotel.database.windows.net');
define('DB_NAME', 'hotel_checkin');
define('DB_USER', 'shreyanshdoshi');
define('DB_PASS', '1!Silver1980');
define('UPLOAD_DIR',  __DIR__ . '/../uploads/');
define('MAX_FILE_SIZE', 2 * 1024 * 1024);
define('ALLOWED_MIME',  ['image/jpeg', 'image/png', 'application/pdf']);
define('AADHAAR_KEY',   'HotelCheckin2024SecureKey!@#$%^&');
 
function getDB(): PDO {
    static $pdo = null;
    if ($pdo !== null) return $pdo;

    $host = getenv('DB_HOST') ?: 'localhost';
    $name = getenv('DB_NAME') ?: 'hotel_checkin';
    $user = getenv('DB_USER') ?: 'sa';
    $pass = getenv('DB_PASS') ?: 'your_password';

    // Azure SQL uses named server, no port needed
    $dsn = "sqlsrv:Server={$host};Database={$name};Encrypt=yes;TrustServerCertificate=no";

    $pdo = new PDO($dsn, $user, $pass, [
        PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    ]);

    return $pdo;
}
 
function respond(int $code, array $data): void {
    http_response_code($code);
    echo json_encode($data, JSON_UNESCAPED_UNICODE);
    exit;
}
 
function generateRequestId(): string {
    $date   = date('Ymd');
    $random = strtoupper(substr(bin2hex(random_bytes(4)), 0, 6));
    return "CHK-{$date}-{$random}";
}
 
function encryptAadhaar(string $plain): string {
    $iv        = random_bytes(16);
    $encrypted = openssl_encrypt($plain, 'AES-256-CBC', AADHAAR_KEY, 0, $iv);
    return base64_encode($iv . $encrypted);
}
 
function hashAadhaar(string $plain): string {
    return hash('sha256', $plain . AADHAAR_KEY);
}
 
function validateMobile(string $val): bool {
    return (bool) preg_match('/^[6-9]\d{9}$/', $val);
}
 
function validateDate(string $val): bool {
    $d = DateTime::createFromFormat('Y-m-d', $val);
    return $d && $d->format('Y-m-d') === $val;
}
 
function sanitizeStr(string $s, int $max = 255): string {
    return htmlspecialchars(trim(substr($s, 0, $max)), ENT_QUOTES, 'UTF-8');
}
 
function handleFileUpload(array $file, string $prefix): ?string {
    if (!isset($file['tmp_name']) || $file['error'] !== UPLOAD_ERR_OK) return null;
    if ($file['size'] > MAX_FILE_SIZE) return null;
    $finfo = new finfo(FILEINFO_MIME_TYPE);
    $mime  = $finfo->file($file['tmp_name']);
    if (!in_array($mime, ALLOWED_MIME, true)) return null;
    $ext = match ($mime) {
        'image/jpeg'      => 'jpg',
        'image/png'       => 'png',
        'application/pdf' => 'pdf',
        default           => ''
    };
    if (!is_dir(UPLOAD_DIR)) mkdir(UPLOAD_DIR, 0750, true);
    $filename = $prefix . '_' . bin2hex(random_bytes(8)) . '.' . $ext;
    if (!move_uploaded_file($file['tmp_name'], UPLOAD_DIR . $filename)) return null;
    return 'uploads/' . $filename;
}
 
$method = $_SERVER['REQUEST_METHOD'];
 
// GET checkin-request.php?hotel={hotelId}
if ($method === 'GET' && isset($_GET['hotel'])) {
    $hotelId = sanitizeStr($_GET['hotel'], 64);
    try {
        $stmt = getDB()->prepare(
            "SELECT hotel_id, name, address, contact, logo_url
             FROM   hotels WHERE hotel_id = :hotel_id"
        );
        $stmt->execute([':hotel_id' => $hotelId]);
        $hotel = $stmt->fetch();
        if (!$hotel) respond(404, ['error' => 'Hotel not found']);
        respond(200, ['success' => true, 'hotel' => $hotel]);
    } catch (Exception $e) {
        error_log($e->getMessage());
        respond(500, ['error' => 'Database error: ' . $e->getMessage()]);
    }
}
 
// POST checkin-request.php
if ($method === 'POST') {
    $contentType = $_SERVER['CONTENT_TYPE'] ?? '';
$body = (strpos($contentType, 'application/json') !== false)
        ? json_decode(file_get_contents('php://input'), true)
        : $_POST;
 
    if (!$body) respond(400, ['error' => 'Invalid or empty request body']);
 
    $fullName = sanitizeStr($body['primaryGuest']['fullName'] ?? '');
    $mobile   = preg_replace('/\D/', '', $body['primaryGuest']['mobile'] ?? '');
    $email    = filter_var($body['primaryGuest']['email'] ?? '', FILTER_SANITIZE_EMAIL);
    $aadhaar  = $body['primaryGuest']['aadhaar'] ?? '';
    $errors   = [];
 
    if (empty($fullName))         $errors[] = 'Full name is required';
    if (!validateMobile($mobile)) $errors[] = 'Invalid mobile number';
    if (empty($aadhaar))          $errors[] = 'Aadhaar is required';
 
    $stay         = $body['stayDetails'] ?? [];
    $numGuests    = max(1, min(10, (int)($stay['numGuests']   ?? 1)));
    $roomType     = in_array($stay['roomType'] ?? '', ['standard','deluxe','suite'])
                        ? $stay['roomType'] : 'standard';
    $checkinDate  = $stay['checkinDate']  ?? '';
    $checkoutDate = $stay['checkoutDate'] ?? '';
    $travelFrom   = sanitizeStr($stay['travelFrom']   ?? '');
    $travelMethod = in_array($stay['travelMethod'] ?? '', ['car','train','flight','other'])
                        ? $stay['travelMethod'] : 'other';
    $hotelId      = sanitizeStr($body['hotelId'] ?? '', 64);
 
    if (!validateDate($checkinDate))  $errors[] = 'Invalid check-in date';
    if (!validateDate($checkoutDate)) $errors[] = 'Invalid check-out date';
    if ($checkoutDate && $checkinDate && $checkoutDate <= $checkinDate)
                                      $errors[] = 'Check-out must be after check-in';
    if (empty($hotelId))              $errors[] = 'Hotel ID is required';
 
    if (!empty($errors)) respond(422, ['error' => 'Validation failed', 'details' => $errors]);
 
    $aadhaarEnc   = $aadhaar;
    $aadhaarHash  = hash('sha256', $aadhaarEnc . AADHAAR_KEY);
    $aadhaarLast4 = $body['primaryGuest']['aadhaarLast4'] ?? '0000';
 
    $requestId   = generateRequestId();
    $idProofPath = handleFileUpload($_FILES['idProof'] ?? [], 'idproof_' . $requestId);
    $photoPath   = handleFileUpload($_FILES['photo']   ?? [], 'photo_'   . $requestId);
 
    try {
        $db = getDB();
        $db->beginTransaction();
 
        $hStmt = $db->prepare("SELECT hotel_id FROM hotels WHERE hotel_id = :hotel_id");
        $hStmt->execute([':hotel_id' => $hotelId]);
        if (!$hStmt->fetch()) {
            $db->rollBack();
            respond(404, ['error' => 'Hotel not found']);
        }
 
        $stmt = $db->prepare("
            INSERT INTO checkin_requests
                (request_id, hotel_id, full_name, mobile, email,
                 aadhaar_hash, aadhaar_last4, aadhaar_enc,
                 num_guests, room_type, checkin_date, checkout_date,
                 travel_from, travel_method, id_proof_path, photo_path,
                 ip_address, user_agent)
            VALUES
                (:request_id, :hotel_id, :full_name, :mobile, :email,
                 :aadhaar_hash, :aadhaar_last4, :aadhaar_enc,
                 :num_guests, :room_type, :checkin_date, :checkout_date,
                 :travel_from, :travel_method, :id_proof_path, :photo_path,
                 :ip_address, :user_agent)
        ");
 
        $stmt->execute([
            ':request_id'    => $requestId,
            ':hotel_id'      => $hotelId,
            ':full_name'     => $fullName,
            ':mobile'        => $mobile,
            ':email'         => $email ?: null,
            ':aadhaar_hash'  => $aadhaarHash,
            ':aadhaar_last4' => $aadhaarLast4,
            ':aadhaar_enc'   => $aadhaarEnc,
            ':num_guests'    => $numGuests,
            ':room_type'     => $roomType,
            ':checkin_date'  => $checkinDate,
            ':checkout_date' => $checkoutDate,
            ':travel_from'   => $travelFrom ?: null,
            ':travel_method' => $travelMethod,
            ':id_proof_path' => $idProofPath,
            ':photo_path'    => $photoPath,
            ':ip_address'    => $_SERVER['REMOTE_ADDR'] ?? null,
            ':user_agent'    => substr($_SERVER['HTTP_USER_AGENT'] ?? '', 0, 512),
        ]);
 
        $members = $body['members'] ?? [];
        foreach (array_slice($members, 0, 9) as $i => $member) {
            $mName    = sanitizeStr($member['fullName'] ?? '');
            $mAadhaar = $member['aadhaar'] ?? '';
 
            if (empty($mName) || empty($mAadhaar)) continue;
 
            $mHash   = hash('sha256', $mAadhaar . AADHAAR_KEY);
            $mLast4  = $member['aadhaarLast4'] ?? '0000';
            $mAge    = isset($member['age']) && $member['age'] !== '' ? (int)$member['age'] : null;
            $mGender = in_array($member['gender'] ?? '', ['male','female','other','prefer_not_to_say'])
                           ? $member['gender'] : null;
            $mPhoto  = handleFileUpload(
                $_FILES["member_{$i}_photo"] ?? [],
                "member_{$i}_{$requestId}"
            );
 
            $mStmt = $db->prepare("
                INSERT INTO guest_members
                    (request_id, member_index, full_name,
                     aadhaar_hash, aadhaar_last4, aadhaar_enc,
                     age, gender, photo_path)
                VALUES
                    (:request_id, :member_index, :full_name,
                     :aadhaar_hash, :aadhaar_last4, :aadhaar_enc,
                     :age, :gender, :photo_path)
            ");
 
            $mStmt->execute([
                ':request_id'    => $requestId,
                ':member_index'  => $i + 1,
                ':full_name'     => $mName,
                ':aadhaar_hash'  => $mHash,
                ':aadhaar_last4' => $mLast4,
                ':aadhaar_enc'   => $mAadhaar,
                ':age'           => $mAge,
                ':gender'        => $mGender,
                ':photo_path'    => $mPhoto,
            ]);
        }
 
        $db->commit();
 
        respond(201, [
            'success'   => true,
            'requestId' => $requestId,
            'status'    => 'pending',
            'message'   => 'Check-in request submitted successfully. Please wait for hotel approval.',
        ]);
 
    } catch (Exception $e) {
        if (isset($db)) $db->rollBack();
        error_log($e->getMessage());
        respond(500, ['error' => 'Submission failed: ' . $e->getMessage()]);
    }
}

respond(400, ['error' => 'Invalid request method or missing parameters']);