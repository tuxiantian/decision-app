import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import Modal from 'react-modal';
import '@toast-ui/editor/dist/toastui-editor-viewer.css';
import { Viewer } from '@toast-ui/react-editor';
import { WEBSITE_URL } from '../../config.js';
import api from '../api.js'
import './DecisionDetails.css'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronDown, faChevronUp, faTimes } from '@fortawesome/free-solid-svg-icons';

const DecisionDetails = () => {
  const { decisionId } = useParams();
  const [decisionDetails, setDecisionDetails] = useState(null);
  const [showArticleModal, setShowArticleModal] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [selectedUsersByQuestion, setSelectedUsersByQuestion] = useState({}); // 每个问题的选中用户ID
  const [expandedQuestions, setExpandedQuestions] = useState({ 0: true }); // 控制每个问题的展开状态
  const [allExpanded, setAllExpanded] = useState(true); // 默认展开所有问题

  const navigate = useNavigate();

  // 配置决策组的状态
  const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);
  const [groupName, setGroupName] = useState('');
  const [groupId, setGroupId] = useState(null);
  const [inviteLink, setInviteLink] = useState('');
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [groupMembers, setGroupMembers] = useState([]);
  const [isMembersModalOpen, setIsMembersModalOpen] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);

  useEffect(() => {
    const fetchDecisionDetails = async () => {
      try {
        const response = await api.get(`/checklist_answers/details/${decisionId}`);
        const r = response.data;
        r.answers = filterAndFormatAnswers(r.answers)
        setDecisionDetails(r);

        // 如果存在决策组信息，设置相关变量
        if (response.data.has_group && response.data.group) {
          setGroupId(response.data.group.id);
          setGroupName(response.data.group.name);
        }
      } catch (error) {
        console.error('Error fetching decision details', error);
      }
    };

    fetchDecisionDetails();
  }, [decisionId]);

  const fetchReviews = () => {
    api.get(`/reviews/${decisionId}`)
      .then(response => setReviews(response.data))
      .catch(error => console.error('Error fetching reviews:', error));
  };

  // 在组件中添加过滤和格式化函数
  const filterAndFormatAnswers = (answers) => {
    return answers
      .filter(answer => {
        // 过滤掉没有回答的问题
        if (answer.responses.length === 0) return false;

        // 对于选择题，确保answer值有效
        if (answer.type === 'choice') {
          const selectedOption = answer.responses[0].answer;
          return selectedOption !== undefined && selectedOption !== null && selectedOption !== '';
        }

        return true;
      })
      .map(answer => {
        // 创建新的responses数组，添加formattedAnswer
        const formattedResponses = answer.responses.map(response => {
          if (answer.type === 'choice') {
            const selectedOptionIndex = parseInt(response.answer);
            const selectedOption = answer.options[selectedOptionIndex];
            return {
              ...response,
              formattedAnswer: selectedOption || '未知选项'
            };
          }
          return {
            ...response,
            formattedAnswer: response.answer
          };
        });

        return {
          ...answer,
          responses: formattedResponses,
          isChoice: answer.type === 'choice'
        };
      });
  };

  const openReviewModal = () => {
    setIsReviewModalOpen(true);
    fetchReviews();
  };

  const handleViewArticle = async (articleId, isPlatformArticle = false) => {
    try {
      // 根据文章的来源选择不同的接口
      const endpoint = isPlatformArticle
        ? `/platform_articles/${articleId}`
        : `/articles/${articleId}`;
      const response = await api.get(endpoint);
      setSelectedArticle(response.data);
      setShowArticleModal(true);
    } catch (error) {
      console.error('Error fetching article details', error);
    }
  };

  const openGroupModal = () => {
    setIsGroupModalOpen(true);
  };

  const closeGroupModal = () => {
    setIsGroupModalOpen(false);
    setGroupName('');
  };

  const handleGroupSubmit = async () => {
    try {
      const response = await api.post(`/decision_groups`, {
        name: groupName,
        owner_id: 1,  // 这里用实际用户 ID 替换
        checklist_decision_id: decisionId,
      });
      setGroupId(response.data.group_id);
      setDecisionDetails((prev) => ({
        ...prev,
        has_group: true,  // 更新本地状态
        group: {
          id: response.data.group_id,
          name: groupName
        }
      }));
      closeGroupModal();
    } catch (error) {
      console.error('Error creating decision group', error);
    }
  };

  // 生成邀请链接
  const generateInviteLink = () => {
    if (groupId) {
      const link = `${window.location.origin}/join-group/${groupId}`;
      setInviteLink(link);
      setIsInviteModalOpen(true);
    } else {
      console.error('Group ID not found');
    }
  };

  // 获取决策组成员
  const fetchGroupMembers = async () => {
    try {
      const response = await api.get(`/decision_groups/${groupId}/members`);
      setGroupMembers(response.data.members);
      setIsMembersModalOpen(true);
    } catch (error) {
      console.error('Error fetching group members', error);
    }
  };

  // 切换选中用户，单独管理每个问题的选中用户状态
  const toggleUserSelection = (questionIndex, userId) => {
    setSelectedUsersByQuestion((prev) => {
      const selectedUsers = prev[questionIndex] || [];
      const newSelectedUsers = selectedUsers.includes(userId)
        ? selectedUsers.filter((id) => id !== userId)
        : selectedUsers.length < 2 ? [...selectedUsers, userId] : [selectedUsers[1], userId];
      return { ...prev, [questionIndex]: newSelectedUsers };
    });
  };

  const toggleQuestion = (questionIndex) => {
    setExpandedQuestions((prev) => ({
      ...prev,
      [questionIndex]: !prev[questionIndex],
    }));
  };

  const toggleAllQuestions = () => {
    if (allExpanded) {
      // 折叠所有问题
      const collapsedState = {};
      decisionDetails.answers.forEach((_, index) => {
        collapsedState[index] = false;
      });
      setExpandedQuestions(collapsedState);
    } else {
      // 展开所有问题
      const expandedState = {};
      decisionDetails.answers.forEach((_, index) => {
        expandedState[index] = true;
      });
      setExpandedQuestions(expandedState);
    }
    setAllExpanded(!allExpanded);
  };

  if (!decisionDetails) return <div>Loading...</div>;

  return (
    <div className="checklist-details" style={{ maxWidth: '800px', margin: '0 auto' }}>
      <h2>{decisionDetails.decision_name} - Details</h2>
      <div style={{ textAlign: 'left' }}><strong>Decision description:</strong> {decisionDetails.description}</div>
      <div style={{ textAlign: 'left' }}><strong>Final Decision:</strong> {decisionDetails.final_decision}</div>
      <div className="answers-header">
        <h3>Answers:</h3>
        <button
          onClick={toggleAllQuestions}
          className="toggle-button"
          style={{
            borderRadius: '4px',
            display: 'flex',
            alignItems: 'center',
            gap: '5px'
          }}
        >
          <FontAwesomeIcon icon={allExpanded ? faChevronUp : faChevronDown} />
          {allExpanded ? 'Collapse All' : 'Expand All'}
        </button>
      </div>

      {decisionDetails.answers.map((answerData, index) => (
        <div key={index} className="question-section">
          <div className="question-header">
            <strong>Q:</strong> {answerData.question}
            <button
              onClick={() => toggleQuestion(index)}
              className="toggle-button"
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '5px',
                fontSize: '1.2em',
                color: '#007bff'
              }}
            >
              {expandedQuestions[index] ? (
                <FontAwesomeIcon icon={faChevronUp} />
              ) : (
                <FontAwesomeIcon icon={faChevronDown} />
              )}
            </button>
          </div>

          {/* 根据答案数量显示不同布局 */}
          {answerData.responses.length === 1 && expandedQuestions[index] ? (
            <div className="single-answer">
              <p>{answerData.isChoice ? answerData.responses[0].formattedAnswer : answerData.responses[0].answer}</p>
              {(answerData.responses[0].referenced_articles.length > 0 ||
                answerData.responses[0].referenced_platform_articles.length > 0) && (
                  <div className="referenced-articles">
                    <strong>Referenced Articles:</strong>
                    <ul>
                      {/* 显示引用的用户自己的文章 */}
                      {answerData.responses[0].referenced_articles.map((article) => (
                        <li key={article.id}>
                          <span
                            className="article-link"
                            onClick={() => handleViewArticle(article.id, false)}
                          >
                            {article.title}
                          </span>
                        </li>
                      ))}

                      {/* 显示引用的平台推荐文章 */}
                      {answerData.responses[0].referenced_platform_articles.map((article) => (
                        <li key={article.id}>
                          <span
                            className="article-link"
                            onClick={() => handleViewArticle(article.id, true)}
                          >
                            {article.title} (Platform)
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}



            </div>


          ) : answerData.responses.length === 2 && expandedQuestions[index] ? (

            <div className="two-answers">
              {answerData.responses.map((response) => (
                <div key={response.user_id} className="answer-item">
                  <strong>{response.username}:</strong>
                  <p>{answerData.isChoice ? response.formattedAnswer : response.answer}</p>

                  {/* 检查是否有引用的文章 */}
                  {(response.referenced_articles.length > 0 || response.referenced_platform_articles.length > 0) && (
                    <div className="referenced-articles">
                      <strong>Referenced Articles:</strong>
                      <ul>
                        {/* 显示用户自己的引用文章 */}
                        {response.referenced_articles.map((article) => (
                          <li key={article.id}>
                            <span
                              className="article-link"
                              onClick={() => handleViewArticle(article.id, false)} // 传递 false 表示“我的文章”
                            >
                              {article.title}
                            </span>
                          </li>
                        ))}

                        {/* 显示平台推荐的引用文章 */}
                        {response.referenced_platform_articles.map((article) => (
                          <li key={article.id}>
                            <span
                              className="article-link"
                              onClick={() => handleViewArticle(article.id, true)} // 传递 true 表示“平台推荐文章”
                            >
                              {article.title} (Platform)
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ))}

            </div>
          ) : (

            <>
              {expandedQuestions[index] && (
                <div className="selected-answers">
                  {(selectedUsersByQuestion[index]?.length > 0
                    ? answerData.responses.filter((response) => selectedUsersByQuestion[index].includes(response.user_id))
                    : answerData.responses.slice(0, 2)
                  ).map((response) => (
                    <div key={response.user_id} className="answer-item">
                      <strong>{response.username}:</strong>
                      <p>{answerData.isChoice ? response.formattedAnswer : response.answer}</p>
                      {/* 检查是否有引用的文章 */}
                      {(response.referenced_articles.length > 0 || response.referenced_platform_articles.length > 0) && (
                        <div className="referenced-articles">
                          <strong>Referenced Articles:</strong>
                          <ul>
                            {/* 显示用户自己的引用文章 */}
                            {response.referenced_articles.map((article) => (
                              <li key={article.id}>
                                <span
                                  className="article-link"
                                  onClick={() => handleViewArticle(article.id, false)} // 传递 false 表示“我的文章”
                                >
                                  {article.title}
                                </span>
                              </li>
                            ))}

                            {/* 显示平台推荐的引用文章 */}
                            {response.referenced_platform_articles.map((article) => (
                              <li key={article.id}>
                                <span
                                  className="article-link"
                                  onClick={() => handleViewArticle(article.id, true)} // 传递 true 表示“平台推荐文章”
                                >
                                  {article.title} (Platform)
                                </span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* 用户名列表，用于选择回答 */}
              {expandedQuestions[index] && (
                <div className="username-list">
                  <strong>Show Answers by:</strong>
                  {answerData.responses.map((response) => (
                    <button
                      key={response.user_id}
                      onClick={() => toggleUserSelection(index, response.user_id)}
                      className={
                        selectedUsersByQuestion[index]?.includes(response.user_id)
                          ? 'username-button selected'
                          : 'username-button'
                      }
                    >
                      {response.username}
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      ))}






      {/* 配置决策组按钮，仅在没有组的情况下显示 */}
      {
        !decisionDetails.has_group && (
          <button onClick={openGroupModal} className='green-button' style={{ margin: '20px 10px' }}>Configure Decision Group</button>
        )
      }

      {/* 配置决策组弹窗 */}
      <Modal
        isOpen={isGroupModalOpen}
        onRequestClose={closeGroupModal}
        contentLabel="Configure Decision Group"
        style={{
          content: {
            top: '10%',
            left: '50%',
            right: 'auto',
            bottom: 'auto',
            marginRight: '-50%',
            transform: 'translate(-50%, 0)',
            width: '50%',
          },
        }}
      >
        <h2>Configure Decision Group</h2>
        <div className="form-group">
          <label>Group Name</label>
          <input
            type="text"
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
            required
            style={{ width: '100%', padding: '8px', marginBottom: '10px' }}
          />
        </div>
        <button onClick={handleGroupSubmit} className='green-button'>Submit</button>
        <button onClick={closeGroupModal} className='gray-button' style={{ marginLeft: '10px' }}>Cancel</button>
      </Modal>

      {/* 邀请链接和查看成员按钮 */}
      {
        groupId && (
          <>
            <button onClick={generateInviteLink} className="green-button" style={{ margin: '0 10px' }}>Generate Invite Link</button>
            <button onClick={fetchGroupMembers} className="green-button" style={{ margin: '0 10px' }}>View Group Members</button>
          </>
        )
      }

      {/* 邀请链接弹窗 */}
      <Modal
        isOpen={isInviteModalOpen}
        onRequestClose={() => setIsInviteModalOpen(false)}
        contentLabel="Invite Link"
      >
        <h2>Invite Link</h2>
        <p>Copy this link to invite others to the decision group:</p>
        <input
          type="text"
          value={inviteLink}
          readOnly
          style={{ width: '100%', padding: '8px' }}
        />
        <div style={{ margin: '20px auto' }}>
          <button onClick={() => navigator.clipboard.writeText(inviteLink)} className="green-button">Copy Link</button>
          <button onClick={() => setIsInviteModalOpen(false)} className="gray-button" style={{ marginLeft: '10px' }}>Close</button>
        </div>

      </Modal>

      {/* 查看成员弹窗 */}
      <Modal
        isOpen={isMembersModalOpen}
        onRequestClose={() => setIsMembersModalOpen(false)}
        contentLabel="Group Members"
      >
        {/* 显示决策组信息 */}
        {
          decisionDetails.has_group && (
            <div>
              <h3>Decision Group: {decisionDetails.group.name}</h3>
              <p>Members Count: {decisionDetails.group.members_count}</p>
            </div>
          )
        }
        <h2>Group Members</h2>
        <ul>
          {groupMembers.map((member) => (
            <li key={member.id}>{member.username}</li>
          ))}
        </ul>
        <button onClick={() => setIsMembersModalOpen(false)} className="gray-button">Close</button>
      </Modal>

      <button onClick={openReviewModal} className='green-button' style={{ margin: '20px 10px' }}>View Reviews</button>
      <Modal
        isOpen={isReviewModalOpen}
        onRequestClose={() => setIsReviewModalOpen(false)}
        contentLabel="Review Modal"
        style={{
          content: {
            top: '5%',
            left: '50%',
            right: 'auto',
            bottom: 'auto',
            marginRight: '-50%',
            transform: 'translate(-50%, 0)',
            width: '70%',
            maxHeight: '90%',
            overflow: 'auto'
          }
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ margin: 0 }}>Reviews Timeline</h2>
          <button
            onClick={() => setIsReviewModalOpen(false)}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontSize: '1.5em',
              color: '#666',
              padding: '5px 10px',
              marginLeft: 'auto'
            }}
          >
            <FontAwesomeIcon icon={faTimes} />
          </button>
        </div>
        {reviews.length === 0 ? (
          <p>No reviews available.</p>
        ) : (
          <div className="timeline-container" style={{
            position: 'relative',
            paddingLeft: '30px',
            marginTop: '20px'
          }}>
            {/* 时间轴竖线 */}
            <div style={{
              position: 'absolute',
              left: '15px',
              top: '0',
              bottom: '0',
              width: '2px',
              backgroundColor: '#007bff'
            }}></div>

            {reviews
              .sort((a, b) => new Date(a.created_at) - new Date(b.created_at)) // 按时间排序
              .map((review, index) => (
                <div key={index} style={{
                  position: 'relative',
                  marginBottom: '30px',
                  paddingLeft: '20px'
                }}>
                  {/* 时间轴节点 */}
                  <div style={{
                    position: 'absolute',
                    left: '-8px',
                    top: '5px',
                    width: '16px',
                    height: '16px',
                    borderRadius: '50%',
                    backgroundColor: '#007bff',
                    border: '3px solid white'
                  }}></div>

                  {/* 时间标签 */}
                  <div style={{
                    fontWeight: 'bold',
                    color: '#555',
                    marginBottom: '5px'
                  }}>
                    {new Date(review.created_at).toLocaleString()}
                  </div>

                  {/* 内容区域 */}
                  <div style={{
                    backgroundColor: '#f8f9fa',
                    padding: '15px',
                    borderRadius: '5px',
                    borderLeft: '3px solid #007bff'
                  }}>
                    <Viewer initialValue={review.content} />

                    {/* 引用的文章 */}
                    {review.referenced_articles?.length > 0 && (
                      <div style={{ marginTop: '10px' }}>
                        <strong>Referenced Articles:</strong>
                        <ul style={{ listStyleType: 'none', paddingLeft: '0' }}>
                          {review.referenced_articles.map((article) => (
                            <li key={article.id}>
                              <a
                                href={`${WEBSITE_URL}/view-article/my/${article.id}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{
                                  textDecoration: 'underline',
                                  color: '#007bff'
                                }}
                              >
                                {article.title}
                              </a>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {review.referenced_platform_articles?.length > 0 && (
                      <div style={{ marginTop: '10px' }}>
                        <strong>Referenced Platform Recommended Articles:</strong>
                        <ul style={{ listStyleType: 'none', paddingLeft: '0' }}>
                          {review.referenced_platform_articles.map((article) => (
                            <li key={article.id}>
                              <a
                                href={`${WEBSITE_URL}/view-article/recommended/${article.id}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{
                                  textDecoration: 'underline',
                                  color: '#007bff'
                                }}
                              >
                                {article.title}
                              </a>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              ))}
          </div>
        )}
        <button
          onClick={() => setIsReviewModalOpen(false)}
          className='green-button'
          style={{ marginTop: '20px' }}
        >
          Close
        </button>
      </Modal>

      <button onClick={() => navigate('/history')} className="green-button" style={{ margin: '20px 10px' }}>Back to Checklist Answer History</button>
      {/* Article Modal */}
      <Modal
        isOpen={showArticleModal}
        onRequestClose={() => setShowArticleModal(false)}
        contentLabel="Article Details"
        style={{
          content: {
            maxWidth: '800px', // 设置弹窗的最大宽度
            width: '80%',
            height: '88vh', // 使用视口高度
            margin: '10px auto', // 在弹窗上下方添加适当的边距，避免紧贴顶部
            padding: '20px',
            overflowY: 'auto', // 使弹窗内容超出时出现滚动条
          },
          overlay: {
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center', // 使弹窗垂直居中
            justifyContent: 'center' // 使弹窗水平居中
          }
        }}
      >
        {selectedArticle ? (
          <div>
            <h2 style={{ marginTop: '0' }}>{selectedArticle.title}</h2>
            <p><strong>Author:</strong> {selectedArticle.author}</p>
            <p><strong>Tags:</strong> {selectedArticle.tags}</p>
            <p><strong>Keywords:</strong> {selectedArticle.keywords}</p>
            <Viewer initialValue={selectedArticle.content} />
            <button onClick={() => setShowArticleModal(false)} style={{ marginTop: '20px' }} className='green-button'>Close</button>
          </div>
        ) : (
          <div>Loading article details...</div>
        )}
      </Modal>

    </div >
  );
};

export default DecisionDetails;
