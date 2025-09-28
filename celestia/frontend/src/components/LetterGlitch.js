import { useRef, useEffect } from 'react';

const LetterGlitch = ({
  // The color palette has been updated to your specified colors.
  glitchColors = ['#2b4539', '#61dca3', '#61b3dc'], 
  className = '',
  glitchSpeed = 50,
  characters = 'SONICKEYS!@#$&*()-_+=/[]0123456789'
}) => {
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const letters = useRef([]);
  const grid = useRef({ columns: 0, rows: 0 });
  const context = useRef(null);
  const lastGlitchTime = useRef(Date.now());
  const lettersAndSymbols = Array.from(characters);
  const fontSize = 16;
  const charWidth = 10;
  const charHeight = 20;

  const getRandomChar = () => lettersAndSymbols[Math.floor(Math.random() * lettersAndSymbols.length)];
  const getRandomColor = () => glitchColors[Math.floor(Math.random() * glitchColors.length)];
  const hexToRgb = hex => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? { r: parseInt(result[1], 16), g: parseInt(result[2], 16), b: parseInt(result[3], 16) } : null;
  };
  
  // **FIXED THE SYNTAX ERROR** by using backticks (`) for the template literal string
  const interpolateColor = (start, end, factor) => `rgb(${Math.round(start.r + (end.r - start.r) * factor)}, ${Math.round(start.g + (end.g - start.g) * factor)}, ${Math.round(start.b + (end.b - start.b) * factor)})`;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    context.current = canvas.getContext('2d');

    const calculateGrid = (width, height) => ({ columns: Math.ceil(width / charWidth), rows: Math.ceil(height / charHeight) });
    
    const initializeLetters = (columns, rows) => {
      grid.current = { columns, rows };
      letters.current = Array.from({ length: columns * rows }, () => ({
        char: getRandomChar(),
        color: getRandomColor(),
        targetColor: getRandomColor(),
        colorProgress: 1,
      }));
    };

    const drawLetters = () => {
      if (!context.current || !canvasRef.current) return;
      const ctx = context.current;
      const { width, height } = canvasRef.current.getBoundingClientRect();
      ctx.clearRect(0, 0, width, height);
      ctx.font = `${fontSize}px monospace`;
      ctx.textBaseline = 'top';
      letters.current.forEach((letter, index) => {
        const x = (index % grid.current.columns) * charWidth;
        const y = Math.floor(index / grid.current.columns) * charHeight;
        ctx.fillStyle = letter.color;
        ctx.fillText(letter.char, x, y);
      });
    };

    const resizeCanvas = () => {
      if (!canvas || !canvas.parentElement) return;
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.parentElement.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      context.current?.setTransform(dpr, 0, 0, dpr, 0, 0);
      // Re-apply font and style dimensions after resize
      context.current.font = `${fontSize}px monospace`;
      canvas.style.width = `${rect.width}px`; 
      canvas.style.height = `${rect.height}px`; 
      
      const { columns, rows } = calculateGrid(rect.width, rect.height);
      initializeLetters(columns, rows);
      drawLetters();
    };

    const animate = () => {
      const now = Date.now();
      if (now - lastGlitchTime.current >= glitchSpeed) {
        // Update a small portion of letters for performance
        const updateCount = Math.max(1, Math.floor(letters.current.length * 0.01));
        for (let i = 0; i < updateCount; i++) {
          const index = Math.floor(Math.random() * letters.current.length);
          if (letters.current[index]) {
            letters.current[index].char = getRandomChar();
            letters.current[index].targetColor = getRandomColor();
            letters.current[index].colorProgress = 0; // Start transition
          }
        }
        lastGlitchTime.current = now;
      }
      
      let needsRedraw = false;
      letters.current.forEach(letter => {
        if (letter.colorProgress < 1) {
          letter.colorProgress = Math.min(1, letter.colorProgress + 0.05);
          const startRgb = hexToRgb(letter.color);
          const endRgb = hexToRgb(letter.targetColor);
          if (startRgb && endRgb) {
            letter.color = interpolateColor(startRgb, endRgb, letter.colorProgress);
          }
          needsRedraw = true;
        }
      });

      if(needsRedraw) drawLetters();
      animationRef.current = requestAnimationFrame(animate);
    };

    resizeCanvas();
    animate();

    window.addEventListener('resize', resizeCanvas);
    return () => {
      cancelAnimationFrame(animationRef.current);
      window.removeEventListener('resize', resizeCanvas);
    };
  }, [glitchSpeed, glitchColors, characters, lettersAndSymbols]);

  // Styles have been modified to ensure this component acts as a fixed background
  const containerStyle = {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100vw',
    height: '100vh',
    backgroundColor: '#0d1117', // Your project's dark-bg color
    overflow: 'hidden',
    zIndex: 0,
  };

  const canvasStyle = { 
    display: 'block', 
    width: '100%', 
    height: '100%',
    // The opacity of the canvas has been reduced to make the effect more subtle.
    opacity: 0.4 
  };
  
  const vignetteStyle = {
    position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
    pointerEvents: 'none', background: 'radial-gradient(circle, rgba(0,0,0,0) 60%, rgba(0,0,0,1) 100%)'
  };

  return (
    <div style={containerStyle} className={className}>
      <canvas ref={canvasRef} style={canvasStyle} />
      <div style={vignetteStyle}></div>
    </div>
  );
};

export default LetterGlitch;