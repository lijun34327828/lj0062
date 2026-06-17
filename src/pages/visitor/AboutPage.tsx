import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Sparkles,
  Award,
  Users,
  BookOpen,
  Target,
  Heart,
  Building2,
  Calendar,
  Globe,
} from 'lucide-react';

const milestones = [
  { year: '1952', event: '博物馆正式成立，首批藏品共计3000余件' },
  { year: '1965', event: '完成首次大规模扩建，展厅面积达到5000平方米' },
  { year: '1978', event: '被列为全国重点文物保护单位' },
  { year: '1990', event: '成立文物保护研究中心' },
  { year: '2008', event: '新馆建成开放，建筑面积达30000平方米' },
  { year: '2015', event: '获评国家一级博物馆' },
  { year: '2020', event: '数字博物馆上线，开启智慧博物馆时代' },
  { year: '2024', event: '年接待观众突破200万人次' },
];

const stats = [
  { icon: Building2, value: '30000+', label: '建筑面积（平方米）' },
  { icon: BookOpen, value: '50000+', label: '馆藏文物（件）' },
  { icon: Users, value: '200万+', label: '年接待观众（人次）' },
  { icon: Award, value: '国家一级', label: '博物馆等级' },
];

const teamMembers = [
  { name: '张文博', role: '馆长', title: '研究员', bio: '从事博物馆管理工作30年，享受国务院特殊津贴专家' },
  { name: '李文化', role: '副馆长', title: '研究馆员', bio: '专注于青铜器研究，发表学术论文50余篇' },
  { name: '王考古', role: '研究部主任', title: '博士生导师', bio: '主持多项国家级考古发掘项目，成果丰硕' },
  { name: '陈教育', role: '教育部主任', title: '高级讲师', bio: '致力于社会教育工作，打造多个品牌教育项目' },
];

