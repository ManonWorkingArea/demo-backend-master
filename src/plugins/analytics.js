export function calculateResult(analytics) {
    if (analytics?.post?.has) {
      if (analytics.post.score !== null && analytics.post.measure !== null && analytics.post.score >= analytics.post.measure) {
        return true; // Pass
      } else if (analytics.post.score !== null && analytics.post.measure !== null && analytics.post.score < analytics.post.measure) {
        if (analytics.retest?.has) {
          if (analytics.retest.score !== null && analytics.retest.measure !== null && analytics.retest.score >= analytics.retest.measure) {
            return true; // Pass
          } else {
            return false; // Fail
          }
        } else {
          return false; // Fail
        }
      }
    }
    return false; // Not Attempted or Fail
  }
  
  export function checkProgress(analytics) {
    return analytics.complete === analytics.total;
  }
  