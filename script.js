const cube = document.querySelector("#cube");
const cback = document.querySelector(".back");
const ctop = document.querySelector(".top");
const cleft = document.querySelector(".left");
const cright = document.querySelector(".right");
const glow = document.querySelector(".hexagon");
const powerup = document.querySelector(".powerup");
const transitionTime = "750ms";
let c = 0;

// Create audio element for Swedish House Mafia track
const audio = new Audio('shm-one-intro.mp3');
audio.volume = 0.8; // Set volume to 80%

// Add click protection variable
let isAnimating = false;

ctop.style.transition = `all ${transitionTime}`;
cleft.style.transition = `all ${transitionTime}`;
cright.style.transition = `all ${transitionTime}`;
cube.style.transition = `all ${transitionTime}`;
powerup.style.transition = `all ${transitionTime}`;
glow.style.transition = `all ${transitionTime}`;
cback.style.transition = `all ${transitionTime}`;

cube.addEventListener("click", openCube);

function createConfetti() {
    const confettiContainer = document.createElement('div');
    confettiContainer.className = 'confetti';
    document.body.appendChild(confettiContainer);

    // Get the cube's position to center the explosion
    const cubeRect = cube.getBoundingClientRect();
    const centerX = cubeRect.left + cubeRect.width / 2;
    const centerY = cubeRect.top + cubeRect.height / 2;

    // Create 80 confetti pieces that explode from center
    for (let i = 0; i < 80; i++) {
        const confettiPiece = document.createElement('div');
        confettiPiece.className = 'confetti-piece';

        // Position each piece at the center of the cube
        confettiPiece.style.left = centerX + 'px';
        confettiPiece.style.top = centerY + 'px';

        // Calculate random direction and distance for explosion
        const angle = (i / 80) * 2 * Math.PI + (Math.random() - 0.5) * 0.5; // Distribute evenly with some randomness
        const distance = 200 + Math.random() * 300; // Random distance between 200-500px

        const dx = Math.cos(angle) * distance;
        const dy = Math.sin(angle) * distance;

        // Set CSS custom properties for the animation
        confettiPiece.style.setProperty('--dx', dx + 'px');
        confettiPiece.style.setProperty('--dy', dy + 'px');

        // Random animation delay for more natural effect
        confettiPiece.style.animationDelay = Math.random() * 0.3 + 's';

        confettiContainer.appendChild(confettiPiece);
    }

    // Remove confetti after 3 seconds
    setTimeout(() => {
        if (document.body.contains(confettiContainer)) {
            document.body.removeChild(confettiContainer);
        }
    }, 3000);
}

function openCube() {
    // Prevent multiple clicks during animation
    if (isAnimating || this.isOpen) return;

    if (!this.isOpen) {
        isAnimating = true; // Lock the cube

        // Start tension building sequence
        buildTension().then(() => {
            // After tension buildup, proceed with opening
            award();
            ctop.style.transform = "translateY(-120px)";
            cleft.style.transform = "translateX(-120px)";
            cright.style.transform = "translateX(120px)";
            ctop.style.opacity = 0.1;
            cleft.style.opacity = 0.1;
            cright.style.opacity = 0.1;
            cback.style.opacity = 0.1;
            glow.style.opacity = 0.5;
            powerup.style.opacity = 1;
            this.isOpen = true;
            cube.style.animationPlayState = "paused";

            // Trigger confetti effect
            createConfetti();

            // Unlock after everything is done
            setTimeout(() => {
                isAnimating = false;
            }, 3000); // Wait for confetti to finish
        });
    } else {
        // Reset sequence
        ctop.style.transform = "translateY(0)";
        cleft.style.transform = "translateX(0)";
        cright.style.transform = "translateX(0)";
        cube.style.opacity = 1;
        this.isOpen = false;
        ctop.style.opacity = 1;
        cleft.style.opacity = 1;
        cright.style.opacity = 1;
        cback.style.opacity = 1;
        glow.style.opacity = 1;
        powerup.style.opacity = 0;
        cube.style.animationPlayState = "running";
        changeVar("rgba(255,195,26,0.4)");

        // Stop audio if playing
        audio.pause();
        audio.currentTime = 0;
    }
}

function buildTension() {
    return new Promise((resolve) => {
        // Disable clicking during tension build
        cube.style.pointerEvents = 'none';

        // Start playing the Swedish House Mafia track
        audio.currentTime = 0; // Start from beginning
        audio.play().catch(e => console.log('Audio play failed:', e));

        // Start BPM-synced pulsing for 21 seconds
        startBPMPulsing();

        // Change glow color to red during tension
        changeVar("rgba(255,50,50,0.8)");
        glow.classList.add('glow-buildup');

        // After 21 seconds, stop pulsing and open the box
        setTimeout(() => {
            stopBPMPulsing();

            // Remove glow animation
            glow.classList.remove('glow-buildup');

            // Re-enable clicking
            cube.style.pointerEvents = 'auto';

            resolve();
        }, 21000); // 21 seconds
    });
}

let pulseTimeout;
let pulseStartTime;
let isCurrentlyPulsing = false;

