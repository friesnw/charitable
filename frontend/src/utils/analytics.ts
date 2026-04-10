const API_URL = import.meta.env.VITE_API_URL ?? '';

function getVisitorId(): string {
  const key = 'visitor_id';
  let id = localStorage.getItem(key);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(key, id);
  }
  return id;
}

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
    visitor_id: getVisitorId(),
  });

  const token = localStorage.getItem('auth_token');
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  // keepalive ensures the request completes even if the page navigates away
  fetch(`${API_URL}/api/events`, {
    method: 'POST',
    headers,
    body: payload,
    keepalive: true,
  }).catch(() => {});
}
