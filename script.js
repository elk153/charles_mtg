function handleLogoClick() {
    if (window.reactIsReady) {
        const splashBackground = document.getElementById("splash-background");
        if (splashBackground) {
            splashBackground.classList.add("fade-out")
            // Erase the HTML elements after the fade finishe
            setTimeout( () => {
              splashBackground.remove();  
            }, 500);
        }
    }
}

const splashLogo = document.getElementById("splash-logo");
if (splashLogo) {splashLogo.addEventListener("click", handleLogoClick);}