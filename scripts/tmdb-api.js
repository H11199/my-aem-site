/**
 * TMDb API Service for fetching movie and TV show data
 * Get your free API key from: https://www.themoviedb.org/settings/api
 */

class TMDbService {
  constructor() {
    // You'll need to get a free API key from TMDb and replace this
    this.apiKey = '9487a57b5a544d3bfc7310d50faa7a4f'; // Replace with your actual API key
    this.baseUrl = 'https://api.themoviedb.org/3';
    this.imageBaseUrl = 'https://image.tmdb.org/t/p/w500';
    this.backdropBaseUrl = 'https://image.tmdb.org/t/p/w1280';
    // Rating thresholds for content rating classification
    this.ratingThresholds = {
      tvMA: 8,
      tv14: 7,
      tvPG: 6,
      contentTvMA: 8.5,
      contentTv14: 7.5,
      contentTvPG: 6.5,
    };
    
    // Current year for fallback when date parsing fails
    this.currentYear = new Date().getFullYear();
  }

  /**
   * Generic fetch method with error handling
   */
  async fetchFromAPI(endpoint) {
    try {
      const url = `${this.baseUrl}${endpoint}${endpoint.includes('?') ? '&' : '?'}api_key=${this.apiKey}`;
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return data;
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('TMDb API Error:', error);
      return this.getFallbackData();
    }
  }

  /**
   * Get popular movies
   */
  async getPopularMovies() {
    const data = await this.fetchFromAPI('/movie/popular');
    return this.formatResults(data.results || []);
  }

  /**
   * Get trending TV shows
   */
  async getTrendingTV() {
    const data = await this.fetchFromAPI('/trending/tv/week');
    return this.formatResults(data.results || []);
  }

  /**
   * Get popular TV shows
   */
  async getPopularTV() {
    const data = await this.fetchFromAPI('/tv/popular');
    return this.formatResults(data.results || []);
  }

  /**
   * Get top rated movies
   */
  async getTopRatedMovies() {
    const data = await this.fetchFromAPI('/movie/top_rated');
    return this.formatResults(data.results || []);
  }

  /**
   * Get Netflix Originals (approximated by filtering popular content)
   */
  async getNetflixOriginals() {
    const data = await this.fetchFromAPI('/discover/tv?with_networks=213'); // Netflix network ID
    return this.formatResults(data.results || []);
  }

  /**
   * Get movie details for hero section
   */
  async getMovieDetails(movieId) {
    const data = await this.fetchFromAPI(`/movie/${movieId}`);
    return this.formatMovieDetails(data);
  }

  /**
   * Get TV show details for hero section
   */
  async getTVDetails(tvId) {
    const data = await this.fetchFromAPI(`/tv/${tvId}`);
    return this.formatTVDetails(data);
  }

  /**
   * Format API results to our component structure
   */
  formatResults(results) {
    return results.slice(0, 20).map((item) => ({
      id: item.id,
      title: item.title || item.name,
      image: item.poster_path ? `${this.imageBaseUrl}${item.poster_path}` : this.getPlaceholderImage(),
      backdrop: item.backdrop_path ? `${this.backdropBaseUrl}${item.backdrop_path}` : null,
      rating: this.formatRating(item.vote_average),
      year: this.extractYear(item.release_date || item.first_air_date),
      overview: item.overview,
      genres: item.genre_ids || [],
    }));
  }

  /**
   * Format movie details for hero section
   */
  formatMovieDetails(movie) {
    return {
      id: movie.id,
      title: movie.title,
      overview: movie.overview,
      backdrop: movie.backdrop_path ? `${this.backdropBaseUrl}${movie.backdrop_path}` : null,
      rating: this.getContentRating(movie.vote_average),
      year: this.extractYear(movie.release_date),
      duration: movie.runtime ? `${movie.runtime}m` : null,
      genres: movie.genres ? movie.genres.map((g) => g.name).slice(0, 3) : [],
    };
  }

