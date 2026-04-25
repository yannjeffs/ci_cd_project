import { onCLS, onFCP, onINP, onLCP, onTTFB, Metric } from 'web-vitals';

const METRICS_ENDPOINT = `${import.meta.env.VITE_API_URL}/api/metrics/frontend`;

interface MetricPayload {
  metric_name: string;
  metric_value: number;
  rating: string;
  page: string;
  timestamp: number;
}

/**
 * Envoie une métrique au backend Laravel qui la transmet à Prometheus
 */
function sendMetric({ name, value, rating }: Metric): void {
  const payload: MetricPayload = {
    metric_name: name,
    metric_value: value,
    rating,
    page: window.location.pathname,
    timestamp: Date.now(),
  };

  // On utilise sendBeacon pour ne pas bloquer la page
  if (navigator.sendBeacon) {
    navigator.sendBeacon(
      METRICS_ENDPOINT,
      JSON.stringify(payload)
    );
  } else {
    fetch(METRICS_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      keepalive: true,
    });
  }
}

/**
 * Initialise la collecte des Web Vitals
 */
export function initMetrics(): void {
  onCLS(sendMetric);   // Cumulative Layout Shift
  onFCP(sendMetric);   // First Contentful Paint
  onINP(sendMetric);   // First Input Delay
  onLCP(sendMetric);   // Largest Contentful Paint
  onTTFB(sendMetric);  // Time to First Byte
}