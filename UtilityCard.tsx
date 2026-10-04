import { ArrowRight, Clock3, MapPin } from 'lucide-react';
import type { Utility } from '../types';

export default function UtilityCard({ item, distance, onClick }: { item: Utility; distance?: number; onClick: () => void }) {
  return (
    <button onClick={onClick} className="group w-full rounded-2xl border border-slate-200 bg-white p-4 text-left transition hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-lg hover:shadow-blue-100">
      <div className="flex items-start justify-between gap-3">
        <div>
          <span className="badge bg-blue-50 text-blue-700">{item.TenLoai}</span>
          <h3 className="mt-2 font-bold text-slate-900 group-hover:text-blue-700">{item.TenTienIch}</h3>
        </div>
        <ArrowRight size={18} className="mt-1 text-slate-300 transition group-hover:translate-x-1 group-hover:text-blue-600" />
      </div>
      <div className="mt-3 space-y-1.5 text-sm text-slate-600">
        <div className="flex gap-2"><MapPin size={16} className="mt-0.5 shrink-0 text-blue-500" />{item.DiaChi}</div>
        {item.GioMoCua && <div className="flex gap-2"><Clock3 size={16} className="mt-0.5 shrink-0 text-blue-500" />{item.GioMoCua}</div>}
      </div>
      {distance !== undefined && <div className="mt-3 text-xs font-bold text-blue-700">Cách bạn khoảng {distance.toFixed(1)} km</div>}
    </button>
  );
}
