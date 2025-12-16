
import React, { useState, useEffect, useMemo } from 'react';
import { InterviewRecord, DashboardStats, InterviewStatus } from './types';
import { dbService } from './services/db';
import { ExportService } from './services/export';
import { 
  LayoutDashboard, 
  Briefcase, 
  Search, 
  Plus, 
  Download, 
  Upload, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  Trophy,
  ArrowRightLeft,
  Columns,
  List
} from './components/Icons';
import StatCard from './components/StatCard';
import InterviewCard from './components/InterviewCard';
import InterviewForm from './components/InterviewForm';
import { ResponsiveContainer, BarChart, Bar, XAxis, Tooltip } from 'recharts';

type TabType = 'dashboard' | 'list' | 'kanban';

const STAGE_ORDER: InterviewStatus[] = ['已投递', '笔试', '初筛', '面试中', '面试成功', 'Offer'];

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [records, setRecords] = useState<InterviewRecord[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<InterviewRecord | undefined>(undefined);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<InterviewStatus | 'All'>('All');
  const [dbReady, setDbReady] = useState(false);

  useEffect(() => {
    const initDB = async () => {
      await dbService.init();
      const allRecords = await dbService.getAll();
      setRecords(allRecords);
      setDbReady(true);
    };
    initDB();
  }, []);

  const stats = useMemo<DashboardStats>(() => {
    return {
      total: records.length,
      inProgress: records.filter(r => ['笔试', '初筛', '面试中'].includes(r.status)).length,
      offers: records.filter(r => r.status === 'Offer').length,
      rejected: records.filter(r => r.subStatus === '拒绝').length // approximate based on new logic
    };
  }, [records]);

  const chartData = useMemo(() => {
    return STAGE_ORDER.map(stage => ({
      name: stage,
      value: records.filter(r => r.status === stage).length
    }));
  }, [records]);

  const filteredRecords = useMemo(() => {
    return records.filter(r => {
      const matchesSearch = r.company.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          r.position.title.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesFilter = filterStatus === 'All' || r.status === filterStatus;
      return matchesSearch && matchesFilter;
    }).sort((a, b) => new Date(b.timeline.updated).getTime() - new Date(a.timeline.updated).getTime());
  }, [records, searchQuery, filterStatus]);

  const handleSaveRecord = async (data: InterviewRecord) => {
    if (records.find(r => r.id === data.id)) {
      await dbService.update(data);
      setRecords(prev => prev.map(r => r.id === data.id ? data : r));
    } else {
      await dbService.add(data);
      setRecords(prev => [data, ...prev]);
    }
    setIsFormOpen(false);
    setEditingRecord(undefined);
  };

  const handleEdit = (id: string) => {
    const record = records.find(r => r.id === id);
    setEditingRecord(record);
    setIsFormOpen(true);
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const imported = await ExportService.importFromJSON(file);
        for (const record of imported) {
          await dbService.update(record);
        }
        const updatedRecords = await dbService.getAll();
        setRecords(updatedRecords);
        alert('导入成功！');
      } catch (err) {
        alert('导入失败，请检查文件格式。');
      }
    }
  };

  if (!dbReady) return <div className="flex items-center justify-center h-screen font-medium text-slate-500">正在连接本地数据库...</div>;

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Sidebar - Desktop */}
      <aside className="w-full md:w-64 bg-white border-r border-gray-100 p-6 flex flex-col fixed h-full z-30 hidden md:flex">
        <div className="flex items-center gap-3 mb-12">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-100">
            <Trophy size={20} />
          </div>
          <h1 className="font-bold text-xl text-slate-800 tracking-tight">InterviewTrack</h1>
        </div>

        <nav className="space-y-2 flex-1">
          <button 
            onClick={() => setActiveTab('dashboard')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'dashboard' ? 'bg-blue-50 text-blue-600 font-bold shadow-sm' : 'text-gray-500 hover:bg-gray-50'}`}
          >
            <LayoutDashboard size={20} /> 概览
          </button>
          <button 
            onClick={() => setActiveTab('list')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'list' ? 'bg-blue-50 text-blue-600 font-bold shadow-sm' : 'text-gray-500 hover:bg-gray-50'}`}
          >
            <Briefcase size={20} /> 投递列表
          </button>
          <button 
            onClick={() => setActiveTab('kanban')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'kanban' ? 'bg-blue-50 text-blue-600 font-bold shadow-sm' : 'text-gray-500 hover:bg-gray-50'}`}
          >
            <Columns size={20} /> 看板进度
          </button>
        </nav>

        <div className="pt-6 border-t border-gray-100 space-y-4">
           <div className="bg-slate-50 p-4 rounded-2xl">
             <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-2 text-center">本地数据备份</p>
             <div className="flex gap-2 justify-center">
               <button 
                onClick={() => ExportService.exportToJSON(records)}
                className="p-2.5 bg-white rounded-xl border border-gray-100 text-slate-600 hover:text-blue-600 hover:bg-white shadow-sm transition-all"
                title="导出数据"
               >
                 <Download size={18} />
               </button>
               <label className="p-2.5 bg-white rounded-xl border border-gray-100 text-slate-600 hover:text-blue-600 hover:bg-white shadow-sm transition-all cursor-pointer" title="导入数据">
                 <Upload size={18} />
                 <input type="file" className="hidden" accept=".json" onChange={handleImport} />
               </label>
             </div>
           </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 md:ml-64 p-6 md:p-10 pb-24 md:pb-10">
        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
          <div>
            <h2 className="text-2xl font-extrabold text-slate-800 tracking-tight">
              {activeTab === 'dashboard' ? '求职分析' : activeTab === 'list' ? '记录详情' : '求职管线'}
            </h2>
            <p className="text-gray-400 text-sm mt-0.5">
              {new Date().toLocaleDateString('zh-CN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>
          <button 
            onClick={() => { setEditingRecord(undefined); setIsFormOpen(true); }}
            className="flex items-center justify-center gap-2 bg-blue-600 text-white px-8 py-3.5 rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-xl shadow-blue-100 active:scale-95"
          >
            <Plus size={20} /> 新增投递
          </button>
        </header>

        {/* Tab Content */}
        <div className="space-y-8">
          {activeTab === 'dashboard' && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              {/* Stats Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard label="总投递数" value={stats.total} icon={<Briefcase size={22} />} color="bg-blue-500" />
                <StatCard label="流程中" value={stats.inProgress} icon={<Clock size={22} />} color="bg-amber-500" />
                <StatCard label="获得 Offer" value={stats.offers} icon={<CheckCircle2 size={22} />} color="bg-emerald-500" />
                <StatCard label="已拒绝" value={stats.rejected} icon={<XCircle size={22} />} color="bg-rose-500" />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Chart Section */}
                <div className="lg:col-span-2 bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
                  <h3 className="text-lg font-bold text-slate-800 mb-8 flex items-center gap-2">
                    <ArrowRightLeft size={20} className="text-blue-500" /> 转化漏斗分析
                  </h3>
                  <div className="h-[320px] w-full">
                    {records.length > 0 ? (
                       <ResponsiveContainer width="100%" height="100%">
                       <BarChart data={chartData} margin={{top: 20, right: 30, left: 0, bottom: 0}}>
                         <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 13, fontWeight: 500}} />
                         <Tooltip cursor={{fill: '#f8fafc', radius: 10}} contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)'}} />
                         <Bar dataKey="value" fill="#4361ee" radius={[12, 12, 4, 4]} barSize={40} />
                       </BarChart>
                     </ResponsiveContainer>
                    ) : (
                      <div className="h-full flex flex-col items-center justify-center text-gray-400">
                        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                            <List size={30} className="opacity-20" />
                        </div>
                        <p className="font-medium">暂无面试统计数据</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Recent Feed */}
                <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm flex flex-col">
                  <h3 className="text-lg font-bold text-slate-800 mb-6">最新动态</h3>
                  <div className="space-y-4 flex-1 overflow-y-auto max-h-[400px] custom-scrollbar pr-2">
                    {records.slice(0, 8).map(record => (
                      <div 
                        key={record.id} 
                        onClick={() => handleEdit(record.id)}
                        className="flex items-center gap-4 p-3 rounded-2xl hover:bg-slate-50 cursor-pointer transition-colors border border-transparent hover:border-slate-100"
                      >
                        <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-lg">
                          {record.company.name.charAt(0)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-slate-800 truncate leading-tight">{record.company.name}</p>
                          <p className="text-xs text-slate-400 truncate mt-1">{record.position.title}</p>
                        </div>
                        <div className="text-[10px] font-bold px-2.5 py-1.5 rounded-lg bg-white border border-slate-100 text-slate-600 shadow-sm">
                          {record.status}
                        </div>
                      </div>
                    ))}
                    {records.length === 0 && (
                      <p className="text-center text-gray-400 text-sm mt-10 italic">开始记录您的职业生涯新起点</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {(activeTab === 'list' || activeTab === 'kanban') && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              {/* Toolbar */}
              <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                  <input 
                    type="text" 
                    placeholder="搜公司、搜职位..." 
                    className="w-full pl-12 pr-4 py-3.5 rounded-2xl border border-gray-100 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all bg-white font-medium"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <div className="flex gap-4">
                  <select 
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value as any)}
                    className="px-6 py-3.5 rounded-2xl border border-gray-100 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-slate-700 font-bold min-w-[160px]"
                  >
                    <option value="All">所有阶段</option>
                    {STAGE_ORDER.map(stage => <option key={stage} value={stage}>{stage}</option>)}
                  </select>
                </div>
              </div>

              {activeTab === 'list' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredRecords.map(record => (
                    <InterviewCard 
                      key={record.id} 
                      record={record} 
                      onClick={handleEdit} 
                    />
                  ))}
                  {filteredRecords.length === 0 && (
                    <div className="col-span-full py-24 text-center">
                      <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Search size={32} className="text-slate-200" />
                      </div>
                      <p className="text-slate-400 font-medium text-lg">未匹配到记录</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex gap-6 overflow-x-auto pb-8 custom-scrollbar min-h-[600px] snap-x">
                  {STAGE_ORDER.map(status => (
                    <div key={status} className="flex-shrink-0 w-80 space-y-4 snap-start">
                      <div className="flex items-center justify-between px-3 bg-white py-3 rounded-2xl border border-slate-50 shadow-sm sticky top-0 z-10">
                        <h4 className="font-extrabold text-slate-800 flex items-center gap-2">
                          <span className={`w-2.5 h-2.5 rounded-full ${status === 'Offer' ? 'bg-emerald-500' : status === '面试成功' ? 'bg-teal-400' : 'bg-blue-500'}`}></span>
                          {status}
                        </h4>
                        <span className="text-[11px] font-black text-blue-600 bg-blue-50 px-2.5 py-1 rounded-lg">
                          {records.filter(r => r.status === status).length}
                        </span>
                      </div>
                      <div className="space-y-4 px-1">
                        {records
                          .filter(r => r.status === status)
                          .map(record => (
                            <InterviewCard key={record.id} record={record} onClick={handleEdit} />
                          ))}
                        {records.filter(r => r.status === status).length === 0 && (
                          <div className="py-12 border-2 border-dashed border-slate-100 rounded-3xl flex items-center justify-center">
                            <p className="text-xs text-slate-300 font-bold uppercase tracking-widest">暂无记录</p>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Form Modal */}
        {isFormOpen && (
          <InterviewForm 
            initialData={editingRecord}
            onSave={handleSaveRecord}
            onCancel={() => { setIsFormOpen(false); setEditingRecord(undefined); }}
          />
        )}
      </main>

      {/* Mobile Tab Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-lg border-t border-gray-100 px-6 py-4 flex justify-around items-center z-40 shadow-xl">
        <button 
          onClick={() => setActiveTab('dashboard')}
          className={`flex flex-col items-center gap-1 transition-all ${activeTab === 'dashboard' ? 'text-blue-600 scale-110' : 'text-gray-400'}`}
        >
          <LayoutDashboard size={22} />
          <span className="text-[10px] font-black">首页</span>
        </button>
        <button 
          onClick={() => setActiveTab('list')}
          className={`flex flex-col items-center gap-1 transition-all ${activeTab === 'list' ? 'text-blue-600 scale-110' : 'text-gray-400'}`}
        >
          <Briefcase size={22} />
          <span className="text-[10px] font-black">列表</span>
        </button>
        <button 
          onClick={() => setActiveTab('kanban')}
          className={`flex flex-col items-center gap-1 transition-all ${activeTab === 'kanban' ? 'text-blue-600 scale-110' : 'text-gray-400'}`}
        >
          <Columns size={22} />
          <span className="text-[10px] font-black">看板</span>
        </button>
      </nav>
    </div>
  );
};

export default App;
