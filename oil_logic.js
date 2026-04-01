// oil_logic.js
// Oil tank planning logic — usable as a browser <script> and as a Node.js module.
//
// Browser usage:  <script src="oil_logic.js"></script>  (functions become page-globals)
// Node.js usage:  const oil = require('./oil_logic');

const oilReorderConfig = {
    oil_0_20: { maxInches: 59, gallonsPerInch: 500 / 59 },
    oil_5_30: { maxInches: 59, gallonsPerInch: 1000 / 59 }
};


function calculateOilReorderGallons(metric, levelInches) {
    const config = oilReorderConfig[metric];
    if (!config) {
        return null;
    }
    const numericLevel = Number(levelInches);
    if (!Number.isFinite(numericLevel)) {
        return null;
    }

    const inchesToFill = Math.max(0, config.maxInches - numericLevel);
    return Math.round(inchesToFill * config.gallonsPerInch);
}

function isOilReorderMetric(metricName) {
    return Object.prototype.hasOwnProperty.call(oilReorderConfig, String(metricName).trim().toLowerCase());
}

function isOilDeadlineMetric(metricName) {
    const normalizedMetricName = String(metricName).trim().toLowerCase();
    return isOilReorderMetric(normalizedMetricName) || normalizedMetricName === 'oil_waste';
}

function parseDateValue(dateValue) {
    const parsedDate = new Date(dateValue);
    if (Number.isNaN(parsedDate.getTime())) {
        return null;
    }
    return parsedDate;
}

function calculateAverageInchesPerDay(metric, allDataRows, trendDirection) {
    if (!Array.isArray(allDataRows) || allDataRows.length < 2) {
        return null;
    }

    const rateValues = [];
    for (let index = 1; index < allDataRows.length; index += 1) {
        const previousRow = allDataRows[index - 1];
        const currentRow = allDataRows[index];

        const previousLevel = Number(previousRow[metric]);
        const currentLevel = Number(currentRow[metric]);
        if (!Number.isFinite(previousLevel) || !Number.isFinite(currentLevel)) {
            continue;
        }

        const previousDate = parseDateValue(previousRow.date);
        const currentDate = parseDateValue(currentRow.date);
        if (!previousDate || !currentDate) {
            continue;
        }

        const dayDifference = (currentDate - previousDate) / (1000 * 60 * 60 * 24);
        if (!Number.isFinite(dayDifference) || dayDifference <= 0) {
            continue;
        }

        const levelDelta = currentLevel - previousLevel;
        let inchesPerDay = null;

        if (trendDirection === 'decreasing' && levelDelta < 0) {
            inchesPerDay = Math.abs(levelDelta) / dayDifference;
        }

        if (trendDirection === 'increasing' && levelDelta > 0) {
            inchesPerDay = levelDelta / dayDifference;
        }

        if (!Number.isFinite(inchesPerDay) || inchesPerDay <= 0) {
            continue;
        }

        rateValues.push(inchesPerDay);
    }

    if (rateValues.length === 0) {
        return null;
    }

    const recentRateValues = rateValues.slice(-7);
    const totalRate = recentRateValues.reduce((sum, rateValue) => sum + rateValue, 0);
    return totalRate / recentRateValues.length;
}

