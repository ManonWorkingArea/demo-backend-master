<template>
    <div class="fixed bottom-4 right-4 z-50">
      <button class="bg-blue-500 w-12 h-12 text-white p-3 rounded-full shadow-lg" @click="showChat = !showChat">
        <i class="fas fa-comment"></i>
      </button>


      <div v-if="showChat" class="talk-bubble tri-right btm-right fixed bottom-24 right-8 bg-white rounded-lg shadow-sm">
        <div class="talktext">

            <div class="flex items-center mb-4">
                <button class="text-gray-600 hover:text-gray-800" @click="showChat = false">
                    <i class="fas fa-times"></i>
                </button>
                <img class="h-10 w-10 rounded-full mr-4" :src="agent.avatarUrl" alt="Agent avatar">
                    <div>
                        <div class="font-semibold text-lg">{{ agent.name }}</div>
                        <div class="text-gray-600">{{ agent.contactInfo }}</div>
                    </div>
                    
                </div>


                <div class="overflow-y-auto max-h-64 bg-white p-3">
                <div v-for="(message, index) in messages" :key="index" class="mb-2">
                    <div v-if="message.isFromCurrentUser" class="text-right">
                    <span class="inline-block bg-blue-500 text-white rounded-full py-2 px-4">{{ message.text }}</span>
                    </div>
                    <div v-else>
                    <span class="inline-block bg-gray-200 rounded-full py-2 px-4">{{ message.text }}</span>
                    </div>
                </div>
                </div>
        
                <form class="mt-4" @submit.prevent="sendMessage">
                <div class="flex">
                    <textarea v-model="newMessage" class="form-textarea rounded-lg w-full" rows="2"></textarea>
                    <button type="submit" class="bg-blue-500 text-white rounded-lg py-2 px-4 ml-4">Send</button>
                </div>
            </form>
        </div>
      </div>

    </div>

    

  </template>
  
  <script>
  export default {
    data() {
      return {
        showChat: false,
        agent: {
          avatarUrl: "https://via.placeholder.com/50x50.png?text=Avatar",
          name: "John Doe",
          contactInfo: "john.doe@example.com"
        },
        messages: [
          { text: "Hello, how can I help you?", isFromCurrentUser: false },
          { text: "Can you tell me more about your products?", isFromCurrentUser: true },
          { text: "Sure, we have a wide range of products including...", isFromCurrentUser: false },
          { text: "That sounds great. How do I place an order?", isFromCurrentUser: true }
        ],
        newMessage: ""
      };
    },
    methods: {
      sendMessage() {
        if (this.newMessage.trim() !== "") {
          this.messages.push({ text: this.newMessage, isFromCurrentUser: true });
          this.newMessage = "";
        }
      }
    }
  };
  </script>

  <style scoped>
  /* CSS talk bubble */
.talk-bubble {
    display: inline-block;
	height: auto;
    background-color: #ebebeb;
}
.border{
  border: 8px solid #666;
}
.round{
  border-radius: 30px;
	-webkit-border-radius: 30px;
	-moz-border-radius: 30px;

}

/* Right triangle placed top left flush. */
.tri-right.border.left-top:before {
	content: ' ';
	position: absolute;
	width: 0;
	height: 0;
  left: -40px;
	right: auto;
  top: -8px;
	bottom: auto;
	border: 32px solid;
	border-color: #666 transparent transparent transparent;
}
.tri-right.left-top:after{
	content: ' ';
	position: absolute;
	width: 0;
	height: 0;
  left: -20px;
	right: auto;
  top: 0px;
	bottom: auto;
	border: 22px solid;
	border-color: #ebebeb transparent transparent transparent;
}

/* Right triangle, left side slightly down */
.tri-right.border.left-in:before {
	content: ' ';
	position: absolute;
	width: 0;
	height: 0;
  left: -40px;
	right: auto;
  top: 30px;
	bottom: auto;
	border: 20px solid;
	border-color: #666 #666 transparent transparent;
}
.tri-right.left-in:after{
	content: ' ';
	position: absolute;
	width: 0;
	height: 0;
  left: -20px;
	right: auto;
  top: 38px;
	bottom: auto;
	border: 12px solid;
	border-color: #ebebeb #ebebeb transparent transparent;
}

