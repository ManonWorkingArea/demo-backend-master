// Video Player Components Export
export { default as UniversalPlayer } from './UniversalPlayer.vue';
export { default as HlsPlayer } from './UniversalPlayer.vue'; // Backward compatibility alias

// Video Player Composables Export
export { useUniversalPlayer } from './composables/useUniversalPlayer';
export { useUniversalPlayer as useHlsPlayer } from './composables/useUniversalPlayer'; // Backward compatibility alias

// Default export for convenience
export { default } from './UniversalPlayer.vue';
