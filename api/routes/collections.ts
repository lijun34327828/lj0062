import { Router, Response } from 'express';
import db from '../db/init.js';
import { authenticateToken, requireRole, AuthRequest } from '../middleware/auth.js';
import { getDaysUntil, getMaintenanceLevel } from '../utils/timeUtils.js';
import { mapToCollectionItem, mapToMaintenanceAlert, mapToExhibition, mapToUser } from '../utils/rowMapper.js';
import { CollectionItem, CollectionCreateRequest, CollectionUpdateRequest, MaintenanceAlert } from '../../shared/types.js';

const router = Router();

router.use(authenticateToken);
router.use(requireRole('admin'));

router.get('/', (req: AuthRequest, res: Response): void => {
  try {
    const { exhibitionId, category } = req.query;
    
    let sql = `
      SELECT c.*, 
             e.id as exhibition_id, e.name as exhibition_name, e.description as exhibition_description, 
             e.cover_image as exhibition_cover_image, e.capacity as exhibition_capacity, 
             e.location as exhibition_location, e.is_active as exhibition_is_active,
             r.id as restorer_id, r.username as restorer_username, r.name as restorer_name, r.role as restorer_role, r.avatar as restorer_avatar, r.phone as restorer_phone, r.bio as restorer_bio, r.rating as restorer_rating,
             s.id as security_id, s.username as security_username, s.name as security_name, s.role as security_role, s.avatar as security_avatar, s.phone as security_phone, s.bio as security_bio, s.rating as security_rating
      FROM collections c
      LEFT JOIN exhibitions e ON c.exhibition_id = e.id
      LEFT JOIN users r ON c.assigned_restorer_id = r.id
      LEFT JOIN users s ON c.assigned_security_id = s.id
      WHERE 1=1
    `;
    const params: unknown[] = [];
    
    if (exhibitionId) {
      sql += ' AND c.exhibition_id = ?';
      params.push(Number(exhibitionId));
    }
    
    if (category) {
      sql += ' AND c.category = ?';
      params.push(category);
    }
    
    sql += ' ORDER BY c.id DESC';
    
    const rows = db.prepare(sql).all(...params) as Record<string, unknown>[];
    
    const collections: CollectionItem[] = rows.map(row => {
      const collection = mapToCollectionItem(row);
      
      if (row.exhibition_id) {
        collection.exhibition = mapToExhibition({
          id: row.exhibition_id,
          name: row.exhibition_name,
          description: row.exhibition_description,
          cover_image: row.exhibition_cover_image,
          capacity: row.exhibition_capacity,
          location: row.exhibition_location,
          is_active: row.exhibition_is_active,
        });
      }
      
      if (row.restorer_id) {
        collection.assignedRestorer = mapToUser({
          id: row.restorer_id,
          username: row.restorer_username,
          name: row.restorer_name,
          role: row.restorer_role,
          avatar: row.restorer_avatar,
          phone: row.restorer_phone,
          bio: row.restorer_bio,
          rating: row.restorer_rating,
        });
      }
      
      if (row.security_id) {
        collection.assignedSecurity = mapToUser({
          id: row.security_id,
          username: row.security_username,
          name: row.security_name,
          role: row.security_role,
          avatar: row.security_avatar,
          phone: row.security_phone,
          bio: row.security_bio,
          rating: row.security_rating,
        });
      }
      
      return collection;
    });
    
    res.json({ success: true, data: collections });
  } catch (err) {
    res.status(500).json({ success: false, error: err instanceof Error ? err.message : '服务器错误' });
  }
});

