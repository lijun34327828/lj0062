import { useState, useEffect } from 'react';
import {
  Settings,
  Clock,
  Calendar,
  Users,
  Plus,
  Edit,
  Trash2,
  RotateCcw,
  Copy,
  X,
  User,
  Phone,
  FileText,
  Search,
  Lock,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  Check,
  Building2,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';
import { settingsApi, usersApi, exhibitionsApi } from '@/services/api';
import type { User as UserType, OpenRule, Exhibition } from '../../../shared/types';

type TabType = 'rules' | 'accounts';
type RoleType = 'admin' | 'restorer' | 'security' | 'guide';

interface DayRule {
  dayOfWeek: number;
  dayName: string;
  isClosed: boolean;
  openTime: string;
  closeTime: string;
}

interface HolidayRule {
  date: string;
  name: string;
  isClosed: boolean;
  openTime: string;
  closeTime: string;
}

interface UserFormData {
  id?: number;
  username: string;
  password: string;
  name: string;
  role: RoleType;
  phone: string;
  bio: string;
}

const weekDays = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];
const roleLabels: Record<RoleType, string> = {
  admin: '系统管理员',
  restorer: '文物修复师',
  security: '安保人员',
  guide: '讲解员',
};

const initialDayRules: DayRule[] = weekDays.map((name, index) => ({
  dayOfWeek: index + 1,
  dayName: name,
  isClosed: index === 0,
  openTime: '09:00',
  closeTime: '17:00',
}));

