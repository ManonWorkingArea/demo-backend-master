import { ref, computed } from 'vue';
import { deepEqualSegments } from './function.js';

/**
 * Simple history manager for the VideoTrimmer state.
 * Caller provides getSnapshot(label) and restore(snapshot).
 */
export function createHistory({ getSnapshot, restore, maxHistory = 200 }) {
  const stack = ref([]);
  const index = ref(-1);

  const push = (label = 'เปลี่ยนแปลง') => {
    const snap = getSnapshot(label);
    const last = stack.value[index.value];
    if (last && deepEqualSegments(last.segments, snap.segments)) return;
    if (index.value < stack.value.length - 1) {
      stack.value = stack.value.slice(0, index.value + 1);
    }
    stack.value.push(snap);
    if (stack.value.length > maxHistory) stack.value.shift();
    index.value = stack.value.length - 1;
  };

  const undo = async () => {
    if (index.value <= 0) return;
    index.value -= 1;
    await restore(stack.value[index.value]);
  };

  const redo = async () => {
    if (index.value >= stack.value.length - 1) return;
    index.value += 1;
    await restore(stack.value[index.value]);
  };

  const gotoIndex = async (i) => {
    if (i < 0 || i >= stack.value.length) return;
    index.value = i;
    await restore(stack.value[i]);
  };

  const canUndo = computed(() => index.value > 0);
  const canRedo = computed(() => index.value >= 0 && index.value < stack.value.length - 1);
  const items = computed(() => stack.value);

  return { stack, index, push, undo, redo, gotoIndex, canUndo, canRedo, items };
}
