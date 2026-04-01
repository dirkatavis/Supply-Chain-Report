// test_oil_logic.js
// Node.js test harness for oil_logic.js.
// Run: node test_oil_logic.js

'use strict';

const oil = require('./oil_logic');

let passed = 0;
let failed = 0;

function assert(label, condition) {
    if (condition) {
        console.log(`  PASS: ${label}`);
        passed += 1;
    } else {
        console.error(`  FAIL: ${label}`);
        failed += 1;
    }
}

function assertEqual(label, actual, expected) {
    const ok = actual === expected;
    if (!ok) {
        console.error(`  FAIL: ${label} — expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
        failed += 1;
    } else {
        console.log(`  PASS: ${label}`);
        passed += 1;
    }
}

// ---------------------------------------------------------------------------
// Helpers to build synthetic data rows.
// ---------------------------------------------------------------------------
function makeRows(metric, readings) {
    // readings: array of { date: 'YYYY-MM-DD', level: number }
    return readings.map(r => {
        const row = { date: r.date };
        row[metric] = r.level;
        return row;
    });
}

// ---------------------------------------------------------------------------
// 1. oilReorderConfig
// ---------------------------------------------------------------------------
console.log('\n--- oilReorderConfig ---');
assert('oil_0_20 exists', 'oil_0_20' in oil.oilReorderConfig);
assert('oil_5_30 exists', 'oil_5_30' in oil.oilReorderConfig);
assert('oil_0_20 maxInches is 59', oil.oilReorderConfig.oil_0_20.maxInches === 59);
assert('oil_5_30 maxInches is 59', oil.oilReorderConfig.oil_5_30.maxInches === 59);
assert('oil_0_20 gallonsPerInch ≈ 8.47', Math.abs(oil.oilReorderConfig.oil_0_20.gallonsPerInch - 500 / 59) < 0.001);
assert('oil_5_30 gallonsPerInch ≈ 16.95', Math.abs(oil.oilReorderConfig.oil_5_30.gallonsPerInch - 1000 / 59) < 0.001);

// ---------------------------------------------------------------------------
// 2. calculateOilReorderGallons
// ---------------------------------------------------------------------------
console.log('\n--- calculateOilReorderGallons ---');
assertEqual('null metric returns null', oil.calculateOilReorderGallons('unknown', 30), null);
assertEqual('non-numeric level returns null', oil.calculateOilReorderGallons('oil_0_20', 'bad'), null);
assertEqual('full tank (59") returns 0 gal', oil.calculateOilReorderGallons('oil_0_20', 59), 0);
assertEqual('over-full tank returns 0 gal', oil.calculateOilReorderGallons('oil_0_20', 65), 0);

// At 30" the 0-20 tank needs (59-30)*500/59 ≈ 246 gal
const expected020At30 = Math.round((59 - 30) * (500 / 59));
assertEqual(`oil_0_20 at 30" = ${expected020At30} gal`, oil.calculateOilReorderGallons('oil_0_20', 30), expected020At30);

// At 30" the 5-30 tank needs (59-30)*1000/59 ≈ 492 gal
const expected530At30 = Math.round((59 - 30) * (1000 / 59));
assertEqual(`oil_5_30 at 30" = ${expected530At30} gal`, oil.calculateOilReorderGallons('oil_5_30', 30), expected530At30);

// ---------------------------------------------------------------------------
// 3. isOilReorderMetric
// ---------------------------------------------------------------------------
console.log('\n--- isOilReorderMetric ---');
assert('oil_0_20 is a reorder metric', oil.isOilReorderMetric('oil_0_20'));
assert('oil_5_30 is a reorder metric', oil.isOilReorderMetric('oil_5_30'));
assert('oil_waste is NOT a reorder metric', !oil.isOilReorderMetric('oil_waste'));
assert('unknown metric returns false', !oil.isOilReorderMetric('glass_pending_repair'));

// ---------------------------------------------------------------------------
// 4. isOilDeadlineMetric
// ---------------------------------------------------------------------------
console.log('\n--- isOilDeadlineMetric ---');
assert('oil_0_20 is a deadline metric', oil.isOilDeadlineMetric('oil_0_20'));
assert('oil_5_30 is a deadline metric', oil.isOilDeadlineMetric('oil_5_30'));
assert('oil_waste is a deadline metric', oil.isOilDeadlineMetric('oil_waste'));
assert('unrelated metric is NOT a deadline metric', !oil.isOilDeadlineMetric('missing_keys'));

// ---------------------------------------------------------------------------
// 5. calculateSupplyConsumptionInchesPerDaySinceLastFill
// ---------------------------------------------------------------------------
console.log('\n--- calculateSupplyConsumptionInchesPerDaySinceLastFill ---');
const fn = oil.calculateSupplyConsumptionInchesPerDaySinceLastFill;

assertEqual('null on empty array', fn('oil_0_20', []), null);
assertEqual('null on single-row array', fn('oil_0_20', [{ date: '2025-01-01', oil_0_20: 50 }]), null);

// Simple monotone decrease: 50 → 40 over 10 days = 1 in/day
const monoRows = makeRows('oil_0_20', [
    { date: '2025-01-01', level: 50 },
    { date: '2025-01-11', level: 40 }
]);
const monoRate = fn('oil_0_20', monoRows);
assert('mono-decrease rate ≈ 1 in/day', monoRate !== null && Math.abs(monoRate - 1) < 0.001);

// Refill event: level goes up then down — consumption measured from highest-increase point
const refillRows = makeRows('oil_0_20', [
    { date: '2025-01-01', level: 40 },  // old low
    { date: '2025-01-05', level: 55 },  // refill at index 1 — last increase
    { date: '2025-01-10', level: 50 }   // consumed 5" over 5 days → 1 in/day
]);
const refillRate = fn('oil_0_20', refillRows);
assert('post-refill rate ≈ 1 in/day', refillRate !== null && Math.abs(refillRate - 1) < 0.001);

// Level never truly decreases after last fill → consumedInchesSinceFill ≤ 0 → null
const flatRows = makeRows('oil_0_20', [
    { date: '2025-01-01', level: 50 },
    { date: '2025-01-11', level: 55 }   // only increasing, no consumption
]);
assertEqual('all-increasing rows returns null', fn('oil_0_20', flatRows), null);

// ---------------------------------------------------------------------------
// 6. calculateOilDeadline
// ---------------------------------------------------------------------------
console.log('\n--- calculateOilDeadline ---');
const refConfig = { oil_0_20: { reference_line: 20, direction: 'above' } };

// Not an oil deadline metric → null
assertEqual('non-deadline metric returns null',
    oil.calculateOilDeadline('glass_pending_repair', 50, monoRows, refConfig), null);

// No consumption data (single row) → null
assertEqual('no consumption data returns null',
    oil.calculateOilDeadline('oil_0_20', 30, [{ date: '2025-01-01', oil_0_20: 30 }], refConfig), null);

// Known scenario: 1 in/day consumption, level=30", ref_line=20" → 10 days until deadline
const knownRows = makeRows('oil_0_20', [
    { date: '2025-01-01', level: 50 },
    { date: '2025-01-11', level: 40 }
]);
const deadlineResult = oil.calculateOilDeadline('oil_0_20', 30, knownRows, refConfig);
assert('deadline is a Date', deadlineResult instanceof Date);
if (deadlineResult) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const diffDays = Math.round((deadlineResult - today) / (1000 * 60 * 60 * 24));
    // level=30, refLine=20, rate=1 in/day → 10 days → floor(10) = 10
    assertEqual('deadline 10 days from today', diffDays, 10);
}

// Reference line not configured → falls back to unusable-bottom + delivery-lag formula
const emptyRefConfig = {};
const fallbackResult = oil.calculateOilDeadline('oil_0_20', 30, knownRows, emptyRefConfig);
assert('fallback path returns a Date', fallbackResult instanceof Date);
if (fallbackResult) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const diffDays = Math.round((fallbackResult - today) / (1000 * 60 * 60 * 24));
    // usableInches = max(0, 30 - 3) = 27; daysToBingo = 27/1 = 27; days = max(0, 27 - 3) = 24
    assertEqual('fallback deadline 24 days from today', diffDays, 24);
}

// Already at or past the trigger line → deadline = today (0 days)
const atTriggerRows = makeRows('oil_0_20', [
    { date: '2025-01-01', level: 25 },
    { date: '2025-01-11', level: 15 }   // rate=1 in/day
]);
const pastTriggerResult = oil.calculateOilDeadline('oil_0_20', 18, atTriggerRows, refConfig);
assert('past trigger line returns a Date', pastTriggerResult instanceof Date);
if (pastTriggerResult) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const diffDays = Math.round((pastTriggerResult - today) / (1000 * 60 * 60 * 24));
    // level=18, refLine=20, remainingInches=max(0,18-20)=0 → 0 days
    assertEqual('past trigger level = today', diffDays, 0);
}

// Reference line present but reference_line is NaN → null
const badRefConfig = { oil_0_20: { reference_line: 'bad', direction: 'above' } };
assertEqual('non-numeric reference_line falls back to formula',
    oil.calculateOilDeadline('oil_0_20', 30, knownRows, badRefConfig) instanceof Date, true);

// ---------------------------------------------------------------------------
// Summary
// ---------------------------------------------------------------------------
console.log(`\n${'='.repeat(50)}`);
console.log(`Results: ${passed} passed, ${failed} failed`);
if (failed > 0) {
    process.exit(1);
}
