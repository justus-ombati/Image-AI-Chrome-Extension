document.addEventListener("DOMContentLoaded", function() {
    const submitBtn = document.querySelector(".submitBtn");
    const captionDiv = document.getElementById("caption");
    const inputField = document.querySelector("input[type='text']");
    const mainDiv = document.querySelector('.main-div');
    const toggleOnBtn = document.querySelector('.toggle-btn.active');
    const toggleOffBtn = document.querySelector('.toggle-btn:not(.active)');

    // Hide the caption div by default
    captionDiv.style.display = "none";

    toggleOnBtn.addEventListener('click', function() {
        mainDiv.style.backgroundColor = "#FFF7F7";
        mainDiv.style.color = "#21242d";
        toggleOnBtn.classList.remove('active');
        toggleOffBtn.classList.add('active');
      });
    
      toggleOffBtn.addEventListener('click', function() {
        mainDiv.style.backgroundColor = "#21242d";
        mainDiv.style.color = "#15F5BA";
        toggleOffBtn.classList.remove('active');
        toggleOnBtn.classList.add('active');
      });
    
    submitBtn.addEventListener("click", () => {
        const imageUrl = inputField.value;
        
        // Check if the input field is empty
        if (imageUrl.trim() === "") {
            captionDiv.textContent = "You have not entered any image URL.";
            captionDiv.style.display = "block";
            return; // Stop execution if input is empty
        }

        if (!imageUrl.startsWith("https://")) {
            captionDiv.textContent = "Invalid Image URL";
            captionDiv.style.color = "#FF407D";
            captionDiv.style.height = "auto";
            captionDiv.style.display = "block";
            return; // Stop execution if input is invalid
        }
        
        const loadingContainer = document.createElement("div");
        const loadingIcon = document.createElement("img");
        
        loadingContainer.style.justifyContent = "center";
        loadingContainer.style.display = "flex";
        loadingContainer.style.flexDirection = "row";
        
        // Apply CSS to the loading GIF
        loadingIcon.src = "loading.gif"; 
        loadingIcon.style.width = "150px";
        
        // Append loading GIF to the container
        loadingContainer.appendChild(loadingIcon);
        
        // Show loading icon and processing message
        captionDiv.textContent = "Processing image caption...";
        captionDiv.appendChild(loadingContainer);
        captionDiv.style.display = "block";
        captionDiv.style.transition = "height 2.5s ease-in-out, opacity 2.5s ease-in-out";
        
        fetch(`http://localhost:5001/generate_caption`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ image_url: imageUrl }),
        })
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                captionDiv.textContent = data.error;
                imagePreview.innerHTML = ""; // Clear the image preview if there's an error
            } else {
                // Display the image preview
                const imagePreview = document.getElementById("imagePreview");
                imagePreview.innerHTML = `<img src="${imageUrl}" alt="Image Preview" style="max-width: 100%; max-height: 300px;">`;
                
                // Display the caption
                captionDiv.textContent = data.caption;
            }
        })
        .catch(error => {
            console.error(error);
            captionDiv.textContent = "An error occurred. Please try again later!!";
        });
    });
});
