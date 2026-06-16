import { useState, useEffect } from 'react';
import {
  Search,
  Plus,
  Edit2,
  Trash2,
  Users,
  X,
  Upload,
  ChevronLeft,
  ChevronRight,
  Eye,
  Filter,
  MapPin,
  Calendar,
  Clock,
  AlertCircle,
  CheckCircle,
  Wrench,
} from 'lucide-react';
import dayjs from 'dayjs';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';
import { collectionsApi, exhibitionsApi } from '@/services/api';
import AssignPersonnelModal from '@/components/AssignPersonnelModal';
import type { CollectionItem, Exhibition } from '../../../shared/types';

const categories = ['青铜器', '玉器', '瓷器', '织物', '乐器', '陶器', '书画', '玺印', '其他'];

const statusLabels: Record<CollectionItem['status'], { label: string; className: string; icon: React.ReactNode }> = {
  normal: {
    label: '正常',
    className: 'bg-green-500/10 text-green-400 border-green-500/30',
    icon: <CheckCircle className="w-3.5 h-3.5" />,
  },
  maintenance: {
    label: '养护中',
    className: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
    icon: <Clock className="w-3.5 h-3.5" />,
  },
  repair: {
    label: '修复中',
    className: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
    icon: <Wrench className="w-3.5 h-3.5" />,
  },
};

interface FormData {
  name: string;
  category: string;
  era: string;
  description: string;
  image: string;
  exhibitionId: string;
  locationX: string;
  locationY: string;
  maintenanceCycle: string;
  lastMaintenanceDate: string;
  nextMaintenanceDate: string;
  status: CollectionItem['status'];
}

const initialFormData: FormData = {
  name: '',
  category: '',
  era: '',
  description: '',
  image: '',
  exhibitionId: '',
  locationX: '',
  locationY: '',
  maintenanceCycle: '30',
  lastMaintenanceDate: '',
  nextMaintenanceDate: '',
  status: 'normal',
};

