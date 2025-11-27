// Centralized pure/mostly-pure functions extracted from VideoTrimmer.vue
// Keep UI-free. No direct DOM or component refs. Parameterize all inputs.
// Note: Use JSDoc for quick IntelliSense and safer refactors.

/**
 * Parse time string into seconds.
 * Accepts formats: ss, mm:ss, hh:mm:ss
 * Returns number (seconds) or null if invalid.
 */
export function parseTimeStringSafe(str) {
  if (typeof str !== 'string') return null;
  const s = str.trim();
  if (!s) return null;
  const parts = s.split(':').map(p => p.trim());
  if (parts.some(p => p === '' || isNaN(Number(p)))) return null;
  let seconds = 0;
  if (parts.length === 1) {
    seconds = Number(parts[0]);
  } else if (parts.length === 2) {
    const [m, sec] = parts.map(Number);
    seconds = m * 60 + sec;
  } else if (parts.length === 3) {
    const [h, m, sec] = parts.map(Number);
    seconds = h * 3600 + m * 60 + sec;
  } else {
    return null;
  }
  if (!isFinite(seconds) || seconds < 0) return null;
  return seconds;
}

/**
 * Format seconds to mm:ss or hh:mm:ss if >= 1 hour.
 */
export function formatTimeSimple(totalSeconds) {
  const sec = Math.max(0, Math.floor(totalSeconds || 0));
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = sec % 60;
  const pad = n => String(n).padStart(2, '0');
  return h > 0 ? `${h}:${pad(m)}:${pad(s)}` : `${m}:${pad(s)}`;
}

/** @typedef {{id:string,start:number,end:number,duration:number}} Segment */

/** Clone a segment (plain) */
export function cloneSegment(seg) {
  if (!seg) return null;
  const start = Number(seg.start) || 0;
  const end = Number(seg.end) || 0;
  return { id: seg.id, start, end, duration: Math.max(0, end - start) };
}

/** Sort segments by start (ascending) */
export function sortSegments(segments) {
  return [...segments].sort((a, b) => a.start - b.start);
}

/** Check if [start,end] overlaps any others (exclusive of touching) */
export function hasOverlap(segments, currentIndex, start, end) {
  for (let i = 0; i < segments.length; i++) {
    if (i === currentIndex) continue;
    const seg = segments[i];
    if (start < seg.end && end > seg.start) return true;
  }
  return false;
}

/** Compute next default segment duration based on total video duration */
export function recommendSegmentDuration(videoDuration) {
  if (!videoDuration) return 30;
  if (videoDuration <= 60) return 10;
  if (videoDuration <= 180) return 15;
  if (videoDuration <= 300) return 20;
  if (videoDuration <= 600) return 30;
  if (videoDuration <= 1800) return 45;
  return 60;
}

/** Sum durations */
export function sumSegmentsDuration(segments) {
  return segments.reduce((acc, s) => acc + (s?.duration || 0), 0);
}

/** Build project snapshot structure */
export function buildProjectSnapshot({ video, settings, timeline, segments }) {
  return {
    $schema: 'https://example.com/schemas/video-trimmer-project.json',
    type: 'video-trimmer-project',
    version: 1,
    createdAt: new Date().toISOString(),
    video,
    settings,
    timeline,
    segments: (segments || []).map(s => ({
      id: s.id,
      start: Number(s.start) || 0,
      end: Number(s.end) || 0,
      duration: Number(s.duration) || Math.max(0, (Number(s.end)||0) - (Number(s.start)||0))
    }))
  };
}

/** Basic project validation */
export function validateImportedProject(data) {
  if (!data || typeof data !== 'object') return { ok: false, reason: 'รูปแบบไฟล์ไม่ถูกต้อง' };
  if (data.type !== 'video-trimmer-project') return { ok: false, reason: 'ชนิดโปรเจกต์ไม่ถูกต้อง' };
  if (!Array.isArray(data.segments)) return { ok: false, reason: 'ไม่มีข้อมูล segments' };
  return { ok: true };
}

