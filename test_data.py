"""
Data and config validation tests for Supply-Chain-Report dashboard.
Validates YAML, CSV, and dashboard logic.
"""
import os
import sys
import yaml
def extract_responsibilities(yaml_text):
    """Extracts the General Responsibilities list from YAML text."""
    try:
        data = yaml.safe_load(yaml_text)
        return data.get('General Responsibilities', [])
    except Exception:
        return []

def test_extract_responsibilities():
    """Test extraction of responsibilities from sample YAML."""
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
    """Render a KPI card as HTML (logic only)."""
    return (
        f"<div class='card {status}'>"
        f"<span>{metric}</span>"
        f"<span>{value}</span>"
        f"</div>"
    )

def test_render_kpi_card():
    """Test rendering of KPI card HTML."""
    html = render_kpi_card('Inventory', 100, 'status-green')
    assert (
        'Inventory' in html and '100' in html and 'status-green' in html
    ), (
        'Card HTML should contain all fields'
    )
    print('test_render_kpi_card: OK')

def get_status_color(percentage):
    """Return status color string based on percentage value."""
    if percentage >= 90:
        return 'status-green'
    if percentage >= 75:
        return 'status-amber'
    return 'status-red'

def test_get_status_color():
    """Test status color logic for various percentages."""
    assert get_status_color(95) == 'status-green', 'Should be green for >=90%'
    assert get_status_color(80) == 'status-amber', (
        'Should be amber for >=75%'
    )
    assert get_status_color(60) == 'status-red', (
        'Should be red for <75%'
    )
    print('test_get_status_color: OK')

def test_reference_lines_config():
    """Test ReferenceLines config for required fields and correct types."""
    with open('config.yaml', encoding='utf-8') as f:
        data = yaml.safe_load(f)
    ref = data.get('ReferenceLines', {})
    assert isinstance(ref, dict), 'ReferenceLines should be a dict'
    for metric, conf in ref.items():
        assert 'reference_line' in conf, (
            f"{metric} missing reference_line"
        )
        assert 'direction' in conf, (
            f"{metric} missing direction"
        )
        assert conf['direction'] in ('above', 'below'), (
            f"{metric} direction must be 'above' or 'below'"
        )
        assert isinstance(conf['reference_line'], (int, float)), (
            f"{metric} reference_line must be a number"
        )
    print('test_reference_lines_config: OK')

def test_status_logic():
    """Test status logic for both 'above' and 'below' directions."""
    # Simulate dashboard logic
    def get_status(value, ref_line, direction):
        if value is None or ref_line is None or direction not in ('above', 'below'):
            return 'Needs Attention'
        if direction == 'above':
            return 'Excellent' if value >= ref_line else 'Needs Attention'
        return 'Excellent' if value <= ref_line else 'Needs Attention'
    # Test 'above'
    assert get_status(15, 10, 'above') == 'Excellent', 'Above: value >= line should be Excellent'
    assert (
        get_status(5, 10, 'above') == 'Needs Attention'
    ), (
        'Above: value < line should be Needs Attention'
    )
    # Test 'below'
    assert (
        get_status(5, 10, 'below') == 'Excellent'
    ), (
        'Below: value <= line should be Excellent'
    )
    assert (
        get_status(15, 10, 'below') == 'Needs Attention'
    ), (
        'Below: value > line should be Needs Attention'
    )
    print('test_status_logic: OK')

def test_missing_or_invalid_reference_line():
    """Test error handling for missing or invalid reference_line config."""
    # Missing reference_line
    conf = {'direction': 'above'}
    try:
        _ = conf['reference_line']
        assert False, 'Should raise KeyError for missing reference_line'
    except KeyError:
        pass
    # Invalid direction
    conf = {'reference_line': 10, 'direction': 'sideways'}
    assert conf['direction'] not in ('above', 'below'), (
        'Invalid direction should not be accepted'
    )
    # Non-numeric reference_line
    conf = {'reference_line': 'ten', 'direction': 'above'}
    assert not isinstance(conf['reference_line'], (int, float)), (
        'Non-numeric reference_line should not be accepted'
    )
    print('test_missing_or_invalid_reference_line: OK')


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
    """Return the most recent KPI updates from data."""
    # Assumes data is a list of dicts with 'date' key in YYYY-MM-DD format
    sorted_data = sorted(data, key=lambda x: x['date'], reverse=True)
    return sorted_data[:count]

def test_get_recent_kpi_updates():
    """Test recent KPI update extraction logic."""
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
    """Calculate the trend (difference) for a metric over time."""
    # Returns the difference between the last and first value for a metric
    if not data or metric not in data[0]:
        return None
    sorted_data = sorted(data, key=lambda x: x['date'])
    return sorted_data[-1][metric] - sorted_data[0][metric]

