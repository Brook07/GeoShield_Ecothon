'use client';

interface RiskSliderProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
  description?: string;
}

export default function RiskSlider({
  label,
  value,
  onChange,
  min = 0,
  max = 100,
  step = 1,
  unit = '%',
  description,
}: RiskSliderProps) {
  const percentage = ((value - min) / (max - min)) * 100;

  return (
    <div className="space-y-3">
      <div className="flex items-start justify-between">
        <div>
          <label className="block text-sm font-semibold text-white">{label}</label>
          {description && <p className="text-xs text-slate-400 mt-1">{description}</p>}
        </div>
        <div className="text-right">
          <span className="text-lg font-bold text-emerald-400">{value}</span>
          <span className="text-sm text-slate-400 ml-1">{unit}</span>
        </div>
      </div>

      {/* Custom slider */}
      <div className="relative pt-2">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(parseFloat(e.target.value))}
          className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer slider"
          style={{
            background: `linear-gradient(to right, #1565C0 0%, #1565C0 ${percentage}%, #334155 ${percentage}%, #334155 100%)`,
          }}
        />
      </div>

      {/* Range labels */}
      <div className="flex justify-between text-xs text-slate-500">
        <span>{min}{unit}</span>
        <span>{max}{unit}</span>
      </div>

      <style jsx>{`
        input[type='range']::-webkit-slider-thumb {
          appearance: none;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: linear-gradient(135deg, #1565C0, #42A5F5);
          cursor: pointer;
          box-shadow: 0 0 10px rgba(66, 165, 245, 0.5);
          border: 2px solid rgba(255, 255, 255, 0.2);
        }

        input[type='range']::-moz-range-thumb {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: linear-gradient(135deg, #1565C0, #42A5F5);
          cursor: pointer;
          box-shadow: 0 0 10px rgba(66, 165, 245, 0.5);
          border: 2px solid rgba(255, 255, 255, 0.2);
        }
      `}</style>
    </div>
  );
}
