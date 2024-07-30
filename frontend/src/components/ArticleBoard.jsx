import React from 'react';
import {useNavigate} from 'react-router-dom';
import {truncateText} from '../utils/textUtils';
import {handleArticleClick} from '../utils/utils';

const ArticleBoard = ({
  user,
  setClickedArticle,
  setViewInteracted,
  articleList,
}) => {
  const navigate = useNavigate();

  return (
    <>
      <div className="grid grid-cols-4 gap-6 ml-6 mr-6 mb-4">
        {articleList.map((article, index) => (
          <div
            key={index}
            className="bg-neutral p-4 rounded-lg text-white cursor-pointer hover:bg-gray-800 hover:scale-105 transition-transform"
            onClick={() =>
              handleArticleClick(user, article, setClickedArticle, navigate)
            }>
            <h3 className="text-xl font-bold">{article.title}</h3>
            <p className="text-success">
              {article.realScore === 0
                ? 'NO SCORE CALCULATED'
                : (article.realScore * 100).toFixed(4) + '% Real Content Score'}
            </p>
            <p className="text-pink-500">{article.author.join(', ')}</p>
            <p>{truncateText(article.description, 30)}</p>
          </div>
        ))}
      </div>
    </>
  );
};

export default ArticleBoard;
