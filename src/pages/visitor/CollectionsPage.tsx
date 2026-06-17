import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, ArrowLeft, Sparkles, Eye, Clock, Tag } from 'lucide-react';
import { collectionsApi, exhibitionsApi } from '@/services/api';
import type { CollectionItem, Exhibition } from '../../../shared/types';

export default function CollectionsPage() {
  const navigate = useNavigate();
  const [collections, setCollections] = useState<CollectionItem[]>([]);
  const [exhibitions, setExhibitions] = useState<Exhibition[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('全部');
  const [selectedExhibition, setSelectedExhibition] = useState<number | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [collectionsRes, exhibitionsRes] = await Promise.all([
          collectionsApi.getList(),
          exhibitionsApi.getList()
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
    fetchData();
  }, []);

  const categories = ['全部', ...Array.from(new Set(collections.map(c => c.category)))];

  const filteredCollections = collections.filter(item => {
    const matchesSearch = item.name.includes(searchTerm) || 
                          item.description.includes(searchTerm) ||
                          item.era.includes(searchTerm);
    const matchesCategory = selectedCategory === '全部' || item.category === selectedCategory;
    const matchesExhibition = selectedExhibition === null || item.exhibitionId === selectedExhibition;
    return matchesSearch && matchesCategory && matchesExhibition;
  });

  const heroImage = 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=ancient%20chinese%20treasures%20museum%20collection%20display%20with%20spotlight&image_size=landscape_16_9';

  return (
    <div className="min-h-screen bg-cream-50 animate-fade-in">
      <section className="relative h-[50vh] overflow-hidden">
        <img
          src={heroImage}
          alt="藏品展示"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-primary-900/70 via-primary-900/50 to-primary-900/80" />
        <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-4">
          <Sparkles className="w-12 h-12 text-gold-400 mb-4 animate-pulse-slow" />
          <h1 className="text-4xl md:text-6xl font-serif font-bold text-transparent bg-clip-text bg-gradient-to-r from-gold-300 via-gold-400 to-gold-500 mb-4">
            藏品展示
          </h1>
          <p className="text-lg md:text-xl text-cream-100 max-w-2xl">
            欣赏数万件珍贵文物，感受中华文明五千年的璀璨历史
          </p>
        </div>
      </section>

      <section className="py-16 px-4 md:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-primary-800 text-white py-4 px-6 rounded-lg mb-8 flex items-center gap-4 flex-wrap">
            <button
              onClick={() => navigate('/visitor')}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <p className="text-cream-200 flex-1">馆藏文物共 {collections.length} 件，可按分类或展厅筛选浏览</p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-cream-400" />
                <input
                  type="text"
                  placeholder="搜索藏品名称、年代或描述..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border-2 border-cream-200 rounded-lg focus:border-gold-500 focus:outline-none transition-colors"
                />
              </div>
              <div className="flex gap-3 flex-wrap">
                <div className="flex items-center gap-2">
                  <Filter className="w-5 h-5 text-cream-500" />
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="px-4 py-3 border-2 border-cream-200 rounded-lg focus:border-gold-500 focus:outline-none transition-colors bg-white"
                  >
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                <select
                  value={selectedExhibition || ''}
                  onChange={(e) => setSelectedExhibition(e.target.value ? Number(e.target.value) : null)}
                  className="px-4 py-3 border-2 border-cream-200 rounded-lg focus:border-gold-500 focus:outline-none transition-colors bg-white"
                >
                  <option value="">全部展厅</option>
                  {exhibitions.map(exh => (
                    <option key={exh.id} value={exh.id}>{exh.name}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-16 text-cream-500">
              <div className="w-12 h-12 border-4 border-gold-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p>正在加载藏品信息...</p>
            </div>
          ) : filteredCollections.length === 0 ? (
            <div className="text-center py-16 text-cream-500">
              <Eye className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p className="text-lg">没有找到匹配的藏品</p>
              <p className="text-sm mt-2">请尝试调整搜索条件或筛选器</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredCollections.map((item, index) => (
                <div
                  key={item.id}
                  className="group bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 animate-slide-up"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="relative h-56 overflow-hidden">
                    <img
                      src={item.image || `https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=${encodeURIComponent(`ancient chinese ${item.category} artifact`)}&image_size=square`}
                      alt={item.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                    <div className="absolute top-3 right-3 px-3 py-1 bg-gold-500/90 text-primary-900 text-xs font-bold rounded-full">
                      {item.era}
                    </div>
                    {item.status !== 'normal' && (
                      <div className="absolute top-3 left-3 px-3 py-1 bg-red-500/90 text-white text-xs font-bold rounded-full">
                        {item.status === 'maintenance' ? '维护中' : '修复中'}
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="text-lg font-bold text-primary-800 mb-1 group-hover:text-gold-600 transition-colors">
                      {item.name}
                    </h3>
                    <div className="flex items-center gap-2 mb-2">
                      <Tag className="w-4 h-4 text-gold-500" />
                      <span className="text-sm text-gold-600">{item.category}</span>
                    </div>
                    <p className="text-sm text-cream-600 line-clamp-2 mb-3">
                      {item.description}
                    </p>
                    <div className="flex items-center justify-between pt-3 border-t border-cream-200">
                      <div className="flex items-center gap-1 text-xs text-cream-500">
                        <Eye className="w-4 h-4" />
                        <span>{item.visitCount.toLocaleString()} 次浏览</span>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-cream-500">
                        <Clock className="w-4 h-4" />
                        <span>{item.era}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="py-16 px-4 md:px-8 bg-primary-800">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-serif font-bold text-gold-400 mb-8 text-center">
            藏品分类
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {categories.slice(1).map((cat, index) => {
              const count = collections.filter(c => c.category === cat).length;
              return (
                <div
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`cursor-pointer p-6 rounded-xl text-center transition-all duration-300 ${
                    selectedCategory === cat
                      ? 'bg-gold-500 text-primary-900 shadow-lg scale-105'
                      : 'bg-white/5 text-white hover:bg-white/10 border border-gold-500/20'
                  }`}
                >
                  <p className="text-2xl font-bold mb-1">{count}</p>
                  <p className="text-sm">{cat}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
