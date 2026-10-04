export type LatLng = [number, number];

export interface RouteStep {
  name: string;
  distance: number;
  duration: number;
  maneuver: string;
}

interface OsrmResponse {
  code: string;
  routes?: Array<{
    geometry: { coordinates: [number, number][] };
    distance: number;
    duration: number;
    legs?: Array<{ steps?: Array<{ name?: string; distance: number; duration: number; maneuver?: { type?: string; modifier?: string } }> }>;
  }>;
}

export async function getDrivingRoute(origin: LatLng, destination: LatLng) {
  const url = `https://router.project-osrm.org/route/v1/driving/${origin[1]},${origin[0]};${destination[1]},${destination[0]}?overview=full&geometries=geojson&steps=true`;
  const response = await fetch(url, { headers: { Accept: 'application/json' } });
  if (!response.ok) throw new Error('Không thể kết nối dịch vụ chỉ đường.');
  const data = (await response.json()) as OsrmResponse;
  if (data.code !== 'Ok' || !data.routes?.[0]) throw new Error('Không tìm thấy tuyến đường phù hợp tại Hà Nội.');
  const route = data.routes[0];
  const steps: RouteStep[] = (route.legs?.flatMap(leg => leg.steps || []) || [])
    .filter(step => step.distance > 5)
    .slice(0, 8)
    .map(step => ({
      name: step.name || 'Đường không có tên',
      distance: step.distance,
      duration: step.duration,
      maneuver: `${step.maneuver?.type || 'continue'}${step.maneuver?.modifier ? ` ${step.maneuver.modifier}` : ''}`,
    }));
  return {
    coordinates: route.geometry.coordinates.map(([lng, lat]) => [lat, lng] as LatLng),
    distanceKm: route.distance / 1000,
    durationMin: route.duration / 60,
    steps,
  };
}
