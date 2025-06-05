require('dotenv').config();
const express = require('express');
const fetch = require('node-fetch');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const NodeCache = require('node-cache');
const app = express();
app.use(cors());

// Initialize cache with 5 minute TTL
const newsCache = new NodeCache({ stdTTL: 300 });

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

app.use(limiter);

// Validate country code
const validateCountryCode = (code) => {
  const validCountryCodes = new Set([
    'us', 'gb', 'de', 'fr', 'au', 'br', 'ca', 'cn', 'in', 'it', 'jp', 'mx', 'ru', 'za'
    // Add more valid country codes as needed
  ]);
  return validCountryCodes.has(code.toLowerCase());
};

// Validate category
const validateCategory = (category) => {
  const validCategories = new Set([
    'general', 'world', 'nation', 'business', 'technology', 
    'entertainment', 'sports', 'science', 'health', 'conflict',
    'environment'
  ]);
  return category ? validCategories.has(category.toLowerCase()) : true;
};

app.get('/api/news', async (req, res) => {
  try {
    const country = req.query.country?.toLowerCase() || 'us';
    const category = req.query.category?.toLowerCase();
    const query = req.query.q || '';

    // Validate inputs
    if (!validateCountryCode(country)) {
      return res.status(400).json({ error: 'Invalid country code' });
    }
    if (category && !validateCategory(category)) {
      return res.status(400).json({ error: 'Invalid category' });
    }

    // Check cache first
    const cacheKey = `${country}-${category || 'all'}-${query}`;
    const cachedData = newsCache.get(cacheKey);
    if (cachedData) {
      console.log('Returning cached data for:', cacheKey);
      return res.json(cachedData);
    }

    const { GNEWS_KEY, NEWSAPI_KEY, BING_KEY, NYT_KEY } = process.env;
    let results = [];

    // Log API keys present (don't log the actual keys in production!)
    console.log('GNEWS:', !!GNEWS_KEY, 'NEWSAPI:', !!NEWSAPI_KEY, 'BING:', !!BING_KEY, 'NYT:', !!NYT_KEY);

    // Build category parameter for each API
    const gnewsCategory = category || 'general';
    const newsapiCategory = category || 'general';
    const bingCategory = category ? `${category} news ${country}` : country;

    // Prepare API URLs with category filtering
    const gnewsURL = `https://gnews.io/api/v4/top-headlines?token=${GNEWS_KEY}&lang=en&country=${country}&category=${gnewsCategory}${query ? `&q=${query}` : ''}`;
    const newsapiURL = `https://newsapi.org/v2/top-headlines?country=${country}&category=${newsapiCategory}&apiKey=${NEWSAPI_KEY}${query ? `&q=${query}` : ''}`;
    const bingURL = `https://api.bing.microsoft.com/v7.0/news/search?q=${bingCategory}${query ? ` ${query}` : ''}&mkt=en-US`;
    const nytURL = `https://api.nytimes.com/svc/topstories/v2/${category || 'home'}.json?api-key=${NYT_KEY}`;

    // Call all APIs in parallel with timeouts
    const fetchWithTimeout = async (url, options = {}, timeout = 5000) => {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);
      try {
        const response = await fetch(url, { ...options, signal: controller.signal });
        clearTimeout(timeoutId);
        return response.json();
      } catch (error) {
        clearTimeout(timeoutId);
        console.error(`Fetch error for ${url.split('?')[0]}:`, error.message);
        return null;
      }
    };

    const [gnews, newsapi, bing, nyt] = await Promise.all([
      fetchWithTimeout(gnewsURL),
      fetchWithTimeout(newsapiURL),
      fetchWithTimeout(bingURL, { headers: { "Ocp-Apim-Subscription-Key": BING_KEY } }),
      fetchWithTimeout(nytURL)
    ]);

    // Process and normalize articles from each API
    if (gnews?.articles?.length) {
      console.log(`GNews returned ${gnews.articles.length} articles`);
      results = results.concat(gnews.articles.map(a => ({
        title: a.title,
        url: a.url,
        source: a.source?.name || "GNews",
        publishedAt: a.publishedAt,
        description: a.description,
        image: a.image,
        category: category || 'general'
      })));
    }

    if (newsapi?.articles?.length) {
      console.log(`NewsAPI returned ${newsapi.articles.length} articles`);
      results = results.concat(newsapi.articles.map(a => ({
        title: a.title,
        url: a.url,
        source: a.source?.name || "NewsAPI",
        publishedAt: a.publishedAt,
        description: a.description,
        image: a.urlToImage,
        category: category || 'general'
      })));
    }

    if (bing?.value?.length) {
      console.log(`Bing returned ${bing.value.length} articles`);
      results = results.concat(bing.value.map(a => ({
        title: a.name,
        url: a.url,
        source: a.provider?.[0]?.name || "Bing News",
        publishedAt: a.datePublished,
        description: a.description,
        image: a.image?.thumbnail?.contentUrl,
        category: category || 'general'
      })));
    }

    if (nyt?.results?.length) {
      console.log(`NYT returned ${nyt.results.length} articles`);
      results = results.concat(nyt.results.map(a => ({
        title: a.title,
        url: a.url,
        source: a.section || "NYT",
        publishedAt: a.published_date,
        description: a.abstract,
        image: a.multimedia?.[0]?.url,
        category: a.section || category || 'general'
      })));
    }

    // Deduplicate articles by title and URL
    results = results.filter((item, index, self) =>
      index === self.findIndex((t) => (
        t.title === item.title || t.url === item.url
      ))
    );

    // Sort by date
    results.sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));

    // Cache the results
    if (results.length > 0) {
      newsCache.set(cacheKey, { articles: results });
    }

    if (results.length === 0) {
      return res.status(404).json({ 
        articles: [], 
        error: "No articles found. Please try a different country, category, or search term." 
      });
    }

    res.json({ articles: results });
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ 
      error: "An error occurred while fetching news. Please try again later.",
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});