export default function AboutPage() {
  const navigate = useNavigate();

  const heroImage = 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=grand%20museum%20building%20facade%20with%20traditional%20chinese%20architecture%20style&image_size=landscape_16_9';

  return (
    <div className="min-h-screen bg-cream-50 animate-fade-in">
      <section className="relative h-[50vh] overflow-hidden">
        <img
          src={heroImage}
          alt="关于我们"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-primary-900/70 via-primary-900/50 to-primary-900/80" />
        <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-4">
          <Sparkles className="w-12 h-12 text-gold-400 mb-4 animate-pulse-slow" />
          <h1 className="text-4xl md:text-6xl font-serif font-bold text-transparent bg-clip-text bg-gradient-to-r from-gold-300 via-gold-400 to-gold-500 mb-4">
            关于我们
          </h1>
          <p className="text-lg md:text-xl text-cream-100 max-w-2xl">
            传承历史文化，展示艺术瑰宝，服务社会大众
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
            <p className="text-cream-200">了解文博展览馆的发展历程与使命愿景</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            {stats.map((stat, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl shadow-lg p-6 text-center hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
              >
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-gold-400 to-gold-600 flex items-center justify-center mx-auto mb-4">
                  <stat.icon className="w-8 h-8 text-primary-900" />
                </div>
                <p className="text-4xl font-bold text-gold-600 mb-2">{stat.value}</p>
                <p className="text-cream-600 text-sm">{stat.label}</p>
              </div>
            ))}
          </div>

          <div className="mb-16">
            <h2 className="text-3xl font-serif font-bold text-primary-800 mb-8 text-center">
              展馆简介
            </h2>
            <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                <div>
                  <img
                    src="https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=museum%20interior%20grand%20hall%20with%20visitors%20admiring%20exhibits&image_size=landscape_4_3"
                    alt="博物馆内景"
                    className="w-full h-64 md:h-80 object-cover rounded-xl shadow-lg"
                  />
                </div>
                <div className="space-y-6">
                  <div className="flex gap-4">
                    <div className="w-12 h-12 rounded-full bg-gold-100 flex items-center justify-center flex-shrink-0">
                      <Target className="w-6 h-6 text-gold-600" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-primary-800 mb-2">办馆宗旨</h3>
                      <p className="text-cream-600 leading-relaxed">
                        以保护和传承中华优秀传统文化为己任，通过文物收藏、科学研究、社会教育和展览展示，
                        为公众提供高品质的文化服务，增强民族文化自信。
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="w-12 h-12 rounded-full bg-gold-100 flex items-center justify-center flex-shrink-0">
                      <Heart className="w-6 h-6 text-gold-600" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-primary-800 mb-2">发展愿景</h3>
                      <p className="text-cream-600 leading-relaxed">
                        建设成为国内一流、国际知名的综合性博物馆，打造文物保护、学术研究、
                        社会教育和文化传播的高地，成为中华文明走向世界的重要窗口。
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="w-12 h-12 rounded-full bg-gold-100 flex items-center justify-center flex-shrink-0">
                      <Globe className="w-6 h-6 text-gold-600" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-primary-800 mb-2">社会价值</h3>
                      <p className="text-cream-600 leading-relaxed">
                        充分发挥博物馆的公共文化服务功能，面向社会各阶层开展丰富多彩的教育活动，
                        让文物活起来，让文化传下去，为构建现代公共文化服务体系贡献力量。
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mb-16">
            <h2 className="text-3xl font-serif font-bold text-primary-800 mb-8 text-center">
              发展历程
            </h2>
            <div className="relative">
              <div className="absolute left-1/2 top-0 bottom-0 w-1 bg-gradient-to-b from-gold-300 via-gold-500 to-gold-600 transform -translate-x-1/2 hidden md:block" />
              <div className="space-y-8">
                {milestones.map((milestone, index) => (
                  <div
                    key={index}
                    className={`flex items-center gap-4 md:gap-8 ${
                      index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'
                    }`}
                  >
                    <div className={`flex-1 ${index % 2 === 0 ? 'md:text-right' : 'md:text-left'}`}>
                      <div className="bg-white rounded-xl shadow-lg p-6 inline-block hover:shadow-xl transition-shadow">
                        <div className="flex items-center gap-3 mb-2">
                          <Calendar className="w-5 h-5 text-gold-500" />
                          <span className="text-2xl font-bold text-gold-600">{milestone.year}</span>
                        </div>
                        <p className="text-cream-600">{milestone.event}</p>
                      </div>
                    </div>
                    <div className="w-6 h-6 rounded-full bg-gold-500 border-4 border-white shadow-lg flex-shrink-0 z-10" />
                    <div className="flex-1 hidden md:block" />
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="mb-16">
            <h2 className="text-3xl font-serif font-bold text-primary-800 mb-8 text-center">
              学术团队
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {teamMembers.map((member, index) => (
                <div
                  key={index}
                  className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-2 group"
                >
                  <div className="relative h-56 overflow-hidden">
                    <img
                      src={`https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=${encodeURIComponent(`professional chinese museum scholar ${member.name} portrait`)}&image_size=square`}
                      alt={member.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-primary-900/80 via-transparent to-transparent" />
                    <div className="absolute bottom-4 left-4 right-4 text-white">
                      <h3 className="text-xl font-bold mb-1">{member.name}</h3>
                      <div className="flex gap-2">
                        <span className="px-2 py-0.5 bg-gold-500/80 text-primary-900 text-xs rounded-full">
                          {member.role}
                        </span>
                        <span className="px-2 py-0.5 bg-white/20 backdrop-blur text-xs rounded-full">
                          {member.title}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="p-4">
                    <p className="text-sm text-cream-600">{member.bio}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h2 className="text-3xl font-serif font-bold text-primary-800 mb-8 text-center">
              机构设置
            </h2>
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[
                  { name: '办公室', desc: '负责日常行政事务管理' },
                  { name: '藏品保管部', desc: '负责文物征集、登编、保管' },
                  { name: '展览陈列部', desc: '负责展览策划与实施' },
                  { name: '社会教育部', desc: '负责观众服务与教育活动' },
                  { name: '文物保护中心', desc: '负责文物科技保护与修复' },
                  { name: '学术研究部', desc: '负责学术研究与出版' },
                  { name: '安全保卫部', desc: '负责全馆安全与消防' },
                  { name: '信息技术部', desc: '负责数字博物馆建设' },
                  { name: '计划财务部', desc: '负责财务与资产管理' },
                ].map((dept, index) => (
                  <div
                    key={index}
                    className="p-4 border-2 border-cream-200 rounded-xl hover:border-gold-300 transition-colors group"
                  >
                    <h4 className="font-bold text-primary-800 mb-1 group-hover:text-gold-600 transition-colors">
                      {dept.name}
                    </h4>
                    <p className="text-sm text-cream-500">{dept.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 px-4 md:px-8 bg-primary-800">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-serif font-bold text-gold-400 mb-6">
            加入我们
          </h2>
          <p className="text-cream-300 mb-8 leading-relaxed">
            文博展览馆诚邀有志于文化遗产保护事业的优秀人才加入我们的团队。
            我们提供有竞争力的薪酬待遇、完善的培训体系和广阔的发展空间。
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => navigate('/visitor/booking')}
              className="px-8 py-3 bg-gradient-to-r from-gold-500 to-gold-600 text-primary-900 font-bold rounded-lg hover:from-gold-400 hover:to-gold-500 transition-all duration-300 shadow-lg hover:shadow-gold-500/30 hover:scale-105"
            >
              在线预约参观
            </button>
            <a
              href="mailto:hr@museum.com"
              className="px-8 py-3 border-2 border-gold-500 text-gold-400 font-bold rounded-lg hover:bg-gold-500/10 transition-all duration-300"
            >
              投递简历
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
