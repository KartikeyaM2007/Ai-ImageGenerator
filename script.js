// DOM Elements
const themetoggle = document.querySelector(".theme-toggle");
const promptInput = document.querySelector(".prompt-input");
const promptBtn = document.querySelector(".prompt-btn");
const promptForm = document.querySelector(".prompt-form");
const modelSelect = document.getElementById("model-select");
const countSelect = document.getElementById("count-select");
const ratioSelect = document.getElementById("ratio-select");
const gridGallery = document.querySelector(".gallery-grid");
const generateBtn = document.querySelector(".generate-btn");
const statusContainer = document.createElement("div");
statusContainer.className = "generation-status";
promptForm.appendChild(statusContainer);

// API and Prompts
const API_KEY = "#";

const examplePrompts = [
  "A magic forest with glowing plants and fairy homes among giant mushrooms",
  "An old steampunk airship floating through golden clouds at sunset",
  "A future Mars colony with glass domes and gardens against red mountains",
  "A dragon sleeping on gold coins in a crystal cave",
  "An underwater kingdom with merpeople and glowing coral buildings",
  "A floating island with waterfalls pouring into clouds below",
  "A witch's cottage in fall with magic herbs in the garden",
  "A robot painting in a sunny studio with art supplies around it",
  "A magical library with floating glowing books and spiral staircases",
  "A Japanese shrine during cherry blossom season with lanterns and misty mountains",
  "A cosmic beach with glowing sand and an aurora in the night sky",
  "A medieval marketplace with colorful tents and street performers",
  "A cyberpunk city with neon signs and flying cars at night",
  "A peaceful bamboo forest with a hidden ancient temple",
  "A giant turtle carrying a village on its back in the ocean",
];
// Theme Toggle
const toggleTheme = () => {
    const isDarkTheme = document.body.classList.toggle("dark-theme");
    themetoggle.querySelector("i").className = isDarkTheme
        ? "fa-solid fa-sun"
        : "fa-solid fa-moon";
};

// Image Dimensions Calculation
const getImageDimensions = (aspectRatio, baseSize = 512) => {
    const [w, h] = aspectRatio.split("/").map(Number);
    const scaleFactor = baseSize / Math.sqrt(w * h);
    let width = Math.floor((w * scaleFactor) / 16) * 16;
    let height = Math.floor((h * scaleFactor) / 16) * 16;
    return { width, height };
};

// Create Image Cards with Status
const createImageCards = (imageCount, aspectRatio) => {
    gridGallery.innerHTML = "";
    statusContainer.innerHTML = "";
    
    for (let i = 0; i < imageCount; i++) {
        gridGallery.innerHTML += `
            <div class="img-card" id="img-card-${i}" style="aspect-ratio:${aspectRatio}">
                <div class="generating-overlay">
                    <i class="fas fa-spinner fa-spin"></i>
                    <span>Generating...</span>
                </div>
                <img src="" class="result-img"/>
                <div class="img-overlay">
                    <button class="img-download-btn">
                        <i class="fa-solid fa-download"></i>
                    </button>
                </div>
            </div>
        `;
    }
};

// Generate Images with Status Updates
const generateImages = async (model, count, aspectRatio, prompt) => {
    const { width, height } = getImageDimensions(aspectRatio);
    const MODEL_URL = `https://api-inference.huggingface.co/models/${model}`;
    
    generateBtn.disabled = true;
    generateBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Generating...';

    const imagePromises = Array.from({ length: count }, async (_, i) => {
        const card = document.querySelector(`#img-card-${i}`);
        const spinner = card.querySelector(".generating-overlay");
        
        try {
            const response = await fetch(MODEL_URL, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${API_KEY}`,
                    "Content-Type": "application/json",
                    "x-use-cache": "false"
                },
                body: JSON.stringify({
                    inputs: prompt,
                    parameters: { width, height },
                    options: { wait_for_model: true, use_cache: false }
                })
            });

            if (!response.ok) throw new Error(await response.text());
            
            const blob = await response.blob();
            const imageURL = URL.createObjectURL(blob);
            const img = card.querySelector("img");
            img.src = imageURL;
            img.onload = () => {
                spinner.innerHTML = '<i class="fas fa-check"></i> Completed';
                spinner.classList.add("completed");
            };
        } catch (err) {
            console.error("Image error:", err);
            spinner.innerHTML = '<i class="fas fa-times"></i> Failed';
            spinner.classList.add("failed");
        }
    });

    await Promise.allSettled(imagePromises);
    generateBtn.disabled = false;
    generateBtn.innerHTML = '<i class="fa-solid fa-wand-magic-sparkles"></i> Generate';
};

// Form Submission
const handleFormSubmit = (e) => {
    e.preventDefault();
    const selectedModel = modelSelect.value;
    const imageCount = parseInt(countSelect.value);
    const aspectRatio = ratioSelect.value;
    const promptText = promptInput.value.trim();

    createImageCards(imageCount, aspectRatio);
    generateImages(selectedModel, imageCount, aspectRatio, promptText);
};

// Random Prompt
promptBtn.addEventListener("click", (e) => {
    e.preventDefault();
    const prompt = examplePrompts[Math.floor(Math.random() * examplePrompts.length)];
    promptInput.value = prompt;
    promptInput.focus();
});

// Event Listeners
promptForm.addEventListener("submit", handleFormSubmit);
themetoggle.addEventListener("click", toggleTheme);