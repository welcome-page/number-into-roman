document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('confetti-canvas');
    const myConfetti = confetti.create(canvas, {
        resize: true,
        useWorker: true
    });

    function fireConfetti() {
        const duration = 1.5 * 1000;
        const animationEnd = Date.now() + duration;
        const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

        function randomInRange(min, max) {
            return Math.random() * (max - min) + min;
        }

        const interval = setInterval(function() {
            const timeLeft = animationEnd - Date.now();

            if (timeLeft <= 0) {
                return clearInterval(interval);
            }

            const particleCount = 50 * (timeLeft / duration);
            myConfetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
            myConfetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
        }, 250);
    }

    fireConfetti();

    const processImage = async ({ baseImageSrc, imageElementId, iconSrc, iconSize, iconCenter, text, textOrigin, font }) => {
        try {
            const [baseImg, iconImg] = await Promise.all([
                loadImage(baseImageSrc),
                loadImage(iconSrc)
            ]);

            const canvas = document.createElement('canvas');
            canvas.width = baseImg.width;
            canvas.height = baseImg.height;
            const ctx = canvas.getContext('2d');

            ctx.drawImage(baseImg, 0, 0);

            const iconX = iconCenter.x - iconSize / 2;
            const iconY = iconCenter.y - iconSize / 2;
            ctx.drawImage(iconImg, iconX, iconY, iconSize, iconSize);

            if (text && textOrigin && font) {
                ctx.font = font;
                ctx.fillStyle = 'black';
                ctx.fillText(text, textOrigin.x, textOrigin.y);
            }

            const imageElement = document.getElementById(imageElementId);
            if (imageElement) {
                imageElement.src = canvas.toDataURL();
            }
        } catch (error) {
            console.error('Error processing image:', error);
        }
    };

    const loadImage = (src) => {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => resolve(img);
            img.onerror = reject;
            img.src = src;
        });
    };

    fetch('config.json')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(config => {
            const appName = config.appName;
            document.title = `Welcome to ${appName}`;
            const appNameElement = document.getElementById('appName');
            if (appNameElement) {
                appNameElement.textContent = appName;
                const logo = appNameElement.previousElementSibling;
                if(logo) {
                    logo.alt = appName;
                }
            }
            
            const welcomeMessage = config.welcomeMessage;
            const welcomeElement = document.getElementById('welcomeMessage');
            if (welcomeElement && welcomeMessage) {
                welcomeElement.innerHTML = welcomeMessage.replace(/\\n/g, '<br>');
            }

            processImage({
                baseImageSrc: 'images/welcome-page-1.png',
                imageElementId: 'welcome-image-1',
                iconSrc: 'images/icon.png',
                iconSize: 28,
                iconCenter: { x: 855, y: 266 },
                text: appName,
                textOrigin: { x: 886, y: 271 },
                font: '17px Arial'
            });

            processImage({
                baseImageSrc: 'images/welcome-page-2.png',
                imageElementId: 'welcome-image-2',
                iconSrc: 'images/icon.png',
                iconSize: 28,
                iconCenter: { x: 1146, y: 76 }
            });
        })
        .catch(error => console.error('Error loading config:', error));
});
