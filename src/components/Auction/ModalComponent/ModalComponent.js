import React, { useEffect, useState } from 'react'
import './Modal.scss'
import { fetchAccount, fetchCreateComment } from '../../../services/api';
import { useSelector } from 'react-redux';
import { message, notification } from 'antd';


const iconAvatar = 'https://png.pngtree.com/png-clipart/20210608/ourlarge/pngtree-dark-gray-simple-avatar-png-image_3418404.jpg'
const ModalComponent = ({ CloseModal,IDAuction}) => {

  const [comment, setComment] = useState('');
  const [apiUser, setApiUser] = useState([]);
  console.log('apiUser',apiUser);
  const dataUserID = useSelector((state) => state.account.dataUser.UserID);
    useEffect(() => {
      const fetchUserData = async () => {
        try {
          const response = await fetchAccount();
          const fetchedUser = response.find(user => user.userid === dataUserID);
          if (fetchedUser) {
            setApiUser(fetchedUser);
          } else {  
            notification.error({
              message: 'Error',
              description: 'Please log in to your account'
            });
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
          notification.error({
            message: 'Error',
            description: 'Failed to fetch user data'
          });
        }
      };

      fetchUserData();
    }, [dataUserID]);

  const handleCommentChange = (e) => {
    setComment(e.target.value);
  };


  const handleSubmit = async () => {
    if (!comment) {
      notification.error({
        message: 'Error',
        description: 'Comments cannot be empty !'
      });
      return;
    }

    const token = localStorage.getItem('access_token');
    if (!token) {
      notification.error({
        message: 'Login error',
        description: 'please log in again'
      });
      return;
    }

    // api comment
    const response = await fetchCreateComment(IDAuction, comment, dataUserID, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (response) {
      message.success('Comment added successfully');
      setComment('');
      CloseModal();
    } else {
      notification.error({
        message: 'Comment error',
        description: response.message
      });
    }
  };


  return (
    <div className="appraisal-form" onHide={CloseModal}>
    <div className="appraisal-header">
      <img src={apiUser?.avatarLink || iconAvatar} alt="Avatar" className="avatar" />
      <span className="appraiser-name">{apiUser?.FullName || 'Tên người thẩm định'}</span>
    </div>
    <div className="appraisal-body">
      <textarea
        className="appraisal-textarea"
        placeholder="Nhập thông tin thẩm định..."
        value={comment}
        onChange={handleCommentChange}
      >
      </textarea>
    </div>
    <div className="appraisal-footer">
      <button className="submit-button" onClick={handleSubmit}>ĐĂNG</button>
      <button className="submit-cancel" onClick={CloseModal}>CANCEL</button>
    </div>
  </div>
);
};

export default ModalComponent
