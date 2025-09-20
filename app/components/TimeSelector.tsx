import React from "react";

interface TimeSelectorProps {
  label: string;
  selectedTime: Date | null;
  onChange: (time: Date | null) => void;
  name: string;
}

const TimeSelector: React.FC<TimeSelectorProps> = ({
  label,
  selectedTime,
  onChange,
  name,
}) => {
  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = new Date(e.target.value);
    if (selectedTime) {
      newDate.setHours(selectedTime.getHours());
      newDate.setMinutes(selectedTime.getMinutes());
    }
    onChange(newDate);
  };

  const handleHourChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (!selectedTime) {
      const newDate = new Date();
      newDate.setHours(parseInt(e.target.value));
      newDate.setMinutes(0);
      onChange(newDate);
    } else {
      const newDate = new Date(selectedTime);
      newDate.setHours(parseInt(e.target.value));
      onChange(newDate);
    }
  };

  const handleMinuteChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (!selectedTime) {
      const newDate = new Date();
      newDate.setHours(0);
      newDate.setMinutes(parseInt(e.target.value));
      onChange(newDate);
    } else {
      const newDate = new Date(selectedTime);
      newDate.setMinutes(parseInt(e.target.value));
      onChange(newDate);
    }
  };

  const setToNow = () => {
    onChange(new Date());
  };

  const clear = () => {
    onChange(null);
  };

  // Generate hour options (0-23)
  const hourOptions = Array.from({ length: 24 }, (_, i) => i);
  
  // Generate minute options (0-59)
  const minuteOptions = Array.from({ length: 60 }, (_, i) => i);

  const formatDateForInput = (date: Date | null) => {
    if (!date) return "";
    return date.toISOString().split('T')[0];
  };

  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label}
      </label>
      <div className="space-y-2">
        {/* Date selector */}
        <div>
          <label className="block text-xs text-gray-500 mb-1">Dátum</label>
          <input
            type="date"
            value={formatDateForInput(selectedTime)}
            onChange={handleDateChange}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
        </div>
        
        {/* Time selectors */}
        <div className="flex gap-2">
          <div className="flex-1">
            <label className="block text-xs text-gray-500 mb-1">Óra</label>
            <select
              value={selectedTime?.getHours() ?? ""}
              onChange={handleHourChange}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            >
              <option value="">--</option>
              {hourOptions.map(hour => (
                <option key={hour} value={hour}>
                  {hour.toString().padStart(2, '0')}
                </option>
              ))}
            </select>
          </div>
          
          <div className="flex-1">
            <label className="block text-xs text-gray-500 mb-1">Perc</label>
            <select
              value={selectedTime?.getMinutes() ?? ""}
              onChange={handleMinuteChange}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            >
              <option value="">--</option>
              {minuteOptions.map(minute => (
                <option key={minute} value={minute}>
                  {minute.toString().padStart(2, '0')}
                </option>
              ))}
            </select>
          </div>
        </div>
        
        {/* Action buttons */}
        <div className="flex gap-2">
          <button
            type="button"
            onClick={setToNow}
            className="rounded-md bg-indigo-600 px-2.5 py-1.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          >
            Most
          </button>
          <button
            type="button"
            onClick={clear}
            className="rounded-md bg-gray-600 px-2.5 py-1.5 text-sm font-semibold text-white shadow-sm hover:bg-gray-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-600"
          >
            Törlés
          </button>
        </div>
      </div>
      
      {/* Hidden input for form submission */}
      <input 
        type="hidden" 
        name={name} 
        value={selectedTime?.toISOString() ?? ""} 
      />
    </div>
  );
};

export default TimeSelector;
