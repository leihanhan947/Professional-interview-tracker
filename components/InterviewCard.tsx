
import React from 'react';
import { InterviewRecord, InterviewStatus } from '../types';
import { Star, Calendar, Briefcase, ChevronRight } from './Icons';

interface InterviewCardProps {
  record: InterviewRecord;
  onClick: (id: string) => void;
}

const getStatusColor = (status: InterviewStatus) => {
  switch (status) {
    case 'Offer': return 'bg-emerald-100 text-emerald-700';
    case '面试成功': return 'bg-teal-100 text-teal-700';
    case '面试中': return 'bg-blue-100 text-blue-700';
    case '笔试': return 'bg-purple-100 text-purple-700';
    case '初筛': return 'bg-amber-100 text-amber-700';
    case '已投递': return 'bg-slate-100 text-slate-700';
    default: return 'bg-slate-100 text-slate-700';
  }
};

const InterviewCard: React.FC<InterviewCardProps> = ({ record, onClick }) => {
  return (
    <div 
      onClick={() => onClick(record.id)}
      className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all cursor-pointer group"
    >
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-slate-50 border border-gray-100 flex items-center justify-center text-xl font-bold text-slate-400 uppercase">
            {record.company.name.charAt(0)}
          </div>
          <div>
            <h4 className="font-bold text-slate-800 group-hover:text-blue-600 transition-colors">{record.company.name}</h4>
            <p className="text-sm text-gray-500">{record.position.title}</p>
          </div>
        </div>
        <button className={`p-1.5 rounded-full ${record.metadata.favorite ? 'text-amber-400' : 'text-gray-300'}`}>
          <Star size={18} fill={record.metadata.favorite ? 'currentColor' : 'none'} />
        </button>
      </div>

      <div className="space-y-2 mb-4">
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <Briefcase size={14} />
          <span>{record.position.type || '全职'} · {record.position.level || '中级'}</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <Calendar size={14} />
          <span>投递于 {record.timeline.applied}</span>
        </div>
      </div>

      <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-50">
        <div className="flex flex-col items-start gap-1">
          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(record.status)}`}>
            {record.status}
          </span>
          {record.subStatus && (
            <span className="text-[10px] text-gray-400 ml-1">
              • {record.subStatus}
            </span>
          )}
        </div>
        <div className="flex items-center text-blue-600 text-xs font-bold gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          查看详情 <ChevronRight size={14} />
        </div>
      </div>
    </div>
  );
};

export default InterviewCard;
