import TMDbService from '../../scripts/tmdb-api.js';

export default async function decorate(block) {
  const h1 = block.querySelector('h1');
  const picture = block.querySelector('picture');
  
  // Create hero content wrapper
  const heroContent = document.createElement('div');
  heroContent.className = 'hero-content';
  
  // Show loading state
  heroContent.innerHTML = '<div class="hero-loading">Loading featured content...</div>';
  block.appendChild(heroContent);
  
  try {
    // Get TMDb service instance
    const tmdbService = window.tmdbService || new TMDbService();
    
    // Fetch featured content (Stranger Things)
    const featuredContent = await tmdbService.getFeaturedContent();
    
    // Clear loading state
    heroContent.innerHTML = '';
    
    // Create title
    const title = document.createElement('h1');
    title.className = 'hero-title';
    title.textContent = featuredContent.title || 'Stranger Things';
    heroContent.appendChild(title);
    
    // Create description
    const description = document.createElement('p');
    description.className = 'hero-description';
    description.textContent = featuredContent.overview || 'When a young boy vanishes, a small town uncovers a mystery involving secret experiments, terrifying supernatural forces, and one strange little girl.';
    heroContent.appendChild(description);
    
    // Create metadata section
    const metadata = document.createElement('div');
    metadata.className = 'hero-metadata';
    metadata.innerHTML = `
      <span class="hero-rating">${featuredContent.rating || 'TV-14'}</span>
      <span class="hero-year">${featuredContent.year || '2016'}</span>
      <span class="hero-duration">${featuredContent.duration || '51m'}</span>
    `;
    heroContent.appendChild(metadata);
    
    // Create genres
    const genres = document.createElement('div');
    genres.className = 'hero-genres';
    const genreList = featuredContent.genres || ['Drama', 'Fantasy', 'Horror'];
    genres.innerHTML = genreList.map(genre => `<span class="hero-genre">${genre}</span>`).join('');
    heroContent.appendChild(genres);
    
    // Create buttons
    const buttonsContainer = document.createElement('div');
    buttonsContainer.className = 'hero-buttons';
    
    const playButton = document.createElement('button');
    playButton.className = 'button-play';
    playButton.innerHTML = `
      <svg class="play-icon" viewBox="0 0 24 24">
        <path d="M8 5v14l11-7z"/>
      </svg>
      Play
    `;
    
    const infoButton = document.createElement('button');
    infoButton.className = 'button-info';
    infoButton.innerHTML = `
      <svg class="info-icon" viewBox="0 0 24 24">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/>
      </svg>
      More Info
    `;
    
    buttonsContainer.appendChild(playButton);
    buttonsContainer.appendChild(infoButton);
    heroContent.appendChild(buttonsContainer);
    
    // Create and set background image if available
    if (featuredContent.backdrop) {
      const picture = document.createElement('picture');
      const img = document.createElement('img');
      img.src = featuredContent.backdrop;
      img.alt = `${featuredContent.title} backdrop`;
      img.loading = 'eager';
      picture.appendChild(img);
      
      // Insert picture as first child (background)
      block.insertBefore(picture, block.firstChild);
    }
    
    // Add click handlers for buttons
    playButton.addEventListener('click', () => {
      console.log('Play button clicked for:', featuredContent.title);
      // Add play functionality here
    });
    
    infoButton.addEventListener('click', () => {
      console.log('More Info button clicked for:', featuredContent.title);
      // Add more info functionality here
    });
    
  } catch (error) {
    console.error('Error loading featured content:', error);
    
    // Fallback content
    heroContent.innerHTML = `
      <h1 class="hero-title">Stranger Things</h1>
      <p class="hero-description">When a young boy vanishes, a small town uncovers a mystery involving secret experiments, terrifying supernatural forces, and one strange little girl.</p>
      <div class="hero-metadata">
        <span class="hero-rating">TV-14</span>
        <span class="hero-year">2016</span>
        <span class="hero-duration">51m</span>
      </div>
      <div class="hero-genres">
        <span class="hero-genre">Drama</span>
        <span class="hero-genre">Fantasy</span>
        <span class="hero-genre">Horror</span>
      </div>
      <div class="hero-buttons">
        <button class="button-play">
          <svg class="play-icon" viewBox="0 0 24 24">
            <path d="M8 5v14l11-7z"/>
          </svg>
          Play
        </button>
        <button class="button-info">
          <svg class="info-icon" viewBox="0 0 24 24">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/>
          </svg>
          More Info
        </button>
      </div>
    `;
    
    // Add fallback click handlers
    const fallbackPlayButton = heroContent.querySelector('.button-play');
    const fallbackInfoButton = heroContent.querySelector('.button-info');
    
    if (fallbackPlayButton) {
      fallbackPlayButton.addEventListener('click', () => {
        console.log('Play button clicked (fallback)');
      });
    }
    
    if (fallbackInfoButton) {
      fallbackInfoButton.addEventListener('click', () => {
        console.log('More Info button clicked (fallback)');
      });
    }
  }
  
  // Remove any existing picture element since we're using API backdrop
  if (picture) {
    picture.remove();
  }
}