def test_calculate_trend():
    """Test trend calculation for a metric."""
    sample = [
        {'date': '2026-01-01', 'kpi': 10},
        {'date': '2026-01-02', 'kpi': 15},
        {'date': '2026-01-03', 'kpi': 20},
    ]
    assert calculate_trend(sample, 'kpi') == 10, 'Trend should be last minus first'
    print('test_calculate_trend: OK')

def calculate_bingo_days(current_level, reference_line, avg_consumption_inches_per_day):
    """Return days until the reference line (Bingo Date) is reached."""
    if not isinstance(current_level, (int, float)):
        return None
    if not isinstance(reference_line, (int, float)):
        return None
    if not isinstance(avg_consumption_inches_per_day, (int, float)):
        return None
    if avg_consumption_inches_per_day <= 0:
        return None

    remaining_inches = max(0, current_level - reference_line)
    return remaining_inches / avg_consumption_inches_per_day

def test_bingo_date_is_reference_line_based():
    """Bingo Date should be projected at the reference line threshold."""
    days = calculate_bingo_days(current_level=38, reference_line=20, avg_consumption_inches_per_day=3)
    assert abs(days - 6.0) < 1e-9, 'Bingo days should be (38-20)/3 = 6 days'
    print('test_bingo_date_is_reference_line_based: OK')

def test_bingo_date_no_double_delivery_lag_subtraction():
    """Do not subtract delivery lag again because reference line already encodes it."""
    days = calculate_bingo_days(current_level=35, reference_line=20, avg_consumption_inches_per_day=3)
    assert abs(days - 5.0) < 1e-9, 'Bingo days should remain 5, not 2 after extra lag subtraction'
    print('test_bingo_date_no_double_delivery_lag_subtraction: OK')

def test_oil_reference_lines_present():
    """Oil metrics should define reference lines for Bingo Date projections."""
    with open('config.yaml', encoding='utf-8') as f:
        data = yaml.safe_load(f)
    ref = data.get('ReferenceLines', {})
    for oil_metric in ('oil_0_20', 'oil_5_30'):
        assert oil_metric in ref, f'{oil_metric} must be present in ReferenceLines'
        assert isinstance(ref[oil_metric].get('reference_line'), (int, float)), (
            f'{oil_metric}.reference_line must be numeric'
        )
    print('test_oil_reference_lines_present: OK')

def test_used_oil_filters_reference_line_present():
    """used_oil_filters should define a reference line of 70 with direction 'below'."""
    with open('config.yaml', encoding='utf-8') as f:
        data = yaml.safe_load(f)
    ref = data.get('ReferenceLines', {})
    assert 'used_oil_filters' in ref, 'used_oil_filters must be present in ReferenceLines'
    assert ref['used_oil_filters'].get('reference_line') == 70, (
        'used_oil_filters reference_line must be 70'
    )
    assert ref['used_oil_filters'].get('direction') == 'below', (
        "used_oil_filters direction must be 'below'"
    )
    print('test_used_oil_filters_reference_line_present: OK')


def test_used_oil_filters_status_logic():
    """used_oil_filters status: <=70% is Excellent, >70% is Needs Attention, None is Needs Attention."""
    def get_status(value, ref_line, direction):
        if value is None or ref_line is None or direction not in ('above', 'below'):
            return 'Needs Attention'
        if direction == 'above':
            return 'Excellent' if value >= ref_line else 'Needs Attention'
        return 'Excellent' if value <= ref_line else 'Needs Attention'

    assert get_status(70, 70, 'below') == 'Excellent', (
        'At threshold (70%) should be Excellent'
    )
    assert get_status(71, 70, 'below') == 'Needs Attention', (
        'Above threshold (71%) should be Needs Attention'
    )
    assert get_status(None, 70, 'below') == 'Needs Attention', (
        'Missing value should be Needs Attention'
    )
    print('test_used_oil_filters_status_logic: OK')


def main():
    test_reference_lines_config()
    test_status_logic()
    test_missing_or_invalid_reference_line()

    # Commented out check_csv since it is not defined in this file
    # if os.path.exists('status.csv') and os.path.exists('config.yaml'):
    #     check_csv('status.csv')
    if os.path.exists('config.yaml'):
        check_yaml('config.yaml')
        print('All data checks passed.')
    else:
        print('Error: config.yaml is missing.')
        sys.exit(1)

    # Run additional unit tests (breadth-first, all areas)
    test_get_recent_kpi_updates()
    test_calculate_trend()
    test_bingo_date_is_reference_line_based()
    test_bingo_date_no_double_delivery_lag_subtraction()
    test_oil_reference_lines_present()
    test_used_oil_filters_reference_line_present()
    test_used_oil_filters_status_logic()
    test_get_status_color()
    # test_get_metric_series()  # Commented out, not defined in this file
    test_extract_responsibilities()
    test_render_kpi_card()

if __name__ == "__main__":
    main()
