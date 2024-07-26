import './Home.scss';
import { FaLocationArrow } from 'react-icons/fa';
import { GiGolfFlag } from 'react-icons/gi';
import { MdDeleteForever } from 'react-icons/md';
import { FaPaintBrush } from 'react-icons/fa';
import { LuShare2 } from 'react-icons/lu';
import { FaArrowRotateLeft } from 'react-icons/fa6';
import { FiPlus } from 'react-icons/fi';
import { RiSubtractLine } from 'react-icons/ri';
import { FaAngleDown } from 'react-icons/fa6';

import { GrLocation } from 'react-icons/gr';
import React, { useState, useRef } from 'react';

import 'rc-slider/assets/index.css';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
import { message, notification } from 'antd';
import ModalDownMenu from './ModalDown/ModalDownMenu';
import ModalPriceFilter from './ModalDown/ModalPriceFilter';
import {  useSelector } from 'react-redux';
import { DollarIcon, FileUploadIcon, SaveIcon } from '../Icons';
import ModalUploadImage from './ModalUploadImage';
import 'leaflet/dist/leaflet.css';

import Map from '../Map';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
});

L.Marker.prototype.options.icon = DefaultIcon;


function Home() {
    const [opacity, setOpacity] = useState(1);
    const [selectedPosition, setSelectedPosition] = useState(null); 
    const [activeItem, setActiveItem] = useState(0);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [isModalUpLoadVisible, setIsModalUploadVisible] = useState(false);
    const [isShowModalPrice, setIsShowModalPrice] = useState(false);
    const [modalPosition, setModalPosition] = useState({ top: 0, left: 0 });
    const [provinceName, setProvinceName] = useState('');

    const {  displayName } = useSelector((state) => state.searchQuery.searchResult);

    const handleSliderChange = (event) => {
        setOpacity(event.target.value);
    };

    const handleSetProvinceName = (locationInfo) => {
        setProvinceName(locationInfo);
    }

    const handleLocationArrowClick = () => {
        if (!selectedPosition) {
            message.success('Vui lòng chọn vị trí bạn muốn tìm');
        } else {
            const [lat, lng] = selectedPosition;
            window.open(`https://www.google.com/maps/search/?api=1&query=${lat},${lng}`, '_blank');
        }
    };

   
    const handleCloseModal = () => {
        setIsModalUploadVisible(false);
    };

   
    const handleClick = (index) => {
        setActiveItem(index);
        if (index === 3) {
            setIsModalVisible(true);
        }
    };

    const handleModalClose = () => {
        setIsModalVisible(false);
    };
    const handleClosePrice = () => {
        setIsShowModalPrice(false);
    };
    const buttonRef = useRef();

    const showNotification = (type, message, description) => {
        notification[type]({
            message,
            description,
        });
    };

   
    return (
        <div className="home-container">
            <div
                className="slider-container"
                style={{
                    position: 'absolute',
                    top: 10,
                    right: 10,
                    zIndex: 1000,
                    padding: 10,
                    borderRadius: 4,
                }}
            >
                <div className="slider-container-range">
                    <div className="nav-icon-arrow" onClick={() => setOpacity((prev) => (prev === 1 ? 1 : prev + 0.1))}>
                        <FiPlus size={22} />
                    </div>
                    <input
                        type="range"
                        className="slider"
                        orientation="vertical"
                        value={opacity}
                        onChange={handleSliderChange}
                        min={0}
                        max={1}
                        step={0.01}
                        style={{
                            writingMode: 'bt-lr',
                            WebkitAppearance: 'slider-vertical',
                        }}
                    />
                    <div className="nav-icon-arrow" onClick={() => setOpacity((prev) => (prev === 0 ? 0 : prev - 0.1))}>
                        <RiSubtractLine size={22} />
                    </div>
                    <div className="nav-icon">
                        <div className="nav-icon-arrow">
                            <FaArrowRotateLeft size={20} />
                        </div>
                        <div className="nav-icon-arrow" onClick={handleLocationArrowClick}>
                            <FaLocationArrow size={18} />
                        </div>
                        <div className="nav-icon-flag-delete">
                            <GiGolfFlag size={24} />
                            <MdDeleteForever size={22} />
                        </div>
                        <div className="nav-icon-arrow">
                            <FaPaintBrush size={18} />
                        </div>
                        <div className="nav-icon-arrow">
                            <LuShare2 size={20} />
                        </div>
                    </div>
                </div>
            </div>

            {/* Header Container */}
            <div className="container-header">
                <div className="container-header-select">
                    <div className="slider-container-range Plot-saved">
                        <SaveIcon />
                        <div className="slider-Plot-saved">
                            <span>Thửa đã lưu</span>
                            <p>
                                <FaAngleDown />
                            </p>
                        </div>
                    </div>
                    <div className="slider-container-location">
                        <GrLocation />
                        <span>{displayName}</span>
                    </div>

                    <div className="slider-container-range Show-price" onClick={() => setIsShowModalPrice(true)}>
                        <DollarIcon />

                        <div className="slider-container-Show-price">
                            <span>Hiển thị giá</span>
                            <p>
                                <FaAngleDown />
                            </p>
                        </div>
                    </div>
                </div>
                <div className="container-header-option">
                    <div
                        className={`container-header-option-item ${activeItem === 0 ? 'active_item' : ''}`}
                        onClick={() => handleClick(0)}
                    >
                        Quy hoạch 2030
                    </div>
                    <div
                        className={`container-header-option-item ${activeItem === 1 ? 'active_item' : ''}`}
                        onClick={() => handleClick(1)}
                    >
                        Quy hoạch 2024
                    </div>
                    <div
                        className={`container-header-option-item ${activeItem === 2 ? 'active_item' : ''}`}
                        onClick={() => handleClick(2)}
                    >
                        QH Xây dựng
                    </div>
                    <div
                        ref={buttonRef}
                        className={`container-header-option-item ${activeItem === 3 ? 'active_item' : ''}`}
                        onClick={() => handleClick(3)}
                    >
                        Quy hoạch khác
                    </div>
                </div>
            </div>

            {/* Map Container */}
            <Map opacity={opacity} handleSetProvinceName={handleSetProvinceName} setSelectedPosition={setSelectedPosition} selectedPosition={selectedPosition}  />

            <ModalDownMenu
                show={isModalVisible}
                handleClose={handleModalClose}
                style={{ top: modalPosition.top, left: modalPosition.left }}
            />
            <ModalPriceFilter showPrice={isShowModalPrice} handleClosePrice={handleClosePrice} />

            {/* upload Image */}
            {isModalUpLoadVisible || (
                <div className="upload-image-container" onClick={() => setIsModalUploadVisible(true)}>
                    <FileUploadIcon />
                    <p>Thêm hình ảnh mảnh đất, dự án</p>
                    <FiPlus size={22} />
                </div>
            )}

            <ModalUploadImage
                showNotification={showNotification}
                isModalUpLoadVisible={isModalUpLoadVisible}
                handleCloseModal={handleCloseModal}
                selectedPosition={selectedPosition}
                locationInfo={provinceName}
            />
        </div>
    );
}

export default Home;
