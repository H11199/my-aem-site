/**
 * Fallback content when API fails
 */
function getFallbackContent() {
  return [
    {
      id: 1,
      title: 'Stranger Things',
      image: 'https://via.placeholder.com/500x750/e50914/ffffff?text=Stranger+Things',
      rating: 'TV-14',
      year: 2016,
    },
    {
      id: 2,
      title: 'The Crown',
      image: 'https://via.placeholder.com/500x750/b20710/ffffff?text=The+Crown',
      rating: 'TV-MA',
      year: 2016,
    },
    {
      id: 3,
      title: 'Wednesday',
      image: 'https://via.placeholder.com/500x750/e50914/ffffff?text=Wednesday',
      rating: 'TV-14',
      year: 2022,
    },
    {
      id: 4,
      title: 'Ozark',
      image: 'https://via.placeholder.com/500x750/b20710/ffffff?text=Ozark',
      rating: 'TV-MA',
      year: 2017,
    },
    {
      id: 5,
      title: 'The Witcher',
      image: 'https://via.placeholder.com/500x750/e50914/ffffff?text=The+Witcher',
      rating: 'TV-MA',
      year: 2019,
    },
    {
      id: 6,
      title: 'Money Heist',
      image: 'https://via.placeholder.com/500x750/b20710/ffffff?text=Money+Heist',
      rating: 'TV-MA',
      year: 2017,
    },
  ];
}

export default async function decorate(block) {
  // Import TMDb service
  const { default: TMDbService } = await import('../../scripts/tmdb-api.js');
  const tmdbService = new TMDbService();

  // Get the title from the block content
  const titleElement = block.querySelector('h2, h3, h4, h5, h6');
  const title = titleElement ? titleElement.textContent : 'Popular on Netflix';

  // Clear the block
  block.innerHTML = '';

  // Create the title
  const rowTitle = document.createElement('h2');
  rowTitle.textContent = title;
  block.appendChild(rowTitle);

  // Create container for the slider and navigation
  const container = document.createElement('div');
  container.className = 'content-row-container';

  // Create the slider
  const slider = document.createElement('div');
  slider.className = 'content-row-slider';

  // Show loading state
  slider.innerHTML = '<div class="loading-state">Loading content...</div>';
  container.appendChild(slider);
  block.appendChild(container);

  // Fetch content based on title
  let content = [];
  try {
    switch (title.toLowerCase()) {
      case 'popular on netflix':
        content = await tmdbService.getPopularMovies();
        break;
      case 'trending now':
        content = await tmdbService.getTrendingTV();
        break;
      case 'netflix originals':
        content = await tmdbService.getNetflixOriginals();
        break;
      case 'tv shows':
        content = await tmdbService.getPopularTV();
        break;
      case 'movies':
        content = await tmdbService.getTopRatedMovies();
        break;
      default:
        content = await tmdbService.getPopularMovies();
    }
  } catch (error) {
    console.error('Error fetching content:', error);
    content = getFallbackContent();
  }

  // Clear loading state
  slider.innerHTML = '';

  // Create content items
  content.forEach((item) => {
    const contentItem = document.createElement('div');
    contentItem.className = 'content-item';

    contentItem.innerHTML = `
      <img src="${item.image}" alt="${item.title}" loading="lazy" onerror="this.src='https://via.placeholder.com/500x750/e50914/ffffff?text=No+Image'">
      <div class="content-item-overlay">
        <div class="content-item-title">${item.title}</div>
        <div class="content-item-meta">
          <span class="content-item-rating">${item.rating}</span>
          ${item.year}
        </div>
      </div>
    `;

    // Add click handler
    contentItem.addEventListener('click', () => {
      console.log(`Clicked on ${item.title}`);
      // Add navigation or modal functionality here
    });

    slider.appendChild(contentItem);
  });

  // Create navigation arrows
  const prevButton = document.createElement('button');
  prevButton.className = 'content-row-nav prev';
  prevButton.innerHTML = `
    <svg viewBox="0 0 24 24">
      <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/>
    </svg>
  `;

  const nextButton = document.createElement('button');
  nextButton.className = 'content-row-nav next';
  nextButton.innerHTML = `
    <svg viewBox="0 0 24 24">
      <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/>
    </svg>
  `;

  // Add scroll functionality
  const scrollAmount = 400;

  prevButton.addEventListener('click', () => {
    slider.scrollBy({
      left: -scrollAmount,
      behavior: 'smooth',
    });
  });

  nextButton.addEventListener('click', () => {
    slider.scrollBy({
      left: scrollAmount,
      behavior: 'smooth',
    });
  });

  // Assemble the container
  container.appendChild(slider);
  container.appendChild(prevButton);
  container.appendChild(nextButton);
  block.appendChild(container);

  // Update navigation button visibility based on scroll position
  function updateNavButtons() {
    const isAtStart = slider.scrollLeft <= 0;
    const isAtEnd = slider.scrollLeft >= slider.scrollWidth - slider.clientWidth;

    prevButton.style.opacity = isAtStart ? '0' : '1';
    nextButton.style.opacity = isAtEnd ? '0' : '1';
  }

  slider.addEventListener('scroll', updateNavButtons);
  updateNavButtons(); // Initial check
}
