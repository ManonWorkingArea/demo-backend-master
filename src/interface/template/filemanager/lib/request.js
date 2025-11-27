export function createRequest({ $Request, getKey }) {
  return {
    aggregate: async (payload) => {
      return await $Request.POST('storage/aggregate', payload, getKey());
    },
    
    create: async (payload) => {
      return await $Request.POST('storage/', payload, getKey());
    },
    
    update: async (id, payload) => {
      return await $Request.PUT(`storage/${id}`, payload, getKey());
    },
    
    remove: async (id) => {
      return await $Request.DELETE(`storage/${id}`, null, getKey());
    }
  };
}