/** Normalize imported segments into [0,vd] with min duration=0.1 */
export function normalizeImportedSegments(rawSegments, vd) {
  const MIN = 0.1;
  const normalized = (rawSegments || [])
    .filter(s => typeof s.start === 'number' && typeof s.end === 'number')
    .map(s => {
      const rawStart = Number(s.start) || 0;
      const rawEnd = Number(s.end) || 0;
      const start = Math.max(0, Math.min(rawStart, vd));
      const end = Math.max(start + MIN, Math.min(rawEnd, vd));
      return {
        id: s.id || `segment_${Date.now()}_${Math.random().toString(36).slice(2)}`,
        start,
        end,
        duration: Math.max(MIN, Math.min(end - start, vd))
      };
    })
    .filter(s => s.end > s.start)
    .sort((a, b) => a.start - b.start);
  return normalized;
}

/** Make ID */
export function makeId(prefix = 'seg') {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

/**
 * Build time markers across total duration.
 * @param {number} totalDuration seconds
 * @param {number} count number of intervals (default 10 => 11 markers)
 */
export function computeTimeMarkers(totalDuration, count = 10) {
  if (!totalDuration || totalDuration <= 0) return [];
  const markers = [];
  const interval = totalDuration / count;
  for (let i = 0; i <= count; i++) {
    const time = i * interval;
    markers.push({ time, position: (time / totalDuration) * 100 });
  }
  return markers;
}

/** Quick validator for time input text */
export function isInvalidTimeText(text) {
  if (text == null || text === '') return false;
  return parseTimeStringSafe(String(text)) == null;
}

/** Compute default segment duration with heuristic and clamp to [5, duration/8] */
export function computeDefaultSegmentDuration(videoDuration) {
  const base = recommendSegmentDuration(videoDuration);
  if (!videoDuration || !isFinite(videoDuration) || videoDuration <= 0) return Math.max(5, base);
  return Math.max(5, Math.min(base, videoDuration / 8));
}

/** Find the segment having max end time */
export function findLastSegmentByEnd(segments) {
  if (!Array.isArray(segments) || segments.length === 0) return null;
  let last = segments[0];
  for (const s of segments) {
    if ((s?.end ?? -Infinity) > (last?.end ?? -Infinity)) last = s;
  }
  return last;
}

/** Range overlap check (exclusive of touching edges) */
export function rangesOverlap(aStart, aEnd, bStart, bEnd) {
  return aStart < bEnd && aEnd > bStart;
}

/** Deep compare two segment arrays by id/start/end with tolerance */
export function deepEqualSegments(a, b, eps = 1e-6) {
  if (!Array.isArray(a) || !Array.isArray(b) || a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    const x = a[i], y = b[i];
    if (!x || !y) return false;
    if (x.id !== y.id) return false;
    if (Math.abs((x.start ?? 0) - (y.start ?? 0)) > eps) return false;
    if (Math.abs((x.end ?? 0) - (y.end ?? 0)) > eps) return false;
  }
  return true;
}

/** Sort copy by start and find index by id */
export function sortAndFindIndex(arr, id) {
  const sorted = [...arr].sort((a, b) => a.start - b.start);
  const idx = sorted.findIndex(s => s.id === id);
  return { sorted, idx };
}

// ---------- Segment shifting/resolution helpers ----------
/** Cascade shift to the right from fromIndex, preserving durations and MIN gaps (mutates arr) */
export function shiftChainRight(arr, fromIndex, delta, vd, MIN) {
  if (delta <= 0) return { ok: true, pushed: false };
  let pushed = false;
  for (let i = fromIndex; i < arr.length; i++) {
    const prevEnd = i > 0 ? arr[i - 1].end : 0;
    const requiredStart = prevEnd + (i > 0 ? MIN : 0);
    const desiredStart = Math.max(arr[i].start + delta, requiredStart);
    const dur = arr[i].end - arr[i].start;
    const desiredEnd = desiredStart + dur;
    if (desiredEnd > vd) {
      return { ok: false, side: 'right', need: desiredEnd - vd };
    }
    if (desiredStart !== arr[i].start) pushed = true;
    arr[i].start = desiredStart;
    arr[i].end = desiredEnd;
  }
  return { ok: true, pushed };
}

/** Cascade shift to the left up to toIndex, preserving durations and MIN gaps (mutates arr) */
export function shiftChainLeft(arr, toIndex, delta, MIN) {
  if (delta <= 0) return { ok: true, pushed: false };
  let pushed = false;
  for (let i = toIndex; i >= 0; i--) {
    const nextStart = i < arr.length - 1 ? arr[i + 1].start : Infinity;
    const requiredEnd = nextStart - (i < arr.length - 1 ? MIN : 0);
    const dur = arr[i].end - arr[i].start;
    const desiredEnd = Math.min(arr[i].end - delta, requiredEnd);
    const desiredStart = desiredEnd - dur;
    if (desiredStart < 0) {
      return { ok: false, side: 'left', need: -desiredStart };
    }
    if (desiredStart !== arr[i].start) pushed = true;
    arr[i].end = desiredEnd;
    arr[i].start = desiredStart;
  }
  return { ok: true, pushed };
}

/** Resolve overlaps around center index by pushing neighbors (mutates arr) */
export function autoResolveOverlaps(arr, centerIdx, vd, MIN) {
  let pushedLeft = false;
  let pushedRight = false;
  for (let i = centerIdx - 1; i >= 0; i--) {
    const requiredEnd = arr[i + 1].start - MIN;
    if (arr[i].end > requiredEnd) {
      const delta = arr[i].end - requiredEnd;
      const res = shiftChainLeft(arr, i, delta, MIN);
      if (!res.ok) return { ok: false, side: res.side, need: res.need };
      pushedLeft = pushedLeft || res.pushed;
    }
  }
  for (let i = centerIdx + 1; i < arr.length; i++) {
    const requiredStart = arr[i - 1].end + MIN;
    if (arr[i].start < requiredStart) {
      const delta = requiredStart - arr[i].start;
      const res = shiftChainRight(arr, i, delta, vd, MIN);
      if (!res.ok) return { ok: false, side: res.side, need: res.need };
      pushedRight = pushedRight || res.pushed;
    }
  }
  return { ok: true, pushedLeft, pushedRight };
}

// ---------- Waveform helpers (pure sampling) ----------
/** Compute target bars given pixel width */
export function computeTargetBarsByWidth(width, minBars = 200, maxBars = 1000) {
  const w = Math.max(10, width || 800);
  return Math.min(maxBars, Math.max(minBars, Math.floor(w / 2)));
}

/** Sample min/max peaks from an AudioBuffer into targetBars (channel-averaged) */
export function samplePeaksFromAudioBuffer(audioBuffer, targetBars) {
  const totalSamples = audioBuffer.length;
  const channels = [];
  for (let ch = 0; ch < audioBuffer.numberOfChannels; ch++) channels.push(audioBuffer.getChannelData(ch));
  const per = Math.max(1, Math.floor(totalSamples / targetBars));
  const peaks = new Array(targetBars);
  for (let i = 0; i < targetBars; i++) {
    const start = i * per;
    const end = Math.min(totalSamples, start + per);
    let min = 0, max = 0;
    for (let s = start; s < end; s += 4) {
      let sample = 0;
      for (let c = 0; c < channels.length; c++) sample += channels[c][s] || 0;
      sample /= channels.length;
      if (sample > max) max = sample;
      if (sample < min) min = sample;
    }
    peaks[i] = { min, max };
  }
  return peaks;
}

// ---------- Segment helpers ----------
export function getSegmentMiddleTime(segment) {
  return Number(segment?.start || 0) + Number(segment?.duration || (segment?.end || 0) - (segment?.start || 0)) / 2;
}
