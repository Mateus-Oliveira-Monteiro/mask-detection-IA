// More API functions here:
    // https://github.com/googlecreativelab/teachablemachine-community/tree/master/libraries/image

    // the link to your model provided by Teachable Machine export panel
    const URL = "./my_model/";

    let model, webcam, labelContainer, maxPredictions;
    let isRunning = false;

    // Load the image model and setup the webcam
    async function init() {
        // Para a webcam anterior se existir
        if (webcam) {
            webcam.stop();
        }

        // Limpa os containers
        const webcamContainer = document.getElementById("webcam-container");
        webcamContainer.innerHTML = '';
        labelContainer = document.getElementById("label-container");
        labelContainer.innerHTML = '';

        const modelURL = URL + "model.json";
        const metadataURL = URL + "metadata.json";

        // load the model and metadata
        if (!model) {
            model = await tmImage.load(modelURL, metadataURL);
            maxPredictions = model.getTotalClasses();
        }

        // Convenience function to setup a webcam
        const flip = true; // whether to flip the webcam
        webcam = new tmImage.Webcam(320, 320, flip); // width, height, flip
        await webcam.setup(); // request access to the webcam
        await webcam.play();
        isRunning = true;
        window.requestAnimationFrame(loop);

        // append elements to the DOM
        webcamContainer.appendChild(webcam.canvas);
        
        // Criar barras de progresso para cada classe
        for (let i = 0; i < maxPredictions; i++) {
            const item = document.createElement("div");
            item.className = "prediction-item";
            item.innerHTML = `
                <div class="prediction-header">
                    <span class="prediction-label"></span>
                    <span class="prediction-value">0%</span>
                </div>
                <div class="progress-bar">
                    <div class="progress-fill" style="width: 0%"></div>
                </div>
            `;
            labelContainer.appendChild(item);
        }
    }

    async function loop() {
        if (!isRunning) return;
        webcam.update(); // update the webcam frame
        await predict();
        window.requestAnimationFrame(loop);
    }

    // run the webcam image through the image model
    async function predict() {
        // predict can take in an image, video or canvas html element
        const prediction = await model.predict(webcam.canvas);
        for (let i = 0; i < maxPredictions; i++) {
            const probability = prediction[i].probability;
            const percentage = Math.round(probability * 100);
            const className = prediction[i].className.toLowerCase();
            
            const item = labelContainer.childNodes[i];
            const label = item.querySelector('.prediction-label');
            const value = item.querySelector('.prediction-value');
            const fill = item.querySelector('.progress-fill');
            
            // Define a classe baseado no nome (mask ou no mask)
            if (className.includes('no') || className.includes('sem')) {
                item.className = 'prediction-item no-mask';
                label.textContent = '😷❌ Sem Máscara';
            } else {
                item.className = 'prediction-item mask';
                label.textContent = '😷✅ Com Máscara';
            }
            
            value.textContent = percentage + '%';
            fill.style.width = percentage + '%';
        }
    }