const mockHolidays: HolidayRule[] = [
  { date: '2025-01-01', name: '元旦', isClosed: false, openTime: '10:00', closeTime: '16:00' },
  { date: '2025-02-10', name: '春节', isClosed: true, openTime: '', closeTime: '' },
  { date: '2025-05-01', name: '劳动节', isClosed: false, openTime: '09:00', closeTime: '18:00' },
];

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<TabType>('rules');
  const [exhibitions, setExhibitions] = useState<Exhibition[]>([]);
  const [selectedExhibition, setSelectedExhibition] = useState<number | 'all'>('all');
  const [dayRules, setDayRules] = useState<DayRule[]>(initialDayRules);
  const [expandedExhibition, setExpandedExhibition] = useState<number | null>(null);
  const [holidays, setHolidays] = useState<HolidayRule[]>(mockHolidays);
  const [showHolidayModal, setShowHolidayModal] = useState(false);
  const [newHoliday, setNewHoliday] = useState<HolidayRule>({
    date: '',
    name: '',
    isClosed: false,
    openTime: '09:00',
    closeTime: '17:00',
  });

  const [users, setUsers] = useState<UserType[]>([]);
  const [searchText, setSearchText] = useState('');
  const [showUserModal, setShowUserModal] = useState(false);
  const [editingUser, setEditingUser] = useState<UserType | null>(null);
  const [userForm, setUserForm] = useState<UserFormData>({
    username: '',
    password: '',
    name: '',
    role: 'restorer',
    phone: '',
    bio: '',
  });
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [userToDelete, setUserToDelete] = useState<number | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const exhibitionsRes = await exhibitionsApi.getList();
        const usersRes = await usersApi.getList();
        if (exhibitionsRes.success && exhibitionsRes.data) {
          setExhibitions(exhibitionsRes.data);
          if (exhibitionsRes.data.length > 0) {
            setSelectedExhibition(exhibitionsRes.data[0].id);
          }
        }
        if (usersRes.success && usersRes.data) {
          setUsers(usersRes.data);
        }
      } catch (err) {
        console.error('获取数据失败:', err);
      }
    };
    fetchData();
  }, []);

  const handleDayRuleChange = (dayOfWeek: number, field: keyof DayRule, value: string | boolean) => {
    setDayRules((prev) =>
      prev.map((rule) =>
        rule.dayOfWeek === dayOfWeek ? { ...rule, [field]: value } : rule
      )
    );
  };

  const handleCopyRules = (fromExhibitionId: number) => {
    const targetIds = exhibitions
      .filter((e) => e.id !== fromExhibitionId)
      .map((e) => e.id);
    if (targetIds.length === 0) return;
    alert(`规则已复制到其他 ${targetIds.length} 个展厅（模拟）`);
  };

  const handleAddHoliday = () => {
    if (!newHoliday.date || !newHoliday.name) return;
    setHolidays((prev) => [...prev, { ...newHoliday }]);
    setShowHolidayModal(false);
    setNewHoliday({
      date: '',
      name: '',
      isClosed: false,
      openTime: '09:00',
      closeTime: '17:00',
    });
  };

  const handleRemoveHoliday = (date: string) => {
    setHolidays((prev) => prev.filter((h) => h.date !== date));
  };

  const handleSaveRules = () => {
    alert('开放规则已保存（模拟）');
  };

  const filteredUsers = users.filter(
    (user) =>
      user.name.includes(searchText) ||
      user.username.includes(searchText) ||
      user.phone?.includes(searchText)
  );

  const handleOpenUserModal = (user?: UserType) => {
    if (user) {
      setEditingUser(user);
      setUserForm({
        id: user.id,
        username: user.username,
        password: '',
        name: user.name,
        role: user.role,
        phone: user.phone || '',
        bio: user.bio || '',
      });
    } else {
      setEditingUser(null);
      setUserForm({
        username: '',
        password: '',
        name: '',
        role: 'restorer',
        phone: '',
        bio: '',
      });
    }
    setShowUserModal(true);
  };

  const handleSaveUser = async () => {
    if (!userForm.username || !userForm.name || (!editingUser && !userForm.password)) {
      alert('请填写必填项');
      return;
    }
    try {
      if (editingUser) {
        const res = await usersApi.update(editingUser.id, {
          username: userForm.username,
          name: userForm.name,
          role: userForm.role,
          phone: userForm.phone,
          bio: userForm.bio,
          password: userForm.password || undefined,
        });
        if (res.success) {
          setUsers((prev) =>
            prev.map((u) => (u.id === editingUser.id ? { ...u, ...userForm, password: undefined } as UserType : u))
          );
        }
      } else {
        const res = await usersApi.create({
          username: userForm.username,
          password: userForm.password,
          name: userForm.name,
          role: userForm.role,
          phone: userForm.phone,
          bio: userForm.bio,
        });
        if (res.success && res.data) {
          setUsers((prev) => [...prev, res.data!]);
        }
      }
      setShowUserModal(false);
    } catch (err) {
      console.error('保存用户失败:', err);
    }
  };

  const handleResetPassword = (userId: number) => {
    alert('密码已重置为默认密码 123456（模拟）');
  };

  const handleDeleteUser = async () => {
    if (userToDelete === null) return;
    try {
      const res = await usersApi.remove(userToDelete);
      if (res.success) {
        setUsers((prev) => prev.filter((u) => u.id !== userToDelete));
      }
      setShowDeleteConfirm(false);
      setUserToDelete(null);
    } catch (err) {
      console.error('删除用户失败:', err);
    }
  };

  const tabs = [
    { key: 'rules' as const, label: '开放规则', icon: <Clock className="w-4 h-4" /> },
    { key: 'accounts' as const, label: '账号管理', icon: <Users className="w-4 h-4" /> },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-cream-100 font-serif">系统设置</h1>
          <p className="text-sm text-cream-400 mt-1">配置博物馆开放规则与用户账号</p>
        </div>
      </div>

      <div className="bg-primary-800 rounded-xl border border-gold-500/20">
        <div className="flex border-b border-gold-500/20">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={cn(
                'flex items-center gap-2 px-6 py-4 text-sm font-medium transition-all duration-200 border-b-2',
                activeTab === tab.key
                  ? 'text-gold-400 border-gold-500 bg-gold-500/10'
                  : 'text-cream-400 border-transparent hover:text-cream-200 hover:bg-primary-700/50'
              )}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        <div className="p-6">
          {activeTab === 'rules' && (
            <div className="space-y-6">
              <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-gold-500" />
                    <span className="text-sm text-cream-300">展厅:</span>
                    <select
                      value={selectedExhibition}
                      onChange={(e) =>
                        setSelectedExhibition(e.target.value === 'all' ? 'all' : Number(e.target.value))
                      }
                      className="bg-primary-700 text-cream-100 border border-gold-500/30 rounded px-3 py-1.5 text-sm focus:outline-none focus:border-gold-500"
                    >
                      {exhibitions.map((e) => (
                        <option key={e.id} value={e.id}>
                          {e.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => selectedExhibition !== 'all' && handleCopyRules(selectedExhibition)}
                  >
                    <Copy className="w-4 h-4" />
                    复制到其他展厅
                  </Button>
                  <Button size="sm" onClick={handleSaveRules}>
                    <Check className="w-4 h-4" />
                    保存规则
                  </Button>
                </div>
              </div>

              <div className="bg-primary-900/50 rounded-xl p-6 border border-gold-500/10">
                <h3 className="text-lg font-semibold text-cream-100 mb-6 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-gold-500" />
                  一周开放规则
                </h3>
                <div className="space-y-4">
                  {dayRules.map((rule) => (
                    <div
                      key={rule.dayOfWeek}
                      className={cn(
                        'flex flex-col md:flex-row md:items-center gap-4 p-4 rounded-lg transition-all',
                        rule.isClosed
                          ? 'bg-accent-500/10 border border-accent-500/30'
                          : 'bg-primary-700/50 border border-gold-500/20'
                      )}
                    >
                      <div className="flex items-center gap-3 md:w-24">
                        <span
                          className={cn(
                            'font-semibold',
                            rule.isClosed ? 'text-accent-400' : 'text-cream-200'
                          )}
                        >
                          {rule.dayName}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 flex-1">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={rule.isClosed}
                            onChange={(e) =>
                              handleDayRuleChange(rule.dayOfWeek, 'isClosed', e.target.checked)
                            }
                            className="w-4 h-4 rounded border-gold-500/30 bg-primary-700 text-gold-500 focus:ring-gold-500"
                          />
                          <span className="text-sm text-cream-400">全天闭馆</span>
                        </label>
                        {!rule.isClosed && (
                          <div className="flex items-center gap-2">
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-cream-400">开放时间:</span>
                              <input
                                type="time"
                                value={rule.openTime}
                                onChange={(e) =>
                                  handleDayRuleChange(rule.dayOfWeek, 'openTime', e.target.value)
                                }
                                className="bg-primary-700 text-cream-100 border border-gold-500/30 rounded px-2 py-1 text-sm focus:outline-none focus:border-gold-500"
                              />
                            </div>
                            <span className="text-cream-400">-</span>
                            <input
                              type="time"
                              value={rule.closeTime}
                              onChange={(e) =>
                                handleDayRuleChange(rule.dayOfWeek, 'closeTime', e.target.value)
                              }
                              className="bg-primary-700 text-cream-100 border border-gold-500/30 rounded px-2 py-1 text-sm focus:outline-none focus:border-gold-500"
                            />
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="h-2 bg-primary-700 rounded-full overflow-hidden">
                          <div
                            className={cn(
                              'h-full rounded-full',
                              rule.isClosed
                                ? 'bg-accent-500'
                                : 'bg-gradient-to-r from-gold-600 to-gold-400'
                            )}
                            style={{
                              width: rule.isClosed ? '0%' : '100%',
                            }}
                          />
                        </div>
                        <p className="text-xs text-cream-500 mt-1">
                          {rule.isClosed
                            ? '闭馆日'
                            : `${rule.openTime} - ${rule.closeTime} (${
                                (parseInt(rule.closeTime) - parseInt(rule.openTime)).toFixed(1)
                              } 小时)`}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-primary-900/50 rounded-xl p-6 border border-gold-500/10">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-cream-100 flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-gold-500" />
                    节假日特殊设置
                  </h3>
                  <Button size="sm" variant="outline" onClick={() => setShowHolidayModal(true)}>
                    <Plus className="w-4 h-4" />
                    添加节假日
                  </Button>
                </div>
                <div className="space-y-3">
                  {holidays.length === 0 ? (
                    <p className="text-center text-cream-500 py-8">暂无节假日设置</p>
                  ) : (
                    holidays.map((holiday) => (
                      <div
                        key={holiday.date}
                        className="flex flex-col md:flex-row md:items-center gap-4 p-4 bg-primary-700/50 rounded-lg border border-gold-500/20"
                      >
                        <div className="flex items-center gap-3 md:w-40">
                          <span className="text-cream-200 font-medium">{holiday.name}</span>
                        </div>
                        <div className="flex items-center gap-2 flex-1">
                          <span className="text-sm text-cream-400">{holiday.date}</span>
                          {holiday.isClosed ? (
                            <span className="px-2 py-0.5 bg-accent-500/20 text-accent-400 text-xs rounded-full">
                              闭馆
                            </span>
                          ) : (
                            <span className="text-sm text-cream-300">
                              {holiday.openTime} - {holiday.closeTime}
                            </span>
                          )}
                        </div>
                        <button
                          onClick={() => handleRemoveHoliday(holiday.date)}
                          className="text-accent-400 hover:text-accent-300 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'accounts' && (
            <div className="space-y-6">
              <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-cream-400" />
                  <input
                    type="text"
                    placeholder="搜索用户名、姓名、手机号..."
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                    className="bg-primary-700 text-cream-100 border border-gold-500/30 rounded-lg pl-9 pr-4 py-2 text-sm focus:outline-none focus:border-gold-500 w-64"
                  />
                </div>
                <Button size="sm" onClick={() => handleOpenUserModal()}>
                  <Plus className="w-4 h-4" />
                  新增用户
                </Button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gold-500/20">
                      <th className="text-left py-3 px-4 text-sm font-medium text-cream-400">
                        头像
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-cream-400">
                        用户名
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-cream-400">
                        姓名
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-cream-400">
                        角色
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-cream-400">
                        手机号
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-cream-400">
                        操作
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map((user) => (
                      <tr
                        key={user.id}
                        className="border-b border-gold-500/10 hover:bg-primary-700/50 transition-colors"
                      >
                        <td className="py-3 px-4">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gold-400 to-gold-600 flex items-center justify-center">
                            <User className="w-5 h-5 text-primary-900" />
                          </div>
                        </td>
                        <td className="py-3 px-4 text-cream-200">{user.username}</td>
                        <td className="py-3 px-4 text-cream-200">{user.name}</td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-1 bg-gold-500/20 text-gold-400 text-xs rounded-full">
                            {roleLabels[user.role]}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-cream-300">{user.phone || '-'}</td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleOpenUserModal(user)}
                              className="p-1.5 text-cream-400 hover:text-gold-400 hover:bg-gold-500/10 rounded transition-colors"
                              title="编辑"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleResetPassword(user.id)}
                              className="p-1.5 text-cream-400 hover:text-blue-400 hover:bg-blue-500/10 rounded transition-colors"
                              title="重置密码"
                            >
                              <RotateCcw className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => {
                                setUserToDelete(user.id);
                                setShowDeleteConfirm(true);
                              }}
                              className="p-1.5 text-cream-400 hover:text-accent-400 hover:bg-accent-500/10 rounded transition-colors"
                              title="删除"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>

      {showHolidayModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-primary-800 rounded-xl border border-gold-500/20 w-full max-w-md animate-fade-in">
            <div className="flex items-center justify-between p-4 border-b border-gold-500/20">
              <h3 className="text-lg font-semibold text-cream-100">添加节假日</h3>
              <button
                onClick={() => setShowHolidayModal(false)}
                className="text-cream-400 hover:text-cream-200 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <label className="block text-sm text-cream-300 mb-1">节假日名称</label>
                <input
                  type="text"
                  value={newHoliday.name}
                  onChange={(e) => setNewHoliday({ ...newHoliday, name: e.target.value })}
                  placeholder="如：元旦、春节"
                  className="w-full bg-primary-700 text-cream-100 border border-gold-500/30 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-gold-500"
                />
              </div>
              <div>
                <label className="block text-sm text-cream-300 mb-1">日期</label>
                <input
                  type="date"
                  value={newHoliday.date}
                  onChange={(e) => setNewHoliday({ ...newHoliday, date: e.target.value })}
                  className="w-full bg-primary-700 text-cream-100 border border-gold-500/30 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-gold-500"
                />
              </div>
              <div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newHoliday.isClosed}
                    onChange={(e) => setNewHoliday({ ...newHoliday, isClosed: e.target.checked })}
                    className="w-4 h-4 rounded border-gold-500/30 bg-primary-700 text-gold-500 focus:ring-gold-500"
                  />
                  <span className="text-sm text-cream-400">全天闭馆</span>
                </label>
              </div>
              {!newHoliday.isClosed && (
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <label className="block text-sm text-cream-300 mb-1">开放时间</label>
                    <input
                      type="time"
                      value={newHoliday.openTime}
                      onChange={(e) => setNewHoliday({ ...newHoliday, openTime: e.target.value })}
                      className="w-full bg-primary-700 text-cream-100 border border-gold-500/30 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-gold-500"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block text-sm text-cream-300 mb-1">关闭时间</label>
                    <input
                      type="time"
                      value={newHoliday.closeTime}
                      onChange={(e) => setNewHoliday({ ...newHoliday, closeTime: e.target.value })}
                      className="w-full bg-primary-700 text-cream-100 border border-gold-500/30 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-gold-500"
                    />
                  </div>
                </div>
              )}
            </div>
            <div className="flex justify-end gap-2 p-4 border-t border-gold-500/20">
              <Button variant="outline" size="sm" onClick={() => setShowHolidayModal(false)}>
                取消
              </Button>
              <Button size="sm" onClick={handleAddHoliday}>
                添加
              </Button>
            </div>
          </div>
        </div>
      )}

      {showUserModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-primary-800 rounded-xl border border-gold-500/20 w-full max-w-lg animate-fade-in max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b border-gold-500/20 sticky top-0 bg-primary-800">
              <h3 className="text-lg font-semibold text-cream-100">
                {editingUser ? '编辑用户' : '新增用户'}
              </h3>
              <button
                onClick={() => setShowUserModal(false)}
                className="text-cream-400 hover:text-cream-200 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-cream-300 mb-1">
                    用户名 <span className="text-accent-400">*</span>
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-cream-400" />
                    <input
                      type="text"
                      value={userForm.username}
                      onChange={(e) => setUserForm({ ...userForm, username: e.target.value })}
                      placeholder="请输入用户名"
                      className="w-full bg-primary-700 text-cream-100 border border-gold-500/30 rounded-lg pl-9 pr-3 py-2 text-sm focus:outline-none focus:border-gold-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm text-cream-300 mb-1">
                    {editingUser ? '新密码' : '密码'} {!editingUser && <span className="text-accent-400">*</span>}
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-cream-400" />
                    <input
                      type="password"
                      value={userForm.password}
                      onChange={(e) => setUserForm({ ...userForm, password: e.target.value })}
                      placeholder={editingUser ? '不修改请留空' : '请输入密码'}
                      className="w-full bg-primary-700 text-cream-100 border border-gold-500/30 rounded-lg pl-9 pr-3 py-2 text-sm focus:outline-none focus:border-gold-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm text-cream-300 mb-1">
                    姓名 <span className="text-accent-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={userForm.name}
                    onChange={(e) => setUserForm({ ...userForm, name: e.target.value })}
                    placeholder="请输入姓名"
                    className="w-full bg-primary-700 text-cream-100 border border-gold-500/30 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-gold-500"
                  />
                </div>
                <div>
                  <label className="block text-sm text-cream-300 mb-1">
                    角色 <span className="text-accent-400">*</span>
                  </label>
                  <select
                    value={userForm.role}
                    onChange={(e) => setUserForm({ ...userForm, role: e.target.value as RoleType })}
                    className="w-full bg-primary-700 text-cream-100 border border-gold-500/30 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-gold-500"
                  >
                    {Object.entries(roleLabels).map(([key, label]) => (
                      <option key={key} value={key}>
                        {label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm text-cream-300 mb-1">手机号</label>
                  <div className="relative">
                    <Phone className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-cream-400" />
                    <input
                      type="tel"
                      value={userForm.phone}
                      onChange={(e) => setUserForm({ ...userForm, phone: e.target.value })}
                      placeholder="请输入手机号"
                      className="w-full bg-primary-700 text-cream-100 border border-gold-500/30 rounded-lg pl-9 pr-3 py-2 text-sm focus:outline-none focus:border-gold-500"
                    />
                  </div>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm text-cream-300 mb-1">个人简介</label>
                  <div className="relative">
                    <FileText className="w-4 h-4 absolute left-3 top-3 text-cream-400" />
                    <textarea
                      value={userForm.bio}
                      onChange={(e) => setUserForm({ ...userForm, bio: e.target.value })}
                      placeholder="请输入个人简介"
                      rows={3}
                      className="w-full bg-primary-700 text-cream-100 border border-gold-500/30 rounded-lg pl-9 pr-3 py-2 text-sm focus:outline-none focus:border-gold-500 resize-none"
                    />
                  </div>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2 p-4 border-t border-gold-500/20 sticky bottom-0 bg-primary-800">
              <Button variant="outline" size="sm" onClick={() => setShowUserModal(false)}>
                取消
              </Button>
              <Button size="sm" onClick={handleSaveUser}>
                {editingUser ? '保存修改' : '创建用户'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-primary-800 rounded-xl border border-gold-500/20 w-full max-w-sm animate-fade-in">
            <div className="p-6 text-center">
              <div className="w-12 h-12 rounded-full bg-accent-500/20 flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="w-6 h-6 text-accent-400" />
              </div>
              <h3 className="text-lg font-semibold text-cream-100 mb-2">确认删除</h3>
              <p className="text-sm text-cream-400 mb-6">
                确定要删除该用户吗？此操作不可撤销。
              </p>
              <div className="flex justify-center gap-3">
                <Button variant="outline" size="sm" onClick={() => setShowDeleteConfirm(false)}>
                  取消
                </Button>
                <Button variant="danger" size="sm" onClick={handleDeleteUser}>
                  确认删除
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
