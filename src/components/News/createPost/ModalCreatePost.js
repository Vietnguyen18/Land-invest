import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import './ModalCreatePost.scss';
import { useNavigate } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';
import importImage from '../../../assets/importImage.png';
import importIcon from '../../../assets/importIcon.png';
import importLocation from '../../../assets/importLocation.png';
import importTag from '../../../assets/importTag.png';
import { LuMoreHorizontal } from "react-icons/lu";
import { Avatar, Space, message, notification } from 'antd';
import { useSelector } from 'react-redux';
import { CreatePost, fetchAccount } from '../../../services/api';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css'; // Import Quill's CSS

const modules = {
  toolbar: [
    [{ 'header': '1'}, {'header': '2'}, { 'font': [] }],
    [{size: []}],
    ['bold', 'italic', 'underline', 'strike', 'blockquote'],
    [{'list': 'ordered'}, {'list': 'bullet'}, {'indent': '-1'}, {'indent': '+1'}],
    ['link', 'image', 'video'],
    ['clean']
  ],
};
const ModalCreatePost = (props) => {
    const { handleClose, show } = props;
    const [inputValueTitle, setInputValueTitle] = useState('');
    const [inputValueContent, setInputValueContent] = useState('');
    const [selectedValueGroup, setSelectedValueGroup] = useState('');
    // const [showSecondTextarea, setShowSecondTextarea] = useState(false);
    const [postLatitude, setPostLatitude] = useState(10);
    const [postLongitude, setPostLongitude] = useState(100);
    const textareaTitleRef = useRef(null);
    const textareaContentRef = useRef(null);
    const datauser = useSelector((state) => state.account.dataUser);
    // const navigate = useNavigate();
    const listGroups = useSelector((state) => state.listbox.listgroup);
    console.log("listGroups post: ", listGroups)
    const [apiUser, setApiUser] = useState([]); // user khi đăng nhập thành công
 
   

    const editorStyle = {
        height: '200px', // Điều chỉnh chiều cao
        maxWidth: '100%' // Điều chỉnh chiều rộng
      };
      
      const editorContainerStyle = {
        height: '100%'
      };
    const handleChangeValueGroup = (event) => {
        setSelectedValueGroup(event.target.value);
      };
      const handleClickNewPost = async () => {
        console.log("datapostnew: ", inputValueTitle, inputValueContent, selectedValueGroup);
    
        const token = localStorage.getItem('access_token');
        if (!token) {
            notification.error({
                message: 'Lỗi xác thực',
                description: 'Vui lòng đăng nhập lại!'
            });
            return;
        }
    
        const res = await CreatePost(selectedValueGroup, inputValueTitle, inputValueContent, postLatitude, postLongitude, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
    
        if (res) {
            message.success('Thêm mới Post thành công');
            props.getListViewPost();
            handleClose();
            setInputValueTitle("");
            setInputValueContent("");
        } else {
            notification.error({
                message: 'Đã có lỗi xảy ra',
                description: res.message
            });
        }
    };


    useEffect(() => {
        adjustTextareaHeightTitle();
    }, [inputValueTitle]);

    const adjustTextareaHeightTitle = () => {
        const textarea = textareaTitleRef.current;
        if (textarea) {
            textarea.style.height = '40px';
            textarea.style.height = `${textarea.scrollHeight}px`;

            if (textarea.scrollHeight > 300) {
                textarea.style.height = '300px';
                textarea.style.overflowY = 'scroll';
            } else {
                textarea.style.overflowY = 'hidden';
            }
        }
    };

    useEffect(() => {
        adjustTextareaHeightContent();
    }, [inputValueContent]);

    const adjustTextareaHeightContent = () => {
        const textarea = textareaContentRef.current;
        if (textarea) {
            textarea.style.height = '40px';
            textarea.style.height = `${textarea.scrollHeight}px`;

            if (textarea.scrollHeight > 300) {
                textarea.style.height = '300px';
                textarea.style.overflowY = 'scroll';
            } else {
                textarea.style.overflowY = 'hidden';
            }
        }
    };
    const handleInputTitleChange = (e) => {
        setInputValueTitle(e.target.value);
    };
    const handleInputContentChange = (value) => {
        setInputValueContent(value);
    };
    // const handleTextareaClick = () => {
    //     setShowSecondTextarea(true);
    // };


     //User
     useEffect(() => {
        const fetchUserData = async () => {
          try {
            const response = await fetchAccount();
            const fetchedUser = response.find(user => user.userid === datauser.UserID);
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
      }, [datauser.UserID]);

    return (
        <Modal className='modal-auth' aria-labelledby="contained-modal-title-vcenter"
            centered show={show} onHide={handleClose}>
            <div className='modal-auth-container'>
                <Modal.Header closeButton>
                    <Modal.Title className='modal-auth-title' style={{ textAlign: 'center', fontSize: '20px' }}>Tạo bài viết</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <div className="post-new">
                        <div className="post-new-avatar">
                            <Space>
                                <Avatar src={apiUser?.avatarLink} />
                                {apiUser?.FullName}
                            </Space>
                            <select className='post-new-select' value={selectedValueGroup} onChange={handleChangeValueGroup}>
                                {listGroups && 
                                    listGroups.map((group, index) => (
                                    <option key={`namegroup-${index}`} value={group.GroupID}>
                                        {group.GroupName}
                                    </option>
                                    ))
                                }
                            </select>
                        </div>
                        <div>
                            <textarea
                                className="post-new-input"
                                placeholder="Tiêu đề..."
                                value={inputValueTitle}
                                onChange={handleInputTitleChange}
                                ref={textareaTitleRef}
                                style={{ cursor: 'pointer', padding:'8px 20px', margin:'auto 0' , height:'40px', border:'solid 1px #ccc', marginBottom:'10px' }}
                            ></textarea>
                            {/* <textarea
                                className="post-new-input"
                                onChange={handleInputContentChange}
                                ref={textareaContentRef}
                                value={inputValueContent}
                                placeholder="Nội dung..."
                                style={{ cursor: 'pointer',padding:'8px 20px', margin:'auto 0' , height:'40px', border:'solid 1px #ccc',marginTop:'20px' }}
                            ></textarea> */}
                            <div style={editorStyle}><ReactQuill placeholder="Nội dung..." style={editorContainerStyle} className="content-post" value={inputValueContent} onChange={handleInputContentChange} modules={modules} /></div>
                        </div>
                        
                        <div className="post-action">
                            <span>Thêm vào bài viết của bạn</span>
                            <div className='post-action-img'>
                                <img src={importImage} alt='anh lỗi' />
                                <img src={importIcon} alt='anh lỗi' />
                                <img src={importTag} alt='anh lỗi' />
                                <img src={importLocation} alt='anh lỗi' />
                                <LuMoreHorizontal size={30} className='more-icon' />
                            </div>
                        </div>
                    </div>
                </Modal.Body>
                <Modal.Footer className='btn-auth'>
                    <Button className='btn-post' variant="primary" onClick={handleClickNewPost}>
                        Đăng bài
                    </Button>
                </Modal.Footer>
            </div>
        </Modal>
    );
};

export default ModalCreatePost;
