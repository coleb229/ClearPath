"use client";

import { useState, useCallback, useId } from "react";

interface DateRangePickerProps {
  startDate?: string;
  endDate?: string;
  current?: boolean;
  startName?: string;
  endName?: string;
  currentName?: string;
  onChange?: (start: string, end: string, current: boolean) => void;
}

export function DateRangePicker({
  startDate: controlledStart,
  endDate: controlledEnd,
  current: controlledCurrent,
  startName,
  endName,
  currentName,
  onChange,
}: DateRangePickerProps) {
  const id = useId();

  const [internalStart, setInternalStart] = useState(controlledStart ?? "");
  const [internalEnd, setInternalEnd] = useState(controlledEnd ?? "");
  const [internalCurrent, setInternalCurrent] = useState(
    controlledCurrent ?? false
  );

  const isControlled = onChange !== undefined;
  const start = isControlled ? (controlledStart ?? "") : internalStart;
  const end = isControlled ? (controlledEnd ?? "") : internalEnd;
  const current = isControlled ? (controlledCurrent ?? false) : internalCurrent;

  const handleChange = useCallback(
    (newStart: string, newEnd: string, newCurrent: boolean) => {
      if (onChange) {
        onChange(newStart, newEnd, newCurrent);
      } else {
        setInternalStart(newStart);
        setInternalEnd(newEnd);
        setInternalCurrent(newCurrent);
      }
    },
    [onChange]
  );

  const inputClasses =
    "w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring/20 transition-colors duration-(--dur-state)";

  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-2 gap-3">
        {/* Start date */}
        <div className="flex flex-col gap-1">
          <label
            htmlFor={`${id}-start`}
            className="text-xs text-muted-foreground"
          >
            Start date
          </label>
          <input
            id={`${id}-start`}
            type="month"
            name={startName}
            value={start}
            onChange={(e) => handleChange(e.target.value, end, current)}
            className={inputClasses}
          />
        </div>

        {/* End date */}
        <div className="flex flex-col gap-1">
          <label
            htmlFor={`${id}-end`}
            className="text-xs text-muted-foreground"
          >
            End date
          </label>
          <div
            className={`transition-opacity duration-(--dur-state) ease-(--ease-out-quart) ${
              current ? "pointer-events-none opacity-0" : "opacity-100"
            }`}
          >
            <input
              id={`${id}-end`}
              type="month"
              name={endName}
              value={end}
              onChange={(e) => handleChange(start, e.target.value, current)}
              className={inputClasses}
              tabIndex={current ? -1 : 0}
            />
          </div>
        </div>
      </div>

      {/* Currently here toggle */}
      <label className="flex items-center gap-2 cursor-pointer select-none">
        <input
          type="checkbox"
          name={currentName}
          checked={current}
          onChange={(e) => handleChange(start, end, e.target.checked)}
          className="h-4 w-4 rounded border-input text-primary accent-primary"
        />
        <span className="text-sm text-muted-foreground">
          I currently work/study here
        </span>
      </label>
    </div>
  );
}
