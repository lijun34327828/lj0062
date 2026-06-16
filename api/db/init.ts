import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dataDir = path.join(__dirname, '../../data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.join(dataDir, 'museum.db');

const db = new Database(dbPath);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

const createTablesSQL = `
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username VARCHAR(50) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(100) NOT NULL,
  role VARCHAR(20) NOT NULL CHECK (role IN ('admin', 'restorer', 'security', 'guide')),
  avatar VARCHAR(255),
  phone VARCHAR(20),
  bio TEXT,
  rating DECIMAL(2,1) DEFAULT 5.0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS exhibitions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  cover_image VARCHAR(255),
  capacity INTEGER DEFAULT 10,
  location VARCHAR(100),
  is_active BOOLEAN DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS collections (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name VARCHAR(100) NOT NULL,
  category VARCHAR(50),
  description TEXT,
  era VARCHAR(50),
  image VARCHAR(255),
  exhibition_id INTEGER REFERENCES exhibitions(id),
  location_x DECIMAL(5,2),
  location_y DECIMAL(5,2),
  maintenance_cycle INTEGER DEFAULT 30,
  last_maintenance_date DATE,
  next_maintenance_date DATE,
  visit_count INTEGER DEFAULT 0,
  status VARCHAR(20) DEFAULT 'normal' CHECK (status IN ('normal', 'maintenance', 'repair')),
  assigned_restorer_id INTEGER REFERENCES users(id),
  assigned_security_id INTEGER REFERENCES users(id),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS bookings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  exhibition_id INTEGER REFERENCES exhibitions(id),
  guide_id INTEGER REFERENCES users(id),
  visitor_name VARCHAR(100) NOT NULL,
  visitor_phone VARCHAR(20) NOT NULL,
  visitor_count INTEGER DEFAULT 1,
  date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  status VARCHAR(20) DEFAULT 'confirmed' CHECK (status IN ('pending', 'confirmed', 'cancelled')),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS schedules (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER REFERENCES users(id),
  date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  type VARCHAR(20) NOT NULL CHECK (type IN ('restoration', 'security')),
  collection_id INTEGER REFERENCES collections(id),
  area VARCHAR(100),
  status VARCHAR(20) DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'in-progress', 'completed')),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS maintenance_alerts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  collection_id INTEGER REFERENCES collections(id),
  next_maintenance_date DATE NOT NULL,
  days_until INTEGER NOT NULL,
  level VARCHAR(20) NOT NULL CHECK (level IN ('warning', 'urgent', 'overdue')),
  acknowledged BOOLEAN DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS open_rules (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  exhibition_id INTEGER REFERENCES exhibitions(id),
  day_of_week INTEGER NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
  open_time TIME NOT NULL,
  close_time TIME NOT NULL,
  is_closed BOOLEAN DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS visit_statistics (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  date DATE NOT NULL,
  exhibition_id INTEGER REFERENCES exhibitions(id),
  collection_id INTEGER REFERENCES collections(id),
  visit_count INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_bookings_exhibition_date ON bookings(exhibition_id, date);
CREATE INDEX IF NOT EXISTS idx_bookings_guide_date ON bookings(guide_id, date);
CREATE INDEX IF NOT EXISTS idx_collections_exhibition ON collections(exhibition_id);
CREATE INDEX IF NOT EXISTS idx_collections_next_maintenance ON collections(next_maintenance_date);
CREATE INDEX IF NOT EXISTS idx_schedules_user_date ON schedules(user_id, date);
CREATE INDEX IF NOT EXISTS idx_schedules_collection ON schedules(collection_id);
CREATE INDEX IF NOT EXISTS idx_visit_stats_date ON visit_statistics(date);
`;

db.exec(createTablesSQL);

const checkEmpty = db.prepare('SELECT COUNT(*) as count FROM users').get() as { count: number };

if (checkEmpty.count === 0) {
  const insertDataSQL = `
INSERT INTO users (username, password_hash, name, role, phone) VALUES ('admin', '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', '系统管理员', 'admin', '13800000000');
INSERT INTO users (username, password_hash, name, role, phone, bio, rating) VALUES ('restorer1', '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', '张修复', 'restorer', '13800000001', '从事文物修复工作15年，擅长青铜器、书画修复', 4.9);
INSERT INTO users (username, password_hash, name, role, phone, bio, rating) VALUES ('restorer2', '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', '李修复', 'restorer', '13800000002', '陶瓷、玉石修复专家', 4.8);
INSERT INTO users (username, password_hash, name, role, phone, bio) VALUES ('security1', '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', '王安保', 'security', '13800000003', '退伍军人，安保经验丰富');
INSERT INTO users (username, password_hash, name, role, phone, bio) VALUES ('security2', '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', '赵安保', 'security', '13800000004', '博物馆安保工作10年');
INSERT INTO users (username, password_hash, name, role, phone, bio, rating) VALUES ('guide1', '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', '陈讲解', 'guide', '13800000005', '历史专业硕士，擅长古代艺术讲解', 4.9);
INSERT INTO users (username, password_hash, name, role, phone, bio, rating) VALUES ('guide2', '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', '刘讲解', 'guide', '13800000006', '考古专业，熟悉各朝代历史', 4.8);
INSERT INTO users (username, password_hash, name, role, phone, bio, rating) VALUES ('guide3', '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', '周讲解', 'guide', '13800000007', '艺术史专业，书画鉴赏专家', 4.7);

INSERT INTO exhibitions (name, description, cover_image, capacity, location, is_active) VALUES ('珍宝馆', '收藏历代皇家珍宝，包括金银器、玉器、珠宝等稀世珍品', 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Chinese%20imperial%20treasure%20room%20with%20gold%20and%20jade%20artifacts%20luxury%20museum&image_size=landscape_16_9', 8, '1楼东侧', 1);
INSERT INTO exhibitions (name, description, cover_image, capacity, location, is_active) VALUES ('书画馆', '展示唐宋元明清各代名家书画真迹', 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Chinese%20calligraphy%20and%20painting%20museum%20ancient%20art%20gallery&image_size=landscape_16_9', 6, '2楼西侧', 1);
INSERT INTO exhibitions (name, description, cover_image, capacity, location, is_active) VALUES ('陶瓷馆', '从新石器时代到明清的陶瓷精品，展示中国陶瓷发展史', 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Chinese%20ceramics%20museum%20porcelain%20exhibition%20ancient%20pottery&image_size=landscape_16_9', 10, '1楼西侧', 1);
INSERT INTO exhibitions (name, description, cover_image, capacity, location, is_active) VALUES ('青铜器馆', '商周秦汉青铜器精品，展现青铜时代的辉煌', 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Chinese%20bronze%20ware%20museum%20ancient%20ding%20vessels%20exhibition&image_size=landscape_16_9', 8, '2楼东侧', 1);

INSERT INTO collections (name, category, description, era, image, exhibition_id, location_x, location_y, maintenance_cycle, last_maintenance_date, next_maintenance_date, visit_count, status) VALUES ('金镶玉九龙璧', '玉器', '清代皇家玉器，采用金镶玉工艺，九条蟠龙栩栩如生', '清代', 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Chinese%20qing%20dynasty%20jade%20disc%20with%20gold%20inlay%20nine%20dragons&image_size=square_hd', 1, 20.5, 35.2, 30, '2026-05-20', '2026-06-19', 1256, 'normal');
INSERT INTO collections (name, category, description, era, image, exhibition_id, location_x, location_y, maintenance_cycle, last_maintenance_date, next_maintenance_date, visit_count, status) VALUES ('清明上河图(局部)', '书画', '宋代张择端名作，描绘汴京繁华景象', '宋代', 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Chinese%20song%20dynasty%20painting%20along%20the%20river%20during%20qingming%20festival&image_size=square_hd', 2, 45.3, 50.1, 15, '2026-06-01', '2026-06-16', 3420, 'normal');
INSERT INTO collections (name, category, description, era, image, exhibition_id, location_x, location_y, maintenance_cycle, last_maintenance_date, next_maintenance_date, visit_count, status) VALUES ('汝窑天青釉洗', '陶瓷', '宋代汝窑珍品，天青色釉，开片细腻', '宋代', 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Chinese%20song%20dynasty%20ru%20ware%20sky%20blue%20glaze%20porcelain%20bowl&image_size=square_hd', 3, 30.0, 40.5, 60, '2026-04-01', '2026-05-31', 2180, 'normal');
INSERT INTO collections (name, category, description, era, image, exhibition_id, location_x, location_y, maintenance_cycle, last_maintenance_date, next_maintenance_date, visit_count, status) VALUES ('司母戊鼎', '青铜器', '商代晚期青铜重器，是目前已知最大的青铜器', '商代', 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Chinese%20shang%20dynasty%20bronze%20ding%20vessel%20ancient%20ritual%20object&image_size=square_hd', 4, 50.0, 50.0, 90, '2026-03-01', '2026-05-30', 2890, 'normal');
INSERT INTO collections (name, category, description, era, image, exhibition_id, location_x, location_y, maintenance_cycle, last_maintenance_date, next_maintenance_date, visit_count, status) VALUES ('翠玉白菜', '玉器', '清代宫廷玉雕精品，菜叶鲜活如生', '清代', 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Chinese%20jade%20cabbage%20sculpture%20qing%20dynasty%20imperial%20treasure&image_size=square_hd', 1, 60.5, 30.0, 30, '2026-05-25', '2026-06-24', 1987, 'normal');
INSERT INTO collections (name, category, description, era, image, exhibition_id, location_x, location_y, maintenance_cycle, last_maintenance_date, next_maintenance_date, visit_count, status) VALUES ('兰亭序摹本', '书画', '王羲之兰亭序唐代冯承素摹本', '唐代', 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Chinese%20tang%20dynasty%20calligraphy%20lanting%20preface%20copy&image_size=square_hd', 2, 20.0, 60.0, 15, '2026-06-05', '2026-06-20', 3120, 'normal');
INSERT INTO collections (name, category, description, era, image, exhibition_id, location_x, location_y, maintenance_cycle, last_maintenance_date, next_maintenance_date, visit_count, status) VALUES ('青花瓷瓶', '陶瓷', '明代永乐年间青花瓷，造型优美，纹饰精细', '明代', 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Chinese%20ming%20dynasty%20blue%20and%20white%20porcelain%20vase%20yongle%20period&image_size=square_hd', 3, 70.0, 45.0, 45, '2026-05-01', '2026-06-15', 1654, 'normal');
INSERT INTO collections (name, category, description, era, image, exhibition_id, location_x, location_y, maintenance_cycle, last_maintenance_date, next_maintenance_date, visit_count, status) VALUES ('四羊方尊', '青铜器', '商代青铜礼器，四角各有一只卷角羊', '商代', 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Chinese%20shang%20dynasty%20bronze%20fangzun%20vessel%20four%20rams&image_size=square_hd', 4, 25.0, 25.0, 90, '2026-03-15', '2026-06-13', 2345, 'normal');

INSERT INTO open_rules (exhibition_id, day_of_week, open_time, close_time, is_closed) SELECT e.id, 0, '09:00', '17:00', 0 FROM exhibitions e;
INSERT INTO open_rules (exhibition_id, day_of_week, open_time, close_time, is_closed) SELECT e.id, 1, '09:00', '17:00', 1 FROM exhibitions e;
INSERT INTO open_rules (exhibition_id, day_of_week, open_time, close_time, is_closed) SELECT e.id, 2, '09:00', '17:00', 0 FROM exhibitions e;
INSERT INTO open_rules (exhibition_id, day_of_week, open_time, close_time, is_closed) SELECT e.id, 3, '09:00', '17:00', 0 FROM exhibitions e;
INSERT INTO open_rules (exhibition_id, day_of_week, open_time, close_time, is_closed) SELECT e.id, 4, '09:00', '17:00', 0 FROM exhibitions e;
INSERT INTO open_rules (exhibition_id, day_of_week, open_time, close_time, is_closed) SELECT e.id, 5, '09:00', '17:00', 0 FROM exhibitions e;
INSERT INTO open_rules (exhibition_id, day_of_week, open_time, close_time, is_closed) SELECT e.id, 6, '09:00', '17:00', 0 FROM exhibitions e;

INSERT INTO bookings (exhibition_id, guide_id, visitor_name, visitor_phone, visitor_count, date, start_time, end_time, status) VALUES (1, 6, '张三', '13900000001', 4, '2026-06-20', '10:00', '11:30', 'confirmed');
INSERT INTO bookings (exhibition_id, guide_id, visitor_name, visitor_phone, visitor_count, date, start_time, end_time, status) VALUES (2, 7, '李四', '13900000002', 2, '2026-06-20', '14:00', '15:30', 'confirmed');
INSERT INTO bookings (exhibition_id, guide_id, visitor_name, visitor_phone, visitor_count, date, start_time, end_time, status) VALUES (3, 8, '王五', '13900000003', 6, '2026-06-21', '09:30', '11:00', 'confirmed');

INSERT INTO visit_statistics (date, exhibition_id, collection_id, visit_count) VALUES ('2026-06-16', 1, 1, 45);
INSERT INTO visit_statistics (date, exhibition_id, collection_id, visit_count) VALUES ('2026-06-16', 1, 5, 38);
INSERT INTO visit_statistics (date, exhibition_id, collection_id, visit_count) VALUES ('2026-06-16', 2, 2, 78);
INSERT INTO visit_statistics (date, exhibition_id, collection_id, visit_count) VALUES ('2026-06-16', 2, 6, 65);
INSERT INTO visit_statistics (date, exhibition_id, collection_id, visit_count) VALUES ('2026-06-16', 3, 3, 56);
INSERT INTO visit_statistics (date, exhibition_id, collection_id, visit_count) VALUES ('2026-06-16', 3, 7, 42);
INSERT INTO visit_statistics (date, exhibition_id, collection_id, visit_count) VALUES ('2026-06-16', 4, 4, 67);
INSERT INTO visit_statistics (date, exhibition_id, collection_id, visit_count) VALUES ('2026-06-16', 4, 8, 54);
  `;
  
  db.exec(insertDataSQL);
  console.log('数据库初始化完成，已插入初始数据');
}

export default db;