function startBPMPulsing() {
    // Clear any existing pulse
    if (pulseTimeout) {
        clearTimeout(pulseTimeout);
    }

    isCurrentlyPulsing = true;
    pulseStartTime = Date.now();

    // CRITICAL: Stop the hover animation that conflicts with pulsing
    cube.style.animation = 'none';
    cube.style.transition = 'none';

    // Force immediate transform reset
    cube.style.transform = 'scale(1) rotate(0deg)';

    // Start pulsing with responsive transition
    cube.style.transition = 'transform 0.08s ease-out';

    let kicksPerBar = 4; // Start with 4 kicks per bar
    let currentBarIndex = 0;
    let kickInBarCount = 0;
    let baseRotation = 0; // Track accumulated rotation

    doPulse();

    function doPulse() {
        if (!isCurrentlyPulsing) return;

        const elapsed = Date.now() - pulseStartTime;
        const progress = elapsed / 21000; // 0 to 1 over 21 seconds

        // Stop after 21 seconds
        if (elapsed >= 21000) {
            stopBPMPulsing();
            return;
        }

        // Each bar is exactly the same length (4 beats at 126 BPM = ~1.905 seconds)
        const baseBPM = 126;
        const beatsPerBar = 4; // Standard 4/4 time
        const millisecondsPerBar = (60000 / baseBPM) * beatsPerBar; // ~1905ms per bar - CONSISTENT

        // Calculate which bar we're in based on consistent timing
        const newBarIndex = Math.floor(elapsed / millisecondsPerBar);

        // Update kicks per bar when we enter a new bar: 4, 8, 16, 32, 64, etc.
        if (newBarIndex !== currentBarIndex) {
            currentBarIndex = newBarIndex;
            kicksPerBar = 4 * Math.pow(2, currentBarIndex); // 4, 8, 16, 32, 64...
            kickInBarCount = 0; // Reset kick count for new bar
            console.log(`Bar ${currentBarIndex + 1}: ${kicksPerBar} kicks per ${millisecondsPerBar.toFixed(0)}ms bar`);
        }

        // Calculate beat interval: same bar length divided by more kicks
        const beatInterval = millisecondsPerBar / kicksPerBar;

        // Create pulsing effect that builds intensity
        const intensity = 0.3 + (progress * 0.4); // 0.3 to 0.7
        const baseScale = 1.0;
        const maxScale = baseScale + (intensity * 0.3); // Scale up to 1.3 max
        const minScale = baseScale - (intensity * 0.05); // Scale down slightly

        // Add side-kicking effect based on beat - no spinning
        const kickIntensity = intensity * 0.8; // Scale kick intensity with progress

        // Randomly select which side to kick on this beat
        const sideToKick = kickInBarCount % 3; // Cycle through 0, 1, 2

        // Apply kick transform to selected side
        if (sideToKick === 0) {
            // Kick left side
            cleft.style.transform = `translateX(-${15 + kickIntensity * 10}px) rotate(-${2 + kickIntensity * 3}deg)`;
            // Reset other sides
            cright.style.transform = 'translateX(0) rotate(0deg)';
            ctop.style.transform = 'translateY(0) rotate(0deg)';
        } else if (sideToKick === 1) {
            // Kick right side
            cright.style.transform = `translateX(${15 + kickIntensity * 10}px) rotate(${2 + kickIntensity * 3}deg)`;
            // Reset other sides
            cleft.style.transform = 'translateX(0) rotate(0deg)';
            ctop.style.transform = 'translateY(0) rotate(0deg)';
        } else {
            // Kick top side
            ctop.style.transform = `translateY(-${20 + kickIntensity * 15}px) rotate(-${1 + kickIntensity * 2}deg)`;
            // Reset other sides
            cleft.style.transform = 'translateX(0) rotate(0deg)';
            cright.style.transform = 'translateX(0) rotate(0deg)';
        }

        // Log for debugging
        console.log(`Bar: ${currentBarIndex + 1}, Kicks/Bar: ${kicksPerBar}, Beat Interval: ${beatInterval.toFixed(1)}ms, Side: ${sideToKick}`);

        // Pulse up (kick hit) - no spinning, just scaling
        cube.style.transform = `scale(${maxScale})`;

        // Update glow intensity with beat
        const red = 255;
        const green = Math.floor(100 + (intensity * 100));
        const blue = Math.floor(100 + (intensity * 100));
        const glowOpacity = 0.4 + (intensity * 0.3);
        changeVar(`rgba(${red},${green},${blue},${glowOpacity})`);

        // Pulse down after brief moment
        setTimeout(() => {
            if (isCurrentlyPulsing) {
                cube.style.transform = `scale(${minScale})`;

                // Reset side transforms after kick
                setTimeout(() => {
                    if (isCurrentlyPulsing) {
                        cleft.style.transform = 'translateX(0) rotate(0deg)';
                        cright.style.transform = 'translateX(0) rotate(0deg)';
                        ctop.style.transform = 'translateY(0) rotate(0deg)';
                    }
                }, beatInterval * 0.1); // Reset sides quickly after kick
            }
        }, beatInterval * 0.3); // Pulse down for 30% of beat interval

        kickInBarCount++;

        // Schedule next kick
        pulseTimeout = setTimeout(doPulse, beatInterval);
    }
}

function stopBPMPulsing() {
    isCurrentlyPulsing = false;

    if (pulseTimeout) {
        clearTimeout(pulseTimeout);
        pulseTimeout = null;
    }

    // Reset cube transform and restore original hover animation
    cube.style.transition = 'transform 0.5s ease-out';
    cube.style.transform = 'scale(1) rotate(0deg)';

    // Restore the original hover animation after pulsing stops
    setTimeout(() => {
        cube.style.animation = 'hover 1.5s ease-in-out infinite alternate';
    }, 500);
}

function changeVar(glow) {
        document.documentElement.style.setProperty("--glow", glow);
}

function award() {
        // Always show the Swedish House Mafia image
        powerup.style.backgroundImage = "url('swedishhousemafia-2.webp')";
        changeVar("rgba(255,0,0,0.4)"); // Red glow to match the Swedish House Mafia theme
        c++;
}
