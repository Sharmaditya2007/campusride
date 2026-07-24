import React from 'react';
import { Sparkles } from 'lucide-react';

const MatchScoreBadge = ({ score = 90 }) => {
  let color = 'from-emerald-500 to-teal-400 text-slate-950';
  if (score < 70) color = 'from-amber-500 to-yellow-400 text-slate-950';
  if (score < 55) color = 'from-slate-700 to-slate-600 text-slate-200';

  return (
    <div className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-gradient-to-r ${color} font-extrabold text-[11px] shadow-sm tracking-wide`}>
      <Sparkles className="w-3 h-3" />
      <span>{score}% Route Match</span>
    </div>
  );
};

export default MatchScoreBadge;
