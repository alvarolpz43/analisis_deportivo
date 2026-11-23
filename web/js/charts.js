/**
 * Gestor de Gráficos Interactivos con Chart.js
 */
const ChartManager = {
  instances: {},

  destroy(id) {
    if (this.instances[id]) {
      this.instances[id].destroy();
      delete this.instances[id];
    }
  },

  renderOutcomeDonut(canvasId, homeWins, draws, awayWins) {
    this.destroy(canvasId);
    const ctx = document.getElementById(canvasId)?.getContext('2d');
    if (!ctx) return;

    this.instances[canvasId] = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: ['Victoria Local (H)', 'Empate (D)', 'Victoria Visitante (A)'],
        datasets: [{
          data: [homeWins, draws, awayWins],
          backgroundColor: ['#10b981', '#64748b', '#3b82f6'],
          borderColor: '#182234',
          borderWidth: 2,
          hoverOffset: 6
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
            labels: { color: '#94a3b8', font: { family: 'Inter', size: 12 } }
          },
          tooltip: {
            callbacks: {
              label: (item) => {
                const total = homeWins + draws + awayWins;
                const pct = ((item.raw / total) * 100).toFixed(1);
                return ` ${item.label}: ${item.raw.toLocaleString()} (${pct}%)`;
              }
            }
          }
        },
        cutout: '68%'
      }
    });
  },

  renderSeasonsBar(canvasId, seasons, matchesPerSeason) {
    this.destroy(canvasId);
    const ctx = document.getElementById(canvasId)?.getContext('2d');
    if (!ctx) return;

    const labels = Object.keys(matchesPerSeason).map(s => `Temp ${s}`);
    const counts = Object.values(matchesPerSeason);

    this.instances[canvasId] = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [{
          label: 'Partidos Consolidados',
          data: counts,
          backgroundColor: '#3b82f6',
          borderRadius: 6
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true,
            grid: { color: '#24324a' },
            ticks: { color: '#94a3b8' }
          },
          x: {
            grid: { display: false },
            ticks: { color: '#94a3b8' }
          }
        },
        plugins: {
          legend: { display: false }
        }
      }
    });
  },

  renderBayesBar(canvasId, prior, posterior) {
    this.destroy(canvasId);
    const ctx = document.getElementById(canvasId)?.getContext('2d');
    if (!ctx) return;

    this.instances[canvasId] = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: ['Probabilidad a Priori P(A)', 'Probabilidad a Posteriori P(A|B)'],
        datasets: [{
          data: [prior * 100, posterior * 100],
          backgroundColor: ['#64748b', '#10b981'],
          borderRadius: 8,
          barThickness: 45
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            min: 0,
            max: 100,
            grid: { color: '#24324a' },
            ticks: {
              color: '#94a3b8',
              callback: (v) => `${v}%`
            }
          },
          x: {
            grid: { display: false },
            ticks: { color: '#f8fafc', font: { weight: 600 } }
          }
        },
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (item) => ` Probabilidad: ${item.raw.toFixed(1)}%`
            }
          }
        }
      }
    });
  },

  renderHypergeometricChart(canvasId, kValues, pmfValues, highlightedX) {
    this.destroy(canvasId);
    const ctx = document.getElementById(canvasId)?.getContext('2d');
    if (!ctx) return;

    const backgroundColors = kValues.map(k => k === highlightedX ? '#10b981' : 'rgba(59, 130, 246, 0.45)');
    const borderColors = kValues.map(k => k === highlightedX ? '#34d399' : '#3b82f6');

    this.instances[canvasId] = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: kValues.map(k => `x = ${k}`),
        datasets: [{
          label: 'P(X = x) Función de Masa (PMF)',
          data: pmfValues.map(v => v * 100),
          backgroundColor: backgroundColors,
          borderColor: borderColors,
          borderWidth: 1.5,
          borderRadius: 6
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true,
            grid: { color: '#24324a' },
            ticks: {
              color: '#94a3b8',
              callback: (v) => `${v}%`
            }
          },
          x: {
            grid: { display: false },
            ticks: { color: '#94a3b8' }
          }
        },
        plugins: {
          legend: {
            position: 'top',
            labels: { color: '#94a3b8' }
          },
          tooltip: {
            callbacks: {
              label: (item) => ` P(X = ${kValues[item.dataIndex]}): ${item.raw.toFixed(2)}%`
            }
          }
        }
      }
    });
  },

  renderBinomialChart(canvasId, kValues, pmfValues, highlightedK) {
    this.destroy(canvasId);
    const ctx = document.getElementById(canvasId)?.getContext('2d');
    if (!ctx) return;

    const backgroundColors = kValues.map(k => k === highlightedK ? '#f59e0b' : 'rgba(16, 185, 129, 0.45)');
    const borderColors = kValues.map(k => k === highlightedK ? '#fbbf24' : '#10b981');

    this.instances[canvasId] = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: kValues.map(k => `k = ${k}`),
        datasets: [{
          label: 'P(X = k) Probabilidad Binomial (%)',
          data: pmfValues.map(v => v * 100),
          backgroundColor: backgroundColors,
          borderColor: borderColors,
          borderWidth: 1.5,
          borderRadius: 6
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true,
            grid: { color: '#24324a' },
            ticks: {
              color: '#94a3b8',
              callback: (v) => `${v}%`
            }
          },
          x: {
            grid: { display: false },
            ticks: { color: '#94a3b8' }
          }
        },
        plugins: {
          legend: {
            position: 'top',
            labels: { color: '#94a3b8' }
          },
          tooltip: {
            callbacks: {
              label: (item) => ` P(X = ${kValues[item.dataIndex]}): ${item.raw.toFixed(2)}%`
            }
          }
        }
      }
    });
  },

  renderFeatureImportanceChart(canvasId, features) {
    this.destroy(canvasId);
    const ctx = document.getElementById(canvasId)?.getContext('2d');
    if (!ctx) return;

    const topFeats = features.slice(0, 8);
    const labels = topFeats.map(f => f.feature);
    const vals = topFeats.map(f => (f.importance * 100).toFixed(1));

    this.instances[canvasId] = new Chart(ctx, {
      type: 'bar',
      indexAxis: 'y',
      data: {
        labels: labels,
        datasets: [{
          label: 'Importancia Relativa (%)',
          data: vals,
          backgroundColor: '#6366f1',
          borderRadius: 6
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: {
            beginAtZero: true,
            grid: { color: '#24324a' },
            ticks: {
              color: '#94a3b8',
              callback: (v) => `${v}%`
            }
          },
          y: {
            grid: { display: false },
            ticks: { color: '#f8fafc', font: { size: 11 } }
          }
        },
        plugins: {
          legend: { display: false }
        }
      }
    });
  },

  renderPoissonChart(canvasId, kValues, pmfValues, highlightedX) {
    this.destroy(canvasId);
    const ctx = document.getElementById(canvasId)?.getContext('2d');
    if (!ctx) return;

    const bgColors = kValues.map(k => k === highlightedX ? '#38bdf8' : 'rgba(14, 165, 233, 0.4)');
    const borderColors = kValues.map(k => k === highlightedX ? '#0284c7' : '#0ea5e9');

    this.instances[canvasId] = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: kValues.map(k => `x = ${k}`),
        datasets: [{
          label: 'P(X = x) Probabilidad Poisson (%)',
          data: pmfValues.map(v => v * 100),
          backgroundColor: bgColors,
          borderColor: borderColors,
          borderWidth: 1.5,
          borderRadius: 6
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true,
            grid: { color: '#24324a' },
            ticks: { color: '#94a3b8', callback: (v) => `${v}%` }
          },
          x: { grid: { display: false }, ticks: { color: '#94a3b8' } }
        },
        plugins: {
          legend: { position: 'top', labels: { color: '#94a3b8' } },
          tooltip: {
            callbacks: {
              label: (item) => ` P(X = ${kValues[item.dataIndex]}): ${item.raw.toFixed(2)}%`
            }
          }
        }
      }
    });
  },

  renderNormalChart(canvasId, xValues, pdfValues, highlightedX, mean) {
    this.destroy(canvasId);
    const ctx = document.getElementById(canvasId)?.getContext('2d');
    if (!ctx) return;

    this.instances[canvasId] = new Chart(ctx, {
      type: 'line',
      data: {
        labels: xValues.map(x => x.toFixed(1)),
        datasets: [{
          label: 'Función de Densidad f(x)',
          data: pdfValues,
          borderColor: '#a855f7',
          backgroundColor: 'rgba(168, 85, 247, 0.15)',
          fill: true,
          tension: 0.35,
          pointRadius: 0
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true,
            grid: { color: '#24324a' },
            ticks: { color: '#94a3b8' }
          },
          x: {
            grid: { color: '#1e293b' },
            ticks: { color: '#94a3b8', maxTicksLimit: 12 }
          }
        },
        plugins: {
          legend: { position: 'top', labels: { color: '#94a3b8' } },
          tooltip: {
            callbacks: {
              label: (item) => ` f(x): ${item.raw.toFixed(4)}`
            }
          }
        }
      }
    });
  },

  renderDescriptiveQ1Chart(canvasId, q1Data) {
    this.destroy(canvasId);
    const ctx = document.getElementById(canvasId)?.getContext('2d');
    if (!ctx) return;

    this.instances[canvasId] = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: ['Victoria Local (H)', 'Empate (D)', 'Victoria Visitante (A)'],
        datasets: [
          {
            label: 'Top 3 Clubes (Élite)',
            data: [q1Data.top_clubes.local, q1Data.top_clubes.empate, q1Data.top_clubes.visitante],
            backgroundColor: '#10b981',
            borderRadius: 6
          },
          {
            label: 'Promedio General LaLiga',
            data: [q1Data.general.local, q1Data.general.empate, q1Data.general.visitante],
            backgroundColor: '#3b82f6',
            borderRadius: 6
          },
          {
            label: 'Resto de la Liga (28 Clubes)',
            data: [q1Data.resto_liga.local, q1Data.resto_liga.empate, q1Data.resto_liga.visitante],
            backgroundColor: '#64748b',
            borderRadius: 6
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            min: 0,
            max: 90,
            grid: { color: '#24324a' },
            ticks: { color: '#94a3b8', callback: (v) => `${v}%` }
          },
          x: { grid: { display: false }, ticks: { color: '#f8fafc', font: { weight: 600 } } }
        },
        plugins: {
          legend: { position: 'top', labels: { color: '#94a3b8' } },
          tooltip: {
            callbacks: {
              label: (item) => ` ${item.dataset.label}: ${item.raw}%`
            }
          }
        }
      }
    });
  },

  renderDescriptiveQ3Chart(canvasId, q3List) {
    this.destroy(canvasId);
    const ctx = document.getElementById(canvasId)?.getContext('2d');
    if (!ctx) return;

    const labels = q3List.map(item => `Temp ${item.temporada}`);
    const localPct = q3List.map(item => item.pct_local);
    const goalsAvg = q3List.map(item => item.promedio_goles);

    // Color condicional: destacar la temporada 2020/21 (pandemia)
    const bgColors = q3List.map(item => item.temporada === '2021' ? '#ef4444' : '#3b82f6');

    this.instances[canvasId] = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [
          {
            type: 'bar',
            label: '% Victoria Local',
            data: localPct,
            backgroundColor: bgColors,
            borderRadius: 6,
            yAxisID: 'y'
          },
          {
            type: 'line',
            label: 'Promedio Goles / Partido',
            data: goalsAvg,
            borderColor: '#f59e0b',
            backgroundColor: '#f59e0b',
            borderWidth: 2,
            tension: 0.3,
            pointRadius: 4,
            yAxisID: 'y1'
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            type: 'linear',
            position: 'left',
            min: 30,
            max: 55,
            grid: { color: '#24324a' },
            ticks: { color: '#94a3b8', callback: (v) => `${v}%` }
          },
          y1: {
            type: 'linear',
            position: 'right',
            min: 2.0,
            max: 3.2,
            grid: { display: false },
            ticks: { color: '#fbbf24' }
          },
          x: { grid: { display: false }, ticks: { color: '#94a3b8' } }
        },
        plugins: {
          legend: { position: 'top', labels: { color: '#94a3b8' } },
          tooltip: {
            callbacks: {
              afterLabel: (item) => {
                if (item.label.includes('2021')) {
                  return ' (Anomalía COVID: partidos a puerta cerrada sin público)';
                }
                return '';
              }
            }
          }
        }
      }
    });
  },

  renderRadarChart(canvasId, radarData) {
    this.destroy(canvasId);
    const ctx = document.getElementById(canvasId)?.getContext('2d');
    if (!ctx || !radarData) return;

    const t1 = radarData.team1;
    const t2 = radarData.team2;

    this.instances[canvasId] = new Chart(ctx, {
      type: 'radar',
      data: {
        labels: radarData.axes,
        datasets: [
          {
            label: t1.name,
            data: t1.scores,
            backgroundColor: 'rgba(56, 189, 248, 0.25)',
            borderColor: '#38bdf8',
            pointBackgroundColor: '#38bdf8',
            pointBorderColor: '#ffffff',
            pointHoverBackgroundColor: '#ffffff',
            pointHoverBorderColor: '#38bdf8',
            borderWidth: 2.2
          },
          {
            label: t2.name,
            data: t2.scores,
            backgroundColor: 'rgba(239, 68, 68, 0.22)',
            borderColor: '#ef4444',
            pointBackgroundColor: '#ef4444',
            pointBorderColor: '#ffffff',
            pointHoverBackgroundColor: '#ffffff',
            pointHoverBorderColor: '#ef4444',
            borderWidth: 2.2
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          r: {
            angleLines: { color: 'rgba(148, 163, 184, 0.2)' },
            grid: { color: 'rgba(148, 163, 184, 0.15)' },
            pointLabels: {
              color: '#cbd5e1',
              font: { family: 'Inter', size: 11, weight: '600' }
            },
            ticks: {
              backdropColor: 'transparent',
              color: '#64748b',
              stepSize: 20,
              display: false
            },
            suggestedMin: 20,
            suggestedMax: 100
          }
        },
        plugins: {
          legend: {
            position: 'top',
            labels: {
              color: '#e2e8f0',
              font: { family: 'Inter', size: 12, weight: '700' },
              padding: 12
            }
          },
          tooltip: {
            callbacks: {
              label: (item) => ` ${item.dataset.label}: ${item.raw}/100`
            }
          }
        }
      }
    });
  }
};

window.ChartManager = ChartManager;

