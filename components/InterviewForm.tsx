
import React, { useState } from 'react';
import { InterviewRecord, InterviewStatus, Priority, JobType, Level } from '../types';
import { XCircle } from './Icons';

interface InterviewFormProps {
  initialData?: InterviewRecord;
  onSave: (data: InterviewRecord) => void;
  onCancel: () => void;
}

const InterviewForm: React.FC<InterviewFormProps> = ({ initialData, onSave, onCancel }) => {
  const [formData, setFormData] = useState<InterviewRecord>({
    id: initialData?.id || crypto.randomUUID(),
    company: initialData?.company || { name: '', industry: '', size: '' },
    position: initialData?.position || { title: '', level: '中级', type: '全职', salaryRange: { min: 0, max: 0, currency: 'CNY' } },
    timeline: initialData?.timeline || { applied: new Date().toISOString().split('T')[0], updated: new Date().toISOString(), stages: [] },
    status: initialData?.status || '已投递',
    subStatus: initialData?.subStatus,
    interviews: initialData?.interviews || [],
    notes: initialData?.notes || { preparation: '', questions: '', summary: '' },
    metadata: initialData?.metadata || { favorite: false, tags: [], priority: '中' }
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...(prev[parent as keyof InterviewRecord] as any),
          [child]: value
        }
      }));
    } else {
      if (name === 'status') {
        // Clear sub-status when main status changes to prevent invalid combinations
        setFormData(prev => ({ ...prev, status: value as InterviewStatus, subStatus: undefined }));
      } else {
        setFormData(prev => ({ ...prev, [name]: value }));
      }
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...formData,
      timeline: {
        ...formData.timeline,
        updated: new Date().toISOString()
      }
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl relative max-h-[90vh] flex flex-col">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white rounded-t-3xl z-10">
          <h2 className="text-xl font-bold text-slate-800">{initialData ? '编辑记录' : '添加新投递'}</h2>
          <button onClick={onCancel} className="text-gray-400 hover:text-gray-600"><XCircle size={24} /></button>
        </div>

        <form onSubmit={handleSave} className="p-8 space-y-6 overflow-y-auto custom-scrollbar flex-1">
          {/* Company & Position */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">公司名称 *</label>
              <input 
                required
                type="text" 
                name="company.name"
                value={formData.company.name}
                onChange={handleChange}
                placeholder="例如：Google" 
                className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" 
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">职位名称 *</label>
              <input 
                required
                type="text" 
                name="position.title"
                value={formData.position.title}
                onChange={handleChange}
                placeholder="例如：高级前端工程师" 
                className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" 
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">当前主状态</label>
              <select 
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all bg-white"
              >
                <option value="已投递">已投递</option>
                <option value="笔试">笔试</option>
                <option value="初筛">初筛</option>
                <option value="面试中">面试中</option>
                <option value="面试成功">面试成功</option>
                <option value="Offer">Offer</option>
              </select>
            </div>

            {/* Conditional Sub-status */}
            {formData.status === '已投递' && (
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">投递细分</label>
                <select 
                  name="subStatus"
                  value={formData.subStatus || ''}
                  onChange={handleChange}
                  className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all bg-white"
                >
                  <option value="">请选择...</option>
                  <option value="已读不回">已读不回</option>
                  <option value="进行中">进行中</option>
                </select>
              </div>
            )}

            {formData.status === '面试中' && (
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">面试轮次</label>
                <select 
                  name="subStatus"
                  value={formData.subStatus || ''}
                  onChange={handleChange}
                  className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all bg-white"
                >
                  <option value="">请选择...</option>
                  <option value="一面">一面</option>
                  <option value="二面">二面</option>
                  <option value="其他">其他</option>
                </select>
              </div>
            )}

            {formData.status === 'Offer' && (
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Offer状态</label>
                <select 
                  name="subStatus"
                  value={formData.subStatus || ''}
                  onChange={handleChange}
                  className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all bg-white"
                >
                  <option value="">请选择...</option>
                  <option value="待发">待发</option>
                  <option value="已发">已发</option>
                  <option value="拒绝">拒绝</option>
                  <option value="待定">待定</option>
                </select>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">职位级别</label>
              <select 
                name="position.level"
                value={formData.position.level}
                onChange={handleChange}
                className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all bg-white"
              >
                <option value="初级">初级</option>
                <option value="中级">中级</option>
                <option value="高级">高级</option>
                <option value="专家">专家</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">优先级</label>
              <select 
                name="metadata.priority"
                value={formData.metadata.priority}
                onChange={handleChange}
                className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all bg-white"
              >
                <option value="高">高 (Must Have)</option>
                <option value="中">中 (Preferred)</option>
                <option value="低">低 (Backup)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">投递日期</label>
              <input 
                type="date" 
                name="timeline.applied"
                value={formData.timeline.applied}
                onChange={handleChange}
                className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all" 
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">期望薪资 (k)</label>
              <div className="flex items-center gap-2">
                 <input 
                  type="number" 
                  placeholder="Min"
                  value={formData.position.salaryRange?.min}
                  onChange={(e) => {
                    const val = parseInt(e.target.value);
                    setFormData(prev => ({
                      ...prev,
                      position: { ...prev.position, salaryRange: { ...prev.position.salaryRange!, min: val } }
                    }));
                  }}
                  className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all" 
                />
                <span className="text-gray-400">-</span>
                <input 
                  type="number" 
                  placeholder="Max"
                  value={formData.position.salaryRange?.max}
                  onChange={(e) => {
                    const val = parseInt(e.target.value);
                    setFormData(prev => ({
                      ...prev,
                      position: { ...prev.position, salaryRange: { ...prev.position.salaryRange!, max: val } }
                    }));
                  }}
                  className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all" 
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">备注 / 准备</label>
            <textarea 
              name="notes.preparation"
              value={formData.notes.preparation}
              onChange={handleChange}
              rows={3}
              placeholder="记录面试要点、公司调研等..." 
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            ></textarea>
          </div>
        </form>

        <div className="p-6 border-t border-gray-100 flex justify-end gap-4 sticky bottom-0 bg-white rounded-b-3xl">
          <button 
            type="button" 
            onClick={onCancel}
            className="px-6 py-2.5 rounded-xl border border-gray-200 text-gray-600 font-semibold hover:bg-gray-50 transition-all"
          >
            取消
          </button>
          <button 
            type="submit" 
            onClick={handleSave}
            className="px-8 py-2.5 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 shadow-lg shadow-blue-100 transition-all"
          >
            保存记录
          </button>
        </div>
      </div>
    </div>
  );
};

export default InterviewForm;
