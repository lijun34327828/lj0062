import { useState, useEffect, useRef } from 'react';
import * as echarts from 'echarts';
import dayjs from 'dayjs';
import {
  Calendar,
  Building2,
  Trophy,
  Clock,
  Download,
  Search,
  Users,
  TrendingUp,
  Building,
  Package,
  UserCheck,
  PieChart,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';
import {
  statisticsApi,
  exhibitionsApi,
  collectionsApi,
} from '@/services/api';
import type { Exhibition, CollectionItem } from '../../../shared/types';

type TabType = 'frequency' | 'utilization' | 'workload';

interface StatsData {
  totalVisits: number;
  hottestExhibition: string;
  hottestCollection: string;
  avgDuration: string;
}

export default function StatisticsPage() {
  const [activeTab, setActiveTab] = useState<TabType>('frequency');
  const [startDate, setStartDate] = useState(dayjs().subtract(30, 'day').format('YYYY-MM-DD'));
  const [endDate, setEndDate] = useState(dayjs().format('YYYY-MM-DD'));
  const [selectedExhibition, setSelectedExhibition] = useState<number | 'all'>('all');
  const [searchText, setSearchText] = useState('');
  const [exhibitions, setExhibitions] = useState<Exhibition[]>([]);
  const [collections, setCollections] = useState<CollectionItem[]>([]);
  const [stats, setStats] = useState<StatsData>({
    totalVisits: 125680,
    hottestExhibition: '青铜器展厅',
    hottestCollection: '青铜方鼎',
    avgDuration: '2.5 小时',
  });

  const lineChartRef = useRef<HTMLDivElement>(null);
  const barChartRef = useRef<HTMLDivElement>(null);
  const pieChartRef = useRef<HTMLDivElement>(null);
  const workloadChartRef = useRef<HTMLDivElement>(null);
  const lineChartInstance = useRef<echarts.ECharts | null>(null);
  const barChartInstance = useRef<echarts.ECharts | null>(null);
  const pieChartInstance = useRef<echarts.ECharts | null>(null);
  const workloadChartInstance = useRef<echarts.ECharts | null>(null);

  const goldColor = '#C9A962';
  const goldColorLight = '#D7BA71';
  const goldColorDark = '#B89A5A';
  const darkBg = '#0B1717';
  const darkBgLight = '#102323';

  useEffect(() => {
    const fetchData = async () => {
      try {
        const exhibitionsRes = await exhibitionsApi.getList();
        const collectionsRes = await collectionsApi.getList();
        if (exhibitionsRes.success && exhibitionsRes.data) {
          setExhibitions(exhibitionsRes.data);
        }
        if (collectionsRes.success && collectionsRes.data) {
          setCollections(collectionsRes.data);
        }
      } catch (err) {
        console.error('获取数据失败:', err);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (activeTab === 'frequency' && lineChartRef.current) {
      if (!lineChartInstance.current) {
        lineChartInstance.current = echarts.init(lineChartRef.current, 'dark');
      }
      if (!barChartInstance.current) {
        barChartInstance.current.dispose();
      }
      barChartInstance.current = echarts.init(barChartRef.current!, 'dark');

      const dates = Array.from({ length: 30 }, (_, i) =>
        dayjs().subtract(29 - i, 'day').format('MM-DD')
      );
      const visitData = dates.map(() => Math.floor(Math.random() * 500) + 200);

      const lineOption: echarts.EChartsOption = {
        backgroundColor: 'transparent',
        tooltip: {
          trigger: 'axis',
          backgroundColor: darkBgLight,
          borderColor: goldColor,
          textStyle: { color: '#EFEADB' },
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          top: '10%',
          containLabel: true,
        },
        xAxis: {
          type: 'category',
          data: dates,
          axisLine: { lineStyle: { color: '#C9A962' } },
          axisLabel: { color: '#D4CEC0' },
        },
        yAxis: {
          type: 'value',
          axisLine: { lineStyle: { color: '#C9A962' } },
          axisLabel: { color: '#D4CEC0' },
          splitLine: { lineStyle: { color: 'rgba(201, 169, 98, 0.1)' } },
        },
        dataZoom: [
          {
            type: 'inside',
            start: 0,
            end: 100,
          },
          {
            type: 'slider',
            start: 0,
            end: 100,
            borderColor: goldColor,
            textStyle: { color: '#D4CEC0' },
          },
        ],
        series: [
          {
            name: '参观人数',
            type: 'line',
            smooth: true,
            symbol: 'circle',
            symbolSize: 8,
            lineStyle: {
              color: goldColor,
              width: 3,
              shadowColor: goldColor,
              shadowBlur: 10,
            },
            itemStyle: {
              color: goldColor,
              borderColor: goldColorLight,
              borderWidth: 2,
            },
            areaStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: 'rgba(201, 169, 98, 0.4)' },
                { offset: 1, color: 'rgba(201, 169, 98, 0.05)' },
              ]),
            },
            data: visitData,
          },
        ],
      };

      const barOption: echarts.EChartsOption = {
        backgroundColor: 'transparent',
        tooltip: {
          trigger: 'axis',
          backgroundColor: darkBgLight,
          borderColor: goldColor,
          textStyle: { color: '#EFEADB' },
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          top: '10%',
          containLabel: true,
        },
        xAxis: {
          type: 'category',
          data: exhibitions.map((e) => e.name),
          axisLine: { lineStyle: { color: '#C9A962' } },
          axisLabel: { color: '#D4CEC0', rotate: 30 },
        },
        yAxis: {
          type: 'value',
          axisLine: { lineStyle: { color: '#C9A962' } },
          axisLabel: { color: '#D4CEC0' },
          splitLine: { lineStyle: { color: 'rgba(201, 169, 98, 0.1)' } },
        },
        series: [
          {
            name: '参观量',
            type: 'bar',
            barWidth: '50%',
            itemStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: goldColorLight },
                { offset: 1, color: goldColorDark },
              ]),
              borderRadius: [4, 4, 0, 0],
            },
            data: exhibitions.map(() => Math.floor(Math.random() * 5000) + 1000),
          },
        ],
      };

      lineChartInstance.current.setOption(lineOption);
      barChartInstance.current.setOption(barOption);
    }

    if (activeTab === 'utilization' && pieChartRef.current) {
      if (!pieChartInstance.current) {
        pieChartInstance.current.dispose();
      }
      pieChartInstance.current = echarts.init(pieChartRef.current, 'dark');

      const pieData = exhibitions.map((e) => ({
        value: Math.floor(Math.random() * 3000) + 500,
        name: e.name,
      }));

      const pieOption: echarts.EChartsOption = {
        backgroundColor: 'transparent',
        tooltip: {
          trigger: 'item',
          backgroundColor: darkBgLight,
          borderColor: goldColor,
          textStyle: { color: '#EFEADB' },
          formatter: '{b}: {c} 人次 ({d}%)',
        },
        legend: {
          orient: 'vertical',
          right: '5%',
          top: 'center',
          textStyle: { color: '#D4CEC0' },
        },
        series: [
          {
            name: '展厅预约',
            type: 'pie',
            radius: ['40%', '70%'],
            center: ['35%', '50%'],
            avoidLabelOverlap: false,
            itemStyle: {
              borderRadius: 8,
              borderColor: darkBg,
              borderWidth: 2,
            },
            label: {
              show: false,
              position: 'center',
            },
            emphasis: {
              label: {
                show: true,
                fontSize: 16,
                fontWeight: 'bold',
                color: goldColor,
              },
            },
            labelLine: {
              show: false,
            },
            data: pieData,
            color: [
              '#C9A962',
              '#D7BA71',
              '#B89A5A',
              '#A38650',
              '#8E7346',
              '#6B5636',
            ],
          },
        ],
      };

      pieChartInstance.current.setOption(pieOption);
    }

    if (activeTab === 'workload' && workloadChartRef.current) {
      if (!workloadChartInstance.current) {
        workloadChartInstance.current = echarts.init(workloadChartRef.current, 'dark');
      }

      const restorerData = [
        { name: '张修复', value: 45 },
        { name: '李修复', value: 38 },
        { name: '王修复', value: 52 },
        { name: '赵修复', value: 33 },
      ];

      const securityData = [
        { name: '刘安保', value: 60 },
        { name: '陈安保', value: 55 },
        { name: '杨安保', value: 48 },
        { name: '黄安保', value: 42 },
      ];

      const workloadOption: echarts.EChartsOption = {
        backgroundColor: 'transparent',
        tooltip: {
          trigger: 'axis',
          backgroundColor: darkBgLight,
          borderColor: goldColor,
          textStyle: { color: '#EFEADB' },
        },
        legend: {
          data: ['修复师', '安保人员'],
          textStyle: { color: '#D4CEC0' },
          top: 0,
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          top: '15%',
          containLabel: true,
        },
        xAxis: {
          type: 'category',
          data: restorerData.map((d) => d.name),
          axisLine: { lineStyle: { color: '#C9A962' } },
          axisLabel: { color: '#D4CEC0' },
        },
        yAxis: {
          type: 'value',
          name: '任务数',
          axisLine: { lineStyle: { color: '#C9A962' } },
          axisLabel: { color: '#D4CEC0' },
          splitLine: { lineStyle: { color: 'rgba(201, 169, 98, 0.1)' } },
          nameTextStyle: { color: '#D4CEC0' },
        },
        series: [
          {
            name: '修复师',
            type: 'bar',
            barWidth: '30%',
            itemStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: '#D7BA71' },
                { offset: 1, color: '#C9A962' },
              ]),
              borderRadius: [4, 4, 0, 0],
            },
            data: restorerData.map((d) => d.value),
          },
        ],
      };

      workloadChartInstance.current.setOption(workloadOption);
    }

    const handleResize = () => {
      lineChartInstance.current?.resize();
      barChartInstance.current?.resize();
      pieChartInstance.current?.resize();
      workloadChartInstance.current?.resize();
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [activeTab, exhibitions]);

  const handleExport = () => {
    alert('数据导出功能（模拟）：统计数据导出成功！');
  };

  const utilizationData = exhibitions
    .map((e) => ({
      id: e.id,
      name: e.name,
      utilization: Math.floor(Math.random() * 30) + 60,
      bookings: Math.floor(Math.random() * 3000) + 500,
      capacity: e.capacity,
    }))
    .sort((a, b) => b.utilization - a.utilization)
    .filter(
      (item) =>
        item.name.includes(searchText) ||
        item.name.toLowerCase().includes(searchText.toLowerCase())
    );

  const tabs = [
    { key: 'frequency' as const, label: '参观频次', icon: <Users className="w-4 h-4" /> },
    { key: 'utilization' as const, label: '展厅利用率', icon: <Building className="w-4 h-4" /> },
    { key: 'workload' as const, label: '人员工作量', icon: <UserCheck className="w-4 h-4" /> },
  ];

  const statCards = [
    {
      label: '总参观人次',
      value: stats.totalVisits.toLocaleString(),
      icon: <Users className="w-8 h-8" />,
    },
    {
      label: '最热门展厅',
      value: stats.hottestExhibition,
      icon: <Building2 className="w-8 h-8" />,
    },
    {
      label: '最热门藏品',
      value: stats.hottestCollection,
      icon: <Package className="w-8 h-8" />,
    },
    {
      label: '平均参观时长',
      value: stats.avgDuration,
      icon: <Clock className="w-8 h-8" />,
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-cream-100 font-serif">数据统计分析</h1>
          <p className="text-sm text-cream-400 mt-1">全面了解博物馆运营数据</p>
        </div>
        <Button onClick={handleExport} className="bg-gold-600 text-primary-900 hover:bg-gold-500">
          <Download className="w-4 h-4" />
          导出数据
        </Button>
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center p-4 bg-primary-800 rounded-xl border border-gold-500/20">
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-gold-500" />
            <span className="text-sm text-cream-300">日期范围:</span>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="bg-primary-700 text-cream-100 border border-gold-500/30 rounded px-3 py-1.5 text-sm focus:outline-none focus:border-gold-500"
            />
            <span className="text-cream-400">至</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="bg-primary-700 text-cream-100 border border-gold-500/30 rounded px-3 py-1.5 text-sm focus:outline-none focus:border-gold-500"
            />
          </div>
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
              <option value="all">全部展厅</option>
              {exhibitions.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card, index) => (
          <div
            key={card.label}
            className="bg-primary-800 rounded-xl p-5 border border-gold-500/20 hover:border-gold-500/40 transition-all duration-300 animate-slide-up"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-cream-400">{card.label}</p>
                <p className="text-2xl font-bold text-gold-400 mt-2">{card.value}</p>
              </div>
              <div className="p-2 bg-gold-500/10 rounded-lg text-gold-500">
                {card.icon}
              </div>
            </div>
          </div>
        ))}
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
          {activeTab === 'frequency' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-cream-100 mb-4 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-gold-500" />
                  每日参观人数趋势
                </h3>
                <div ref={lineChartRef} className="w-full h-80 rounded-lg" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-cream-100 mb-4 flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-gold-500" />
                  各展厅参观量对比
                </h3>
                <div ref={barChartRef} className="w-full h-80 rounded-lg" />
              </div>
            </div>
          )}

          {activeTab === 'utilization' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold text-cream-100 mb-4 flex items-center gap-2">
                    <PieChart className="w-5 h-5 text-gold-500" />
                    各展厅预约占比
                  </h3>
                  <div ref={pieChartRef} className="w-full h-80 rounded-lg" />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-cream-100 flex items-center gap-2">
                      <Trophy className="w-5 h-5 text-gold-500" />
                      利用率排名
                    </h3>
                    <div className="relative">
                      <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-cream-400" />
                      <input
                        type="text"
                        placeholder="搜索展厅..."
                        value={searchText}
                        onChange={(e) => setSearchText(e.target.value)}
                        className="bg-primary-700 text-cream-100 border border-gold-500/30 rounded-lg pl-9 pr-4 py-2 text-sm focus:outline-none focus:border-gold-500 w-48"
                      />
                    </div>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gold-500/20">
                          <th className="text-left py-3 px-4 text-sm font-medium text-cream-400">
                            排名
                          </th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-cream-400">
                            展厅名称
                          </th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-cream-400">
                            预约人次
                          </th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-cream-400">
                            容量
                          </th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-cream-400">
                            利用率
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {utilizationData.map((item, index) => (
                          <tr
                            key={item.id}
                            className="border-b border-gold-500/10 hover:bg-primary-700/50 transition-colors"
                          >
                            <td className="py-3 px-4">
                              <span
                                className={cn(
                                  'inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold',
                                  index === 0
                                    ? 'bg-gold-500 text-primary-900'
                                    : index === 1
                                    ? 'bg-gold-400/80 text-primary-900'
                                    : index === 2
                                    ? 'bg-gold-300/60 text-primary-900'
                                    : 'bg-primary-600 text-cream-300'
                                )}
                              >
                                {index + 1}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-cream-200">{item.name}</td>
                            <td className="py-3 px-4 text-cream-300">
                              {item.bookings.toLocaleString()}
                            </td>
                            <td className="py-3 px-4 text-cream-300">{item.capacity}</td>
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-2">
                                <div className="flex-1 h-2 bg-primary-700 rounded-full overflow-hidden">
                                  <div
                                    className="h-full bg-gradient-to-r from-gold-600 to-gold-400 rounded-full"
                                    style={{ width: `${item.utilization}%` }}
                                  />
                                </div>
                                <span className="text-gold-400 text-sm font-medium">
                                  {item.utilization}%
                                </span>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'workload' && (
            <div>
              <h3 className="text-lg font-semibold text-cream-100 mb-4 flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-gold-500" />
                修复师工作量统计
              </h3>
              <div ref={workloadChartRef} className="w-full h-96 rounded-lg" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