  /**
   * Format TV show details for hero section
   */
  formatTVDetails(show) {
    return {
      id: show.id,
      title: show.name,
      overview: show.overview,
      backdrop: show.backdrop_path ? `${this.backdropBaseUrl}${show.backdrop_path}` : null,
      rating: this.getContentRating(show.vote_average),
      year: this.extractYear(show.first_air_date),
      duration: show.episode_run_time ? `${show.episode_run_time[0]}m` : null,
      genres: show.genres ? show.genres.map((g) => g.name).slice(0, 3) : [],
    };
  }

  /**
   * Convert TMDb rating to Netflix-style rating
   */
  formatRating(voteAverage) {
    if (voteAverage >= this.ratingThresholds.tvMA) return 'TV-MA';
    if (voteAverage >= this.ratingThresholds.tv14) return 'TV-14';
    if (voteAverage >= this.ratingThresholds.tvPG) return 'TV-PG';
    return 'TV-G';
  }

  /**
   * Get content rating based on vote average
   */
  getContentRating(voteAverage) {
    if (voteAverage >= this.ratingThresholds.contentTvMA) return 'TV-MA';
    if (voteAverage >= this.ratingThresholds.contentTv14) return 'TV-14';
    if (voteAverage >= this.ratingThresholds.contentTvPG) return 'TV-PG';
    return 'TV-G';
  }

  /**
   * Extract year from date string
   */
  extractYear(dateString) {
    return dateString ? new Date(dateString).getFullYear() : this.currentYear;
  }

  /**
   * Get placeholder image for missing posters
   */
  getPlaceholderImage() {
    return 'https://via.placeholder.com/500x750/e50914/ffffff?text=No+Image';
  }

  /**
   * Fallback data when API fails
   */
  getFallbackData() {
    return {
      results: [
        {
          id: 1,
          title: 'Stranger Things',
          name: 'Stranger Things',
          poster_path: null,
          backdrop_path: null,
          vote_average: 8.7,
          release_date: '2016-07-15',
          first_air_date: '2016-07-15',
          overview: 'When a young boy vanishes, a small town uncovers a mystery involving secret experiments, terrifying supernatural forces, and one strange little girl.',
        },
        {
          id: 2,
          title: 'The Crown',
          name: 'The Crown',
          poster_path: null,
          backdrop_path: null,
          vote_average: 8.5,
          release_date: '2016-11-04',
          first_air_date: '2016-11-04',
          overview: 'Follows the political rivalries and romance of Queen Elizabeth II\'s reign and the events that shaped the second half of the twentieth century.',
        },
        {
          id: 3,
          title: 'Wednesday',
          name: 'Wednesday',
          poster_path: null,
          backdrop_path: null,
          vote_average: 8.3,
          release_date: '2022-11-23',
          first_air_date: '2022-11-23',
          overview: 'Smart, sarcastic and a little dead inside, Wednesday Addams investigates a murder spree while making new friends — and foes — at Nevermore Academy.',
        },
      ],
    };
  }

  /**
   * Get featured content for hero section (Stranger Things by default)
   */
  async getFeaturedContent() {
    try {
      // Try to get Stranger Things (TV show ID: 66732)
      const strangerthings = await this.getTVDetails(66732);
      return strangerthings;
    } catch (error) {
      // Fallback to a popular movie
      const popular = await this.getPopularMovies();
      return popular[0] || this.getFallbackHeroContent();
    }
  }

  /**
   * Fallback hero content
   */
  getFallbackHeroContent() {
    return {
      id: 66732,
      title: 'Stranger Things',
      overview: 'When a young boy vanishes, a small town uncovers a mystery involving secret experiments, terrifying supernatural forces, and one strange little girl.',
      backdrop: 'https://via.placeholder.com/1280x720/141414/ffffff?text=Stranger+Things',
      rating: 'TV-14',
      year: 2016,
      duration: '51m',
      genres: ['Drama', 'Fantasy', 'Horror'],
    };
  }
}

// Create global instance
window.tmdbService = new TMDbService();

export default TMDbService;
