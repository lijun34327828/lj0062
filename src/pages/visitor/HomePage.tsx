import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, ChevronRight, ChevronLeft, MapPin, Users, Clock, Sparkles } from 'lucide-react';
import dayjs from 'dayjs';
import { exhibitionsApi } from '@/services/api';
import { useBookingStore } from '@/store/bookingStore';
import type { Exhibition, CollectionItem } from '../../../shared/types';

const heroSlides = [
  {
    title: '穿越千年文明',
    subtitle: '探索历史的瑰宝，感受文化的魅力',
    image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=ancient%20chinese%20museum%20grand%20hall%20with%20golden%20sunlight%20streaming%20through%20windows%2C%20columns%2C%20traditional%20architecture&image_size=landscape_16_9',
  },
  {
    title: '珍藏历史记忆',
    subtitle: '数万件珍贵藏品，讲述中华文明的故事',
    image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=museum%20exhibition%20hall%20with%20ancient%20chinese%20artifacts%20in%20glass%20display%20cases%2C%20spotlight%20lighting%2C%20elegant%20interior&image_size=landscape_16_9',
  },
  {
    title: '沉浸式文化体验',
    subtitle: '专业讲解，带您深入了解每一件展品的故事',
    image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=museum%20guide%20in%20traditional%20chinese%20attire%20explaining%20ancient%20treasures%20to%20a%20group%20of%20visitors%2C%20warm%20atmosphere&image_size=landscape_16_9',
  },
];

const mockCollections: CollectionItem[] = Array.from({ length: 8 }, (_, i) => ({
  id: i + 1,
  name: ['青铜方鼎', '玉如意', '青花瓷瓶', '金缕玉衣', '战国编钟', '唐三彩', '清明上河图', '玉玺'][i],
  category: ['青铜器', '玉器', '瓷器', '织物', '乐器', '陶器', '书画', '玺印'][i],
  description: '珍贵的历史文物，具有极高的艺术价值和历史意义。',
  era: ['商代', '清代', '明代', '汉代', '战国', '唐代', '宋代', '秦代'][i],
  image: `https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=${encodeURIComponent(['ancient chinese bronze ding vessel', 'jade ruyi ornament', 'blue and white porcelain vase', 'gold thread jade burial suit', 'ancient chinese bronze bells', 'tang dynasty sancai pottery', 'ancient chinese painting scroll', 'imperial jade seal'][i])}&image_size=square`,
  exhibitionId: (i % 4) + 1,
  locationX: 0,
  locationY: 0,
  maintenanceCycle: 30,
  lastMaintenanceDate: dayjs().subtract(7, 'day').format('YYYY-MM-DD'),
  nextMaintenanceDate: dayjs().add(23, 'day').format('YYYY-MM-DD'),
  visitCount: Math.floor(Math.random() * 10000) + 1000,
  status: 'normal' as const,
}));

