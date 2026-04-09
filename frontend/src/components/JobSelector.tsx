import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import api from '../services/api';

interface Job {
  type: string;
  name: string;
  base_reward: number;
  requires?: string;
  bonus?: string;
  penalty?: string;
  reward?: string;
  variable?: string;
  description: string;
}

interface JobSelectorProps {
  selectedJob: string;
  onSelect: (jobType: string) => void;
  onStart: () => void;
}

export const JobSelector = ({ selectedJob, onSelect, onStart }: JobSelectorProps) => {
  const { t } = useTranslation();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const response = await api.get<{ success: boolean; data: Job[] }>('/work/jobs');
        setJobs(response.data.data);
      } catch (error) {
        console.error('Failed to fetch jobs:', error);
      } finally {
        setLoading(false);
      }
    };

    void fetchJobs();
  }, []);

  if (loading) {
    return (
      <div className="text-center text-gray-400" data-testid="job-selector-loading">
        {t('common.loading')}
      </div>
    );
  }

  const selected = jobs.find(j => j.type === selectedJob);

  return (
    <div className="space-y-4" data-testid="job-selector">
      {/* Job Selection Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {jobs.map((job) => (
          <motion.button
            key={job.type}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onSelect(job.type)}
            className={`p-4 rounded-lg border-2 transition-all text-left ${
              selectedJob === job.type
                ? 'border-primary bg-primary/10'
                : 'border-gray-700 bg-gray-800 hover:border-gray-600'
            }`}
            data-testid={`job-option-${job.type}`}
          >
            <div className="flex justify-between items-start mb-2">
              <h4 className="font-bold text-white">{t(`work.jobs.${job.type}.name`, job.name)}</h4>
              <span className="text-secondary font-semibold">${job.base_reward}</span>
            </div>
            <p className="text-sm text-gray-400">{t(`work.jobs.${job.type}.description`, job.description)}</p>

            {/* Requirements/Bonuses/Penalties */}
            <div className="mt-2 flex flex-wrap gap-2">
              {job.requires && (
                <span className="text-xs px-2 py-1 bg-red-500/20 text-red-400 rounded">
                  {t('work.requires')}: {t(`work.requirements.${job.requires}`)}
                </span>
              )}
              {job.bonus && (
                <span className="text-xs px-2 py-1 bg-green-500/20 text-green-400 rounded">
                  {t('work.bonus')}: {t(`work.bonuses.${job.bonus}`)}
                </span>
              )}
              {job.penalty && (
                <span className="text-xs px-2 py-1 bg-yellow-500/20 text-yellow-400 rounded">
                  {t('work.penalty')}: {t(`work.penalties.${job.penalty}`)}
                </span>
              )}
              {job.reward && (
                <span className="text-xs px-2 py-1 bg-purple-500/20 text-purple-400 rounded">
                  {t('work.reward')}: {t(`work.rewards.${job.reward}`)}
                </span>
              )}
              {job.variable && (
                <span className="text-xs px-2 py-1 bg-blue-500/20 text-blue-400 rounded">
                  {t('work.variable')}
                </span>
              )}
            </div>
          </motion.button>
        ))}
      </div>

      {/* Start Work Button */}
      {selected && (
        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onStart}
          className="w-full bg-gradient-to-r from-primary to-secondary text-white font-bold py-6 px-8 rounded-xl shadow-2xl hover:shadow-primary/50 transition-all duration-300 flex items-center justify-center space-x-3 text-xl"
          data-testid="start-work-button"
        >
          <span className="text-3xl">💼</span>
          <span>{t('work.startButton', 'Start Work')}: {t(`work.jobs.${selected.type}.name`, selected.name)}</span>
        </motion.button>
      )}
    </div>
  );
};
