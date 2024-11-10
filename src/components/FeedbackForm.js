import React, { useState } from 'react';
import './FeedbackForm.css';
import api from './api.js'

const FeedbackForm = () => {
    const [description, setDescription] = useState('');
    const [contactInfo, setContactInfo] = useState('');
    const [message, setMessage] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post('/api/feedback', {                
                description,
                contact_info: contactInfo,
            });
            setMessage("反馈已成功提交！");
            setDescription('');
            setContactInfo('');
        } catch (error) {
            setMessage("提交反馈时出现错误，请稍后重试。");
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
                <button type="submit" className="green-button">提交反馈</button>
                {message && <p className="feedback-message">{message}</p>}
            </form>
        </div>
    );
};

export default FeedbackForm;