router.get('/maintenance-alerts', (req: AuthRequest, res: Response): void => {
  try {
    const sql = `
      SELECT c.id, c.name, c.next_maintenance_date,
             e.id as exhibition_id, e.name as exhibition_name
      FROM collections c
      LEFT JOIN exhibitions e ON c.exhibition_id = e.id
      WHERE c.next_maintenance_date IS NOT NULL
    `;
    
    const rows = db.prepare(sql).all() as Record<string, unknown>[];
    
    const alerts: MaintenanceAlert[] = [];
    let alertId = 1;
    
    for (const row of rows) {
      const nextMaintenanceDate = row.next_maintenance_date as string;
      const daysUntil = getDaysUntil(nextMaintenanceDate);
      const level = getMaintenanceLevel(daysUntil);
      
      if (daysUntil <= 7 || daysUntil < 0) {
        const alert = mapToMaintenanceAlert({
          id: alertId++,
          collection_id: row.id,
          collection_name: row.name,
          next_maintenance_date: nextMaintenanceDate,
          days_until: daysUntil,
          level: level,
          acknowledged: false,
        });
        
        const collection = mapToCollectionItem({
          id: row.id,
          name: row.name,
          category: '',
          description: '',
          era: '',
          image: '',
          exhibition_id: row.exhibition_id as number,
          location_x: 0,
          location_y: 0,
          maintenance_cycle: 0,
          last_maintenance_date: '',
          next_maintenance_date: nextMaintenanceDate,
          visit_count: 0,
          status: 'normal',
        });
        
        if (row.exhibition_id) {
          collection.exhibition = mapToExhibition({
            id: row.exhibition_id,
            name: row.exhibition_name,
            description: '',
            cover_image: '',
            capacity: 0,
            location: '',
            is_active: true,
          });
        }
        
        alert.collection = collection;
        alerts.push(alert);
      }
    }
    
    alerts.sort((a, b) => a.daysUntil - b.daysUntil);
    
    res.json({ success: true, data: alerts });
  } catch (err) {
    res.status(500).json({ success: false, error: err instanceof Error ? err.message : '服务器错误' });
  }
});

router.get('/:id', (req: AuthRequest, res: Response): void => {
  try {
    const { id } = req.params;
    
    const sql = `
      SELECT c.*, 
             e.id as exhibition_id, e.name as exhibition_name, e.description as exhibition_description, 
             e.cover_image as exhibition_cover_image, e.capacity as exhibition_capacity, 
             e.location as exhibition_location, e.is_active as exhibition_is_active,
             r.id as restorer_id, r.username as restorer_username, r.name as restorer_name, r.role as restorer_role, r.avatar as restorer_avatar, r.phone as restorer_phone, r.bio as restorer_bio, r.rating as restorer_rating,
             s.id as security_id, s.username as security_username, s.name as security_name, s.role as security_role, s.avatar as security_avatar, s.phone as security_phone, s.bio as security_bio, s.rating as security_rating
      FROM collections c
      LEFT JOIN exhibitions e ON c.exhibition_id = e.id
      LEFT JOIN users r ON c.assigned_restorer_id = r.id
      LEFT JOIN users s ON c.assigned_security_id = s.id
      WHERE c.id = ?
    `;
    
    const row = db.prepare(sql).get(Number(id)) as Record<string, unknown> | undefined;
    
    if (!row) {
      res.status(404).json({ success: false, error: '藏品不存在' });
      return;
    }
    
    const collection = mapToCollectionItem(row);
    
    if (row.exhibition_id) {
      collection.exhibition = mapToExhibition({
        id: row.exhibition_id,
        name: row.exhibition_name,
        description: row.exhibition_description,
        cover_image: row.exhibition_cover_image,
        capacity: row.exhibition_capacity,
        location: row.exhibition_location,
        is_active: row.exhibition_is_active,
      });
    }
    
    if (row.restorer_id) {
      collection.assignedRestorer = mapToUser({
        id: row.restorer_id,
        username: row.restorer_username,
        name: row.restorer_name,
        role: row.restorer_role,
        avatar: row.restorer_avatar,
        phone: row.restorer_phone,
        bio: row.restorer_bio,
        rating: row.restorer_rating,
      });
    }
    
    if (row.security_id) {
      collection.assignedSecurity = mapToUser({
        id: row.security_id,
        username: row.security_username,
        name: row.security_name,
        role: row.security_role,
        avatar: row.security_avatar,
        phone: row.security_phone,
        bio: row.security_bio,
        rating: row.security_rating,
      });
    }
    
    res.json({ success: true, data: collection });
  } catch (err) {
    res.status(500).json({ success: false, error: err instanceof Error ? err.message : '服务器错误' });
  }
});

