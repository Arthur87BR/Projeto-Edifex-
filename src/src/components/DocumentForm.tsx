import React from 'react';

interface DocumentFormProps {
  onSubmit: (data: any) => void;
  onCancel: () => void;
  initialData?: any;
}

const DocumentForm: React.FC<DocumentFormProps> = ({ onSubmit, onCancel, initialData }) => {
  const [formData, setFormData] = React.useState({
    name: initialData?.name || '',
    type: initialData?.type || 'Planta',
    url: initialData?.url || '',
    uploadDate: initialData?.uploadDate || new Date().toISOString().split('T')[0],
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Nome do Documento</label>
        <input
          type="text"
          required
          className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="Ex: Planta Baixa - Térreo"
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Tipo de Documento</label>
        <select
          className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none"
          value={formData.type}
          onChange={(e) => setFormData({ ...formData, type: e.target.value })}
        >
          <option value="Planta">Planta</option>
          <option value="Contrato">Contrato</option>
          <option value="Alvará">Alvará</option>
          <option value="Técnico">Técnico</option>
          <option value="Financeiro">Financeiro</option>
          <option value="Outros">Outros</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">URL do Arquivo (Simulado)</label>
        <input
          type="url"
          required
          className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none"
          value={formData.url}
          onChange={(e) => setFormData({ ...formData, url: e.target.value })}
          placeholder="https://exemplo.com/arquivo.pdf"
        />
        <p className="text-xs text-slate-400 mt-1">Nesta versão, insira o link direto para o documento.</p>
      </div>

      <div className="flex justify-end gap-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-6 py-2 text-slate-600 font-medium hover:bg-slate-50 rounded-xl transition-colors"
        >
          Cancelar
        </button>
        <button
          type="submit"
          className="px-6 py-2 bg-brand-600 text-white font-medium rounded-xl hover:bg-brand-700 transition-colors"
        >
          {initialData ? 'Salvar Alterações' : 'Adicionar Documento'}
        </button>
      </div>
    </form>
  );
};

export default DocumentForm;


