import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Clock,
  MapPin,
  Phone,
  Mail,
  Ticket,
  Camera,
  Coffee,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Bus,
  Car,
  Bike,
  Accessibility,
} from 'lucide-react';

const faqs = [
  {
    question: '如何预约参观？',
    answer: '您可以通过本网站的"在线预约"功能进行预约。个人参观需提前1天预约，团队参观（10人以上）需提前3天预约。预约成功后将生成二维码，入馆时请出示。'
  },
  {
    question: '门票价格是多少？',
    answer: '本馆实行免费开放政策，所有展览均免费参观。特展期间可能会收取少量费用，届时将提前公告。讲解服务需另行付费，具体价格请咨询服务台。'
  },
  {
    question: '可以带小孩参观吗？',
    answer: '非常欢迎家庭观众！14岁以下儿童需由成年人陪同入馆。我们设有儿童互动区，每周六下午有专门的儿童教育活动，欢迎参与。'
  },
  {
    question: '馆内可以拍照吗？',
    answer: '常设展览允许非闪光灯摄影，但禁止使用三脚架和自拍杆。特展和部分珍贵文物可能禁止拍照，请以现场标识为准。禁止对藏品进行摄像和直播。'
  },
  {
    question: '有讲解服务吗？',
    answer: '有的。我们提供免费的中文人工讲解服务，每日上午10:00和下午2:00各一场，在大厅集合。也可以租用语音导览器，或预约付费的专业讲解员。'
  },
  {
    question: '馆内有餐饮服务吗？',
    answer: '馆内设有咖啡厅和观众餐厅，提供简餐、饮品和文博主题特色餐饮。您也可以在休息区食用自带的食品，但展厅内禁止饮食。'
  },
];

const trafficInfo = [
  {
    icon: Bus,
    title: '公共交通',
    content: '乘坐公交1路、5路、10路至博物馆站下车，步行200米即到。地铁2号线文化广场站D出口，步行500米。'
  },
  {
    icon: Car,
    title: '自驾车',
    content: '馆内设有地下停车场，入口位于东门。开放时间内停车免费，车位有限，建议优先选择公共交通。'
  },
  {
    icon: Bike,
    title: '非机动车',
    content: '南门两侧设有共享单车停放区和自行车停车场，方便绿色出行。'
  },
  {
    icon: Accessibility,
    title: '无障碍设施',
    content: '全馆配备无障碍通道、电梯、无障碍卫生间。东门设有轮椅坡道，服务台可免费租借轮椅和婴儿车。'
  },
];