export default function CollectionPage() {
  const [collections, setCollections] = useState<CollectionItem[]>([]);
  const [exhibitions, setExhibitions] = useState<Exhibition[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedExhibition, setSelectedExhibition] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);

  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<CollectionItem | null>(null);
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [formErrors, setFormErrors] = useState<Partial<Record<keyof FormData, string>>>({});
  const [imagePreview, setImagePreview] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const [showAssignModal, setShowAssignModal] = useState(false);
  const [assignCollection, setAssignCollection] = useState<CollectionItem | null>(null);

  const [showDetail, setShowDetail] = useState<CollectionItem | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [collectionsRes, exhibitionsRes] = await Promise.all([
        collectionsApi.getList(),
        exhibitionsApi.getList(),
      ]);
      if (collectionsRes.success && collectionsRes.data) {
        setCollections(collectionsRes.data);
      }
      if (exhibitionsRes.success && exhibitionsRes.data) {
        setExhibitions(exhibitionsRes.data);
      }
    } catch (err) {
      console.error('获取数据失败:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredCollections = collections.filter(item => {
    const matchSearch = item.name.includes(searchQuery) || item.description.includes(searchQuery);
    const matchCategory = !selectedCategory || item.category === selectedCategory;
    const matchExhibition = !selectedExhibition || item.exhibitionId === Number(selectedExhibition);
    return matchSearch && matchCategory && matchExhibition;
  });

  const totalPages = Math.ceil(filteredCollections.length / pageSize);
  const paginatedCollections = filteredCollections.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setImagePreview(result);
        setFormData(prev => ({ ...prev, image: result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const validateForm = (): boolean => {
    const errors: Partial<Record<keyof FormData, string>> = {};
    if (!formData.name.trim()) errors.name = '请输入藏品名称';
    if (!formData.category) errors.category = '请选择分类';
    if (!formData.era.trim()) errors.era = '请输入年代';
    if (!formData.description.trim()) errors.description = '请输入描述';
    if (!formData.exhibitionId) errors.exhibitionId = '请选择所属展厅';
    if (!formData.locationX) errors.locationX = '请输入X坐标';
    if (!formData.locationY) errors.locationY = '请输入Y坐标';
    if (!formData.maintenanceCycle) errors.maintenanceCycle = '请输入养护周期';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleOpenModal = (item?: CollectionItem) => {
    if (item) {
      setEditingItem(item);
      setFormData({
        name: item.name,
        category: item.category,
        era: item.era,
        description: item.description,
        image: item.image,
        exhibitionId: String(item.exhibitionId),
        locationX: String(item.locationX),
        locationY: String(item.locationY),
        maintenanceCycle: String(item.maintenanceCycle),
        lastMaintenanceDate: item.lastMaintenanceDate,
        nextMaintenanceDate: item.nextMaintenanceDate,
        status: item.status,
      });
      setImagePreview(item.image);
    } else {
      setEditingItem(null);
      setFormData(initialFormData);
      setImagePreview('');
    }
    setFormErrors({});
    setShowModal(true);
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    setSubmitting(true);
    try {
      const data = {
        ...formData,
        exhibitionId: Number(formData.exhibitionId),
        locationX: Number(formData.locationX),
        locationY: Number(formData.locationY),
        maintenanceCycle: Number(formData.maintenanceCycle),
      };

      if (editingItem) {
        await collectionsApi.update(editingItem.id, data);
      } else {
        await collectionsApi.create(data);
      }
      await fetchData();
      setShowModal(false);
    } catch (err) {
      console.error('保存失败:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('确定要删除这件藏品吗？')) return;
    try {
      await collectionsApi.remove(id);
      await fetchData();
    } catch (err) {
      console.error('删除失败:', err);
    }
  };

  const handleAssignPersonnel = (item: CollectionItem) => {
    setAssignCollection(item);
    setShowAssignModal(true);
  };

  const getExhibitionName = (id: number) => {
    return exhibitions.find(e => e.id === id)?.name || '未知展厅';
  };

  const getMaintenanceStatus = (date: string) => {
    const daysUntil = dayjs(date).diff(dayjs(), 'day');
    if (daysUntil < 0) return { label: '已过期', className: 'text-accent-400' };
    if (daysUntil <= 7) return { label: `${daysUntil}天后`, className: 'text-amber-400' };
    return { label: `${daysUntil}天后`, className: 'text-green-400' };
  };

  return (
    <div className="min-h-screen bg-primary-900 animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gold-400 font-serif">藏品管理</h1>
          <p className="text-sm text-cream-400 mt-1">共 {filteredCollections.length} 件藏品</p>
        </div>
        <Button
          variant="primary"
          onClick={() => handleOpenModal()}
        >
          <Plus className="w-4 h-4" />
          新增藏品
        </Button>
      </div>

      <div className="bg-primary-800 rounded-xl border border-gold-500/20 p-4 mb-6">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex-1 min-w-[200px] relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-cream-400" />
            <input
              type="text"
              placeholder="搜索藏品名称或描述..."
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
              className="w-full pl-10 pr-4 py-2.5 bg-primary-700/50 border border-primary-600 rounded-lg text-cream-100 placeholder-cream-500 focus:outline-none focus:border-gold-500/50 transition-colors"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-cream-400" />
            <select
              value={selectedCategory}
              onChange={(e) => { setSelectedCategory(e.target.value); setCurrentPage(1); }}
              className="px-4 py-2.5 bg-primary-700/50 border border-primary-600 rounded-lg text-cream-100 focus:outline-none focus:border-gold-500/50 transition-colors"
            >
              <option value="">全部分类</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-cream-400" />
            <select
              value={selectedExhibition}
              onChange={(e) => { setSelectedExhibition(e.target.value); setCurrentPage(1); }}
              className="px-4 py-2.5 bg-primary-700/50 border border-primary-600 rounded-lg text-cream-100 focus:outline-none focus:border-gold-500/50 transition-colors"
            >
              <option value="">全部展厅</option>
              {exhibitions.map(exh => (
                <option key={exh.id} value={exh.id}>{exh.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="bg-primary-800 rounded-xl border border-gold-500/20 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-2 border-gold-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : paginatedCollections.length === 0 ? (
          <div className="py-20 text-center">
            <AlertCircle className="w-12 h-12 text-cream-500 mx-auto mb-4" />
            <p className="text-cream-400">暂无藏品数据</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gold-500/20">
                    <th className="px-4 py-4 text-left text-xs font-medium text-cream-400 uppercase tracking-wider">藏品</th>
                    <th className="px-4 py-4 text-left text-xs font-medium text-cream-400 uppercase tracking-wider">年代</th>
                    <th className="px-4 py-4 text-left text-xs font-medium text-cream-400 uppercase tracking-wider">分类</th>
                    <th className="px-4 py-4 text-left text-xs font-medium text-cream-400 uppercase tracking-wider">展厅</th>
                    <th className="px-4 py-4 text-left text-xs font-medium text-cream-400 uppercase tracking-wider">养护周期</th>
                    <th className="px-4 py-4 text-left text-xs font-medium text-cream-400 uppercase tracking-wider">下次养护</th>
                    <th className="px-4 py-4 text-left text-xs font-medium text-cream-400 uppercase tracking-wider">状态</th>
                    <th className="px-4 py-4 text-right text-xs font-medium text-cream-400 uppercase tracking-wider">操作</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-primary-700/50">
                  {paginatedCollections.map((item) => {
                    const maintenanceStatus = getMaintenanceStatus(item.nextMaintenanceDate);
                    return (
                      <tr
                        key={item.id}
                        onClick={() => setShowDetail(item)}
                        className="hover:bg-primary-700/30 transition-colors cursor-pointer group"
                      >
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-lg bg-primary-700 overflow-hidden border border-gold-500/20 flex-shrink-0">
                              {item.image ? (
                                <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-cream-500">
                                  <Eye className="w-5 h-5" />
                                </div>
                              )}
                            </div>
                            <div className="min-w-0">
                              <p className="font-medium text-cream-100 truncate max-w-[180px]">{item.name}</p>
                              <p className="text-xs text-cream-500 truncate max-w-[180px]">
                                {item.assignedRestorer?.name && `修复师: ${item.assignedRestorer.name}`}
                                {item.assignedSecurity?.name && ` | 安保: ${item.assignedSecurity.name}`}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4 text-sm text-cream-300">{item.era}</td>
                        <td className="px-4 py-4">
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-gold-500/10 text-gold-400 border border-gold-500/30">
                            {item.category}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-sm text-cream-300">{getExhibitionName(item.exhibitionId)}</td>
                        <td className="px-4 py-4 text-sm text-cream-300">{item.maintenanceCycle}天</td>
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5 text-cream-500" />
                            <span className={cn('text-sm font-medium', maintenanceStatus.className)}>
                              {maintenanceStatus.label}
                            </span>
                          </div>
                          <p className="text-xs text-cream-500 mt-0.5">
                            {dayjs(item.nextMaintenanceDate).format('YYYY-MM-DD')}
                          </p>
                        </td>
                        <td className="px-4 py-4">
                          <span className={cn(
                            'inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border',
                            statusLabels[item.status].className
                          )}>
                            {statusLabels[item.status].icon}
                            {statusLabels[item.status].label}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={(e) => { e.stopPropagation(); handleOpenModal(item); }}
                              className="border-transparent hover:border-gold-500/50"
                            >
                              <Edit2 className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={(e) => { e.stopPropagation(); handleAssignPersonnel(item); }}
                              className="border-transparent hover:border-gold-500/50"
                            >
                              <Users className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={(e) => { e.stopPropagation(); handleDelete(item.id); }}
                              className="border-transparent hover:border-accent-500/50 hover:text-accent-400"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-between px-4 py-4 border-t border-gold-500/20">
                <p className="text-sm text-cream-400">
                  显示 {(currentPage - 1) * pageSize + 1} - {Math.min(currentPage * pageSize, filteredCollections.length)} 条，共 {filteredCollections.length} 条
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="w-4 h-4" />
                    上一页
                  </Button>
                  <span className="px-3 py-1.5 text-sm text-cream-300">
                    {currentPage} / {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                  >
                    下一页
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-3xl bg-primary-800 rounded-xl border border-gold-500/30 shadow-2xl shadow-gold-500/10 animate-slide-up max-h-[90vh] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between p-6 border-b border-gold-500/20">
              <h2 className="text-xl font-bold text-gold-400 font-serif">
                {editingItem ? '编辑藏品' : '新增藏品'}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 text-cream-400 hover:text-gold-400 transition-colors rounded-lg hover:bg-primary-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-cream-200 mb-2">藏品名称 *</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      className={cn(
                        'w-full px-4 py-2.5 bg-primary-700/50 border rounded-lg text-cream-100 placeholder-cream-500 focus:outline-none transition-colors',
                        formErrors.name ? 'border-accent-500 focus:border-accent-500' : 'border-primary-600 focus:border-gold-500/50'
                      )}
                      placeholder="请输入藏品名称"
                    />
                    {formErrors.name && <p className="text-xs text-accent-400 mt-1">{formErrors.name}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-cream-200 mb-2">分类 *</label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                      className={cn(
                        'w-full px-4 py-2.5 bg-primary-700/50 border rounded-lg text-cream-100 focus:outline-none transition-colors',
                        formErrors.category ? 'border-accent-500 focus:border-accent-500' : 'border-primary-600 focus:border-gold-500/50'
                      )}
                    >
                      <option value="">请选择分类</option>
                      {categories.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                    {formErrors.category && <p className="text-xs text-accent-400 mt-1">{formErrors.category}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-cream-200 mb-2">年代 *</label>
                    <input
                      type="text"
                      value={formData.era}
                      onChange={(e) => setFormData(prev => ({ ...prev, era: e.target.value }))}
                      className={cn(
                        'w-full px-4 py-2.5 bg-primary-700/50 border rounded-lg text-cream-100 placeholder-cream-500 focus:outline-none transition-colors',
                        formErrors.era ? 'border-accent-500 focus:border-accent-500' : 'border-primary-600 focus:border-gold-500/50'
                      )}
                      placeholder="如：商代、唐代"
                    />
                    {formErrors.era && <p className="text-xs text-accent-400 mt-1">{formErrors.era}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-cream-200 mb-2">所属展厅 *</label>
                    <select
                      value={formData.exhibitionId}
                      onChange={(e) => setFormData(prev => ({ ...prev, exhibitionId: e.target.value }))}
                      className={cn(
                        'w-full px-4 py-2.5 bg-primary-700/50 border rounded-lg text-cream-100 focus:outline-none transition-colors',
                        formErrors.exhibitionId ? 'border-accent-500 focus:border-accent-500' : 'border-primary-600 focus:border-gold-500/50'
                      )}
                    >
                      <option value="">请选择展厅</option>
                      {exhibitions.map(exh => (
                        <option key={exh.id} value={exh.id}>{exh.name}</option>
                      ))}
                    </select>
                    {formErrors.exhibitionId && <p className="text-xs text-accent-400 mt-1">{formErrors.exhibitionId}</p>}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-cream-200 mb-2">位置X坐标 *</label>
                      <input
                        type="number"
                        value={formData.locationX}
                        onChange={(e) => setFormData(prev => ({ ...prev, locationX: e.target.value }))}
                        className={cn(
                          'w-full px-4 py-2.5 bg-primary-700/50 border rounded-lg text-cream-100 placeholder-cream-500 focus:outline-none transition-colors',
                          formErrors.locationX ? 'border-accent-500 focus:border-accent-500' : 'border-primary-600 focus:border-gold-500/50'
                        )}
                        placeholder="0"
                      />
                      {formErrors.locationX && <p className="text-xs text-accent-400 mt-1">{formErrors.locationX}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-cream-200 mb-2">位置Y坐标 *</label>
                      <input
                        type="number"
                        value={formData.locationY}
                        onChange={(e) => setFormData(prev => ({ ...prev, locationY: e.target.value }))}
                        className={cn(
                          'w-full px-4 py-2.5 bg-primary-700/50 border rounded-lg text-cream-100 placeholder-cream-500 focus:outline-none transition-colors',
                          formErrors.locationY ? 'border-accent-500 focus:border-accent-500' : 'border-primary-600 focus:border-gold-500/50'
                        )}
                        placeholder="0"
                      />
                      {formErrors.locationY && <p className="text-xs text-accent-400 mt-1">{formErrors.locationY}</p>}
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-cream-200 mb-2">图片上传</label>
                    <div className="relative">
                      {imagePreview ? (
                        <div className="relative w-full aspect-video rounded-lg overflow-hidden border border-gold-500/30 bg-primary-700/50">
                          <img src={imagePreview} alt="预览" className="w-full h-full object-cover" />
                          <button
                            type="button"
                            onClick={() => { setImagePreview(''); setFormData(prev => ({ ...prev, image: '' })); }}
                            className="absolute top-2 right-2 p-1.5 bg-black/50 rounded-full text-cream-200 hover:text-white transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <label className="flex flex-col items-center justify-center w-full aspect-video rounded-lg border-2 border-dashed border-primary-600 hover:border-gold-500/50 bg-primary-700/30 cursor-pointer transition-colors">
                          <Upload className="w-8 h-8 text-cream-500 mb-2" />
                          <p className="text-sm text-cream-400">点击上传图片</p>
                          <p className="text-xs text-cream-500 mt-1">支持 JPG, PNG 格式</p>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageUpload}
                            className="hidden"
                          />
                        </label>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-cream-200 mb-2">养护周期（天） *</label>
                    <input
                      type="number"
                      value={formData.maintenanceCycle}
                      onChange={(e) => setFormData(prev => ({ ...prev, maintenanceCycle: e.target.value }))}
                      className={cn(
                        'w-full px-4 py-2.5 bg-primary-700/50 border rounded-lg text-cream-100 placeholder-cream-500 focus:outline-none transition-colors',
                        formErrors.maintenanceCycle ? 'border-accent-500 focus:border-accent-500' : 'border-primary-600 focus:border-gold-500/50'
                      )}
                      placeholder="30"
                    />
                    {formErrors.maintenanceCycle && <p className="text-xs text-accent-400 mt-1">{formErrors.maintenanceCycle}</p>}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-cream-200 mb-2">上次养护日期</label>
                      <input
                        type="date"
                        value={formData.lastMaintenanceDate}
                        onChange={(e) => setFormData(prev => ({ ...prev, lastMaintenanceDate: e.target.value }))}
                        className="w-full px-4 py-2.5 bg-primary-700/50 border border-primary-600 rounded-lg text-cream-100 focus:outline-none focus:border-gold-500/50 transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-cream-200 mb-2">下次养护日期</label>
                      <input
                        type="date"
                        value={formData.nextMaintenanceDate}
                        onChange={(e) => setFormData(prev => ({ ...prev, nextMaintenanceDate: e.target.value }))}
                        className="w-full px-4 py-2.5 bg-primary-700/50 border border-primary-600 rounded-lg text-cream-100 focus:outline-none focus:border-gold-500/50 transition-colors"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-cream-200 mb-2">状态</label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as CollectionItem['status'] }))}
                      className="w-full px-4 py-2.5 bg-primary-700/50 border border-primary-600 rounded-lg text-cream-100 focus:outline-none focus:border-gold-500/50 transition-colors"
                    >
                      <option value="normal">正常</option>
                      <option value="maintenance">养护中</option>
                      <option value="repair">修复中</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-cream-200 mb-2">描述 *</label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      rows={4}
                      className={cn(
                        'w-full px-4 py-2.5 bg-primary-700/50 border rounded-lg text-cream-100 placeholder-cream-500 focus:outline-none transition-colors resize-none',
                        formErrors.description ? 'border-accent-500 focus:border-accent-500' : 'border-primary-600 focus:border-gold-500/50'
                      )}
                      placeholder="请输入藏品描述"
                    />
                    {formErrors.description && <p className="text-xs text-accent-400 mt-1">{formErrors.description}</p>}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 p-6 border-t border-gold-500/20">
              <Button
                variant="outline"
                onClick={() => setShowModal(false)}
                disabled={submitting}
              >
                取消
              </Button>
              <Button
                variant="primary"
                onClick={handleSubmit}
                loading={submitting}
              >
                {editingItem ? '保存修改' : '创建藏品'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {showDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-2xl bg-primary-800 rounded-xl border border-gold-500/30 shadow-2xl shadow-gold-500/10 animate-slide-up">
            <div className="flex items-center justify-between p-6 border-b border-gold-500/20">
              <h2 className="text-xl font-bold text-gold-400 font-serif">藏品详情</h2>
              <button
                onClick={() => setShowDetail(null)}
                className="p-2 text-cream-400 hover:text-gold-400 transition-colors rounded-lg hover:bg-primary-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6">
              <div className="flex gap-6">
                <div className="w-48 h-48 flex-shrink-0 rounded-lg overflow-hidden border border-gold-500/30 bg-primary-700">
                  {showDetail.image ? (
                    <img src={showDetail.image} alt={showDetail.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-cream-500">
                      <Eye className="w-12 h-12" />
                    </div>
                  )}
                </div>
                <div className="flex-1 space-y-3">
                  <h3 className="text-xl font-bold text-cream-100">{showDetail.name}</h3>
                  <div className="flex flex-wrap gap-2">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-gold-500/10 text-gold-400 border border-gold-500/30">
                      {showDetail.category}
                    </span>
                    <span className={cn(
                      'inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border',
                      statusLabels[showDetail.status].className
                    )}>
                      {statusLabels[showDetail.status].icon}
                      {statusLabels[showDetail.status].label}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-cream-500">年代</p>
                      <p className="text-cream-200">{showDetail.era}</p>
                    </div>
                    <div>
                      <p className="text-cream-500">展厅</p>
                      <p className="text-cream-200">{getExhibitionName(showDetail.exhibitionId)}</p>
                    </div>
                    <div>
                      <p className="text-cream-500">位置坐标</p>
                      <p className="text-cream-200">({showDetail.locationX}, {showDetail.locationY})</p>
                    </div>
                    <div>
                      <p className="text-cream-500">养护周期</p>
                      <p className="text-cream-200">{showDetail.maintenanceCycle}天</p>
                    </div>
                    <div>
                      <p className="text-cream-500">上次养护</p>
                      <p className="text-cream-200">{dayjs(showDetail.lastMaintenanceDate).format('YYYY-MM-DD')}</p>
                    </div>
                    <div>
                      <p className="text-cream-500">下次养护</p>
                      <p className="text-cream-200">{dayjs(showDetail.nextMaintenanceDate).format('YYYY-MM-DD')}</p>
                    </div>
                  </div>
                  {showDetail.assignedRestorer && (
                    <div>
                      <p className="text-cream-500 text-sm">负责修复师</p>
                      <p className="text-cream-200">{showDetail.assignedRestorer.name}</p>
                    </div>
                  )}
                  {showDetail.assignedSecurity && (
                    <div>
                      <p className="text-cream-500 text-sm">负责安保</p>
                      <p className="text-cream-200">{showDetail.assignedSecurity.name}</p>
                    </div>
                  )}
                </div>
              </div>
              <div className="mt-6 pt-6 border-t border-primary-700">
                <p className="text-cream-500 text-sm mb-2">描述</p>
                <p className="text-cream-300">{showDetail.description}</p>
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 p-6 border-t border-gold-500/20">
              <Button
                variant="outline"
                onClick={() => { setShowDetail(null); handleOpenModal(showDetail); }}
              >
                <Edit2 className="w-4 h-4" />
                编辑
              </Button>
              <Button
                variant="primary"
                onClick={() => setShowDetail(null)}
              >
                关闭
              </Button>
            </div>
          </div>
        </div>
      )}

      <AssignPersonnelModal
        isOpen={showAssignModal}
        onClose={() => { setShowAssignModal(false); setAssignCollection(null); }}
        collectionId={assignCollection?.id || null}
        collectionName={assignCollection?.name}
        currentRestorerId={assignCollection?.assignedRestorerId || null}
        currentSecurityId={assignCollection?.assignedSecurityId || null}
        onAssigned={() => { fetchData(); setShowAssignModal(false); setAssignCollection(null); }}
      />
    </div>
  );
}
