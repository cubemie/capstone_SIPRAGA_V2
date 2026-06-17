# SIPRAGA V2 — Diagram PlantUML
> Dibuat berdasarkan source code aktual di `capstone_SIPRAGA_V2-main.zip`
> (backend Express modular `letters/*`, frontend React wizard, schema `database/master.sql`)

Cara pakai: copy tiap blok ```plantuml``` ke [plantuml.com/plantuml](https://www.plantuml.com/plantuml/uml/) atau plugin PlantUML di VSCode.

---

## 1. Use Case Diagram (Diagram Pengguna)

```plantuml
@startuml UseCase_SIPRAGA
left to right direction
skinparam packageStyle rectangle

actor Warga
actor "Ketua RT" as RT
actor "Ketua RW" as RW
actor Superadmin
actor "Publik\n(tanpa login)" as Publik

rectangle "SIPRAGA V2" {

  package "Autentikasi & Profil" {
    usecase "Registrasi Akun\n(Warga/RT/RW/Superadmin)" as UC_Register
    usecase "Login" as UC_Login
    usecase "Logout" as UC_Logout
    usecase "Kelola Profil\n(termasuk avatar)" as UC_Profile
  }

  package "Surat - Warga" {
    usecase "Ajukan Surat\n(Wizard 8 Step)" as UC_AjukanSurat
    usecase "Lihat Riwayat Surat" as UC_RiwayatSurat
    usecase "Lihat Detail & Tracking Surat" as UC_DetailSurat
    usecase "Unduh PDF Surat" as UC_DownloadPdf
  }

  package "Surat - RT/RW" {
    usecase "Lihat Inbox Surat Masuk" as UC_Inbox
    usecase "Setujui Surat" as UC_Approve
    usecase "Tolak / Minta Revisi" as UC_Reject
    usecase "Buat Surat untuk Warga\n(offline/manual)" as UC_BuatSuratRtRw
    usecase "Kelola Tanda Tangan Digital\n(upload / gambar canvas)" as UC_TTD
  }

  package "Notifikasi" {
    usecase "Lihat & Baca Notifikasi" as UC_Notif
  }

  package "Superadmin" {
    usecase "Lihat Dashboard & Statistik" as UC_Dashboard
    usecase "Kelola Akun RT/RW\n(reset password, suspend, hapus)" as UC_KelolaAkun
    usecase "Kelola Konfigurasi Instansi" as UC_Konfigurasi
    usecase "Kelola Template Surat (Markdown)" as UC_TemplateMD
    usecase "Lihat Log Sistem / Audit Trail" as UC_LogSistem
  }

  package "Publik" {
    usecase "Verifikasi Keaslian Surat via QR" as UC_VerifyQR
  }
}

Warga --> UC_Register
Warga --> UC_Login
Warga --> UC_Logout
Warga --> UC_Profile
Warga --> UC_AjukanSurat
Warga --> UC_RiwayatSurat
Warga --> UC_DetailSurat
Warga --> UC_DownloadPdf
Warga --> UC_Notif

RT --> UC_Login
RT --> UC_Logout
RT --> UC_Profile
RT --> UC_Inbox
RT --> UC_Approve
RT --> UC_Reject
RT --> UC_BuatSuratRtRw
RT --> UC_TTD
RT --> UC_DetailSurat
RT --> UC_Notif

RW --> UC_Login
RW --> UC_Logout
RW --> UC_Profile
RW --> UC_Inbox
RW --> UC_Approve
RW --> UC_Reject
RW --> UC_BuatSuratRtRw
RW --> UC_TTD
RW --> UC_DetailSurat
RW --> UC_Notif

Superadmin --> UC_Login
Superadmin --> UC_Logout
Superadmin --> UC_Dashboard
Superadmin --> UC_KelolaAkun
Superadmin --> UC_Konfigurasi
Superadmin --> UC_TemplateMD
Superadmin --> UC_LogSistem

Publik --> UC_VerifyQR

UC_AjukanSurat .> UC_Notif : <<include>>
UC_Approve .> UC_Notif : <<include>>
UC_Reject .> UC_Notif : <<include>>
@enduml
```

---

## 2. Sequence Diagram — Per Fitur

### 2.1 Login (Warga / RT-RW / Superadmin)

```plantuml
@startuml Sequence_Login
actor User
participant "Frontend\n(LoginWarga / LoginRtRw)" as FE
participant "AuthContext" as Ctx
participant "API\n/api/auth/login\n/api/auth/login-rtrw" as API
participant "AuthController" as Ctrl
participant "AuthService" as Service
database "MySQL\n(warga / rt / rw / superadmin)" as DB

User -> FE : input NIK/username + password
FE -> API : POST /api/auth/login (atau /login-rtrw)\n[loginLimiter: max 10x/15menit]
API -> Ctrl : loginWarga() / loginRtRw()
Ctrl -> Service : loginWarga(nik, password)\natau loginRtRw(username, password)
Service -> DB : SELECT user WHERE NIK/username = ?
DB --> Service : row user (password hash)
Service -> Service : bcrypt.compare(password, hash)

alt password & user valid
  Service -> Service : jwt.sign({id/id_warga, role, ...}, JWT_SECRET, {expiresIn:'1d'})
  Service --> Ctrl : { token, user }
  Ctrl --> API : 200 OK { token, user }
  API --> FE : token + data user
  FE -> Ctx : simpan token & user (localStorage)
  Ctx --> User : redirect sesuai role\n(/warga/dashboard, /rtrw/dashboard, /superadmin/dashboard)
else user tidak ditemukan / password salah
  Service --> Ctrl : { error: 'kredensial tidak valid' }
  Ctrl --> API : 400 Bad Request
  API --> FE : error message
  FE --> User : toast error
end
@enduml
```

---

### 2.2 Registrasi Warga

```plantuml
@startuml Sequence_RegistrasiWarga
actor Warga
participant "RegisterWarga.jsx" as FE
participant "API /api/auth/register" as API
participant "AuthController" as Ctrl
participant "AuthService" as Service
database "MySQL: warga" as DB

Warga -> FE : isi form (NIK, nama, email, password, alamat, dll)
FE -> API : POST /api/auth/register
API -> Ctrl : register(req.body)
Ctrl -> Service : registerWarga(data)
Service -> Service : validateNik(NIK) -- harus 16 digit angka
Service -> DB : SELECT warga WHERE NIK = ? OR email = ?
DB --> Service : hasil cek duplikat

alt NIK / email sudah terdaftar
  Service --> Ctrl : { error: 'NIK/Email sudah digunakan' }
  Ctrl --> FE : 400 Bad Request
  FE --> Warga : tampilkan error di form
else data valid
  Service -> Service : bcrypt.hash(password, 10)
  Service -> DB : INSERT INTO warga (NIK, nama, email, password, ...)
  DB --> Service : insertId
  Service --> Ctrl : { data: user baru }
  Ctrl --> FE : 201 Created
  FE --> Warga : redirect ke halaman login
end
@enduml
```

---

### 2.3 Pengajuan Surat — Letter Wizard (Draft → Preview PDF → Submit)

```plantuml
@startuml Sequence_PengajuanSurat
actor Warga
participant "LetterWizardPage\n(Step1..Step8)" as Wizard
participant "useLetterWizard.js" as Hook
participant "API /api/v2/letters" as API
participant "LettersController" as Ctrl
participant "LettersService" as Service
participant "LettersModel" as Model
participant "PdfService" as Pdf
database "MySQL" as DB
participant "NotificationService" as Notif

== Step 1-2: Pilih jenis surat & isi data dinamis ==
Wizard -> API : GET /api/v2/letters/types
API -> Ctrl : getLetterTypes()
Ctrl -> Service : getAvailableLetterTypes()
Service -> Model : getLetterTypes()
Model -> DB : SELECT * FROM letter_types WHERE is_active=TRUE
DB --> Wizard : daftar jenis surat (render kartu pilihan)

Wizard -> API : GET /api/v2/letters/types/:typeId/fields
API -> Ctrl : getTemplateFields()
Ctrl -> Service : getTemplateFields(typeId)
Service -> Model : getTemplateFields(typeId)
Model -> DB : SELECT * FROM letter_template_fields WHERE letter_type_id=?
DB --> Wizard : field dinamis -> DynamicField.jsx (text/select/date/dll)

== Step 3-5: Konten, lampiran, workflow ==
Warga -> Wizard : isi content blocks, upload lampiran, pilih workflow
Wizard -> Hook : simpan state (fieldValues, content, attachments, workflow)

== Simpan sebagai Draft ==
Hook -> API : POST /api/v2/letters/drafts\n{letter_type_id, workflow_option_id, subject, purpose, fields}
API -> Ctrl : createDraft(req)
Ctrl -> DB : SELECT rt, rw FROM warga WHERE id_warga = req.user.id
DB --> Ctrl : data wilayah warga
Ctrl -> DB : SELECT rw_id FROM rw WHERE rw_id=? OR no_rw=?
DB --> Ctrl : tenant_id (rw_id), default 'RW001'
Ctrl -> Service : createDraft(payload)
Service -> DB : BEGIN TRANSACTION
Service -> DB : INSERT INTO letters (uuid, tenant_id, resident_id,\nletter_type_id, workflow_option_id, subject, purpose,\nstatus='draft', current_step=1)
DB --> Service : letterId
Service -> DB : INSERT INTO letter_field_values (letter_id, field_key, value) VALUES (...)
Service -> DB : COMMIT
Service --> Ctrl : letterUuid
Ctrl --> Hook : 201 { data: { uuid } }

== Step 6: Preview PDF ==
Wizard -> API : GET /api/v2/letters/:uuid/preview-pdf
API -> Ctrl : getPreviewPdf()
Ctrl -> DB : SELECT id FROM letters WHERE uuid=?
Ctrl -> DB : cek letter_pdf_versions (type='preview')
alt preview belum ada
  Ctrl -> Pdf : createPdfForLetter(uuid)
  Pdf -> Model : getLetterByUuid(uuid) + getFieldValues(letterId)
  Pdf -> Pdf : renderHtml() -- Mustache.render(template, data) + QRCode.toDataURL()
  Pdf -> Pdf : generatePdfBuffer() -- Puppeteer page.pdf({format:'A4'})
  Pdf --> Ctrl : pdfBuffer
  Ctrl -> DB : INSERT INTO letter_pdf_versions (type='preview', file_url=base64 PDF)
end
Ctrl --> Wizard : 200 { pdf_url }
Wizard --> Warga : tampilkan PDF via react-pdf + tombol "Download Preview"

== Step 7-8: Konfirmasi & Submit ==
Warga -> Wizard : klik "Kirim Surat"
Wizard -> API : POST /api/v2/letters/:uuid/submit
API -> Ctrl : submitLetter()
Ctrl -> Service : submitLetter(uuid)
Service -> Model : getLetterByUuid(uuid)
Model --> Service : letter (status harus 'draft')
Service -> Model : updateLetterStatus(id, 'submitted', 1)
Model -> DB : UPDATE letters SET status='submitted', submitted_at=NOW()

Service -> Notif : createInAppNotification(warga, type='NEW_LETTER')
Service -> Notif : kirimNotifikasi(email/WA, event='DIAJUKAN')
Service -> Notif : createInAppNotification(RT tujuan, type='NEW_LETTER')
Notif -> DB : INSERT INTO notifications (...)

Service --> Ctrl : true
Ctrl --> Wizard : 200 { message: 'Surat berhasil diajukan' }
Wizard --> Warga : tampilkan Step8Success + link tracking /warga/surat/:uuid
@enduml
```

---

### 2.4 RT/RW — Inbox, Approve, Reject (+ generate PDF final)

```plantuml
@startuml Sequence_ApprovalSurat
actor "Ketua RT / RW" as Officer
participant "LetterInboxPage" as Inbox
participant "LetterDetailPage" as Detail
participant "API /api/v2/letters" as API
participant "LettersController" as Ctrl
participant "ApprovalsService" as Approval
database "MySQL" as DB
participant "BullMQ Queue\n(pdf-generation)" as Queue
participant "PDF Worker\n(pdf.queue.js)" as Worker
participant "PdfService" as Pdf
participant "NotificationService" as Notif

== Lihat Inbox ==
Officer -> Inbox : buka halaman inbox
Inbox -> API : GET /api/v2/letters/inbox\n[authRtRwMiddleware -> req.tenantId = rw_id]
API -> Ctrl : getInbox()
Ctrl -> DB : getInboxByRole(role, tenantId)\nWHERE status IN (...) AND tenant_id=?
DB --> Ctrl : daftar surat masuk
Ctrl --> Inbox : 200 { data: letters }
Officer -> Inbox : pilih surat
Inbox -> Detail : navigate /rtrw/surat/:uuid
Detail -> API : GET /api/v2/letters/:uuid
API -> Ctrl : getLetterDetail()
Ctrl --> Detail : 200 { data: detail + field_values + approvals + attachments }

== Opsi A: Setujui ==
alt RT/RW menyetujui
  Officer -> Detail : isi catatan, pilih TTD, klik "Setujui"
  Detail -> API : POST /api/v2/letters/:uuid/approve\n{notes, signature_url}
  API -> Ctrl : approveLetter()
  Ctrl -> Approval : approveLetter(uuid, role, notes, signatureUrl, approverId)
  Approval -> DB : SELECT letter JOIN workflow_options JOIN letter_types
  Approval -> Approval : cek STATUS_TRANSITIONS[workflow_code][role]\n(RT_ONLY / RT_THEN_RW)

  alt status sesuai transisi yang diizinkan
    Approval -> DB : BEGIN TRANSACTION
    Approval -> DB : INSERT INTO letter_approvals\n(letter_id, approver_id, step, action='approved', notes, signature_url)

    alt nextStatus == 'completed'
      Approval -> Approval : generateLetterNumber()\n+ qr_token = uuid()
      Approval -> DB : UPDATE letters SET status='completed',\nletter_number=?, qr_token=?, completed_at=NOW()
      Approval -> Queue : pdfQueue.add('generate-pdf', {letterId, type:'final'})
      Queue -> Worker : proses job async
      Worker -> Pdf : createPdfForLetter(uuid)
      Pdf --> Worker : pdfBuffer (PDF final + QR code)
      Worker -> DB : INSERT INTO letter_pdf_versions (type='final', file_url=...)
    else nextStatus == 'approved_rt' (lanjut ke RW)
      Approval -> DB : UPDATE letters SET status='approved_rt'
      Approval -> Notif : createInAppNotification(RW tenant, type='NEW_LETTER')
    end

    Approval -> DB : COMMIT
    Approval -> Notif : createInAppNotification(warga, type='APPROVED')
    Approval -> Notif : kirimNotifikasi(email/WA, event='DISETUJUI')
    Notif -> DB : INSERT INTO notifications
  else status tidak valid untuk role ini
    Approval --> Ctrl : throw Error('Status tidak bisa di-approve')
    Ctrl --> Detail : 400 Bad Request
  end

  Approval --> Ctrl : { nextStatus, letterNumber, qrToken }
  Ctrl --> Detail : 200 { data: result }
  Detail --> Officer : toast "Surat berhasil disetujui"
end

== Opsi B: Tolak ==
alt RT/RW menolak
  Officer -> Detail : isi alasan, klik "Tolak"
  Detail -> API : POST /api/v2/letters/:uuid/reject\n{notes}
  API -> Ctrl : rejectLetter()
  Ctrl -> Approval : rejectLetter(uuid, role, notes, approverId)
  Approval -> DB : BEGIN TRANSACTION
  Approval -> DB : INSERT INTO letter_approvals (action='rejected', notes)
  Approval -> DB : UPDATE letters SET status='rejected', rejected_by_role=?
  Approval -> DB : COMMIT
  Approval -> Notif : createInAppNotification(warga, type='REJECTED')
  Approval -> Notif : kirimNotifikasi(email/WA, event='DITOLAK')
  Ctrl --> Detail : 200 { message: 'Surat berhasil ditolak' }
  Detail --> Officer : toast "Surat ditolak"
end
@enduml
```

---

### 2.5 Verifikasi Keaslian Surat via QR Code (Publik)

```plantuml
@startuml Sequence_VerifyQR
actor "Siapapun (Publik)" as Public
participant "QrVerifyPage.jsx" as FE
participant "API\nGET /api/v2/letters/verify/:qrToken" as API
participant "LettersController" as Ctrl
database "MySQL" as DB

Public -> FE : scan QR di surat fisik\natau buka link /verify/:qrToken
FE -> API : GET /api/v2/letters/verify/:qrToken (tanpa auth)
API -> Ctrl : verifyByQrToken(req)
Ctrl -> DB : SELECT l.letter_number, l.status, l.completed_at,\nlt.name, w.nama\nFROM letters l\nJOIN letter_types lt ON l.letter_type_id=lt.id\nJOIN warga w ON l.resident_id=w.id_warga\nWHERE l.qr_token = ?

alt qr_token ditemukan
  DB --> Ctrl : data surat
  Ctrl --> FE : 200 { valid: true, letter_number, letter_type,\nresident_name, status, completed_at }
  FE --> Public : tampilkan "✅ Surat Terverifikasi" + detail surat
else qr_token tidak ditemukan
  DB --> Ctrl : kosong
  Ctrl --> FE : 404 { valid: false, message: 'Surat tidak ditemukan' }
  FE --> Public : tampilkan "❌ Surat tidak valid"
end
@enduml
```

---

### 2.6 Kelola Tanda Tangan Digital (TTD) — Upload File / Gambar Canvas

```plantuml
@startuml Sequence_TTD
actor "Ketua RT / RW" as Officer
participant "TtdSurat.jsx" as FE
participant "react-signature-canvas" as Canvas
participant "ttdService.js" as Svc
participant "API /api/ttd" as API
participant "wargaController" as Ctrl
participant "Multer + Cloudinary" as Upload
database "MySQL: rt / rw" as DB

Officer -> FE : buka halaman "Tanda Tangan Digital"
FE -> API : GET /api/ttd/current-ttd [authRtRwMiddleware]
API -> Ctrl : getTtd()
Ctrl -> DB : SELECT ttd_digital FROM rt/rw WHERE id=?
DB --> Ctrl : url ttd_digital (jika ada)
Ctrl --> FE : 200 { ttd_digital }
FE --> Officer : tampilkan TTD tersimpan (jika ada)

alt Mode Upload File
  Officer -> FE : pilih file PNG/JPG
  FE -> Svc : uploadTtd(formData)
else Mode Gambar di Canvas
  Officer -> Canvas : gambar tanda tangan
  Canvas -> FE : toDataURL('image/png')
  FE -> FE : dataURLtoBlob(dataUrl)
  FE -> Svc : uploadTtd(formData berisi blob 'ttd.png')
end

Svc -> API : POST /api/ttd/upload-ttd (multipart/form-data)
API -> Upload : multer.single('ttdImage') -> upload ke Cloudinary
Upload --> Ctrl : file.path (URL Cloudinary)
Ctrl -> DB : UPDATE rt/rw SET ttd_digital = ? WHERE id = ?
DB --> Ctrl : OK
Ctrl --> FE : 200 { message: 'TTD berhasil disimpan', ttd_digital }
FE --> Officer : toast sukses + tampilkan preview TTD terbaru
@enduml
```

---

### 2.7 Sistem Notifikasi (In-App + Email/WhatsApp)

```plantuml
@startuml Sequence_Notifikasi
participant "LettersService /\nApprovalsService" as Source
participant "NotificationService" as Notif
database "MySQL: notifications" as DB
participant "Nodemailer\n(SMTP/Ethereal)" as Email
participant "Fonnte API\n(WhatsApp)" as WA
actor "Penerima\n(Warga/RT/RW/Superadmin)" as Recipient
participant "NotificationBell.jsx" as Bell
participant "API /api/notifications" as API

== Trigger event (DIAJUKAN / DISETUJUI / DITOLAK / NEW_LETTER) ==
Source -> Notif : createInAppNotification(\n{recipientId, recipientRole, type, title, message, link, letterUuid})
Notif -> DB : INSERT INTO notifications (...)

Source -> Notif : kirimNotifikasi({email, no_hp, event, data})
par Kirim Email
  Notif -> Email : sendMail(TEMPLATE_EMAIL[event])
  Email --> Notif : sukses / gagal (di-log saja)
else Kirim WhatsApp (jika FONNTE_TOKEN diset)
  Notif -> WA : POST pesan WA
  WA --> Notif : sukses / gagal (di-log saja)
end
note right of Notif
  Promise.allSettled() —
  error notifikasi TIDAK
  menghentikan flow utama
end note

== Penerima membuka aplikasi ==
Recipient -> Bell : buka dropdown notifikasi
Bell -> API : GET /api/notifications [anyAuth]
API -> DB : SELECT * FROM notifications\nWHERE recipient_id=? AND recipient_role=?\nORDER BY created_at DESC
DB --> API : daftar notifikasi
API --> Bell : 200 { data }
Bell --> Recipient : tampilkan list + badge unread

Recipient -> Bell : klik salah satu notifikasi
Bell -> API : PATCH /api/notifications/:id/read
API -> DB : UPDATE notifications SET is_read=TRUE WHERE id=?
Bell --> Recipient : redirect ke `link` (mis. /warga/surat/:uuid)
@enduml
```

---

### 2.8 Superadmin — Manajemen Akun RT/RW (+ Audit Log)

```plantuml
@startuml Sequence_ManajemenAkun
actor Superadmin
participant "ManajemenAkun.jsx" as FE
participant "API /api/superadmin" as API
participant "superAdminController" as Ctrl
participant "auditLogger" as Audit
database "MySQL: rt / rw / system_logs" as DB

Superadmin -> FE : login & buka halaman Manajemen Akun
FE -> API : GET /api/superadmin/rt\nGET /api/superadmin/rw\n[verifyToken + requireSuperadmin + auditLogger]
API -> Ctrl : listRT() / listRW()
Ctrl -> DB : SELECT * FROM rt / rw
DB --> Ctrl : daftar akun RT/RW
Ctrl --> FE : 200 { data }
FE --> Superadmin : tampilkan tabel akun

alt Reset Password
  Superadmin -> FE : klik "Reset Password"
  FE -> API : PATCH /api/superadmin/users/:role/:id/reset-password
  API -> Audit : log aksi (action='RESET_PASSWORD', target)
  Audit -> DB : INSERT INTO system_logs
  API -> Ctrl : resetPassword()
  Ctrl -> Ctrl : bcrypt.hash(passwordBaru, 10)
  Ctrl -> DB : UPDATE rt/rw SET password=? WHERE id=?
  Ctrl --> FE : 200 { message: 'Password berhasil direset' }

else Suspend / Aktifkan Akun
  Superadmin -> FE : toggle status aktif
  FE -> API : PATCH /api/superadmin/users/:role/:id/toggle-active
  API -> Audit : log aksi (action='TOGGLE_ACTIVE')
  Audit -> DB : INSERT INTO system_logs
  API -> Ctrl : toggleActive()
  Ctrl -> DB : UPDATE rt/rw SET is_active = NOT is_active WHERE id=?
  Ctrl --> FE : 200 { is_active }

else Hapus Akun
  Superadmin -> FE : klik "Hapus"
  FE -> API : DELETE /api/superadmin/users/:role/:id
  API -> Audit : log aksi (action='DELETE_USER')
  Audit -> DB : INSERT INTO system_logs
  API -> Ctrl : deleteUser()
  Ctrl -> DB : DELETE FROM rt/rw WHERE id=?
  Ctrl --> FE : 200 { message: 'Akun dihapus' }
end

FE --> Superadmin : refresh daftar akun
@enduml
```

---

## 3. Class Diagram

### 3.1 Domain Model (berdasarkan `database/master.sql`)

```plantuml
@startuml ClassDiagram_Domain
skinparam classAttributeIconSize 0
hide circle

' ====== V1 Legacy ======
class Warga {
  +id_warga: int <<PK>>
  +NIK: char(16) <<unique>>
  +nama: string
  +email: string <<unique>>
  +password: string
  +no_hp: string
  +alamat: text
  +rt: string
  +rw: string
  +foto_ktp: string
  +avatar: string
}

class RT {
  +rt_id: int <<PK>>
  +no_rt: string
  +rw_id: string <<FK>>
  +nama_ketua: string
  +username: string <<unique>>
  +password: string
  +ttd_digital: string
  +is_active: boolean
}

class RW {
  +rw_id: string <<PK>>
  +no_rw: string
  +nama_ketua: string
  +username: string <<unique>>
  +password: string
  +ttd_digital: string
  +is_active: boolean
}

class Superadmin {
  +id: int <<PK>>
  +username: string <<unique>>
  +password: string
}

class PengajuanSurat {
  +id: int <<PK>>
  +id_warga: int <<FK>>
  +subjek: string
  +file_path: string
  +file_path_signed: string
  +status: tinyint
  +alasan_penolakan: text
  +tanggal_ajuan: datetime
}

class TemplateSurat {
  +id_template: int <<PK>>
  +nama: string
  +file_path: string
}

' ====== V2 Letters System ======
class LetterType {
  +id: int <<PK>>
  +code: string <<unique>>
  +name: string
  +description: text
  +icon: string
  +required_docs: json
  +is_active: boolean
  +sort_order: int
}

class LetterTemplateField {
  +id: int <<PK>>
  +letter_type_id: int <<FK>>
  +field_key: string
  +label: string
  +field_type: enum
  +placeholder: string
  +options: json
  +validation: json
  +is_required: boolean
}

class LetterWorkflowOption {
  +id: int <<PK>>
  +code: string <<unique>>
  +name: string
  +description: string
  +steps: json
  +is_active: boolean
}

class LetterPdfTemplate {
  +id: int <<PK>>
  +letter_type_id: int <<FK>>
  +tenant_id: string
  +name: string
  +html_template: longtext
  +version: int
  +is_active: boolean
}

class LetterMarkdownTemplate {
  +id: int <<PK>>
  +letter_type_id: int <<FK>>
  +name: string
  +markdown_content: longtext
  +html_compiled: longtext
  +version: int
  +is_active: boolean
  +created_by: int
}

class Letter {
  +id: int <<PK>>
  +uuid: string <<unique>>
  +letter_number: string
  +tenant_id: string
  +resident_id: int <<FK>>
  +letter_type_id: int <<FK>>
  +workflow_option_id: int <<FK>>
  +subject: string
  +purpose: text
  +status: enum
  +current_step: int
  +qr_token: string <<unique>>
  +rejected_by_role: string
  +submitted_at: timestamp
  +completed_at: timestamp
}

class LetterFieldValue {
  +id: int <<PK>>
  +letter_id: int <<FK>>
  +field_key: string
  +value: text
}

class LetterContentBlock {
  +id: int <<PK>>
  +letter_id: int <<FK>>
  +block_type: enum
  +content: text
  +sort_order: int
}

class LetterAttachment {
  +id: int <<PK>>
  +letter_id: int <<FK>>
  +original_name: string
  +file_url: string
  +mime_type: string
  +file_size: int
}

class LetterPdfVersion {
  +id: int <<PK>>
  +letter_id: int <<FK>>
  +version: int
  +type: enum
  +file_url: string
  +generated_by: int
  +generated_at: timestamp
}

class LetterApproval {
  +id: int <<PK>>
  +letter_id: int <<FK>>
  +approver_id: int
  +step: int
  +action: enum
  +notes: text
  +signature_url: string
  +acted_at: timestamp
}

class LetterComment {
  +id: int <<PK>>
  +letter_id: int <<FK>>
  +author_id: int
  +content: text
  +is_internal: boolean
}

class Notification {
  +id: bigint <<PK>>
  +recipient_id: int
  +recipient_role: string
  +type: string
  +title: string
  +message: text
  +link: string
  +is_read: boolean
  +letter_uuid: string
}

class SystemLog {
  +id: bigint <<PK>>
  +actor_id: int
  +actor_role: string
  +actor_name: string
  +action: string
  +target_type: string
  +target_id: string
  +detail: json
  +ip_address: string
}

class AppConfig {
  +key: string <<PK>>
  +value: text
  +description: string
}

' ====== Relasi ======
Warga "1" -- "0..*" Letter : mengajukan
Warga "1" -- "0..*" PengajuanSurat : mengajukan (V1)
RW "1" -- "0..*" RT : membawahi

LetterType "1" -- "0..*" LetterTemplateField
LetterType "1" -- "0..*" LetterPdfTemplate
LetterType "1" -- "0..*" LetterMarkdownTemplate
LetterType "1" -- "0..*" Letter

LetterWorkflowOption "1" -- "0..*" Letter

Letter "1" -- "0..*" LetterFieldValue
Letter "1" -- "0..*" LetterContentBlock
Letter "1" -- "0..*" LetterAttachment
Letter "1" -- "0..*" LetterPdfVersion
Letter "1" -- "0..*" LetterApproval
Letter "1" -- "0..*" LetterComment
Letter "0..1" -- "0..*" Notification : terkait via letter_uuid
@enduml
```

---

### 3.2 Class Diagram — Modul Letters (Backend Service Layer)

```plantuml
@startuml ClassDiagram_LettersModule
skinparam classAttributeIconSize 0

class LettersController {
  +getLetterTypes(req, res)
  +getTemplateFields(req, res)
  +getWorkflowOptions(req, res)
  +createDraft(req, res)
  +getInbox(req, res)
  +getMyLetters(req, res)
  +getLetterDetail(req, res)
  +submitLetter(req, res)
  +getPreviewPdf(req, res)
  +uploadPdfClient(req, res)
  +approveLetter(req, res)
  +rejectLetter(req, res)
  +uploadAttachments(req, res)
  +verifyByQrToken(req, res)
}

class LettersService {
  +getAvailableLetterTypes()
  +getTemplateFields(letterTypeId)
  +getWorkflowOptions()
  +createDraft(payload)
  +getMyLetters(residentId)
  +getLetterDetail(uuid)
  +submitLetter(uuid)
}

class LettersModel {
  +getLetterTypes()
  +getTemplateFields(letterTypeId)
  +getWorkflowOptions()
  +createLetterDraft(letterData)
  +getLetterByUuid(uuid)
  +getDetailByUuid(uuid)
  +getInboxByRole(role, tenantId)
  +getMyLetters(residentId)
  +getLetterById(id)
  +updateLetterStatus(id, status, step, letterNumber, qrToken)
  +insertAttachment(letterId, attachment)
  +saveFieldValues(letterId, fields)
  +getFieldValues(letterId)
  +getPdfTemplate(letterTypeId, tenantId)
}

class ApprovalsService {
  +approveLetter(uuid, role, notes, signatureUrl, approverId)
  +rejectLetter(uuid, role, notes, approverId)
  -generateLetterNumber(letterTypeCode, tenantId)
  -getResidentContext(letterId)
  -getRwContext(tenantId)
  -notifySuperadmins(title, message, link, letterUuid)
}

class PdfService {
  +renderHtml(templateStr, data)
  +generatePdfBuffer(htmlContent)
  +createPdfForLetter(uuid)
}

class PdfQueueWorker {
  +process(job)
}

class NotificationService {
  +createInAppNotification(payload)
  +kirimNotifikasi(payload)
  -getTransporter()
}

class AuthRtRwMiddleware {
  +verify(req, res, next)
  --
  sets req.user, req.tenantId = rw_id || id
}

LettersController ..> AuthRtRwMiddleware : protected by
LettersController --> LettersService
LettersController --> LettersModel
LettersController --> ApprovalsService
LettersController --> PdfService
LettersService --> LettersModel
LettersService --> NotificationService
ApprovalsService --> LettersModel : (raw query letters)
ApprovalsService --> NotificationService
ApprovalsService --> PdfQueueWorker : enqueue 'generate-pdf'
PdfQueueWorker --> PdfService
PdfService --> LettersModel
@enduml
```
