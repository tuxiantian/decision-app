import React, { useState, useRef } from 'react';
import './FeedbackForm.css';
import api from './api.js';
import { useNavigate } from 'react-router-dom';

const FeedbackForm = () => {
    const [description, setDescription] = useState('');
    const [contactInfo, setContactInfo] = useState('');
    const [message, setMessage] = useState('');
    const [attachments, setAttachments] = useState([]);
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef(null);
    const navigate = useNavigate();

    const handleFileChange = (e) => {
        const files = Array.from(e.target.files);

        // 验证文件数量和大小
        if (files.length + attachments.length > 5) {
            setMessage("最多只能上传5个文件");
            return;
        }

        const oversizedFiles = files.filter(file => file.size > 10 * 1024 * 1024);
        if (oversizedFiles.length > 0) {
            setMessage(`以下文件超过10M限制: ${oversizedFiles.map(f => f.name).join(', ')}`);
            return;
        }

        setAttachments([...attachments, ...files]);
        setMessage('');
        e.target.value = ''; // 清空文件输入，允许重复选择相同文件
    };

    const removeAttachment = (index) => {
        const updatedAttachments = [...attachments];
        updatedAttachments.splice(index, 1);
        setAttachments(updatedAttachments);
    };

    const uploadFile = async (file) => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('type', 'feedback');

        try {
            const response = await api.post('/upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            return response.data.url;
        } catch (error) {
            console.error('文件上传失败:', error);
            throw error;
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!description.trim()) {
            setMessage("请填写反馈内容");
            return;
        }

        setIsUploading(true);
        setMessage('');

        try {
            // 上传所有附件
            const uploadedUrls = [];
            for (const file of attachments) {
                try {
                    const url = await uploadFile(file);
                    uploadedUrls.push(url);
                } catch (error) {
                    console.error(`文件 ${file.name} 上传失败`, error);
                    continue;
                }
            }
            await api.post('/api/feedback', {
                description,
                contact_info: contactInfo,
                attachments: uploadedUrls
            });
            setMessage("反馈已成功提交！");
            setDescription('');
            setContactInfo('');
            setAttachments([]);
            navigate('/myfeedback');
        } catch (error) {
            setMessage("提交反馈时出现错误，请稍后重试。");
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className="feedback-form-container">
            <h2>反馈</h2>
            <form onSubmit={handleSubmit} className="feedback-form">
                <div className="form-group">
                    <label>反馈内容：</label>
                    <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        required
                        className="form-input"
                    />
                </div>
                <div className="form-group">
                    <label>联系方式：</label>
                    <input
                        type="text"
                        value={contactInfo}
                        onChange={(e) => setContactInfo(e.target.value)}
                        className="form-input"
                    />
                </div>
                <div className="form-group">
                    <label>附件：</label>
                    <div style={{ flex: 1 }}>
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileChange}
                            multiple
                            style={{ display: 'none' }}
                        />
                        <button
                            type="button"
                            onClick={() => fileInputRef.current.click()}
                            style={{
                                padding: '8px 15px',
                                backgroundColor: '#007bff',
                                color: 'white',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                marginBottom: '10px'
                            }}
                        >
                            添加文件 (最多5个，每个不超过10M)
                        </button>

                        {attachments.length > 0 && (
                            <div style={{ marginTop: '10px' }}>
                                <strong>已选文件：</strong>
                                <ul style={{ listStyle: 'none', padding: 0 }}>
                                    {attachments.map((file, index) => (
                                        <li key={index} style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            marginBottom: '5px'
                                        }}>
                                            <span style={{ flex: 1 }}>
                                                {file.name} ({(file.size / 1024 / 1024).toFixed(2)}MB)
                                            </span>
                                            <button
                                                type="button"
                                                onClick={() => removeAttachment(index)}
                                                style={{
                                                    padding: '2px 8px',
                                                    backgroundColor: '#dc3545',
                                                    color: 'white',
                                                    border: 'none',
                                                    borderRadius: '4px',
                                                    cursor: 'pointer',
                                                    marginLeft: '10px'
                                                }}
                                            >
                                                删除
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                </div>
                <button
                    type="submit"
                    disabled={isUploading}
                    style={{
                        padding: '10px 20px',
                        backgroundColor: isUploading ? '#6c757d' : '#28a745',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: isUploading ? 'not-allowed' : 'pointer',
                        width: '100%'
                    }}
                >
                    {isUploading ? '提交中...' : '提交反馈'}
                </button>
                {message && (
                    <p
                        className="feedback-message"
                        style={{
                            color: message.startsWith('反馈已成功') ? 'green' : 'red',
                            marginTop: '15px'
                        }}
                    >
                        {message}
                    </p>
                )}
            </form>
        </div>
    );
};

export default FeedbackForm;
