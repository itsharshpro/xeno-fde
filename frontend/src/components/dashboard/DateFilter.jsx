import React from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const DateFilter = ({ startDate, endDate, onStartDateChange, onEndDateChange }) => {
    const handlePresetClick = (preset) => {
        const now = new Date();
        let newStartDate;
        let newEndDate = now;

        switch (preset) {
            case 'overall':
                // Set to a very early date to get all data
                newStartDate = new Date('2020-01-01');
                break;
            case 'lastWeek':
                newStartDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                break;
            case 'lastMonth':
                newStartDate = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
                break;
            case 'last3Months':
                newStartDate = new Date(now.getFullYear(), now.getMonth() - 3, now.getDate());
                break;
            case 'lastYear':
                newStartDate = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
                break;
            default:
                return;
        }

        onStartDateChange(newStartDate);
        onEndDateChange(newEndDate);
    };

    const presets = [
        { key: 'overall', label: 'Overall' },
        { key: 'lastWeek', label: 'Last Week' },
        { key: 'lastMonth', label: 'Last Month' },
        { key: 'last3Months', label: 'Last 3 Months' },
        { key: 'lastYear', label: 'Last Year' }
    ];

    return (
        <div className="bg-white rounded-lg shadow-sm border border-black p-6 mb-6">
            <div className="flex flex-col items-center space-y-6">
                {/* Date Range Shortcuts */}
                <div className="flex flex-wrap justify-center gap-2">
                    {presets.map((preset) => (
                        <button
                            key={preset.key}
                            onClick={() => handlePresetClick(preset.key)}
                            className="px-3 py-2 text-sm font-medium bg-white text-black border border-black rounded-md hover:bg-gray-50 transition-colors"
                        >
                            {preset.label}
                        </button>
                    ))}
                </div>

                {/* Custom Date Selectors */}
                <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6">
                    <div className="flex items-center space-x-3">
                        <label htmlFor="start-date" className="text-sm font-medium text-black whitespace-nowrap">
                            From:
                        </label>
                        <DatePicker
                            id="start-date"
                            selected={startDate}
                            onChange={onStartDateChange}
                            selectsStart
                            startDate={startDate}
                            endDate={endDate}
                            maxDate={new Date()}
                            dateFormat="MMM dd, yyyy"
                            className="px-3 py-2 border border-black rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-black text-sm w-32"
                        />
                    </div>
                    
                    <div className="flex items-center space-x-3">
                        <label htmlFor="end-date" className="text-sm font-medium text-black whitespace-nowrap">
                            To:
                        </label>
                        <DatePicker
                            id="end-date"
                            selected={endDate}
                            onChange={onEndDateChange}
                            selectsEnd
                            startDate={startDate}
                            endDate={endDate}
                            minDate={startDate}
                            maxDate={new Date()}
                            dateFormat="MMM dd, yyyy"
                            className="px-3 py-2 border border-black rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-black text-sm w-32"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DateFilter;