router.post('/', (req: AuthRequest, res: Response): void => {
  try {
    const body = req.body as CollectionCreateRequest;
    
    if (!body.name || !body.category || !body.description || !body.era || !body.exhibitionId) {
      res.status(400).json({ success: false, error: '缺少必填字段' });
      return;
    }
    
    const exhibition = db.prepare('SELECT id FROM exhibitions WHERE id = ?').get(Number(body.exhibitionId));
    if (!exhibition) {
      res.status(400).json({ success: false, error: '展厅不存在' });
      return;
    }
    
    const sql = `
      INSERT INTO collections (
        name, category, description, era, image, exhibition_id, 
        location_x, location_y, maintenance_cycle, 
        last_maintenance_date, next_maintenance_date
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    const result = db.prepare(sql).run(
      body.name,
      body.category,
      body.description,
      body.era,
      body.image || '',
      body.exhibitionId,
      body.locationX,
      body.locationY,
      body.maintenanceCycle || 30,
      body.lastMaintenanceDate || null,
      body.nextMaintenanceDate || null
    );
    
    const newCollection = db.prepare('SELECT * FROM collections WHERE id = ?').get(result.lastInsertRowid) as Record<string, unknown>;
    
    res.json({ success: true, data: mapToCollectionItem(newCollection) });
  } catch (err) {
    res.status(500).json({ success: false, error: err instanceof Error ? err.message : '服务器错误' });
  }
});

router.put('/:id', (req: AuthRequest, res: Response): void => {
  try {
    const { id } = req.params;
    const body = req.body as CollectionUpdateRequest;
    
    const existing = db.prepare('SELECT id FROM collections WHERE id = ?').get(Number(id));
    if (!existing) {
      res.status(404).json({ success: false, error: '藏品不存在' });
      return;
    }
    
    if (body.exhibitionId) {
      const exhibition = db.prepare('SELECT id FROM exhibitions WHERE id = ?').get(Number(body.exhibitionId));
      if (!exhibition) {
        res.status(400).json({ success: false, error: '展厅不存在' });
        return;
      }
    }
    
    const updateFields: string[] = [];
    const updateValues: unknown[] = [];
    
    const fieldMap: Record<string, string> = {
      name: 'name',
      category: 'category',
      description: 'description',
      era: 'era',
      image: 'image',
      exhibitionId: 'exhibition_id',
      locationX: 'location_x',
      locationY: 'location_y',
      maintenanceCycle: 'maintenance_cycle',
      lastMaintenanceDate: 'last_maintenance_date',
      nextMaintenanceDate: 'next_maintenance_date',
      status: 'status',
      assignedRestorerId: 'assigned_restorer_id',
      assignedSecurityId: 'assigned_security_id',
    };
    
    for (const [key, dbField] of Object.entries(fieldMap)) {
      if (body[key as keyof CollectionUpdateRequest] !== undefined) {
        updateFields.push(`${dbField} = ?`);
        updateValues.push(body[key as keyof CollectionUpdateRequest]);
      }
    }
    
    if (updateFields.length === 0) {
      res.status(400).json({ success: false, error: '没有提供更新字段' });
      return;
    }
    
    updateValues.push(Number(id));
    
    const sql = `UPDATE collections SET ${updateFields.join(', ')} WHERE id = ?`;
    db.prepare(sql).run(...updateValues);
    
    const updatedCollection = db.prepare('SELECT * FROM collections WHERE id = ?').get(Number(id)) as Record<string, unknown>;
    
    res.json({ success: true, data: mapToCollectionItem(updatedCollection) });
  } catch (err) {
    res.status(500).json({ success: false, error: err instanceof Error ? err.message : '服务器错误' });
  }
});

router.delete('/:id', (req: AuthRequest, res: Response): void => {
  try {
    const { id } = req.params;
    
    const existing = db.prepare('SELECT id FROM collections WHERE id = ?').get(Number(id));
    if (!existing) {
      res.status(404).json({ success: false, error: '藏品不存在' });
      return;
    }
    
    db.prepare('DELETE FROM collections WHERE id = ?').run(Number(id));
    
    res.json({ success: true, data: { message: '删除成功' } });
  } catch (err) {
    res.status(500).json({ success: false, error: err instanceof Error ? err.message : '服务器错误' });
  }
});

export default router;