function calculateSupplyConsumptionInchesPerDaySinceLastFill(metric, allDataRows) {
    if (!Array.isArray(allDataRows) || allDataRows.length < 2) {
        return null;
    }

    let fillStartIndex = 0;
    for (let index = 1; index < allDataRows.length; index += 1) {
        const previousLevel = Number(allDataRows[index - 1][metric]);
        const currentLevel = Number(allDataRows[index][metric]);
        if (!Number.isFinite(previousLevel) || !Number.isFinite(currentLevel)) {
            continue;
        }

        const levelDelta = currentLevel - previousLevel;
        if (levelDelta > 0) {
            fillStartIndex = index;
        }
    }

    const fillStartRow = allDataRows[fillStartIndex];
    const latestRow = allDataRows[allDataRows.length - 1];

    const fillStartLevel = Number(fillStartRow[metric]);
    const latestLevel = Number(latestRow[metric]);
    if (!Number.isFinite(fillStartLevel) || !Number.isFinite(latestLevel)) {
        return null;
    }

    const fillStartDate = parseDateValue(fillStartRow.date);
    const latestDate = parseDateValue(latestRow.date);
    if (!fillStartDate || !latestDate) {
        return null;
    }

    const elapsedDays = (latestDate - fillStartDate) / (1000 * 60 * 60 * 24);
    if (!Number.isFinite(elapsedDays) || elapsedDays <= 0) {
        return null;
    }

    const consumedInchesSinceFill = fillStartLevel - latestLevel;
    if (!Number.isFinite(consumedInchesSinceFill) || consumedInchesSinceFill <= 0) {
        return null;
    }

    return consumedInchesSinceFill / elapsedDays;
}

// Internal helper — not exported.
function getOilActionTriggerLine(metric, referenceLinesConfig) {
    if (!referenceLinesConfig) return null;
    const refLine = referenceLinesConfig[metric];
    if (!refLine || typeof refLine.reference_line !== 'number') {
        return null;
    }
    return refLine.reference_line;
}

function calculateOilDeadline(metric, levelInches, allDataRows, referenceLinesConfig) {
    if (!isOilDeadlineMetric(metric)) {
        return null;
    }

    const numericLevel = Number(levelInches);
    if (!Number.isFinite(numericLevel)) {
        return null;
    }

    let daysUntilDeadline = null;
    if (isOilReorderMetric(metric)) {
        const averageConsumptionInchesPerDay = calculateSupplyConsumptionInchesPerDaySinceLastFill(metric, allDataRows);
        if (!Number.isFinite(averageConsumptionInchesPerDay) || averageConsumptionInchesPerDay <= 0) {
            return null;
        }

        const actionTriggerLine = getOilActionTriggerLine(metric, referenceLinesConfig);
        if (!Number.isFinite(actionTriggerLine)) {
            return null;
        } else {
            const remainingInchesToActionTrigger = Math.max(0, numericLevel - actionTriggerLine);
            daysUntilDeadline = remainingInchesToActionTrigger / averageConsumptionInchesPerDay;
        }
    } else if (String(metric).trim().toLowerCase() === 'oil_waste') {
        const averageFillInchesPerDay = calculateAverageInchesPerDay(metric, allDataRows, 'increasing');
        if (!Number.isFinite(averageFillInchesPerDay) || averageFillInchesPerDay <= 0) {
            return null;
        }

        const actionTriggerLine = getOilActionTriggerLine(metric, referenceLinesConfig);
        if (!Number.isFinite(actionTriggerLine)) {
            return null;
        }

        const remainingInchesToActionTrigger = Math.max(0, actionTriggerLine - numericLevel);
        daysUntilDeadline = remainingInchesToActionTrigger / averageFillInchesPerDay;
    }

    if (!Number.isFinite(daysUntilDeadline)) {
        return null;
    }

    const wholeDaysUntilDeadline = Math.max(0, Math.floor(daysUntilDeadline));
    const deadlineDate = new Date();
    deadlineDate.setHours(0, 0, 0, 0);
    deadlineDate.setDate(deadlineDate.getDate() + wholeDaysUntilDeadline);
    return deadlineDate;
}

function formatOilDate(dateValue) {
    return dateValue.toLocaleDateString('en-US', {
        month: '2-digit',
        day: '2-digit',
        year: '2-digit'
    });
}

// Node.js export — ignored in the browser where module is undefined.
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        oilReorderConfig,
        calculateOilReorderGallons,
        isOilReorderMetric,
        isOilDeadlineMetric,
        calculateSupplyConsumptionInchesPerDaySinceLastFill,
        calculateOilDeadline,
        formatOilDate
    };
}
