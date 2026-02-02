# Refactoring Opportunities for Testability

This document outlines areas in the Supply-Chain-Report dashboard codebase where refactoring can improve testability and maintainability, especially for data processing and logic functions.

## 1. Data Processing vs. DOM Manipulation
- **Current:** Functions like `displayCurrentStatus`, `displayProgressChart`, and logic in `loadStatusData` mix data processing with DOM updates.
- **Opportunity:** Extract pure data processing functions (e.g., filtering, sorting, aggregating) that take data as input and return results, separate from rendering logic.
- **Example:**
  ```js
  function getRecentKPIUpdates(data, count) { /* ... */ }
  function prepareChartData(data, metric) { /* ... */ }
  ```

## 2. Status/Color Logic
- **Current:** Functions like `getStatusColor`, `getStatusText`, and `calculatePercentage` are already pure and testable.
- **Opportunity:** No change needed, but ensure these are covered by unit tests.

## 3. Metric Range Handling
- **Current:** `metricRanges` is used inline for lookups and normalization.
- **Opportunity:** Extract range lookup and normalization into a helper function for easier testing and reuse.
- **Example:**
  ```js
  function getMetricRange(metric) { return metricRanges[metric] || { min: 0, max: 100, unit: '', lowerIsBetter: false }; }
  ```

## 4. CSV/YAML Parsing
- **Current:** Parsing is handled by PapaParse and js-yaml directly in async functions.
- **Opportunity:** Wrap parsing and validation in your own functions for more granular testing and error handling.
- **Example:**
  ```js
  function parseStatusCSV(csvText) { /* ... */ }
  function parseConfigYAML(yamlText) { /* ... */ }
  ```

## 5. Chart Data Preparation
- **Current:** Chart.js data is prepared inline in `displayProgressChart`.
- **Opportunity:** Extract logic for preparing chart data into a function that can be tested independently.
- **Example:**
  ```js
  function getMetricSeries(data, metric) { return data.map(row => row[metric]); }
  ```

## 6. General Recommendations
- Keep pure functions (input → output, no DOM) for all data logic.
- Use clear, small test cases for each function.
- Document how to run and extend tests.

---
For more, see index.html and related scripts.
