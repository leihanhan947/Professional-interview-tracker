
export type InterviewStatus = '已投递' | '笔试' | '初筛' | '面试中' | '面试成功' | 'Offer';
export type AppliedSubStatus = '已读不回' | '进行中';
export type InterviewSubStatus = '一面' | '二面' | '其他';
export type OfferSubStatus = '待发' | '已发' | '拒绝' | '待定';

export type Priority = '低' | '中' | '高';
export type JobType = '全职' | '实习' | '兼职';
export type Level = '初级' | '中级' | '高级' | '专家';

export interface InterviewStage {
  id: string;
  name: string;
  date: string;
  notes: string;
  completed: boolean;
}

export interface InterviewDetail {
  id: string;
  type: string;
  time: string;
  interviewer?: string;
  location?: string;
  feedback?: string;
}

export interface InterviewRecord {
  id: string;
  company: {
    name: string;
    logo?: string;
    industry?: string;
    size?: string;
  };
  position: {
    title: string;
    level?: Level;
    type?: JobType;
    salaryRange?: { min: number; max: number; currency: string };
  };
  timeline: {
    applied: string;
    updated: string;
    stages: InterviewStage[];
  };
  status: InterviewStatus;
  subStatus?: AppliedSubStatus | InterviewSubStatus | OfferSubStatus;
  interviews: InterviewDetail[];
  notes: {
    preparation: string;
    questions: string;
    summary: string;
  };
  metadata: {
    favorite: boolean;
    tags: string[];
    priority: Priority;
  };
}

export interface DashboardStats {
  total: number;
  inProgress: number;
  offers: number;
  rejected: number;
}
