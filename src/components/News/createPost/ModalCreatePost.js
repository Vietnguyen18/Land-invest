import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import './ModalCreatePost.scss';
// import { useNavigate } from 'react-router-dom';
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
import { IoMdCloseCircleOutline } from 'react-icons/io';

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

const iconAvatar = 'https://png.pngtree.com/png-clipart/20210608/ourlarge/pngtree-dark-gray-simple-avatar-png-image_3418404.jpg'

const ModalCreatePost = (props) => {
    const { handleClose, show } = props;
    const [inputValueTitle, setInputValueTitle] = useState('');
    const [inputValueContent, setInputValueContent] = useState('');
    const [selectedValueGroup, setSelectedValueGroup] = useState(null);
    console.log('selectedValueGroup',selectedValueGroup);
    // const [showSecondTextarea, setShowSecondTextarea] = useState(false);
    const textareaTitleRef = useRef(null);
    const textareaContentRef = useRef(null);
    const datauser = useSelector((state) => state.account.dataUser);
    // const navigate = useNavigate();
    const listGroups = useSelector((state) => state.listbox.listgroup);
    const [apiUser, setApiUser] = useState([]); // user khi đăng nhập thành công
    const [PostLatitude, setPostLatitude] = useState(null)
    const [PostLongitude, setPostLongitude] = useState(null)
    const [showModalImage, setShowModalImage] = useState(false)
    const [files, setFiles] = useState([]);
    const [base64Images, setBase64Images] = useState([]);
    console.log('base64Images',base64Images);
    // const Images = files.map(file => file.name) // lấy đường dẫn ảnh
    // const editorStyle = {
    //     height: '200px', // Điều chỉnh chiều cao
    //     maxWidth: '100%' // Điều chỉnh chiều rộng
    //   };
      
    //   const editorContainerStyle = {
    //     height: '100%'
    //   };
    const handleChangeValueGroup = (event) => {
        setSelectedValueGroup(Number(event.target.value));
      };

      //click new post
      const handleClickNewPost = async () => {
        const token = localStorage.getItem('access_token');
        if (!token) {
            notification.error({
                message: 'Lỗi xác thực',
                description: 'Vui lòng đăng nhập lại!'
            });
            return;
        }
        try{
            const res = await CreatePost(selectedValueGroup, inputValueTitle, inputValueContent,PostLatitude, PostLongitude,base64Images, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            console.log('res', res);
            if (res) {
                message.success('Thêm mới Post thành công');
                props.getListViewPost();
                handleClose();
                setInputValueTitle("");
                setInputValueContent("");
                setFiles([]);
                setBase64Images([]);
            } else {
                notification.error({
                    message: 'Đã có lỗi xảy ra',
                    description: res.message
                });
            }
        }catch(error){
            console.error('Error', error);
            notification.error({
                message: 'Error',
                description: error.message && Array.isArray(error.message) ? error.message[0] : error.message,
                duration: 5
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
    // const handleInputContentChange = (value) => {
    //     setInputValueContent(value);
    // };
    // const handleTextareaClick = () => {
    //     setShowSecondTextarea(true);
    // };


     //User
     useEffect(() => {
        const fetchUserData = async () => {
          try {
            if (datauser?.UserID) {
                const response = await fetchAccount();
                const fetchedUser = response.find((user) => user?.userid === datauser?.UserID);
                fetchedUser && setApiUser(fetchedUser);
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

      // lấy tọa độ người dùng
      useEffect(() => {
        if(navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) =>{
                    setPostLatitude(position.coords.latitude);
                    setPostLongitude(position.coords.longitude);
                },
                (error) =>{
                    console.error("Error fetching geolocation",error)
                }
            );
        }
      },[])

      const handleShowModal = () => {
        setShowModalImage(true)
      }

      const handleFileImage = (event) => {
        const selectedFiles = Array.from(event.target.files);
        const fileReaders = selectedFiles.map(file => {
            return new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onloadend = () => resolve({ file, base64: reader.result });
                reader.onerror = reject;
                reader.readAsDataURL(file);
            });
        });

        Promise.all(fileReaders).then(results => {
            const base64Images = results.map(result => result.base64);
            setBase64Images(base64Images);
            setFiles(selectedFiles);
            setShowModalImage(false);
        });
      }

      const removeFile = (index) => {
        const newFiles = [...files];
        newFiles.splice(index, 1);
        const newBase64Images = [...base64Images];
        newBase64Images.splice(index, 1);
        setFiles(newFiles);
        setBase64Images(newBase64Images);
    };

    const renderFilePreview = (base64, index) => {
        return (
            <div key={index} className="preview-file">
                <img src={base64} alt={`preview-${index}`} className="preview-image" />
                <span className="remove-icon" onClick={() => removeFile(index)}><IoMdCloseCircleOutline /></span>
            </div>
        );
    };

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
                                <Avatar src={apiUser?.avatarLink || iconAvatar} />
                                {apiUser?.FullName || "Tên chủ tài khoản"}
                            </Space>
                            <select className='post-new-select' value={selectedValueGroup} onChange={handleChangeValueGroup}>
                                <option value={0}>Chọn Nhóm</option>
                                {listGroups && 
                                    listGroups.map((group, index) => (
                                    <option key={`namegroup-${index}`} value={group.GroupID}>
                                        {group.GroupID}
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
                            {/* <div style={editorStyle}>
                                <ReactQuill 
                                placeholder="Nội dung..." 
                                style={editorContainerStyle} 
                                className="content-post" 
                                value={inputValueContent} 
                                onChange={handleInputContentChange} 
                                modules={modules} />
                                
                                </div> */}
                            <textarea
                                className="post-new-content"
                                placeholder={`${apiUser.FullName} ơi, bạn đăng muốn viết gì `}
                                value={inputValueContent}
                                onChange={(e) => setInputValueContent(e.target.value)}
                                ref={textareaContentRef}
                            />
                            {
                                showModalImage 
                                && (<div className='post-image'>
                                        <span className='icon-close' onClick={()=> setShowModalImage(false)}><IoMdCloseCircleOutline /></span>
                                        <input type='file' accept='image/*,video/*' multiple onChange={handleFileImage} style={{display: 'none'}} id='fileInput' />
                                    <label className='add-image-post' htmlFor="fileInput">
                                        <div className='images-content'>
                                            <img src={importImage} alt='icon'/>
                                            <p>Thêm ảnh / Video </p>
                                            <label>hoặc kéo và thả</label>
                                        </div>
                                    </label>
                                </div>)
                            }
                            <div className="preview-files">
                                {base64Images.map((base64, index) => renderFilePreview(base64, index))}
                            </div>
                        </div>
                        <div className="post-action">
                            <span>Thêm vào bài viết của bạn</span>
                            <div className='post-action-img'>
                                <span className='icon-post-forums' onClick={handleShowModal}>
                                    <img src={importImage} alt='anh lỗi' />
                                </span>
                                <span className='icon-post-forums'>
                                    <img src={importIcon} alt='anh lỗi' />
                                </span>
                                <span className='icon-post-forums'>
                                    <img src={importLocation} alt='anh lỗi' />
                                </span>
                                <span className='icon-post-forums'>
                                    <LuMoreHorizontal size={30} className='more-icon' />
                                </span>
                                {/* <img src={importTag} alt='anh lỗi' /> */}
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
