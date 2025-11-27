// reportUtils.js

import axios from 'axios';
import moment from 'moment';

export async function getTotalUniqueVisitors(apiKey) {
  try {
    const response = await axios.get(`https://multisource-api-edsdv.ondigitalocean.app/api/${apiKey}/analytics/`);
    const data = response.data;
    const uniqueIds = new Set();
    for (let item of data) {
      uniqueIds.add(item.clientData.userId);
    }
    const uniqueVisitors = uniqueIds.size;
    return uniqueVisitors;
  } catch (error) {
    console.error(error);
    return null;
  }
}

export async function getPageViews(apiKey, timeframe) {
    try {
      const response = await axios.get(`https://multisource-api-edsdv.ondigitalocean.app/api/${apiKey}/analytics/`);
      const data = response.data;
      const pageViews = {};
  
      // loop through each item in data and group by day/week/month
      for (let item of data) {
        const date = moment(item.timestamp);
        let groupKey;
        if (timeframe === 'day') {
          groupKey = date.format('YYYY-MM-DD');
        } else if (timeframe === 'week') {
          groupKey = date.startOf('week').format('YYYY-MM-DD');
        } else if (timeframe === 'month') {
          groupKey = date.format('YYYY-MM');
        }
        if (!pageViews[groupKey]) {
          pageViews[groupKey] = 0;
        }
        pageViews[groupKey]++;
      }
  
      return pageViews;
    } catch (error) {
      console.error(error);
      return null;
    }
  }

  export async function getMostPopularPages(apiKey, limit) {
    try {
      const response = await axios.get(`https://multisource-api-edsdv.ondigitalocean.app/api/${apiKey}/analytics/`);
      const data = response.data;
      const pageViews = {};
  
      // loop through each item in data and count page views
      for (let item of data) {
        const page = item.pageData.path;
        if (!pageViews[page]) {
          pageViews[page] = 0;
        }
        pageViews[page]++;
      }
  
      // sort the page views in descending order and return the top limit pages
      const sortedPageViews = Object.entries(pageViews).sort((a, b) => b[1] - a[1]).slice(0, limit);
      const mostPopularPages = {};
      for (let [page, count] of sortedPageViews) {
        mostPopularPages[page] = count;
      }
  
      return mostPopularPages;
    } catch (error) {
      console.error(error);
      return null;
    }
  }
  