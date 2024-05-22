document.addEventListener("DOMContentLoaded", () => {
const generateForm = document.querySelector(".generator-form");
const imgGallery = document.querySelector(".image-gallery");

const OPENAI_API_KEY = "sk-proj-L8zk5UM1o7CKg6ky13ljT3BlbkFJ7kdNLtpneehrkH8kAZIr";
let isimageGenerating = false;

const updateImageCard = (imgDataArray) => {
    imgDataArray.forEach((imgObject, index) => {
        const imgCard = imgGallery.querySelectorAll(".img-card")[index];
        const imgElement = imgCard.querySelector("img");
        const downloadBtn = document.querySelector(".download-btn");

        //Set the image source to the AI-generated image data
        const aiGeneratedImg = `data:image/jpeg;base64, ${imgDataArray.b64_json}`;
        imgElement.src = aiGeneratedImg;

        //when the image is load then remove load class
        imgElement.onload = () => {
            imgCard.classList.remove("loading");
            downloadBtn.setAttribute("href", aiGeneratedImg);
            downloadBtn.setAttribute("download", `${new Date().getTime()}.jpg`);
        }
    });
}

const generateAiImage = async (userPrompt, userimgQuantity) => {
    try {
        const payload = {
            prompt: userPrompt,
            n: parseInt(userimgQuantity), // Ensure userimgQuantity is parsed as an integer
            size: "512x512",
            response_format: "b64_json"
        };

        console.log('Request Payload:', payload);

        // Send a request to the OpenAI API to generate images based on user inputs
        const response = await fetch("https://api.openai.com/v1/images/generations", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${OPENAI_API_KEY}`,
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const errorDetails = await response.json();
            if (errorDetails.error.message.includes("Billing hard limit has been reached")) {
                throw new Error("Your account has reached the billing limit. Please check your billing status or upgrade your plan.");
            } else {
                throw new Error(`Error: ${response.status} ${response.statusText} - ${errorDetails.error.message}`);
            }
        }

        const { data } = await response.json();
        console.log(data);
        updateImageCard([...data]);
    } catch (error) {
        alert(`An error occurred: ${error.message}`);
    }finally{
        isimageGenerating = false;
    }
};

const handleFormSubmission = (e) => {
    e.preventDefault();
    if(isimageGenerating) return;
    isimageGenerating = true;

    const userPrompt = e.srcElement[0].value;
    const userimgQuantity = e.target[1].value;
    console.log(userPrompt, userimgQuantity);

    //Creating HTML markup for image cards with loading state
    const imgCardMarkup = Array.from({length: userimgQuantity}, () => 
        `<div class="img-card loading">
            <img src="loader.svg" alt="image">
            <a href="#" class="download-btn">
                <img src="download.svg" alt="download icon">
            </a>
        </div>`
    ).join("");
    console.log(imgCardMarkup);
    imgGallery.innerHTML = imgCardMarkup;
    generateAiImage(userPrompt, userimgQuantity);
}

generateForm.addEventListener("submit", handleFormSubmission);

});