export default function GuidePage() {
  const navigate = useNavigate();
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const heroImage = 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=museum%20visitor%20guide%20information%20desk%20with%20warm%20lighting&image_size=landscape_16_9';

  return (
    <div className="min-h-screen bg-cream-50 animate-fade-in">
      <section className="relative h-[50vh] overflow-hidden">
        <img
          src={heroImage}
          alt="参观指南"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-primary-900/70 via-primary-900/50 to-primary-900/80" />
        <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-4">
          <Sparkles className="w-12 h-12 text-gold-400 mb-4 animate-pulse-slow" />
          <h1 className="text-4xl md:text-6xl font-serif font-bold text-transparent bg-clip-text bg-gradient-to-r from-gold-300 via-gold-400 to-gold-500 mb-4">
            参观指南
          </h1>
          <p className="text-lg md:text-xl text-cream-100 max-w-2xl">
            参观前请仔细阅读本指南，祝您拥有愉快的文化之旅
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
            <p className="text-cream-200">为您提供全方位的参观信息和服务指南</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            <div className="bg-white rounded-2xl shadow-lg p-6 text-center hover:shadow-xl transition-shadow">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-gold-400 to-gold-600 flex items-center justify-center mx-auto mb-4">
                <Clock className="w-8 h-8 text-primary-900" />
              </div>
              <h3 className="text-xl font-bold text-primary-800 mb-3">开放时间</h3>
              <div className="text-cream-600 space-y-1 text-sm">
                <p>周二至周日</p>
                <p className="text-lg font-semibold text-gold-600">09:00 - 17:00</p>
                <p className="text-cream-500">16:30 停止入馆</p>
                <p className="mt-3 text-red-500 font-medium">周一闭馆</p>
                <p className="text-xs text-cream-500">（法定节假日除外）</p>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-6 text-center hover:shadow-xl transition-shadow">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-gold-400 to-gold-600 flex items-center justify-center mx-auto mb-4">
                <Ticket className="w-8 h-8 text-primary-900" />
              </div>
              <h3 className="text-xl font-bold text-primary-800 mb-3">参观门票</h3>
              <div className="text-cream-600 space-y-1 text-sm">
                <p className="text-3xl font-bold text-gold-600 mb-2">免费</p>
                <p>需提前预约</p>
                <p className="text-cream-500">特展除外</p>
                <p className="mt-3">
                  <span className="inline-block px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs">
                    个人预约
                  </span>
                  <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs ml-2">
                    团队预约
                  </span>
                </p>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-6 text-center hover:shadow-xl transition-shadow">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-gold-400 to-gold-600 flex items-center justify-center mx-auto mb-4">
                <MapPin className="w-8 h-8 text-primary-900" />
              </div>
              <h3 className="text-xl font-bold text-primary-800 mb-3">场馆地址</h3>
              <div className="text-cream-600 space-y-1 text-sm">
                <p className="font-medium">文化街1号</p>
                <p>博物馆大厦</p>
                <p className="text-cream-500 mt-2">邮编：100000</p>
                <div className="mt-3 p-3 bg-cream-100 rounded-lg">
                  <p className="text-xs text-cream-500">地铁2号线文化广场站D出口</p>
                  <p className="text-xs text-cream-500">步行500米即达</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-6 text-center hover:shadow-xl transition-shadow">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-gold-400 to-gold-600 flex items-center justify-center mx-auto mb-4">
                <Phone className="w-8 h-8 text-primary-900" />
              </div>
              <h3 className="text-xl font-bold text-primary-800 mb-3">联系我们</h3>
              <div className="text-cream-600 space-y-2 text-sm">
                <p className="flex items-center justify-center gap-2">
                  <Phone className="w-4 h-4 text-gold-500" />
                  <span>400-888-8888</span>
                </p>
                <p className="flex items-center justify-center gap-2">
                  <Mail className="w-4 h-4 text-gold-500" />
                  <span>contact@museum.com</span>
                </p>
                <p className="text-xs text-cream-500 mt-2">咨询时间</p>
                <p className="text-xs">09:00 - 17:00</p>
              </div>
            </div>
          </div>

          <div className="mb-16">
            <h2 className="text-3xl font-serif font-bold text-primary-800 mb-8 text-center">
              交通指南
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {trafficInfo.map((info, index) => (
                <div
                  key={index}
                  className="bg-white rounded-2xl shadow-lg p-6 flex gap-4 hover:shadow-xl transition-shadow"
                >
                  <div className="w-12 h-12 rounded-xl bg-gold-100 flex items-center justify-center flex-shrink-0">
                    <info.icon className="w-6 h-6 text-gold-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-primary-800 mb-2">{info.title}</h3>
                    <p className="text-cream-600 text-sm leading-relaxed">{info.content}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mb-16">
            <h2 className="text-3xl font-serif font-bold text-primary-800 mb-8 text-center">
              参观须知
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-green-50 border border-green-200 rounded-2xl p-6">
                <div className="w-12 h-12 rounded-full bg-green-500 flex items-center justify-center mb-4">
                  <Ticket className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-bold text-green-800 mb-3">入馆须知</h3>
                <ul className="text-green-700 text-sm space-y-2">
                  <li>• 请凭预约二维码入馆</li>
                  <li>• 请配合安全检查</li>
                  <li>• 衣冠不整者谢绝入内</li>
                  <li>• 醉酒者谢绝入内</li>
                  <li>• 请勿携带易燃易爆物品</li>
                </ul>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6">
                <div className="w-12 h-12 rounded-full bg-amber-500 flex items-center justify-center mb-4">
                  <Camera className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-bold text-amber-800 mb-3">参观礼仪</h3>
                <ul className="text-amber-700 text-sm space-y-2">
                  <li>• 展厅内禁止使用闪光灯</li>
                  <li>• 禁止触摸展品</li>
                  <li>• 请勿大声喧哗</li>
                  <li>• 请勿追逐打闹</li>
                  <li>• 手机请调至静音</li>
                </ul>
              </div>

              <div className="bg-red-50 border border-red-200 rounded-2xl p-6">
                <div className="w-12 h-12 rounded-full bg-red-500 flex items-center justify-center mb-4">
                  <AlertTriangle className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-bold text-red-800 mb-3">禁止行为</h3>
                <ul className="text-red-700 text-sm space-y-2">
                  <li>• 展厅内禁止饮食</li>
                  <li>• 禁止吸烟和使用明火</li>
                  <li>• 禁止携带宠物入馆</li>
                  <li>• 禁止未经许可的直播</li>
                  <li>• 禁止翻越围栏和展台</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="mb-16">
            <h2 className="text-3xl font-serif font-bold text-primary-800 mb-8 text-center">
              游客服务
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { icon: Coffee, title: '餐饮服务', desc: '咖啡厅、餐厅、休息区' },
                { icon: Ticket, title: '讲解服务', desc: '人工讲解、语音导览' },
                { icon: Accessibility, title: '无障碍服务', desc: '轮椅、电梯、卫生间' },
                { icon: Phone, title: '失物招领', desc: '服务台、咨询电话' },
              ].map((service, index) => (
                <div key={index} className="bg-white rounded-xl shadow p-4 text-center hover:shadow-lg transition-shadow">
                  <service.icon className="w-8 h-8 text-gold-500 mx-auto mb-2" />
                  <h4 className="font-bold text-primary-800">{service.title}</h4>
                  <p className="text-xs text-cream-500 mt-1">{service.desc}</p>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h2 className="text-3xl font-serif font-bold text-primary-800 mb-8 text-center">
              常见问题
            </h2>
            <div className="max-w-3xl mx-auto space-y-4">
              {faqs.map((faq, index) => (
                <div
                  key={index}
                  className="bg-white rounded-xl shadow-lg overflow-hidden"
                >
                  <button
                    onClick={() => setOpenFaq(openFaq === index ? null : index)}
                    className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-cream-50 transition-colors"
                  >
                    <span className="font-bold text-primary-800 pr-4">{faq.question}</span>
                    {openFaq === index ? (
                      <ChevronUp className="w-5 h-5 text-gold-500 flex-shrink-0" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-gold-500 flex-shrink-0" />
                    )}
                  </button>
                  {openFaq === index && (
                    <div className="px-6 pb-4">
                      <p className="text-cream-600 leading-relaxed">{faq.answer}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
