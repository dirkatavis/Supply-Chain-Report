import yaml
import os
def extract_responsibilities(yaml_text):
    try:
        data = yaml.safe_load(yaml_text)
        return data.get('General Responsibilities', [])
    except Exception:
        return []

def test_extract_responsibilities():
    sample_yaml = """
Name: Test User
Role: Test Role
General Responsibilities:
  - Inventory Management
  - Supplier Coordination
"""
    result = extract_responsibilities(sample_yaml)
    assert isinstance(result, list), 'Responsibilities should be a list'
    assert 'Inventory Management' in result, 'Should extract Inventory Management'
    assert 'Supplier Coordination' in result, 'Should extract Supplier Coordination'
    print('test_extract_responsibilities: OK')

# Placeholder for UI rendering logic (logic only, not actual DOM)
def render_kpi_card(metric, value, status):
    return f"<div class='card {status}'><span>{metric}</span><span>{value}</span></div>"

def test_render_kpi_card():
    html = render_kpi_card('Inventory', 10, 'status-green')
    assert 'Inventory' in html and '10' in html and 'status-green' in html, 'Card should contain metric, value, and status'
    print('test_render_kpi_card: OK')
def get_status_color(percentage):
    if percentage >= 90:
        return 'status-green'
    if percentage >= 75:
        return 'status-amber'
    return 'status-red'

def test_get_status_color():
    assert get_status_color(95) == 'status-green', 'Should be green for >=90%'
    assert get_status_color(80) == 'status-amber', 'Should be amber for >=75%'
    assert get_status_color(60) == 'status-red', 'Should be red for <75%'
    print('test_get_status_color: OK')

def get_metric_series(data, metric):
    return [row[metric] for row in data if metric in row]

def test_get_metric_series():
    sample = [
        {'date': '2026-01-01', 'a': 1},
        {'date': '2026-01-02', 'a': 2},
        {'date': '2026-01-03', 'a': 3},
    ]
    result = get_metric_series(sample, 'a')
    assert result == [1, 2, 3], 'Should extract metric series correctly'
    print('test_get_metric_series: OK')
# Minimal data validation for Supply-Chain-Report
# Usage: Right-click and run in terminal, or: python test_data.py
import csv
import sys
import re

def check_csv(path):
    try:
        with open(path, newline='', encoding='utf-8') as f:
            reader = csv.reader(f)
            rows = list(reader)
        if len(rows) < 2:
            raise Exception('CSV missing data rows')
        header = rows[0]
        if len(header) < 4:
            raise Exception('CSV header too short')
        for i, row in enumerate(rows[1:], 2):
            if len(row) < len(header):
                raise Exception(f'Row {i} has too few columns')
        print('status.csv: OK')
    except Exception as e:
        print('status.csv:', e)
        sys.exit(1)

def check_yaml(path):
    try:
        with open(path, encoding='utf-8') as f:
            data = f.read()
        parsed = yaml.safe_load(data)
        if not isinstance(parsed, dict) or not parsed:
            raise Exception('YAML does not contain a valid mapping/object')
        print('config.yaml: OK')
    except Exception as e:
        print('config.yaml:', e)
        sys.exit(1)


# --- Additional KPI Data Processing Tests ---
def get_recent_kpi_updates(data, count):
    # Assumes data is a list of dicts with 'date' key in YYYY-MM-DD format
    sorted_data = sorted(data, key=lambda x: x['date'], reverse=True)
    return sorted_data[:count]

def test_get_recent_kpi_updates():
    sample = [
        {'date': '2026-01-01', 'kpi': 1},
        {'date': '2026-01-03', 'kpi': 3},
        {'date': '2026-01-02', 'kpi': 2},
    ]
    result = get_recent_kpi_updates(sample, 2)
    assert result[0]['date'] == '2026-01-03', 'Most recent date should be first'
    assert result[1]['date'] == '2026-01-02', 'Second most recent date should be second'
    print('test_get_recent_kpi_updates: OK')

def calculate_trend(data, metric):
    # Returns the difference between the last and first value for a metric
    if not data or metric not in data[0]:
        return None
    sorted_data = sorted(data, key=lambda x: x['date'])
    return sorted_data[-1][metric] - sorted_data[0][metric]

def test_calculate_trend():
    sample = [
        {'date': '2026-01-01', 'kpi': 10},
        {'date': '2026-01-02', 'kpi': 15},
        {'date': '2026-01-03', 'kpi': 20},
    ]
    assert calculate_trend(sample, 'kpi') == 10, 'Trend should be last minus first'
    print('test_calculate_trend: OK')

def main():
    if os.path.exists('status.csv') and os.path.exists('config.yaml'):
        check_csv('status.csv')
        check_yaml('config.yaml')
        print('All data checks passed.')
    else:
        print('Error: One or more data files are missing.')
        sys.exit(1)

    # Run additional unit tests (breadth-first, all areas)
    test_get_recent_kpi_updates()
    test_calculate_trend()
    test_get_status_color()
    test_get_metric_series()
    test_extract_responsibilities()
    test_render_kpi_card()

if __name__ == "__main__":
    main()
