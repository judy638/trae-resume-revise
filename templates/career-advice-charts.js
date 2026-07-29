(function() {
  var style = getComputedStyle(document.documentElement);
  var accent = style.getPropertyValue('--accent').trim() || '#2563eb';
  var accent2 = style.getPropertyValue('--accent2').trim() || '#059669';
  var accent3 = style.getPropertyValue('--accent3').trim() || '#d97706';
  var ink = style.getPropertyValue('--ink').trim() || '#1a1a2e';
  var muted = style.getPropertyValue('--muted').trim() || '#6b7280';
  var rule = style.getPropertyValue('--rule').trim() || '#e5e7eb';
  var bg2 = style.getPropertyValue('--bg2').trim() || '#ffffff';

  var levels = ['助理', '专员', '主管', '经理', '总监'];

  // --- Chart 1: 电商运营薪资 ---
  var chart1 = echarts.init(document.getElementById('chart-ecommerce'), null, { renderer: 'svg' });
  chart1.setOption({
    animation: false,
    tooltip: {
      trigger: 'axis',
      appendToBody: true,
      formatter: function(params) {
        var p = params[0];
        return p.name + '<br/>月薪范围: ' + p.value + 'K';
      }
    },
    grid: { left: 50, right: 30, top: 30, bottom: 40 },
    xAxis: {
      type: 'category',
      data: levels,
      axisLine: { lineStyle: { color: rule } },
      axisLabel: { color: muted, fontSize: 13 }
    },
    yAxis: {
      type: 'value',
      name: '月薪 (K)',
      nameTextStyle: { color: muted, fontSize: 12 },
      axisLine: { show: false },
      axisLabel: { color: muted, fontSize: 12 },
      splitLine: { lineStyle: { color: rule, type: 'dashed' } }
    },
    series: [{
      type: 'bar',
      data: [5.75, 11.5, 15, 20, 40],
      barWidth: '45%',
      itemStyle: {
        color: {
          type: 'linear', x: 0, y: 0, x2: 0, y2: 1,
          colorStops: [
            { offset: 0, color: accent },
            { offset: 1, color: accent + '66' }
          ]
        },
        borderRadius: [6, 6, 0, 0]
      },
      label: {
        show: true,
        position: 'top',
        color: ink,
        fontSize: 13,
        fontWeight: 600,
        formatter: '{c}K'
      }
    }]
  });
  window.chartEcommerce = chart1;
  window.addEventListener('resize', function() { chart1.resize(); });

  // --- Chart 2: 内容运营薪资 ---
  var chart2 = echarts.init(document.getElementById('chart-content'), null, { renderer: 'svg' });
  chart2.setOption({
    animation: false,
    tooltip: {
      trigger: 'axis',
      appendToBody: true,
      formatter: function(params) {
        var p = params[0];
        return p.name + '<br/>月薪范围: ' + p.value + 'K';
      }
    },
    grid: { left: 50, right: 30, top: 30, bottom: 40 },
    xAxis: {
      type: 'category',
      data: levels,
      axisLine: { lineStyle: { color: rule } },
      axisLabel: { color: muted, fontSize: 13 }
    },
    yAxis: {
      type: 'value',
      name: '月薪 (K)',
      nameTextStyle: { color: muted, fontSize: 12 },
      axisLine: { show: false },
      axisLabel: { color: muted, fontSize: 12 },
      splitLine: { lineStyle: { color: rule, type: 'dashed' } }
    },
    series: [{
      type: 'bar',
      data: [6, 9, 15, 22.5, 35],
      barWidth: '45%',
      itemStyle: {
        color: {
          type: 'linear', x: 0, y: 0, x2: 0, y2: 1,
          colorStops: [
            { offset: 0, color: accent3 },
            { offset: 1, color: accent3 + '66' }
          ]
        },
        borderRadius: [6, 6, 0, 0]
      },
      label: {
        show: true,
        position: 'top',
        color: ink,
        fontSize: 13,
        fontWeight: 600,
        formatter: '{c}K'
      }
    }]
  });
  window.chartContent = chart2;
  window.addEventListener('resize', function() { chart2.resize(); });

  // --- Chart 3: 品牌营销薪资 ---
  var chart3 = echarts.init(document.getElementById('chart-brand'), null, { renderer: 'svg' });
  chart3.setOption({
    animation: false,
    tooltip: {
      trigger: 'axis',
      appendToBody: true,
      formatter: function(params) {
        var p = params[0];
        return p.name + '<br/>月薪范围: ' + p.value + 'K';
      }
    },
    grid: { left: 50, right: 30, top: 30, bottom: 40 },
    xAxis: {
      type: 'category',
      data: levels,
      axisLine: { lineStyle: { color: rule } },
      axisLabel: { color: muted, fontSize: 13 }
    },
    yAxis: {
      type: 'value',
      name: '月薪 (K)',
      nameTextStyle: { color: muted, fontSize: 12 },
      axisLine: { show: false },
      axisLabel: { color: muted, fontSize: 12 },
      splitLine: { lineStyle: { color: rule, type: 'dashed' } }
    },
    series: [{
      type: 'bar',
      data: [6.25, 10.5, 15, 20, 35],
      barWidth: '45%',
      itemStyle: {
        color: {
          type: 'linear', x: 0, y: 0, x2: 0, y2: 1,
          colorStops: [
            { offset: 0, color: accent2 },
            { offset: 1, color: accent2 + '66' }
          ]
        },
        borderRadius: [6, 6, 0, 0]
      },
      label: {
        show: true,
        position: 'top',
        color: ink,
        fontSize: 13,
        fontWeight: 600,
        formatter: '{c}K'
      }
    }]
  });
  window.chartBrand = chart3;
  window.addEventListener('resize', function() { chart3.resize(); });
})();
