<template>

    <div class="lg:col-span-4">
        <h2 id="reviews-heading" class="text-2xl font-bold tracking-tight text-gray-900">Customer Reviews ({{ reviews.length }})</h2>
        <dl class="space-y-3 mt-8">
            <div class="flex items-center text-sm" v-for="rating in ratings" :key="rating.value">
                <dt class="flex flex-1 items-center">
                    <p class="w-3 font-medium text-gray-900">{{ rating.label }}<span class="sr-only"> star reviews</span></p>
                    <div aria-hidden="true" class="ml-1 flex flex-1 items-center">
                    <font-awesome-icon icon="star" class="text-yellow-400 h-5 w-5 flex-shrink-0"/>
                    <div class="relative ml-3 flex-1">
                        <div class="h-3 rounded-full border border-gray-200 bg-gray-100"></div>
                        <div :style="{ width: rating.average * 20 + '%' }" class="absolute inset-y-0 rounded-full border border-yellow-400 bg-yellow-400"></div>
                    </div>
                    </div>
                </dt>
                <dd class="ml-3 w-10 text-right text-sm tabular-nums text-gray-900">{{ rating.average }}%</dd>
            </div>
        </dl>
    </div>

    <div class="mt-16 lg:col-span-7 lg:col-start-6 lg:mt-0">
        <div class="flow-root">
            <div class="-my-12 divide-y divide-gray-200" v-for="(review, index) in reviews" :key="index">
                <div class="py-12">
                    <div class="flex items-center">
                        <img src="https://images.unsplash.com/photo-1502685104226-ee32379fefbe?ixlib=rb-=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=8&w=256&h=256&q=80" alt="Emily Selman." class="h-12 w-12 rounded-full">
                        <div class="ml-4">
                            <h4 class="text-sm font-bold text-gray-900">Emily Selman</h4>
                            <div class="mt-1 flex items-center">
                                <font-awesome-icon icon="star" class="text-gray-400 h-5 w-5 flex-shrink-0"/>
                                <font-awesome-icon icon="star" class="text-gray-400 h-5 w-5 flex-shrink-0"/>
                                <font-awesome-icon icon="star" class="text-gray-400 h-5 w-5 flex-shrink-0"/>
                                <font-awesome-icon icon="star" class="text-gray-400 h-5 w-5 flex-shrink-0"/>
                                <font-awesome-icon icon="star" class="text-gray-400 h-5 w-5 flex-shrink-0"/>
                            </div>
                            <p class="sr-only">{{ review.rating }}/5</p>
                        </div>
                    </div>
                    <div class="mt-4 space-y-6 text-base italic text-gray-600">
                        <p>{{ review.comment }}</p>
                    </div>
                </div>
            </div>
        </div>

        <div class="review-form p-5 border border-gray-200 rounded-md">
            <h2 class="text-lg font-medium">Leave a Review:</h2>
            <div class="flex items-center space-x-2 mt-2">
              <button
                v-for="n in 5"
                :key="n"
                :class="{
                  'text-yellow-400': n <= rating,
                  'text-gray-400': n > rating
                }"
                class="star focus:outline-none"
                @click="rating = n"
              >
              <font-awesome-icon icon="star" class="w-5 h-5 fill-current"/>
              </button>
            </div>
            <textarea
              class="block w-full mt-4 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-blue-200"
              v-model="comment"
              placeholder="Enter your comment here"
            ></textarea>
            <button
              class="mt-6 inline-flex items-center justify-center rounded-md border border-gray-300 bg-white px-8 py-2 text-sm font-medium text-gray-900 hover:bg-gray-50 sm:w-auto"
              @click="submitReview"
            >
              Submit
            </button>
          </div>

    </div>
    
  </template>
  
  
  <script>
  export default {
    data() {
      return {
        rating: 0,
        comment: "",
        reviews: JSON.parse(localStorage.getItem("reviews")) || [],
      };
    },
    methods: {
      submitReview() {
        const newReview = {
          rating: this.rating,
          comment: this.comment,
        };
        this.reviews.push(newReview);
        localStorage.setItem("reviews", JSON.stringify(this.reviews));
        this.rating = 0;
        this.comment = "";
      },
      averageRatingForRating(rating) {
        const filteredReviews = this.reviews.filter((review) => review.rating === rating);
        if (filteredReviews.length === 0) {
          return 0;
        }
        const sum = filteredReviews.reduce((acc, review) => acc + review.rating, 0);
        return Math.round(sum / filteredReviews.length * 10) / 10;
      },
    },
    computed: {
      ratings() {
        return [
          { value: 1, label: '1', average: this.averageRatingForRating(1) },
          { value: 2, label: '2', average: this.averageRatingForRating(2) },
          { value: 3, label: '3', average: this.averageRatingForRating(3) },
          { value: 4, label: '4', average: this.averageRatingForRating(4) },
          { value: 5, label: '5', average: this.averageRatingForRating(5) },
        ];
      },
    },
  };
  </script>
  <style>
  .container {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
  }
  
  .left-column {
    width: 40%;
  }
  
  .right-column {
    width: 60%;
  }
  
  .progress-bars {
    display: flex;
    flex-direction: column;
  }
  
  .progress-bar {
    display: flex;
    align-items: center;
    margin-bottom: 10px;
    width: 100%;
    height: 20px;
    background-color: #ddd;
    position: relative;
  }
  
  .rating-label {
    margin-right: 10px;
  }
  
  .average-label {
    position: absolute;
    top: 0;
    right: 0;
    margin: 0 10px;
    color: #444;
    font-weight: bold;
  }
  
  .progress-bar-fill {
    height: 20px;
    background-color: #ffd700;
    width: calc(20% * var(--rating));
  }
  
  .review-list {
    margin-top: 20px;
    padding: 0;
    list-style-type: none;
  }
  
  .review-list li {
    margin-bottom: 20px;
    border-bottom: 1px solid #ddd;
    padding-bottom: 20px;
  }
  
  .review-list li:last-child {
    border-bottom: none;
  }
  
  .review-list p {
    margin: 0;
  }
  
  .review-form {
    margin-top: 20px;
  }
  
  .stars {
    display: inline-flex;
    align-items: center;
  }
  
  .star {
    position: relative;
    display: inline-block;
    color: #ddd;
    cursor: pointer;
    transition: color 0.2s;
    background: none;
    border: none;
  }
  
  .star i {
    font-size: 2rem;
  }

  .star.active {
    color: #ffd700;
  }

  </style>
  