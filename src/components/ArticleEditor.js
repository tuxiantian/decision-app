import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import '@toast-ui/editor/dist/toastui-editor.css';
import { Editor } from '@toast-ui/react-editor';
import { useParams, useNavigate } from 'react-router-dom'; // 引入 useNavigate

const ArticleEditor = () => {
  const { id } = useParams(); // 获取路由参数中的文章 ID
  const navigate = useNavigate(); // 创建导航对象
  const editorRef = useRef();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [author, setAuthor] = useState('');
  const [tags, setTags] = useState('');
  const [keywords, setKeywords] = useState([]);
  const [keywordInput, setKeywordInput] = useState('');

  // useEffect 钩子用于在组件加载时获取文章数据
  useEffect(() => {
    if (id) {
      axios.get(`http://localhost:5000/articles/${id}`)
        .then(response => {
          const { title, content, author, tags, keywords } = response.data;
          setTitle(title);
          setContent(content);
          setAuthor(author);
          setTags(tags);
          setKeywords(keywords ? keywords.split(',') : []);
          if (editorRef.current) {
            editorRef.current.getInstance().setMarkdown(content);
          }
        })
        .catch(error => {
          console.error('There was an error fetching the article!', error);
        });
    }
  }, [id]);

  const handleAddKeyword = () => {
    if (keywordInput.trim()) {
      setKeywords([...keywords, keywordInput.trim()]);
      setKeywordInput('');
    }
  };

  const handleRemoveKeyword = (index) => {
    setKeywords(keywords.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    const newArticle = {
      title,
      content: editorRef.current.getInstance().getMarkdown(),
      author,
      tags, // 直接使用下拉选择的值
      keywords: keywords.join(',')
    };

    if (id) {
      // 更新已有文章
      axios.put(`http://localhost:5000/articles/${id}`, newArticle)
        .then(response => {
          console.log('Article updated:', response.data);
          navigate('/articles'); // 保存成功后跳转到文章列表
        })
        .catch(error => {
          console.error('There was an error updating the article!', error);
        });
    } else {
      // 创建新文章
      axios.post('http://localhost:5000/articles', newArticle)
        .then(response => {
          console.log('Article saved:', response.data);
          navigate('/articles'); // 保存成功后跳转到文章列表
        })
        .catch(error => {
          console.error('There was an error saving the article!', error);
        });
    }
  };

  return (
    <div>
      <h2>{id ? 'Edit Article' : 'Create Article'}</h2>
      <input
        type="text"
        placeholder="Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      <input
        type="text"
        placeholder="Author"
        value={author}
        onChange={(e) => setAuthor(e.target.value)}
      />
      <select value={tags} onChange={(e) => setTags(e.target.value)}>
        <option value="">Select Tag</option>
        <option value="MentalModel">Mental Model</option>
        <option value="CognitiveBias">Cognitive Bias</option>
      </select>

      {/* Dynamic Keyword Input */}
      <div>
        <input
          type="text"
          placeholder="Add a keyword"
          value={keywordInput}
          onChange={(e) => setKeywordInput(e.target.value)}
        />
        <button type="button" onClick={handleAddKeyword}>Add Keyword</button>
      </div>
      <div style={{ marginTop: '10px' }}>
        {keywords.map((keyword, index) => (
          <div key={index} style={{ display: 'inline-block', marginRight: '10px' }}>
            <span>{keyword}</span>
            <button type="button" onClick={() => handleRemoveKeyword(index)}>x</button>
          </div>
        ))}
      </div>

      <Editor
        initialValue={content}
        previewStyle="vertical"
        height="400px"
        initialEditType="markdown"
        useCommandShortcut={true}
        ref={editorRef}
      />
      <button onClick={handleSave}>Save Article</button>
    </div>
  );
};

export default ArticleEditor;
