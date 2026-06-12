CREATE TABLE IF NOT EXISTS warga (
  id_warga INT(11) AUTO_INCREMENT PRIMARY KEY,
  NIK CHAR(16) NOT NULL,
  nama VARCHAR(255),
  email VARCHAR(255),
  password VARCHAR(255),
  no_hp VARCHAR(15),
  tempat_lahir VARCHAR(255),
  tanggal_lahir DATE,
  jenis_kelamin ENUM('Laki-laki','Perempuan'),
  alamat TEXT,
  rt VARCHAR(10),
  rw VARCHAR(10),
  kelurahan_desa VARCHAR(100),
  kecamatan VARCHAR(100),
  agama VARCHAR(50),
  status_perkawinan ENUM('Belum Kawin','Kawin'),
  pekerjaan VARCHAR(100),
  kewarganegaraan VARCHAR(50),
  negara VARCHAR(100),
  provinsi VARCHAR(100),
  foto_ktp VARCHAR(255),
  kota VARCHAR(255)
);

CREATE TABLE IF NOT EXISTS rw (
  rw_id VARCHAR(100) PRIMARY KEY,
  no_rw VARCHAR(10),
  nama_ketua VARCHAR(255),
  provinsi VARCHAR(100),
  kota VARCHAR(100),
  kecamatan VARCHAR(100),
  kelurahan_desa VARCHAR(100),
  username VARCHAR(255),
  password VARCHAR(255),
  ttd_digital VARCHAR(255)
);

CREATE TABLE IF NOT EXISTS rt (
  rt_id INT(11) AUTO_INCREMENT PRIMARY KEY,
  no_rt VARCHAR(10),
  rw_id VARCHAR(100),
  nama_ketua VARCHAR(255),
  provinsi VARCHAR(100),
  kota VARCHAR(100),
  kecamatan VARCHAR(100),
  kelurahan_desa VARCHAR(100),
  username VARCHAR(255),
  password VARCHAR(255),
  ttd_digital VARCHAR(255)
);

CREATE TABLE IF NOT EXISTS pengajuan_surat (
  id INT(11) AUTO_INCREMENT PRIMARY KEY,
  id_warga INT(11),
  subjek VARCHAR(255),
  file_path VARCHAR(255),
  file_path_signed VARCHAR(255),
  provinsi VARCHAR(100),
  kota VARCHAR(100),
  kecamatan VARCHAR(100),
  kelurahan_desa VARCHAR(100),
  rt VARCHAR(10),
  rw VARCHAR(10),
  status TINYINT(4),
  alasan_penolakan TEXT,
  tanggal_ajuan DATETIME
);

CREATE TABLE IF NOT EXISTS superadmin (
  id INT(11) AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL
);

CREATE TABLE IF NOT EXISTS template_surat (
  id_template INT(11) AUTO_INCREMENT PRIMARY KEY,
  nama VARCHAR(255),
  file_path VARCHAR(255)
);
