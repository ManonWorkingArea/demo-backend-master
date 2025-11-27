import storageManager from '@/plugins/storage';

export default class PostService {
  constructor(app) {
    this.configs = storageManager.get('configs');
    this.$request = app.$Request;
  }

  async getPosts(pipeline) {
    try {
      const { data } = await this.$request.POST('post/aggregate', { pipeline }, this.configs.key);
      return data;
    } catch (error) {
      console.error('Error fetching posts:', error);
      throw error;
    }
  }

  async getPostById(id) {
    try {
      const { data } = await this.$request.GET(`post/${id}`, null, this.configs.key);
      return data;
    } catch (error) {
      console.error('Error fetching post:', error);
      throw error;
    }
  }

  async createPost(post) {
    try {
      const requestBody = {
        data: post,
        options: {
          uniqueFields: ["slug"]
        }
      };
      const { data } = await this.$request.POST('post/', requestBody, this.configs.key);
      return data;
    } catch (error) {
      console.error('Error creating post:', error);
      throw error;
    }
  }

  async updatePost(id, updateData) {
    try {
      const { data } = await this.$request.PUT(`post/${id}`, { data: updateData }, this.configs.key);
      return data;
    } catch (error) {
      console.error('Error updating post:', error);
      throw error;
    }
  }

  async deletePost(id) {
    try {
      const { data } = await this.$request.DELETE(`post/${id}`, null, this.configs.key);
      return data;
    } catch (error) {
      console.error('Error deleting post:', error);
      throw error;
    }
  }

  async bulkDeletePosts(ids) {
    try {
      const results = await Promise.all(
        ids.map(id => this.deletePost(id))
      );
      return results;
    } catch (error) {
      console.error('Error bulk deleting posts:', error);
      throw error;
    }
  }

  async getFormSubmissions(formId, formDestination, page, limit) {
    try {
      const requestBody = {
        method: 'find',
        args: [{ formID: formId }],
        paging: { page, limit },
      };
      const { data } = await this.$request.POST(`${formDestination}/count`, requestBody, this.configs.key);
      return data;
    } catch (error) {
      console.error('Error fetching form submissions:', error);
      throw error;
    }
  }
} 