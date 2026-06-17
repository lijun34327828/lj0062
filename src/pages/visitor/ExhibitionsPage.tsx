import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Users, ChevronRight, ArrowLeft, Calendar, Sparkles } from 'lucide-react';
import { exhibitionsApi } from '@/services/api';
import { useBookingStore } from '@/store/bookingStore';
import type { Exhibition } from '../../../shared/types';

export default function ExhibitionsPage() {
  const navigate = useNavigate();
  const { selectExhibition } = useBookingStore();
  const [exhibitions, setExhibitions] = useState<Exhibition[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchExhibitions = async () => {
      try {
        const response = await exhibitionsApi.getList();
        if (response.success && response.data) {
          setExhibitions(response.data);
        }
      } catch (err) {
        console.error('获取展厅列表失败:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchExhibitions();
  }, []);

  const handleExhibitionClick = (exhibition: Exhibition) => {
    selectExhibition(exhibition);
    navigate('/visitor/booking');
  };

  const heroImage = 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=grand%20museum%20exhibition%20hall%20interior%20with%20columns%20and%20natural%20light&image_size=landscape_16_9';

  return (
    <div className="min-h-screen bg-cream-50 animate-fade-in">
      <section className="relative h-[50vh] overflow-hidden">
        <img
          src={heroImage}
          alt="展厅导览"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-primary-900/70 via-primary-900/50 to-primary-900/80" />
        <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-4">
          <Sparkles className="w-12 h-12 text-gold-400 mb-4 animate-pulse-slow" />
          <h1 className="text-4xl md:text-6xl font-serif font-bold text-transparent bg-clip-text bg-gradient-to-r from-gold-300 via-gold-400 to-gold-500 mb-4">
            展厅导览
          </h1>
          <p className="text-lg md:text-xl text-cream-100 max-w-2xl">
            探索我们精心策划的主题展厅，穿越时空感受中华文明的博大精深
          </p>
        </div>
      </section>

      <section className="py-16 px-4 md:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-primary-800 text-white py-4 px-6 rounded-lg mb-8 flex items-center gap-4">
            <button
              onClick={() => navigate('/visitor')}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <p className="text-cream-200">共设有 {exhibitions.length} 个主题展厅，点击卡片可快速预约参观</p>
          </div>

          {loading ? (
            <div className="text-center py-16 text-cream-500">
              <div className="w-12 h-12 border-4 border-gold-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p>正在加载展厅信息...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {exhibitions.map((exhibition, index) => (
                <div
                  key={exhibition.id}
                  onClick={() => handleExhibitionClick(exhibition)}
                  className="group cursor-pointer bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 animate-slide-up"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="relative h-64 overflow-hidden">
                    <img
                      src={exhibition.coverImage || `https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=${encodeURIComponent(`museum exhibition hall ${exhibition.name}`)}&image_size=landscape_4_3`}
                      alt={exhibition.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                    <div className="absolute bottom-4 left-4 right-4">
                      <h3 className="text-2xl font-serif font-bold text-white mb-2">
                        {exhibition.name}
                      </h3>
                      <div className="flex items-center gap-4 text-white/90 text-sm">
                        <div className="flex items-center gap-1">
                          <MapPin className="w-4 h-4 text-gold-400" />
                          <span>{exhibition.location}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Users className="w-4 h-4 text-gold-400" />
                          <span>容纳 {exhibition.capacity} 人</span>
                        </div>
                      </div>
                    </div>
                    <div className="absolute top-4 right-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                        exhibition.isActive
                          ? 'bg-green-500 text-white'
                          : 'bg-gray-500 text-white'
                      }`}>
                        {exhibition.isActive ? '开放中' : '暂未开放'}
                      </span>
                    </div>
                  </div>
                  <div className="p-6">
                    <p className="text-cream-600 leading-relaxed mb-4">
                      {exhibition.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-gold-600 font-semibold">
                        <Calendar className="w-5 h-5" />
                        <span>立即预约参观</span>
                      </div>
                      <ChevronRight className="w-6 h-6 text-gold-500 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                  <div className="h-1 bg-gradient-to-r from-gold-400 via-gold-500 to-gold-600 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="py-16 px-4 md:px-8 bg-primary-800">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-serif font-bold text-gold-400 mb-6">
            参观须知
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
            <div className="bg-white/5 backdrop-blur rounded-xl p-6 border border-gold-500/20">
              <div className="w-12 h-12 rounded-full bg-gold-500/20 flex items-center justify-center mb-4">
                <Calendar className="w-6 h-6 text-gold-400" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">开放时间</h3>
              <p className="text-cream-300 text-sm">
                周二至周日 9:00-17:00<br />
                16:30 停止入馆<br />
                周一闭馆（法定节假日除外）
              </p>
            </div>
            <div className="bg-white/5 backdrop-blur rounded-xl p-6 border border-gold-500/20">
              <div className="w-12 h-12 rounded-full bg-gold-500/20 flex items-center justify-center mb-4">
                <Users className="w-6 h-6 text-gold-400" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">预约方式</h3>
              <p className="text-cream-300 text-sm">
                个人参观需提前1天预约<br />
                团队参观需提前3天预约<br />
                每人每日最多预约5人
              </p>
            </div>
            <div className="bg-white/5 backdrop-blur rounded-xl p-6 border border-gold-500/20">
              <div className="w-12 h-12 rounded-full bg-gold-500/20 flex items-center justify-center mb-4">
                <MapPin className="w-6 h-6 text-gold-400" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">入馆方式</h3>
              <p className="text-cream-300 text-sm">
                凭预约二维码入馆<br />
                配合工作人员安检<br />
                展厅内禁止饮食和拍照
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
