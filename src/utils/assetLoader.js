// Asset loader utility for loading game assets

// Dog images
export const getDogImage = (dogNumber) => {
  // dogNumber can be 1-19 or "001"-"019"
  const num = typeof dogNumber === 'number' ? dogNumber : parseInt(dogNumber);
  const paddedNum = String(num).padStart(3, '0');
  return `/assets/dogs/dog_${paddedNum}.png`;
};

// Get random dog image
export const getRandomDogImage = () => {
  const randomNum = Math.floor(Math.random() * 19) + 1;
  return getDogImage(randomNum);
};

// Dog thumbnail images
export const getDogThumbnail = (dogNumber) => {
  const num = typeof dogNumber === 'number' ? dogNumber : parseInt(dogNumber);
  const paddedNum = String(num).padStart(3, '0');
  return `/assets/thumbnails/dog_thumbnail_${paddedNum}.png`;
};

// Background images
export const getBackground = (screenName) => {
  // screenName: 'stable', 'race', 'market', 'leaderboard'
  const backgroundMap = {
    'stable': '/assets/backgrounds/background_001.jpg',
    'race': '/assets/backgrounds/background_001.jpg', // Reuse for now
    'market': '/assets/backgrounds/background_001.jpg',
    'leaderboard': '/assets/backgrounds/background_001.jpg'
  };
  
  return backgroundMap[screenName] || backgroundMap['stable'];
};

// Preload images for better performance
export const preloadImages = () => {
  const images = [];
  
  // Preload all dog images
  for (let i = 1; i <= 19; i++) {
    const img = new Image();
    img.src = getDogImage(i);
    images.push(img);
  }
  
  // Preload backgrounds
  ['stable', 'race', 'market', 'leaderboard'].forEach(screen => {
    const img = new Image();
    img.src = getBackground(screen);
    images.push(img);
  });
  
  return images;
};

// Assign random dog image to a dog object
export const assignDogImageToDog = (dog) => {
  if (!dog.imageNumber) {
    dog.imageNumber = Math.floor(Math.random() * 19) + 1;
  }
  return dog.imageNumber;
};
