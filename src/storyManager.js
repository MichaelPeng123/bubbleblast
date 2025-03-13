export class StoryManager {
    constructor(domElement) {
        this.domElement = domElement;
        this.storyContainer = null;
        this.isDisplaying = false;
        this.onContinue = null;
        this.storyTexts = {
            intro: [
                "BUBBLE POPPER",
                "Strange bubbles have appeared in this room, and it's your job to pop them all!",
                "Each bubble you pop earns you points, but be quick - they're constantly moving.",
                "Complete all levels to become the ultimate Bubble Popper champion!",
            ],
            level1Complete: [
                "LEVEL 1 COMPLETE",
                "Nice shooting! You've cleared all the bubbles in the first level.",
                "But the challenge is just beginning...",
                "The next level will have more bubbles moving at faster speeds!",
            ],
            level2Complete: [
                "LEVEL 2 COMPLETE",
                "Impressive! Your bubble-popping skills are getting better.",
                "The final level will be the ultimate test of your aim and reflexes.",
                "Get ready for the fastest and most challenging bubbles yet!",
            ],
            level3Complete: [
                "LEVEL 3 COMPLETE",
                "Outstanding performance! You've mastered the challenging bubbles.",
                "But we're not done yet - two more levels await!",
                "The bubbles will move even faster now. Stay focused!",
            ],
            level4Complete: [
                "LEVEL 4 COMPLETE",
                "Incredible accuracy! Just one more level to go!",
                "The final level will push your skills to the absolute limit.",
                "Prepare for the fastest bubbles you've ever seen!",
            ],
            level5Complete: [
                "CONGRATULATIONS!",
                "You've achieved the impossible and completed all five levels!",
                "Your bubble-popping skills are truly legendary.",
                "Check out your amazing stats on the next screen!",
            ],
        };

        this.createStoryContainer();
        this.setupEventListeners();
    }

    createStoryContainer() {
        this.storyContainer = document.createElement("div");
        this.storyContainer.style.position = "absolute";
        this.storyContainer.style.top = "50%";
        this.storyContainer.style.left = "50%";
        this.storyContainer.style.transform = "translate(-50%, -50%)";
        this.storyContainer.style.width = "80%";
        this.storyContainer.style.maxWidth = "600px";
        this.storyContainer.style.backgroundColor = "rgba(0, 0, 0, 0.8)";
        this.storyContainer.style.color = "#4fc3f7";
        this.storyContainer.style.padding = "20px";
        this.storyContainer.style.borderRadius = "10px";
        this.storyContainer.style.fontFamily = '"Courier New", monospace';
        this.storyContainer.style.border = "2px solid #4fc3f7";
        this.storyContainer.style.boxShadow = "0 0 15px #4fc3f7";
        this.storyContainer.style.zIndex = "1000";
        this.storyContainer.style.display = "none";

        const continueText = document.createElement("p");
        continueText.style.textAlign = "center";
        continueText.style.marginTop = "20px";
        continueText.style.color = "#ffffff";
        continueText.style.fontSize = "14px";
        continueText.innerText = "[ Press any key to continue ]";
        this.storyContainer.appendChild(continueText);

        this.domElement.appendChild(this.storyContainer);
    }

    setupEventListeners() {
        const handleKeyPress = (event) => {
            if (this.isDisplaying) {
                this.hideStory();
                if (this.onContinue) {
                    this.onContinue();
                }
            }
        };

        window.addEventListener("keydown", handleKeyPress);
        this.storyContainer.addEventListener("click", handleKeyPress);
    }

    showStory(storyKey, callback = null) {
        this.isDisplaying = true;
        this.onContinue = callback;

        // Remove any existing paragraphs except the continue text
        while (this.storyContainer.children.length > 1) {
            this.storyContainer.removeChild(this.storyContainer.firstChild);
        }

        // Add story paragraphs
        const storyText = this.storyTexts[storyKey];
        storyText.forEach((text, index) => {
            const paragraph = document.createElement("p");
            paragraph.style.margin = index === 0 ? "0 0 20px 0" : "10px 0";
            paragraph.style.textAlign = index === 0 ? "center" : "left";
            paragraph.style.fontSize = index === 0 ? "24px" : "16px";
            paragraph.style.fontWeight = index === 0 ? "bold" : "normal";
            paragraph.innerText = text;

            // Insert before the continue text
            this.storyContainer.insertBefore(
                paragraph,
                this.storyContainer.lastChild
            );
        });

        // Show the container
        this.storyContainer.style.display = "block";
    }

    hideStory() {
        this.storyContainer.style.display = "none";
        this.isDisplaying = false;
    }

    isActive() {
        return this.isDisplaying;
    }
}
