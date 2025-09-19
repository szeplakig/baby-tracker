import React from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import NowButton from "./NowButton.tsx";

interface DateTimePickerProps {
  label: string;
  selected: Date | null;
  onChange: (date: Date | null) => void;
  name: string;
}

const DateTimePicker: React.FC<DateTimePickerProps> = ({
  label,
  selected,
  onChange,
  name,
}) => {
  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700">
        {label}
      </label>
      <div className="mt-1 flex items-center">
        <DatePicker
          selected={selected}
          onChange={onChange}
          showTimeSelect
          timeFormat="HH:mm"
          timeIntervals={1}
          dateFormat="yyyy. MM. dd. HH:mm"
          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          isClearable
          fixedHeight
          shouldCloseOnSelect={false}
          popperProps={{
            strategy: "fixed",
          }}
          popperModifiers={[
            {
              name: "preventOverflow",
              options: {
                boundary: "viewport",
                padding: 8,
              },
            },
            {
              name: "flip",
              options: {
                fallbackPlacements: ["top", "bottom", "left", "right"],
              },
            },
          ]}
        />
        <NowButton onClick={() => onChange(new Date())} />
        <input type="hidden" name={name} value={selected?.toISOString() ?? ""} />
      </div>
    </div>
  );
};

export default DateTimePicker;
