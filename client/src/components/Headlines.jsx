const Headlines = ({ articles }) => {
  return (
    <div>
      <h2 style={{ marginBottom: '1rem' }}>Top Headlines</h2>
      <ul style={{ paddingLeft: '1rem' }}>
        {articles.map((article, index) => (
          <li key={index} style={{ marginBottom: '0.75rem' }}>
            <a
              href={article.url}
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: '#0af', textDecoration: 'none' }}
            >
              {article.title}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Headlines;
