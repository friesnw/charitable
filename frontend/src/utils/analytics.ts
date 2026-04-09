const API_URL = import.meta.env.VITE_API_URL ?? '';

type EventName =
  | 'page_view'
  | 'charity_view'
  | 'donate_click'
  | 'volunteer_click'
  | 'website_click'
  | 'map_pin_click'
  | 'filter_tag'
  | 'onboarding_cause_select'
  | 'neighborhood_select'
  | 'zip_select'
  | 'sign_in_start';

export function trackEvent(name: EventName, data?: Record<string, unknown>) {
  const payload = JSON.stringify({
    event_name: name,
    event_data: data ?? {},
    page_url: window.location.href,
    referrer: document.referrer,
  });

  // keepalive ensures the request completes even if the page navigates away
  fetch(`${API_URL}/api/events`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: payload,
    keepalive: true,
  }).catch(() => {});
}
