import React from 'react';
import './GlobeView.css';

const Headlines = ({ articles, selectedCountry }) => {
  const title = selectedCountry
    ? `Top Headlines for ${selectedCountry}`
    : 'Global Headlines';

  return (
    <div>
      <h2 className="column-title">{title}</h2>
      <div style={{ padding: '1rem' }}>
        {articles && articles.length > 0 ? (
          articles.map((article, index) => (
            <a
              key={index}
              href={article.url}
              target="_blank"
              rel="noopener noreferrer"
              className="headline-card"
            >
              <div className="trending-pill">Trending</div>
              <div className="headline-title">{article.title}</div>
              <div className="headline-source">{article.source?.name}</div>
              <div className="headline-time">
                {new Date(article.publishedAt).toLocaleString()}
              </div>
            </a>
          ))
        ) : (
          <div style={{ color: '#ccc' }}>No headlines available.</div>
        )}
      </div>
    </div>
  );
};

export default Headlines;