/*Right triangle, placed bottom left side slightly in*/
.tri-right.border.btm-left:before {
	content: ' ';
	position: absolute;
	width: 0;
	height: 0;
	left: -8px;
  right: auto;
  top: auto;
	bottom: -40px;
	border: 32px solid;
	border-color: transparent transparent transparent #666;
}
.tri-right.btm-left:after{
	content: ' ';
	position: absolute;
	width: 0;
	height: 0;
	left: 0px;
  right: auto;
  top: auto;
	bottom: -20px;
	border: 22px solid;
	border-color: transparent transparent transparent #ebebeb;
}

/*Right triangle, placed bottom left side slightly in*/
.tri-right.border.btm-left-in:before {
	content: ' ';
	position: absolute;
	width: 0;
	height: 0;
	left: 30px;
  right: auto;
  top: auto;
	bottom: -40px;
	border: 20px solid;
	border-color: #666 transparent transparent #666;
}
.tri-right.btm-left-in:after{
	content: ' ';
	position: absolute;
	width: 0;
	height: 0;
	left: 38px;
  right: auto;
  top: auto;
	bottom: -20px;
	border: 12px solid;
	border-color: #ebebeb transparent transparent #ebebeb;
}

/*Right triangle, placed bottom right side slightly in*/
.tri-right.border.btm-right-in:before {
	content: ' ';
	position: absolute;
	width: 0;
	height: 0;
  left: auto;
	right: 30px;
	bottom: -40px;
	border: 20px solid;
	border-color: #666 #666 transparent transparent;
}
.tri-right.btm-right-in:after{
	content: ' ';
	position: absolute;
	width: 0;
	height: 0;
  left: auto;
	right: 38px;
	bottom: -20px;
	border: 12px solid;
	border-color: #ebebeb #ebebeb transparent transparent;
}
/*
	left: -8px;
  right: auto;
  top: auto;
	bottom: -40px;
	border: 32px solid;
	border-color: transparent transparent transparent #666;
	left: 0px;
  right: auto;
  top: auto;
	bottom: -20px;
	border: 22px solid;
	border-color: transparent transparent transparent #ebebeb;

/*Right triangle, placed bottom right side slightly in*/
.tri-right.border.btm-right:before {
	content: ' ';
	position: absolute;
	width: 0;
	height: 0;
  left: auto;
	right: -8px;
	bottom: -40px;
	border: 20px solid;
	border-color: #666 #666 transparent transparent;
}
.tri-right.btm-right:after{
	content: ' ';
	position: absolute;
	width: 0;
	height: 0;
  left: auto;
	right: 0px;
	bottom: -20px;
	border: 12px solid;
	border-color: #ebebeb #ebebeb transparent transparent;
}

/* Right triangle, right side slightly down*/
.tri-right.border.right-in:before {
	content: ' ';
	position: absolute;
	width: 0;
	height: 0;
  left: auto;
	right: -40px;
  top: 30px;
	bottom: auto;
	border: 20px solid;
	border-color: #666 transparent transparent #666;
}
.tri-right.right-in:after{
	content: ' ';
	position: absolute;
	width: 0;
	height: 0;
  left: auto;
	right: -20px;
  top: 38px;
	bottom: auto;
	border: 12px solid;
	border-color: #ebebeb transparent transparent #ebebeb;
}

/* Right triangle placed top right flush. */
.tri-right.border.right-top:before {
	content: ' ';
	position: absolute;
	width: 0;
	height: 0;
  left: auto;
	right: -40px;
  top: -8px;
	bottom: auto;
	border: 32px solid;
	border-color: #666 transparent transparent transparent;
}
.tri-right.right-top:after{
	content: ' ';
	position: absolute;
	width: 0;
	height: 0;
  left: auto;
	right: -20px;
  top: 0px;
	bottom: auto;
	border: 20px solid;
	border-color: #ebebeb transparent transparent transparent;
}

/* talk bubble contents */
.talktext{
  padding: 1em;
	text-align: left;
  line-height: 1.5em;
}
.talktext p{
  /* remove webkit p margins */
  -webkit-margin-before: 0em;
  -webkit-margin-after: 0em;
}
</style>