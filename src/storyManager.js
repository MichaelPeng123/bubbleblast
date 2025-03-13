export class StoryManager {
    constructor(domElement) {
      this.domElement = domElement;
      this.storyContainer = null;
      this.isDisplaying = false;
      this.onContinue = null;
      this.storyTexts = {
        intro: [
          "BUBBLE BLAST",
          "Spongebob and Patrick need your help! You're stranded in Bikini Bottom and are surrounded by dirty bubbles.",
          "In order to escape you need to shoot all the bubbles with your ammo of clean bubbles.",
          "Complete all the levels to escape and save Spongebob and Patrick.",
          "The bubbles will come in waves and get angrier as you progress through the levels."
        ],
        level1Complete: [
          "LEVEL 1 COMPLETE",
          "Goob job! You've cleared the first level!",
          "The next level will have more bubbles moving at faster speeds!"
        ],
        level2Complete: [
          "LEVEL 2 COMPLETE",
          "Impressive! Spongebob is very proud.",
          "This next final level will be the hardest!",
        ],
        level3Complete: [
          "CONGRATULATIONS!",
          "You've completed all levels and have saved Spongebob and Patrick!",
          "Check out your stats on the next screen!"
        ]
      };
      
      this.createStoryContainer();
      this.setupEventListeners();
    }
  
    createStoryContainer() {
      this.storyContainer = document.createElement('div');
      this.storyContainer.style.position = 'absolute';
      this.storyContainer.style.top = '50%';
      this.storyContainer.style.left = '50%';
      this.storyContainer.style.transform = 'translate(-50%, -50%)';
      this.storyContainer.style.width = '80%';
      this.storyContainer.style.maxWidth = '600px';
      this.storyContainer.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
      this.storyContainer.style.color = '#4fc3f7';
      this.storyContainer.style.padding = '20px';
      this.storyContainer.style.borderRadius = '10px';
      this.storyContainer.style.fontFamily = '"Courier New", monospace';
      this.storyContainer.style.border = '2px solid #4fc3f7';
      this.storyContainer.style.boxShadow = '0 0 15px #4fc3f7';
      this.storyContainer.style.zIndex = '1000';
      this.storyContainer.style.display = 'none';
      
      const continueText = document.createElement('p');
      continueText.style.textAlign = 'center';
      continueText.style.marginTop = '20px';
      continueText.style.color = '#ffffff';
      continueText.style.fontSize = '14px';
      continueText.innerText = '[ Press any key to continue ]';
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
      
      window.addEventListener('keydown', handleKeyPress);
      this.storyContainer.addEventListener('click', handleKeyPress);
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
        const paragraph = document.createElement('p');
        paragraph.style.margin = index === 0 ? '0 0 20px 0' : '10px 0';
        paragraph.style.textAlign = index === 0 ? 'center' : 'left';
        paragraph.style.fontSize = index === 0 ? '24px' : '16px';
        paragraph.style.fontWeight = index === 0 ? 'bold' : 'normal';
        paragraph.innerText = text;
        
        // Insert before the continue text
        this.storyContainer.insertBefore(paragraph, this.storyContainer.lastChild);
      });
      
      // Show the container
      this.storyContainer.style.display = 'block';
    }
  
    hideStory() {
      this.storyContainer.style.display = 'none';
      this.isDisplaying = false;
    }
  
    isActive() {
      return this.isDisplaying;
    }
  }