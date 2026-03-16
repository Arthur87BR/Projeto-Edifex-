import React from 'react';
import { Camera, CloudSun } from 'lucide-react';

interface DailyLogFormProps {
  onSubmit: (data: any) => void;
  onCancel: () => void;
  initialData?: any;
}

export default function DailyLogForm({ onSubmit, onCancel, initialData }: DailyLogFormProps) {
  const [formData, setFormData] = React.useState({
    date: initialData?.date || new Date().toISOString().split('T')[0],
    weather: initialData?.weather || 'ensolarado',
    activities: initialData?.activities || '',
    problems: initialData?.problems || '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Data</label>
          <input
            type="date"
            required
            className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all"
            value={formData.date}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Clima</label>
          <select
            className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all"
            value={formData.weather}
            onChange={(e) => setFormData({ ...formData, weather: e.target.value })}
          >
            <option value="ensolarado">Ensolarado</option>
            <option value="nublado">Nublado</option>
            <option value="chuva">Chuva</option>
            <option value="tempestade">Tempestade</option>
          </select>
        </div>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Atividades Realizadas</label>
        <textarea
          required
          rows={3}
          className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all"
          placeholder="O que foi feito hoje?"
          value={formData.activities}
          onChange={(e) => setFormData({ ...formData, activities: e.target.value })}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Problemas / Impedimentos</label>
        <textarea
          rows={2}
          className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all"
          placeholder="Algum problema encontrado?"
          value={formData.problems}
          onChange={(e) => setFormData({ ...formData, problems: e.target.value })}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Fotos da Obra</label>
        <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-slate-200 border-dashed rounded-xl hover:border-brand-400 transition-colors cursor-pointer">
          <div className="space-y-1 text-center">
            <Camera className="mx-auto h-12 w-12 text-slate-400" />
            <div className="flex text-sm text-slate-600">
              <span className="relative cursor-pointer bg-white rounded-md font-medium text-brand-600 hover:text-brand-500 focus-within:outline-none">
                Carregar fotos
              </span>
            </div>
            <p className="text-xs text-slate-500">PNG, JPG até 10MB</p>
          </div>
        </div>
      </div>

      <div className="flex gap-3 mt-8">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 px-4 py-2 border border-slate-200 text-slate-600 rounded-xl font-medium hover:bg-slate-50 transition-colors"
        >
          Cancelar
        </button>
        <button
          type="submit"
          className="flex-1 px-4 py-2 bg-brand-600 text-white rounded-xl font-medium hover:bg-brand-700 transition-colors"
        >
          Salvar Registro
        </button>
      </div>
    </form>
  );
}


