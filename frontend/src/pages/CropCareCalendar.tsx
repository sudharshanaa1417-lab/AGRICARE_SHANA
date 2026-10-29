import React, { useState, useEffect } from 'react';
import { 
  Calendar, CheckCircle2, Clock, AlertCircle, Droplets, 
  Layers, Bug, Shovel, Eye, Filter 
} from 'lucide-react';
import { fetchCropTasks, toggleTaskCompleted } from '../services/api';
import { CropTask } from '../types';

export const CropCareCalendar: React.FC = () => {
  const [selectedCrop, setSelectedCrop] = useState('tomato');
  const [tasks, setTasks] = useState<CropTask[]>([]);
  const [loading, setLoading] = useState(false);
  const [filterStage, setFilterStage] = useState('ALL');

  useEffect(() => {
    loadTasks(selectedCrop);
  }, [selectedCrop]);

  const loadTasks = async (crop: string) => {
    setLoading(true);
    try {
      const data = await fetchCropTasks(crop);
      setTasks(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async (taskId: number, currentCompleted: boolean) => {
    const nextVal = !currentCompleted;
    // Optimistic UI update
    setTasks((prev) =>
      prev.map((t) =>
        t.id === taskId
          ? { ...t, completed: nextVal, completed_at: nextVal ? new Date().toISOString() : null }
          : t
      )
    );
    try {
      await toggleTaskCompleted(taskId, nextVal);
    } catch (e) {
      console.error(e);
      // Revert if failed
      setTasks((prev) =>
        prev.map((t) => (t.id === taskId ? { ...t, completed: currentCompleted } : t))
      );
    }
  };

  const completedCount = tasks.filter((t) => t.completed).length;
  const progressPct = tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0;

  const filteredTasks =
    filterStage === 'ALL' ? tasks : tasks.filter((t) => t.stage.toLowerCase().includes(filterStage.toLowerCase()));

  return (
    <div className="space-y-6 pb-12">
      {/* Title & Crop Picker */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900 tracking-tight flex items-center gap-2">
            <Calendar className="text-forest-700" size={24} />
            Crop Care Timeline: Day 1 to Harvest
          </h1>
          <p className="text-xs text-gray-500 font-medium mt-0.5">
            Stage-by-stage agronomic schedule, irrigation guide, nutrient management & scouting
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <label className="text-xs font-bold text-gray-700">Crop:</label>
          <select
            value={selectedCrop}
            onChange={(e) => setSelectedCrop(e.target.value)}
            className="px-3.5 py-2 rounded-xl border border-gray-200 bg-white text-xs font-bold text-gray-900 shadow-2xs focus:ring-2 focus:ring-forest-500"
          >
            <option value="tomato">Tomato (Solanum lycopersicum)</option>
            <option value="rice">Rice / Paddy (Oryza sativa)</option>
            <option value="cotton">Cotton (Gossypium)</option>
            <option value="groundnut">Groundnut (Arachis hypogaea)</option>
            <option value="maize">Maize (Zea mays)</option>
          </select>
        </div>
      </div>

      {/* Progress & Milestone Card */}
      <div className="bg-gradient-to-r from-forest-800 to-forest-900 rounded-3xl p-6 text-white shadow-md space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-300">
              Crop Lifecycle Progress
            </span>
            <h3 className="text-lg font-extrabold">
              {selectedCrop.toUpperCase()} Agronomic Schedule
            </h3>
          </div>
          <div className="text-right">
            <span className="text-2xl font-extrabold font-mono text-emerald-400">
              {progressPct}%
            </span>
            <span className="text-xs text-forest-200 block">
              {completedCount} of {tasks.length} Milestones Achieved
            </span>
          </div>
        </div>

        {/* Progress bar */}
        <div className="w-full bg-forest-950/60 h-2.5 rounded-full overflow-hidden p-0.5 border border-forest-600/50">
          <div
            className="bg-emerald-400 h-full rounded-full transition-all duration-500 shadow-sm"
            style={{ width: `${progressPct}%` }}
          />
        </div>

        {/* Stage Filter Chips */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          {['ALL', 'Nursery', 'Transplanting', 'Vegetative', 'Flowering', 'Harvest'].map((st) => (
            <button
              key={st}
              onClick={() => setFilterStage(st)}
              className={`px-3 py-1 rounded-full text-[11px] font-bold transition-colors ${
                filterStage === st
                  ? 'bg-white text-forest-900 shadow-xs'
                  : 'bg-white/10 text-white/80 hover:bg-white/20'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Daily Farming Timeline Cards */}
      <div className="space-y-4">
        {filteredTasks.map((t) => (
          <div
            key={t.id}
            className={`bg-white rounded-3xl p-5 border transition-all ${
              t.completed
                ? 'border-emerald-300/80 bg-emerald-50/20 shadow-xs'
                : 'border-forest-100 shadow-xs hover:border-forest-200'
            }`}
          >
            <div className="flex items-start justify-between gap-3 pb-3 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => handleToggle(t.id, t.completed)}
                  className={`w-7 h-7 rounded-xl flex items-center justify-center transition-all ${
                    t.completed
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'border-2 border-gray-300 text-transparent hover:border-forest-600'
                  }`}
                  title={t.completed ? 'Mark pending' : 'Mark completed'}
                >
                  <CheckCircle2 size={18} />
                </button>

                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-forest-800 bg-forest-100 px-2 py-0.5 rounded-md">
                      DAY {t.day_number}
                    </span>
                    <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide">
                      {t.stage}
                    </span>
                  </div>
                  <h3
                    className={`text-base font-extrabold mt-1 ${
                      t.completed ? 'line-through text-gray-400' : 'text-gray-900'
                    }`}
                  >
                    {t.title}
                  </h3>
                </div>
              </div>

              {t.completed && (
                <span className="text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-full shrink-0">
                  Completed
                </span>
              )}
            </div>

            {/* Task Guidance Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 pt-3 text-xs">
              {/* Irrigation */}
              <div className="p-3 rounded-2xl bg-blue-50/60 border border-blue-100/80 space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-blue-900">
                  <Droplets size={14} className="text-blue-600" />
                  <span>Irrigation Guidance</span>
                </div>
                <p className="text-gray-600 text-[11px] leading-relaxed">
                  {t.irrigation_guide}
                </p>
              </div>

              {/* Nutrition */}
              <div className="p-3 rounded-2xl bg-amber-50/60 border border-amber-100/80 space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-amber-900">
                  <Layers size={14} className="text-amber-600" />
                  <span>Nutrient Management</span>
                </div>
                <p className="text-gray-600 text-[11px] leading-relaxed">
                  {t.nutrient_management}
                </p>
              </div>

              {/* Pest Scouting */}
              <div className="p-3 rounded-2xl bg-rose-50/60 border border-rose-100/80 space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-rose-900">
                  <Bug size={14} className="text-rose-600" />
                  <span>Pest & Disease Scouting</span>
                </div>
                <p className="text-gray-600 text-[11px] leading-relaxed">
                  {t.pest_scouting}
                </p>
              </div>

              {/* Expected Observation */}
              <div className="p-3 rounded-2xl bg-emerald-50/60 border border-emerald-100/80 space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-emerald-900">
                  <Eye size={14} className="text-emerald-600" />
                  <span>Expected Observation</span>
                </div>
                <p className="text-gray-600 text-[11px] leading-relaxed">
                  {t.expected_observation}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
