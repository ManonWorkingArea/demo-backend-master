import { ref, computed } from 'vue';
import { defineStore } from 'pinia';
import PostService from '@/services/PostService';

export const usePostStore = defineStore('post', () => {
  // State
  const posts = ref([]);
  const loading = ref(false);
  const error = ref(null);
  const currentPage = ref(1);
  const totalItems = ref(0);
  const itemsPerPage = ref(50);
  const searchTerm = ref('');
  const selectedTypes = ref([]);
  const sortBy = ref('date_desc');
  const selectedItems = ref([]);
  
  // Service instance
  let postService;

  // Initialize service with app instance
  function init(app) {
    postService = new PostService(app);
  }

  // Getters
  const filteredPosts = computed(() => {
    let filtered = [...posts.value];
    
    // Apply search filter
    if (searchTerm.value) {
      filtered = filtered.filter(post => 
        post.title.toLowerCase().includes(searchTerm.value.toLowerCase()) ||
        post.slug.toLowerCase().includes(searchTerm.value.toLowerCase())
      );
    }
    
    // Apply type filter
    if (selectedTypes.value.length > 0) {
      filtered = filtered.filter(post => selectedTypes.value.includes(post.type));
    }
    
    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy.value) {
        case 'date_desc':
          return new Date(b.createdAt) - new Date(a.createdAt);
        case 'date_asc':
          return new Date(a.createdAt) - new Date(b.createdAt);
        case 'title_asc':
          return a.title.localeCompare(b.title);
        case 'title_desc':
          return b.title.localeCompare(a.title);
        default:
          return 0;
      }
    });
    
    return filtered;
  });

  // Actions
  async function fetchPosts(options = {}) {
    if (!postService) {
      throw new Error('PostService not initialized. Call init() first.');
    }

    try {
      loading.value = true;
      error.value = null;
      
      const pipeline = [
        {
          $match: {
            $and: [
              { owner: options.owner },
              { type: options.type },
              options.parent ? { parent: options.parent } : {},
            ].filter(Boolean),
          },
        },
        {
          $lookup: {
            from: 'form',
            let: { postID: { $toString: "$_id" } },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $eq: [{ $toString: "$formID" }, "$$postID"]
                  }
                }
              },
              {
                $count: "formCount"
              }
            ],
            as: 'formCounts',
          },
        },
        {
          $addFields: {
            formCount: { $arrayElemAt: ['$formCounts.formCount', 0] }
          },
        },
        {
          $facet: {
            post: [
              { $skip: (currentPage.value - 1) * itemsPerPage.value },
              { $limit: itemsPerPage.value },
            ],
            totalCount: [{ $count: 'count' }],
          },
        },
      ];

      const data = await postService.getPosts(pipeline);
      
      if (data && data[0]) {
        posts.value = data[0].post;
        totalItems.value = data[0].totalCount[0]?.count || 0;
      }
    } catch (err) {
      error.value = err.message;
      console.error('Error fetching posts:', err);
    } finally {
      loading.value = false;
    }
  }

  async function createPost(postData) {
    if (!postService) {
      throw new Error('PostService not initialized. Call init() first.');
    }

    try {
      loading.value = true;
      error.value = null;
      const result = await postService.createPost(postData);
      await fetchPosts();
      return result;
    } catch (err) {
      error.value = err.message;
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function updatePost(id, updateData) {
    if (!postService) {
      throw new Error('PostService not initialized. Call init() first.');
    }

    try {
      loading.value = true;
      error.value = null;
      const result = await postService.updatePost(id, updateData);
      const index = posts.value.findIndex(post => post._id === id);
      if (index !== -1) {
        posts.value[index] = { ...posts.value[index], ...updateData };
      }
      return result;
    } catch (err) {
      error.value = err.message;
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function deletePost(id) {
    if (!postService) {
      throw new Error('PostService not initialized. Call init() first.');
    }

    try {
      loading.value = true;
      error.value = null;
      await postService.deletePost(id);
      posts.value = posts.value.filter(post => post._id !== id);
      selectedItems.value = selectedItems.value.filter(item => item !== id);
    } catch (err) {
      error.value = err.message;
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function bulkDeletePosts(ids) {
    if (!postService) {
      throw new Error('PostService not initialized. Call init() first.');
    }

    try {
      loading.value = true;
      error.value = null;
      await postService.bulkDeletePosts(ids);
      posts.value = posts.value.filter(post => !ids.includes(post._id));
      selectedItems.value = [];
    } catch (err) {
      error.value = err.message;
      throw err;
    } finally {
      loading.value = false;
    }
  }

  function setPage(page) {
    currentPage.value = page;
  }

  function setItemsPerPage(limit) {
    itemsPerPage.value = limit;
    currentPage.value = 1; // Reset to first page when changing items per page
  }

  function setSearchTerm(term) {
    searchTerm.value = term;
    currentPage.value = 1; // Reset to first page when searching
  }

  function setSortBy(sort) {
    sortBy.value = sort;
  }

  function toggleSelectedItem(id) {
    const index = selectedItems.value.indexOf(id);
    if (index === -1) {
      selectedItems.value.push(id);
    } else {
      selectedItems.value.splice(index, 1);
    }
  }

  function clearSelectedItems() {
    selectedItems.value = [];
  }

  return {
    // State
    posts,
    loading,
    error,
    currentPage,
    totalItems,
    itemsPerPage,
    searchTerm,
    selectedTypes,
    sortBy,
    selectedItems,
    
    // Getters
    filteredPosts,
    
    // Actions
    init,
    fetchPosts,
    createPost,
    updatePost,
    deletePost,
    bulkDeletePosts,
    setPage,
    setItemsPerPage,
    setSearchTerm,
    setSortBy,
    toggleSelectedItem,
    clearSelectedItems,
  };
}); 