import React, { useState } from 'react';
import { Check } from 'lucide-react';

// Palette de couleurs prédéfinies
const COLORS = [
    { name: 'Rouge', value: '#EF4444', light: '#FEE2E2' },
    { name: 'Orange', value: '#F97316', light: '#FFEDD5' },
    { name: 'Ambre', value: '#F59E0B', light: '#FEF3C7' },
    { name: 'Jaune', value: '#EAB308', light: '#FEF9C3' },
    { name: 'Lime', value: '#84CC16', light: '#ECFCCB' },
    { name: 'Vert', value: '#22C55E', light: '#DCFCE7' },
    { name: 'Émeraude', value: '#10B981', light: '#D1FAE5' },
    { name: 'Teal', value: '#14B8A6', light: '#CCFBF1' },
    { name: 'Cyan', value: '#06B6D4', light: '#CFFAFE' },
    { name: 'Bleu', value: '#3B82F6', light: '#DBEAFE' },
    { name: 'Indigo', value: '#6366F1', light: '#E0E7FF' },
    { name: 'Violet', value: '#8B5CF6', light: '#EDE9FE' },
    { name: 'Purple', value: '#A855F7', light: '#F3E8FF' },
    { name: 'Fuchsia', value: '#D946EF', light: '#FAE8FF' },
    { name: 'Rose', value: '#EC4899', light: '#FCE7F3' },
    { name: 'Gris', value: '#6B7280', light: '#F3F4F6' }
];

// Icônes Material populaires
const ICONS = [
    { name: 'work', label: 'Travail' },
    { name: 'home', label: 'Maison' },
    { name: 'star', label: 'Étoile' },
    { name: 'favorite', label: 'Favori' },
    { name: 'event', label: 'Événement' },
    { name: 'task', label: 'Tâche' },
    { name: 'assignment', label: 'Assignment' },
    { name: 'shopping_cart', label: 'Shopping' },
    { name: 'lightbulb', label: 'Idée' },
    { name: 'flag', label: 'Drapeau' },
    { name: 'bug_report', label: 'Bug' },
    { name: 'build', label: 'Outils' },
    { name: 'code', label: 'Code' },
    { name: 'email', label: 'Email' },
    { name: 'phone', label: 'Téléphone' },
    { name: 'person', label: 'Personne' },
    { name: 'group', label: 'Groupe' },
    { name: 'school', label: 'École' },
    { name: 'fitness_center', label: 'Sport' },
    { name: 'restaurant', label: 'Restaurant' },
    { name: 'local_hospital', label: 'Santé' },
    { name: 'flight', label: 'Voyage' },
    { name: 'attach_money', label: 'Argent' },
    { name: 'celebration', label: 'Fête' }
];

const ColorIconPicker = ({ selectedColor, selectedIcon, onColorChange, onIconChange }) => {
    const [showColorPicker, setShowColorPicker] = useState(false);
    const [showIconPicker, setShowIconPicker] = useState(false);

    return (
        <div className="space-y-4">
            {/* Color Picker */}
            <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                    Couleur
                </label>
                <div className="relative">
                    <button
                        type="button"
                        onClick={() => setShowColorPicker(!showColorPicker)}
                        className="flex items-center gap-3 px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 transition w-full"
                    >
                        <div
                            className="w-6 h-6 rounded-full border-2 border-white shadow-sm"
                            style={{ backgroundColor: selectedColor || '#6B7280' }}
                        />
                        <span className="text-sm text-slate-700">
                            {COLORS.find(c => c.value === selectedColor)?.name || 'Choisir une couleur'}
                        </span>
                    </button>

                    {showColorPicker && (
                        <div className="absolute z-10 mt-2 p-3 bg-white border border-slate-200 rounded-lg shadow-lg">
                            <div className="grid grid-cols-8 gap-2">
                                {COLORS.map((color) => (
                                    <button
                                        key={color.value}
                                        type="button"
                                        onClick={() => {
                                            onColorChange(color.value);
                                            setShowColorPicker(false);
                                        }}
                                        className="relative w-8 h-8 rounded-full border-2 border-white shadow-sm hover:scale-110 transition"
                                        style={{ backgroundColor: color.value }}
                                        title={color.name}
                                    >
                                        {selectedColor === color.value && (
                                            <Check className="w-4 h-4 text-white absolute inset-0 m-auto" strokeWidth={3} />
                                        )}
                                    </button>
                                ))}
                            </div>
                            <button
                                type="button"
                                onClick={() => {
                                    onColorChange(null);
                                    setShowColorPicker(false);
                                }}
                                className="mt-2 w-full text-xs text-slate-600 hover:text-slate-900 py-1"
                            >
                                Aucune couleur
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Icon Picker */}
            <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                    Icône
                </label>
                <div className="relative">
                    <button
                        type="button"
                        onClick={() => setShowIconPicker(!showIconPicker)}
                        className="flex items-center gap-3 px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 transition w-full"
                    >
                        {selectedIcon ? (
                            <>
                                <span className="material-icons text-slate-700" style={{ fontSize: '20px' }}>
                                    {selectedIcon}
                                </span>
                                <span className="text-sm text-slate-700">
                                    {ICONS.find(i => i.name === selectedIcon)?.label || selectedIcon}
                                </span>
                            </>
                        ) : (
                            <span className="text-sm text-slate-700">Choisir une icône</span>
                        )}
                    </button>

                    {showIconPicker && (
                        <div className="absolute z-10 mt-2 p-3 bg-white border border-slate-200 rounded-lg shadow-lg max-h-64 overflow-y-auto">
                            <div className="grid grid-cols-6 gap-2">
                                {ICONS.map((icon) => (
                                    <button
                                        key={icon.name}
                                        type="button"
                                        onClick={() => {
                                            onIconChange(icon.name);
                                            setShowIconPicker(false);
                                        }}
                                        className={`p-2 rounded-lg hover:bg-slate-100 transition ${selectedIcon === icon.name ? 'bg-indigo-50 text-indigo-600' : 'text-slate-700'
                                            }`}
                                        title={icon.label}
                                    >
                                        <span className="material-icons" style={{ fontSize: '24px' }}>
                                            {icon.name}
                                        </span>
                                    </button>
                                ))}
                            </div>
                            <button
                                type="button"
                                onClick={() => {
                                    onIconChange(null);
                                    setShowIconPicker(false);
                                }}
                                className="mt-2 w-full text-xs text-slate-600 hover:text-slate-900 py-1"
                            >
                                Aucune icône
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ColorIconPicker;
export { COLORS, ICONS };
