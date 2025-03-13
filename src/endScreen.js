export class EndScreen {
    constructor(domElement, gameStats, onRestart) {
        this.domElement = domElement;
        this.gameStats = gameStats;
        this.onRestart = onRestart;
        this.endScreenContainer = null;
        this.isDisplaying = false;

        this.createEndScreen();
    }

    createEndScreen() {
        this.endScreenContainer = document.createElement("div");
        this.endScreenContainer.style.position = "absolute";
        this.endScreenContainer.style.top = "50%";
        this.endScreenContainer.style.left = "50%";
        this.endScreenContainer.style.transform = "translate(-50%, -50%)";
        this.endScreenContainer.style.width = "80%";
        this.endScreenContainer.style.maxWidth = "600px";
        this.endScreenContainer.style.backgroundColor = "rgba(0, 0, 0, 0.9)";
        this.endScreenContainer.style.color = "#4fc3f7";
        this.endScreenContainer.style.padding = "30px";
        this.endScreenContainer.style.borderRadius = "10px";
        this.endScreenContainer.style.fontFamily = '"Courier New", monospace';
        this.endScreenContainer.style.border = "2px solid #4fc3f7";
        this.endScreenContainer.style.boxShadow = "0 0 20px #4fc3f7";
        this.endScreenContainer.style.zIndex = "1000";
        this.endScreenContainer.style.display = "none";
        this.endScreenContainer.style.textAlign = "center";

        // Add to DOM
        this.domElement.appendChild(this.endScreenContainer);
    }

    updateStats(gameStats) {
        this.gameStats = gameStats;
    }

    show() {
        // Clear any existing content
        this.endScreenContainer.innerHTML = "";

        // Title
        const title = document.createElement("h1");
        title.innerText = "MISSION COMPLETE";
        title.style.color = "#ffffff";
        title.style.marginBottom = "30px";
        title.style.fontSize = "32px";
        this.endScreenContainer.appendChild(title);

        // Score
        const scoreText = document.createElement("h2");
        scoreText.innerHTML = `Final Score: <span style="color: #ffff00;">${Math.round(
            this.gameStats.finalScore
        )}</span>`;
        scoreText.style.marginBottom = "20px";
        scoreText.style.fontSize = "28px";
        this.endScreenContainer.appendChild(scoreText);

        // Stats container
        const statsContainer = document.createElement("div");
        statsContainer.style.backgroundColor = "rgba(0, 0, 0, 0.5)";
        statsContainer.style.padding = "20px";
        statsContainer.style.borderRadius = "5px";
        statsContainer.style.marginBottom = "30px";
        statsContainer.style.textAlign = "left";

        // Accuracy stats
        const accuracy =
            (this.gameStats.shotsHit / this.gameStats.shotsFired) * 100 || 0;
        const accuracyText = document.createElement("p");
        accuracyText.innerHTML = `<span style="color: #ffffff;">Accuracy:</span> ${accuracy.toFixed(
            1
        )}% (${this.gameStats.shotsHit}/${this.gameStats.shotsFired})`;
        accuracyText.style.marginBottom = "10px";
        statsContainer.appendChild(accuracyText);

        // Time stats
        const totalTime = document.createElement("p");
        const timeInSeconds = Math.floor(this.gameStats.totalTime / 1000);
        const minutes = Math.floor(timeInSeconds / 60);
        const seconds = timeInSeconds % 60;
        totalTime.innerHTML = `<span style="color: #ffffff;">Time to Complete:</span> ${minutes}m ${seconds}s`;
        totalTime.style.marginBottom = "10px";
        statsContainer.appendChild(totalTime);

        // Level completion times
        const levelTimesTitle = document.createElement("p");
        levelTimesTitle.innerHTML = `<span style="color: #ffffff;">Level Completion Times:</span>`;
        levelTimesTitle.style.marginBottom = "5px";
        statsContainer.appendChild(levelTimesTitle);

        // Add times for each level
        for (let i = 0; i < this.gameStats.levelTimes.length; i++) {
            const levelTime = document.createElement("p");
            const time = Math.floor(this.gameStats.levelTimes[i] / 1000);
            const min = Math.floor(time / 60);
            const sec = time % 60;
            levelTime.innerHTML = `Level ${i + 1}: ${min}m ${sec}s`;
            levelTime.style.marginLeft = "20px";
            levelTime.style.marginBottom = "5px";
            levelTime.style.fontSize = "14px";
            statsContainer.appendChild(levelTime);
        }

        this.endScreenContainer.appendChild(statsContainer);

        // Restart button
        const restartButton = document.createElement("button");
        restartButton.innerText = "PLAY AGAIN";
        restartButton.style.backgroundColor = "#4fc3f7";
        restartButton.style.color = "#000000";
        restartButton.style.border = "none";
        restartButton.style.padding = "15px 30px";
        restartButton.style.fontSize = "18px";
        restartButton.style.fontWeight = "bold";
        restartButton.style.borderRadius = "5px";
        restartButton.style.cursor = "pointer";
        restartButton.style.fontFamily = '"Courier New", monospace';
        restartButton.style.boxShadow = "0 0 10px rgba(79, 195, 247, 0.8)";
        restartButton.style.transition = "all 0.2s ease";

        restartButton.addEventListener("mouseover", () => {
            restartButton.style.backgroundColor = "#ffffff";
        });

        restartButton.addEventListener("mouseout", () => {
            restartButton.style.backgroundColor = "#4fc3f7";
        });

        restartButton.addEventListener("click", () => {
            this.hide();
            if (this.onRestart) {
                this.onRestart();
            }
        });

        this.endScreenContainer.appendChild(restartButton);

        // Show the container
        this.endScreenContainer.style.display = "block";
        this.isDisplaying = true;
    }

    hide() {
        this.endScreenContainer.style.display = "none";
        this.isDisplaying = false;
    }

    isActive() {
        return this.isDisplaying;
    }
}
