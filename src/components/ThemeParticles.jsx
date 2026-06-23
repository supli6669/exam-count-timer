import { useEffect, useRef } from 'react';

function ThemeParticles({ theme }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId;
    let particles = [];
    let width = (canvas.width = canvas.offsetWidth || window.innerWidth);
    let height = (canvas.height = canvas.offsetHeight || window.innerHeight);

    // Handle resizing
    const resizeObserver = new ResizeObserver((entries) => {
      for (let entry of entries) {
        width = canvas.width = entry.contentRect.width || canvas.offsetWidth;
        height = canvas.height = entry.contentRect.height || canvas.offsetHeight;
        initParticles();
      }
    });
    
    // Also listen to window resize as fallback
    const handleResize = () => {
      width = canvas.width = canvas.offsetWidth || window.innerWidth;
      height = canvas.height = canvas.offsetHeight || window.innerHeight;
      initParticles();
    };

    window.addEventListener('resize', handleResize);
    if (canvas.parentElement) {
      resizeObserver.observe(canvas.parentElement);
    }

    // Particle Factories based on theme
    class Particle {
      constructor() {
        this.reset();
      }

      reset() {
        this.x = Math.random() * width;
        
        if (theme === 'lofi-cafe') {
          // Warm dust motes floating upwards
          this.y = height + Math.random() * 20;
          this.size = Math.random() * 3 + 1;
          this.speedY = -(Math.random() * 0.5 + 0.2);
          this.speedX = (Math.random() - 0.5) * 0.3;
          this.alpha = Math.random() * 0.5 + 0.1;
          this.color = `rgba(245, 158, 11, ${this.alpha})`; // Amber
          this.fadeSpeed = 0.001;
        } 
        else if (theme === 'cyberpunk-alley') {
          // Digital rain (cyan & pink vertical drips)
          this.y = -Math.random() * height;
          this.size = Math.random() * 1.5 + 1; // line width
          this.length = Math.random() * 15 + 10;
          this.speedY = Math.random() * 8 + 6;
          this.speedX = 0;
          this.alpha = Math.random() * 0.6 + 0.2;
          this.color = Math.random() > 0.5 
            ? `rgba(6, 182, 212, ${this.alpha})` // Neon Cyan
            : `rgba(236, 72, 153, ${this.alpha})`; // Neon Pink
        } 
        else if (theme === 'sakura-library') {
          // Swaying falling cherry blossom petals
          this.y = -Math.random() * 50;
          this.size = Math.random() * 6 + 4;
          this.speedY = Math.random() * 1.2 + 0.8;
          this.speedX = Math.random() * 0.5 + 0.2;
          this.sway = Math.random() * 2 * Math.PI;
          this.swaySpeed = Math.random() * 0.02 + 0.01;
          this.rotation = Math.random() * 360;
          this.rotationSpeed = (Math.random() - 0.5) * 2;
          this.alpha = Math.random() * 0.5 + 0.4;
          this.color = `rgba(244, 114, 182, ${this.alpha})`; // Sakura Pink
        } 
        else if (theme === 'space-odyssey') {
          // Stars twinkling (stationary, pulsing alpha)
          this.x = Math.random() * width;
          this.y = Math.random() * height;
          this.size = Math.random() * 2 + 0.5;
          this.alpha = Math.random() * 0.8 + 0.2;
          this.pulseSpeed = Math.random() * 0.02 + 0.005;
          this.pulseDir = Math.random() > 0.5 ? 1 : -1;
          this.color = `rgba(255, 255, 255, ${this.alpha})`;
          // Special shooting star flag
          this.isMeteor = Math.random() > 0.995; 
          if (this.isMeteor) {
            this.meteorX = this.x;
            this.meteorY = this.y;
            this.meteorSpeedX = -Math.random() * 8 - 8;
            this.meteorSpeedY = Math.random() * 8 + 8;
            this.meteorLength = Math.random() * 60 + 40;
            this.meteorActive = true;
          }
        } 
        else if (theme === 'nature-cabin') {
          // Campfire sparks rising up & dissolving
          this.x = width / 2 + (Math.random() - 0.5) * 80;
          this.y = height - Math.random() * 30;
          this.size = Math.random() * 3.5 + 1.5;
          this.speedY = -(Math.random() * 2.5 + 1);
          this.speedX = (Math.random() - 0.5) * 1.2;
          this.alpha = 1;
          this.color = `rgba(${Math.floor(Math.random() * 55 + 200)}, ${Math.floor(Math.random() * 100 + 80)}, 22, 1)`; // Fire gold/orange
          this.sway = Math.random() * 2 * Math.PI;
          this.swaySpeed = Math.random() * 0.1 + 0.05;
        }
      }

      update() {
        if (theme === 'lofi-cafe') {
          this.y += this.speedY;
          this.x += this.speedX;
          
          // Gently fade out near the top
          if (this.y < height * 0.3) {
            this.alpha -= 0.005;
          }
          
          if (this.y < 0 || this.alpha <= 0) {
            this.reset();
          }
        } 
        else if (theme === 'cyberpunk-alley') {
          this.y += this.speedY;
          if (this.y > height) {
            this.reset();
          }
        } 
        else if (theme === 'sakura-library') {
          this.y += this.speedY;
          // Sway movement
          this.sway += this.swaySpeed;
          this.x += Math.sin(this.sway) * 0.5 + this.speedX;
          this.rotation += this.rotationSpeed;
          
          if (this.y > height || this.x > width || this.x < 0) {
            this.reset();
          }
        } 
        else if (theme === 'space-odyssey') {
          if (this.isMeteor && this.meteorActive) {
            this.meteorX += this.meteorSpeedX;
            this.meteorY += this.meteorSpeedY;
            if (this.meteorX < 0 || this.meteorY > height) {
              this.meteorActive = false;
              // Reset meteor trigger
              this.isMeteor = false;
            }
          } else {
            // Pulse stars
            this.alpha += this.pulseSpeed * this.pulseDir;
            if (this.alpha >= 1) {
              this.pulseDir = -1;
            } else if (this.alpha <= 0.1) {
              this.pulseDir = 1;
            }
            
            // Re-roll meteor possibility
            if (!this.isMeteor && Math.random() > 0.9998) {
              this.isMeteor = true;
              this.meteorX = Math.random() * width;
              this.meteorY = Math.random() * (height * 0.4);
              this.meteorSpeedX = -Math.random() * 10 - 8;
              this.meteorSpeedY = Math.random() * 10 + 8;
              this.meteorLength = Math.random() * 80 + 40;
              this.meteorActive = true;
            }
          }
        } 
        else if (theme === 'nature-cabin') {
          this.y += this.speedY;
          // Natural drift
          this.sway += this.swaySpeed;
          this.x += Math.sin(this.sway) * 0.8 + this.speedX;
          // Sparks shrink and fade as they rise
          this.size -= 0.02;
          this.alpha -= 0.012;
          
          if (this.y < 0 || this.alpha <= 0 || this.size <= 0) {
            this.reset();
          }
        }
      }

      draw() {
        if (theme === 'lofi-cafe') {
          ctx.beginPath();
          ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(245, 158, 11, ${Math.max(0, this.alpha)})`;
          ctx.fill();
        } 
        else if (theme === 'cyberpunk-alley') {
          ctx.beginPath();
          ctx.moveTo(this.x, this.y);
          ctx.lineTo(this.x, this.y + this.length);
          ctx.strokeStyle = this.color;
          ctx.lineWidth = this.size;
          ctx.stroke();
        } 
        else if (theme === 'sakura-library') {
          ctx.save();
          ctx.translate(this.x, this.y);
          ctx.rotate((this.rotation * Math.PI) / 180);
          
          // Draw a curved petal shape
          ctx.beginPath();
          ctx.ellipse(0, 0, this.size, this.size / 2, 0, 0, Math.PI * 2);
          ctx.fillStyle = this.color;
          ctx.fill();
          
          // Inner petal shadow details
          ctx.beginPath();
          ctx.ellipse(0, 0, this.size / 1.5, this.size / 4, 0, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(242, 73, 159, ${this.alpha * 0.6})`;
          ctx.fill();
          
          ctx.restore();
        } 
        else if (theme === 'space-odyssey') {
          if (this.isMeteor && this.meteorActive) {
            ctx.save();
            ctx.beginPath();
            const grad = ctx.createLinearGradient(
              this.meteorX, this.meteorY, 
              this.meteorX - this.meteorSpeedX * 2, this.meteorY - this.meteorSpeedY * 2
            );
            grad.addColorStop(0, 'rgba(255, 255, 255, 0.9)');
            grad.addColorStop(0.3, 'rgba(6, 182, 212, 0.4)'); // Cyan trail
            grad.addColorStop(1, 'rgba(6, 182, 212, 0)');
            
            ctx.strokeStyle = grad;
            ctx.lineWidth = 1.5;
            ctx.moveTo(this.meteorX, this.meteorY);
            ctx.lineTo(
              this.meteorX - this.meteorSpeedX * 3, 
              this.meteorY - this.meteorSpeedY * 3
            );
            ctx.stroke();
            ctx.restore();
          } else {
            // Draw twinkling star
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(255, 255, 255, ${this.alpha})`;
            ctx.shadowBlur = this.size * 3;
            ctx.shadowColor = '#fff';
            ctx.fill();
            ctx.shadowBlur = 0; // reset
          }
        } 
        else if (theme === 'nature-cabin') {
          ctx.beginPath();
          ctx.arc(this.x, this.y, Math.max(0.1, this.size), 0, Math.PI * 2);
          // Campfire glow
          ctx.fillStyle = `rgba(249, 115, 22, ${Math.max(0, this.alpha)})`;
          ctx.shadowBlur = this.size * 2;
          ctx.shadowColor = '#f97316';
          ctx.fill();
          ctx.shadowBlur = 0; // reset
        }
      }
    }

    const initParticles = () => {
      particles = [];
      let count = 40;
      if (theme === 'space-odyssey') count = 80; // more stars
      if (theme === 'cyberpunk-alley') count = 60; // more rain drips
      if (theme === 'lofi-cafe') count = 25; // sparse cozy dust

      for (let i = 0; i < count; i++) {
        particles.push(new Particle());
      }
    };

    initParticles();

    // Loop
    const animate = () => {
      ctx.clearRect(0, 0, width, height);
      particles.forEach((p) => {
        p.update();
        p.draw();
      });
      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      resizeObserver.disconnect();
    };
  }, [theme]);

  if (theme === 'default') return null;

  return (
    <canvas
      ref={canvasRef}
      className="theme-particles-canvas"
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 2, // Placed between theme image (z-index 1) and contents (z-index 3)
        display: 'block'
      }}
    />
  );
}

export default ThemeParticles;
