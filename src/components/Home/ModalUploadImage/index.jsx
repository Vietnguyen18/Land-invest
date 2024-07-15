import React, { memo, useCallback, useEffect, useState } from 'react';
import './ModalUploadImage.scss';
import { Button, Modal, notification, Select } from 'antd';
import { DollarIcon, FileUploadIcon } from '../../Icons';
import { FiPlus } from 'react-icons/fi';
import { useDropzone } from 'react-dropzone';
import { useSelector } from 'react-redux';
import axios from 'axios'; // Import Axios
import fetchDistrictName, { getDistrict, getProvince } from '../../../function/findProvince';
import fetchProvinceName from '../../../function/findProvince';

const ModalUploadImage = ({
    showNotification,
    isModalUpLoadVisible,
    handleCloseModal,
    selectedPosition,
    provinceName,
    handleSelectedDistrict,
}) => {
    const datauser = useSelector((state) => state.account.dataUser);
    const [images, setImages] = useState([]);
    const [description, setDescription] = useState('');
    const [priceOnM2, setPriceOnM2] = useState('');
    const [listDistrict, setListDistrict] = useState([]);
    const [selectedDistrictId, setSelectedDistrictId] = useState(null);

    console.log(selectedDistrictId);

    useEffect(() => {
        const getIdDistrict = async () => {
            if (provinceName) {
                const province = await getProvince(provinceName);
                const data = await getDistrict(province.TinhThanhPhoID);
                setListDistrict(data);
            }
        };

        getIdDistrict();
    }, [provinceName]);

    const handleUpload = async () => {
        if (
            !datauser ||
            !datauser.UserID ||
            images.length === 0 ||
            !description ||
            !priceOnM2 ||
            !selectedPosition ||
            !selectedDistrictId
        ) {
            console.error('Missing required fields');
            showNotification('error', 'Error', 'Missing required fields');
            return;
        }

        const imageLink = images.join(',');

        const payload = {
            idUser: datauser.UserID,
            imageLink,
            description,
            longitude: selectedPosition.lng,
            latitude: selectedPosition.lat,
            priceOnM2,
            idDistrict: selectedDistrictId,
        };

        try {
            const response = await axios.post('https://apilandinvest.gachmen.org/api/location/add_info', payload, {
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            console.log('Response:', response.data);
            console.log('Data uploaded successfully');
            showNotification('success', 'Success', 'Data uploaded successfully, please reload to see changes');
        } catch (error) {
            console.error('Error uploading data:', error);
            showNotification('error', 'Error', 'Error uploading data');
        }
    };

    const onDrop = useCallback(
        async (acceptedFiles) => {
            const toBase64 = (file) =>
                new Promise((resolve, reject) => {
                    const reader = new FileReader();
                    reader.readAsDataURL(file);
                    reader.onload = () => resolve(reader.result.split(',')[1]);
                    reader.onerror = (error) => reject(error);
                });

            try {
                const base64Images = await Promise.all(acceptedFiles.map((file) => toBase64(file)));
                setImages(base64Images);
            } catch (error) {
                console.error('Error converting files to base64:', error);
                showNotification('error', 'Error', 'Error converting files to base64');
            }
        },
        [showNotification],
    );

    console.log(images);
    const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop, accept: 'image/*', multiple: true });

    return (
        <Modal
            key={1212}
            open={isModalUpLoadVisible}
            // onOk={handleOk}
            onCancel={handleCloseModal}
            footer={null}
            centered
            title={[
                <div className="title--uploadImage">
                    <FileUploadIcon />
                    <p>Thêm hình ảnh mảnh đất, dự án</p>
                    <FiPlus size={22} />
                </div>,
            ]}
        >
            <div className="modal--upload__content">
                <div {...getRootProps()} className="upload--container">
                    <input {...getInputProps()} />
                    {isDragActive ? <p>Thả ảnh ở đây</p> : <p>Thêm hình ảnh vào đây</p>}
                    {images.length > 0 && <p>Bạn đã chọn ${images.length} ảnh</p>}
                </div>
                <div className="content--container">
                    <a href="https://www.youtube.com/" target="_blank" className="content__link" rel="noreferrer">
                        <div className="content__link--box"></div>
                        <span>Video hướng dẫn Youtube</span>
                    </a>
                    <div className="content__price">
                        <DollarIcon />
                        <input type="number" value={priceOnM2} onChange={(e) => setPriceOnM2(e.target.value)} />
                        <span>Giá/m²</span>
                    </div>
                    <div className="content__location">
                        <label htmlFor="">Vĩ độ:</label>
                        <span>{selectedPosition?.lat || ''}</span>
                    </div>
                    <div className="content__location">
                        <label htmlFor="">Kinh độ:</label>
                        <span>{selectedPosition?.lng || ''}</span>
                    </div>
                    <Select
                        showSearch
                        placeholder="Chọn quận/huyện"
                        optionFilterProp="children"
                        onChange={(value) => {
                            setSelectedDistrictId(value);
                            handleSelectedDistrict(value);
                        }}
                        filterOption={(input, option) =>
                            option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                        }
                        style={{ width: '100%' }}
                        value={selectedDistrictId}
                    >
                        {listDistrict.length > 0 &&
                            listDistrict.map((district) => (
                                <Select.Option key={district.DistrictID} value={district.TinhThanhPhoID}>
                                    {district.DistrictName}
                                </Select.Option>
                            ))}
                    </Select>
                    <div className="content__description">
                        <label htmlFor="">Mô tả:</label>
                        <textarea value={description} onChange={(e) => setDescription(e.target.value)} />
                    </div>
                </div>
                <button className="modal--upload--button" onClick={handleUpload}>
                    Đăng tải
                </button>
            </div>
        </Modal>
    );
};

export default ModalUploadImage;
