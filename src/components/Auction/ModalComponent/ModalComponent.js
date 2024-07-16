import React, { useEffect, useRef, useState } from 'react'
import './Modal.scss'
import { fetchAccount, fetchCreateComment } from '../../../services/api';
import { useSelector } from 'react-redux';
import { message, notification } from 'antd';


const iconAvatar = 'https://png.pngtree.com/png-clipart/20210608/ourlarge/pngtree-dark-gray-simple-avatar-png-image_3418404.jpg'
const ModalComponent = ({ CloseModal,IDAuction}) => {

  const [comment, setComment] = useState('');
  const [apiUser, setApiUser] = useState([]);
  console.log('apiUser',apiUser);
  const fileInputRef = useRef(null)
  const videoInputRef = useRef(null)
  const [selectedFile, setSelectedFile] = useState([]);
  const [selectedVideo, setSelectedVideo] = useState('');
  const [fileIndexToReplace, setFileIndexToReplace] = useState(null);
  console.log('selectedFile',selectedFile);
  // lấy thông tin userId
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
              description: 'User not found'
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
        description: 'Bình luận không được để trống!'
      });
      return;
    }

    const token = localStorage.getItem('access_token');
    if (!token) {
      notification.error({
        message: 'Lỗi đăng nhập',
        description: 'Xin vui lòng đăng nhập lại'
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
      message.success('Đã thêm bình luận thành công');
      setComment('');
      setSelectedFile([])
      setSelectedVideo('')
      CloseModal();
    } else {
      notification.error({
        message: 'Lỗi bình luận',
        description: response.message
      });
    }
  };


  //click file
    // const onFileSelected = (file) =>{
    //   console.log('file anh', file);
    // }

    const handleSvgClick = (isVideo) => {
      if(isVideo) {
        videoInputRef.current.click();
      }else{
        fileInputRef.current.click();
      }
    }

    const handleFileChange = (event) => {
      const files = Array.from(event.target.files);
      const newFiles = files.map(file => URL.createObjectURL(file));

    setSelectedFile((prevFiles) => {
      if (prevFiles.length + newFiles.length > 4) {
        notification.error({
          message: 'Error',
          description: 'Bạn chỉ có thể chọn tối đa 4 ảnh'
        });
        return prevFiles;
      }
      if (fileIndexToReplace !== null) {
        const updatedFiles = [...prevFiles];
        updatedFiles[fileIndexToReplace] = newFiles[0];
        setFileIndexToReplace(null); // đặt lại ảnh đã được thay thế
        return updatedFiles;
      }
      return [...prevFiles, ...newFiles];
    });
    }
    const handleVideoChange = (event) => {
      const file = event.target.files[0]
      if (file){
        setSelectedVideo(URL.createObjectURL(file))
      }
    }

    const handleImageClick = (index) => {
      setFileIndexToReplace(index);
      fileInputRef.current.click();
    }

  return (
    <div className="appraisal-form" onHide={CloseModal}>
    <div className="appraisal-header">
      <img src={apiUser ? apiUser.avatarLink : iconAvatar} alt="Avatar" className="avatar" />
      <span className="appraiser-name">{apiUser ? apiUser.FullName : 'Tên người thẩm định' }</span>
    </div>
    <div className="appraisal-body">
      <textarea
        className="appraisal-textarea"
        placeholder="Nhập thông tin thẩm định..."
        value={comment}
        onChange={handleCommentChange}
      >

      </textarea>
      <div className="attachment-section">
        <div className='attachment-item-left'>
          {
            selectedFile.map((item, index)=>(
              <div key={index} className="attachment-item" onClick={() => handleImageClick(index)}>
                  <img src={item} alt={`selected file ${index}`} className="file-preview" />
              </div>
            ))
          }
            <div className="attachment-item" onClick={() => handleSvgClick(false)}>
                <svg width="40" height="40" viewBox="0 0 60 60" 
                    fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M30 54C16.77 54 6 43.23 6 30C6 16.77 16.77 6 30 6C43.23 6 54 16.77 54 30C54 43.23 43.23 54 30 54ZM30 0C26.0603 0 22.1593 0.775973 18.5195 2.28361C14.8797 3.79126 11.5726 6.00104 8.7868 8.7868C3.16071 14.4129 0 22.0435 0 30C0 37.9565 3.16071 45.5871 8.7868 51.2132C11.5726 53.999 14.8797 56.2087 18.5195 57.7164C22.1593 59.224 26.0603 60 30 60C37.9565 60 45.5871 56.8393 51.2132 51.2132C56.8393 45.5871 60 37.9565 60 30C60 26.0603 59.224 22.1593 57.7164 18.5195C56.2087 14.8797 53.999 11.5726 51.2132 8.7868C48.4274 6.00104 45.1203 3.79126 41.4805 2.28361C37.8407 0.775973 33.9397 0 30 0ZM33 15H27V27H15V33H27V45H33V33H45V27H33V15Z" 
                    fill="white"/>
                </svg>
                <input 
                    type='file'
                    ref={fileInputRef}
                    style={{display: 'none'}}
                    multiple
                    onChange={handleFileChange}
                />
            </div>
        </div>
        <div className="attachment-item-right">
                <div className="attachment-item" onClick={() => handleSvgClick(true)}>
                      {
                          selectedVideo ? (
                            <video controls src={selectedVideo} className="file-preview-video" />
                          ) : (<svg width="40" height="40" 
                            viewBox="0 0 60 60" fill="none" 
                            xmlns="http://www.w3.org/2000/svg">
                            <path d="M23.2382 31.5392C23.6663 
                              32.1101 23.8742 32.8163 23.8236 
                              33.5282C23.773 34.24 23.4674 34.9097 
                              22.9628 35.4143C22.4581 35.919 21.7884 
                              36.2246 21.0766 36.2752C20.3647 36.3258 
                              19.6585 36.1179 19.0876 35.6897C17.6696 
                              34.3589 16.5394 32.7515 15.7668 30.9669C14.9942 
                              29.1822 14.5956 27.2581 14.5956 25.3134C14.5956 
                              23.3687 14.9942 21.4446 15.7668 19.66C16.5394 
                              17.8753 17.6696 16.2679 19.0876 14.9371L29.464 
                              4.2643C32.2848 1.52941 36.0595 0 39.9885 0C43.9175 
                              0 47.6922 1.52941 50.5131 4.2643C53.248 7.08518 54.7774 10.8599 54.7774 14.7889C54.7774 18.7178 53.248 22.4925 50.5131 25.3134L46.0661 29.7604C46.1294 27.3347 45.7268 24.9193 44.8802 22.6452L46.3625 21.1629C47.9458 19.4175 48.8228 17.1454 48.8228 14.7889C48.8228 12.4324 47.9458 10.1602 46.3625 8.41483C44.6172 6.83156 42.345 5.95453 39.9885 5.95453C37.632 5.95453 35.3599 6.83156 33.6145 8.41483L23.2382 19.0876C22.395 19.8906 21.7238 20.8565 21.2651 21.9267C20.8065 22.9969 20.57 24.1491 20.57 25.3134C20.57 26.4778 20.8065 27.63 21.2651 28.7002C21.7238 29.7703 22.395 30.7362 23.2382 31.5392ZM60 45.1767V51.106H51.106V60H45.1767V51.106H36.2827V45.1767H45.1767V36.2827H51.106V45.1767M39.8403 32.4286C40.3541 30.0357 40.2421 27.5507 39.515 25.2137C38.7879 22.8767 37.4704 20.7667 35.6897 19.0876C35.1188 18.6594 34.4126 18.4516 33.7008 18.5021C32.9889 18.5527 32.3192 18.8584 31.8146 19.363C31.31 19.8676 31.0043 20.5373 30.9537 21.2492C30.9032 21.961 31.111 22.6672 31.5392 23.2382C32.3824 24.0411 33.0536 25.007 33.5123 26.0772C33.9709 27.1474 34.2074 28.2996 34.2074 29.464C34.2074 30.6283 33.9709 31.7805 33.5123 32.8507C33.0536 33.9209 32.3824 34.8868 31.5392 35.6897L21.1629 46.3625C19.4175 47.9458 17.1454 48.8228 14.7889 48.8228C12.4324 48.8228 10.1602 47.9458 8.41483 46.3625C6.83156 44.6172 5.95453 42.345 5.95453 39.9885C5.95453 37.632 6.83156 35.3599 8.41483 33.6145L9.89716 32.4286C9.0732 30.046 8.67188 27.5377 8.7113 25.017L4.2643 29.464C1.52941 32.2848 0 36.0595 0 39.9885C0 43.9175 1.52941 47.6922 4.2643 50.5131C7.08518 53.248 10.8599 54.7774 14.7889 54.7774C18.7178 54.7774 22.4925 53.248 25.3134 50.5131L30.6498 45.1767C31.103 42.4898 32.1674 39.943 33.7609 37.7327C35.3543 35.5224 37.4343 33.7077 39.8403 32.4286Z" 
                            fill="white"/>
                          </svg>)
                      }
                      <input 
                        type='file'
                        ref={videoInputRef}
                        style={{display: 'none'}}
                        accept='video/*'
                        onChange={handleVideoChange}
                      />
                </div>
        </div>
      </div>
    </div>
    <div className="appraisal-footer">
      <div className="media-buttons">
        <button className="media-button" onClick={()=>handleSvgClick(false)}>🖼️</button>
        <button className="media-button" onClick={()=>handleSvgClick(true)}>📹</button>
      </div>
      <button className="submit-cancel" onClick={CloseModal}>CANCEL</button>
      <button className="submit-button" onClick={handleSubmit}>ĐĂNG</button>
    </div>
  </div>
);
};

export default ModalComponent
