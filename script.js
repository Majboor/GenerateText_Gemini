const promptInput = document.getElementById("userInput");
const chatContainer = document.getElementById("chatContainer");
const typingIndicator = document.getElementById("typingIndicator");


async function sendMessage() {
  const prompt = promptInput.value.trim();
  if (!prompt) {
    alert("Please enter a message.");
    return;
  }

  addMessage(prompt, 'user');
  promptInput.value = "";

  showTypingIndicator();

  const generatedText = await generateText(prompt);
  addMessage(generatedText, 'bot');

  hideTypingIndicator(); 
}

async function generateText(prompt) {
  try {
    const response = await fetch("https://74e3-182-253-124-244.ngrok-free.app/generate_text_stream", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ prompt }),
    });

    if (!response.ok) {
      console.error("Error:", response.statusText);
      return "Error occurred while generating response.";
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let isFinished = false;
    let generatedTextContent = "";

    while (!isFinished) {
      const { done, value } = await reader.read();
      if (done) {
        isFinished = true;
        break;
      }
      generatedTextContent += decoder.decode(value, {stream: true});
    }

    return generatedTextContent;
  } catch (error) {
    console.error("Error:", error);
    return "An error occurred.";
  }
}


function addMessage(text, type) {
  const messageDiv = document.createElement("div");
  messageDiv.className = `message ${type}`;
  messageDiv.innerHTML = `<div class="message-bubble fadeIn"></div>`;
  chatContainer.appendChild(messageDiv);
  chatContainer.scrollTop = chatContainer.scrollHeight;

  let i = 0;
  const messageBubble = messageDiv.querySelector('.message-bubble');
  const interval = setInterval(() => {
      if (i < text.length) {
          if (text.charAt(i) === '\n') {
              messageBubble.innerHTML += '<br>';
          } else {
              messageBubble.innerHTML += text.charAt(i);
          }
          i++;
      } else {
          clearInterval(interval);
          hideTypingIndicator();
      }
  }, 50); // Adjust speed of typing here
}

let typingTimeout;

function showTypingIndicator() {
  clearTimeout(typingTimeout);
  typingIndicator.style.display = "inline-block";
}

function hideTypingIndicator() {
  typingTimeout = setTimeout(() => {
      typingIndicator.style.display = "none";
  }, 1000);
}

function handleKeyPress(event) {
  if (event.key === "Enter") {
      sendMessage();
  }
}

// Assuming chatContainer is the element to hover over
chatContainer.addEventListener('mouseover', () => {
  showTypingIndicator();

  // Set a timeout to simulate typing delay for the user message
  setTimeout(() => {
      const defaultUserMessage = "Hi, what are Digital Software Market's AI services?";
      addMessage(defaultUserMessage, 'user');

      // Wait for the user message to finish typing before showing the bot response
      const userMessageInterval = 50 * defaultUserMessage.length; // Calculate the time taken to type the user message
      setTimeout(() => {
          // Show typing indicator again for bot response
          showTypingIndicator();

          // Set another timeout to simulate typing delay for the bot response
          setTimeout(() => {
              const hardcodedBotResponse = "Hello I am Digital Software Market's Chatbot,here is a list of all our AI development services<br>1. Custom AI model development<br>2. AI-driven data analysis<br>3. Automated AI workflows<br>4. AI integration services<br>5. Machine learning solutions<br>Digital Software Market offers a comprehensive range of AI services tailored to meet your business needs.";
              addMessage(hardcodedBotResponse.replace(/<br>/g, '\n'), 'bot');
          }, 1000); // Delay for bot message
      }, userMessageInterval); // Wait until user message is fully typed
  }, 1000); // Delay for user message
}, { once: true }); // This ensures the event only fires once

