
export const generateQRCodeSVG = (text: string): string => {
  const size = 256;
  const moduleSize = size / 25; // Grid 25x25 para simplicidade
  
  // Gerar pattern simples baseado no texto
  const hash = text.split('').reduce((a, b) => {
    a = ((a << 5) - a) + b.charCodeAt(0);
    return a & a;
  }, 0);
  
  let svg = `<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">`;
  svg += `<rect width="${size}" height="${size}" fill="white"/>`;
  
  // Adicionar bordas (finder patterns)
  const corners = [
    {x: 0, y: 0}, {x: 18, y: 0}, {x: 0, y: 18}
  ];
  
  corners.forEach(corner => {
    // Quadrado externo 7x7
    svg += `<rect x="${corner.x * moduleSize}" y="${corner.y * moduleSize}" width="${7 * moduleSize}" height="${7 * moduleSize}" fill="black"/>`;
    // Quadrado interno branco 5x5
    svg += `<rect x="${(corner.x + 1) * moduleSize}" y="${(corner.y + 1) * moduleSize}" width="${5 * moduleSize}" height="${5 * moduleSize}" fill="white"/>`;
    // Quadrado central 3x3
    svg += `<rect x="${(corner.x + 2) * moduleSize}" y="${(corner.y + 2) * moduleSize}" width="${3 * moduleSize}" height="${3 * moduleSize}" fill="black"/>`;
  });
  
  // Adicionar padrão de dados baseado no hash
  for (let x = 0; x < 25; x++) {
    for (let y = 0; y < 25; y++) {
      // Pular as áreas dos finder patterns
      if ((x < 9 && y < 9) || (x > 15 && y < 9) || (x < 9 && y > 15)) continue;
      
      const shouldFill = ((hash + x * 7 + y * 11) % 3) === 0;
      if (shouldFill) {
        svg += `<rect x="${x * moduleSize}" y="${y * moduleSize}" width="${moduleSize}" height="${moduleSize}" fill="black"/>`;
      }
    }
  }
  
  svg += '</svg>';
  return `data:image/svg+xml;base64,${btoa(svg)}`;
};