export default function HomePage() {
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [exhibitions, setExhibitions] = useState<Exhibition[]>([]);
  const [quickDate, setQuickDate] = useState(dayjs().format('YYYY-MM-DD'));
  const { selectDate, selectExhibition } = useBookingStore();

  useEffect(() => {
    const fetchExhibitions = async () => {
      try {
        const response = await exhibitionsApi.getList();
        if (response.success && response.data) {
          setExhibitions(response.data.slice(0, 4));
        }
      } catch (err) {
        console.error('获取展厅列表失败:', err);
      }
    };
    fetchExhibitions();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const handleQuickBooking = () => {
    selectDate(quickDate);
    navigate('/visitor/booking');
  };

  const handleExhibitionClick = (exhibition: Exhibition) => {
    selectExhibition(exhibition);
    navigate('/visitor/booking');
  };

  const handleExhibitionsClick = () => {
    navigate('/visitor/exhibitions');
  };

  const handleCollectionsClick = () => {
    navigate('/visitor/collections');
  };

  return (
    <div className="min-h-screen bg-cream-50 animate-fade-in">
      <section className="relative h-screen overflow-hidden">
        {heroSlides.map((slide, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-1000 ${
              index === currentSlide ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <img
              src={slide.image}
              alt={slide.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-primary-900/70 via-primary-900/50 to-primary-900/80" />
          </div>
        ))}

        <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-4">
          <Sparkles className="w-16 h-16 text-gold-400 mb-6 animate-pulse-slow" />
          <h1 className="text-5xl md:text-7xl font-serif font-bold text-transparent bg-clip-text bg-gradient-to-r from-gold-300 via-gold-400 to-gold-500 mb-4">
            {heroSlides[currentSlide].title}
          </h1>
          <p className="text-xl md:text-2xl text-cream-100 mb-8 max-w-2xl">
            {heroSlides[currentSlide].subtitle}
          </p>
          <button
            onClick={() => navigate('/visitor/booking')}
            className="group px-10 py-4 bg-gradient-to-r from-gold-500 to-gold-600 text-primary-900 font-bold text-lg rounded-lg hover:from-gold-400 hover:to-gold-500 transition-all duration-300 shadow-lg hover:shadow-gold-500/30 hover:scale-105 flex items-center gap-2"
          >
            <Calendar className="w-5 h-5" />
            立即预约
            <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        <button
          onClick={() => setCurrentSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length)}
          className="absolute left-4 top-1/2 -translate-y-1/2 z-20 p-3 bg-black/30 hover:bg-black/50 rounded-full text-white transition-colors"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <button
          onClick={() => setCurrentSlide((prev) => (prev + 1) % heroSlides.length)}
          className="absolute right-4 top-1/2 -translate-y-1/2 z-20 p-3 bg-black/30 hover:bg-black/50 rounded-full text-white transition-colors"
        >
          <ChevronRight className="w-6 h-6" />
        </button>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex gap-2">
          {heroSlides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                index === currentSlide ? 'bg-gold-400 w-8' : 'bg-white/50 hover:bg-white/70'
              }`}
            />
          ))}
        </div>
      </section>

      <section className="py-20 px-4 md:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-serif font-bold text-primary-800 mb-4">
              精品展厅
            </h2>
            <div className="w-24 h-1 bg-gradient-to-r from-transparent via-gold-500 to-transparent mx-auto mb-4" />
            <button
              onClick={handleExhibitionsClick}
              className="text-gold-600 hover:text-gold-700 font-medium inline-flex items-center gap-1 group"
            >
              查看全部展厅
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {exhibitions.map((exhibition, index) => (
              <div
                key={exhibition.id}
                onClick={() => handleExhibitionClick(exhibition)}
                className="group cursor-pointer bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-3 animate-slide-up"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={exhibition.coverImage || `https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=${encodeURIComponent(`museum exhibition hall ${exhibition.name}`)}&image_size=landscape_4_3`}
                    alt={exhibition.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
                    <div className="flex items-center gap-2 text-white/90">
                      <MapPin className="w-4 h-4 text-gold-400" />
                      <span className="text-sm">{exhibition.location}</span>
                    </div>
                  </div>
                </div>
                <div className="p-5">
                  <h3 className="text-xl font-bold text-primary-800 mb-2 group-hover:text-gold-600 transition-colors">
                    {exhibition.name}
                  </h3>
                  <p className="text-cream-600 text-sm mb-4 line-clamp-2">
                    {exhibition.description}
                  </p>
                  <div className="flex items-center justify-between text-sm text-cream-500">
                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      <span>容纳 {exhibition.capacity} 人</span>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gold-500 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
                <div className="h-1 bg-gradient-to-r from-gold-400 via-gold-500 to-gold-600 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 px-4 md:px-8 bg-primary-800">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-serif font-bold text-gold-400 mb-4">
              热门藏品
            </h2>
            <div className="w-24 h-1 bg-gradient-to-r from-transparent via-gold-500 to-transparent mx-auto mb-4" />
            <p className="text-cream-300 mb-4">探索博物馆最受瞩目的珍贵文物</p>
            <button
              onClick={handleCollectionsClick}
              className="text-gold-400 hover:text-gold-300 font-medium inline-flex items-center gap-1 group"
            >
              浏览全部藏品
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          <div className="relative">
            <div className="overflow-x-auto pb-6 -mx-4 px-4 scrollbar-hide">
              <div className="flex gap-6 min-w-max">
                {mockCollections.map((item, index) => (
                  <div
                    key={item.id}
                    className="w-64 flex-shrink-0 bg-cream-50 rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 group animate-slide-up"
                    style={{ animationDelay: `${index * 80}ms` }}
                  >
                    <div className="relative h-48 overflow-hidden">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      />
                      <div className="absolute top-3 right-3 px-3 py-1 bg-gold-500/90 text-primary-900 text-xs font-bold rounded-full">
                        {item.era}
                      </div>
                    </div>
                    <div className="p-4">
                      <h3 className="text-lg font-bold text-primary-800 mb-1">
                        {item.name}
                      </h3>
                      <p className="text-sm text-gold-600 mb-2">{item.category}</p>
                      <p className="text-xs text-cream-600 line-clamp-2">
                        {item.description}
                      </p>
                      <div className="mt-3 pt-3 border-t border-cream-200 flex items-center justify-between text-xs text-cream-500">
                        <span>参观次数: {item.visitCount.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 px-4 md:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-gradient-to-br from-primary-700 to-primary-800 rounded-2xl p-8 md:p-12 shadow-2xl">
            <div className="text-center mb-8">
              <h2 className="text-3xl md:text-4xl font-serif font-bold text-gold-400 mb-4">
                快速预约
              </h2>
              <p className="text-cream-300">选择参观日期，开启您的文化之旅</p>
            </div>

            <div className="flex flex-col md:flex-row gap-4 items-center justify-center">
              <div className="flex items-center gap-3 bg-white/10 backdrop-blur rounded-lg px-4 py-3 w-full md:w-auto">
                <Calendar className="w-5 h-5 text-gold-400" />
                <input
                  type="date"
                  value={quickDate}
                  min={dayjs().format('YYYY-MM-DD')}
                  onChange={(e) => setQuickDate(e.target.value)}
                  className="bg-transparent text-white border-none outline-none text-lg w-full md:w-48"
                />
              </div>
              <button
                onClick={handleQuickBooking}
                className="group px-8 py-3 bg-gradient-to-r from-gold-500 to-gold-600 text-primary-900 font-bold rounded-lg hover:from-gold-400 hover:to-gold-500 transition-all duration-300 shadow-lg hover:shadow-gold-500/30 hover:scale-105 flex items-center gap-2 w-full md:w-auto justify-center"
              >
                <Clock className="w-5 h-5" />
                一键预约
                <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        </div>
      </section>

      <footer className="bg-primary-900 text-cream-400 py-8 px-4 text-center">
        <p className="mb-2">© 2024 博物馆预约系统 | 传承文明，启迪未来</p>
        <p className="text-sm text-cream-500">开放时间: 周二至周日 09:00-17:00 (16:30停止入馆)</p>
      </footer>
    </div>
  );
}
