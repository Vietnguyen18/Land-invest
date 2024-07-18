import { Carousel, Drawer, Image } from 'antd';
import React, { memo, useState } from 'react';
import './DrawerView.scss';
import { calculateDate } from '../../../function/calculateDate';
import { formatToVND } from '../../../function/formatToVND';

const DrawerView = ({ isDrawerVisible, closeDrawer, images, description, priceOnM2, addAt }) => {
    const [currentSlide, setCurrentSlide] = useState(0);

    const nextSlide = () => {
        setCurrentSlide((prev) => (prev + 1) % images.length);
    };

    const prevSlide = () => {
        setCurrentSlide((prev) => (prev - 1 + images.length) % images.length);
    };
    return (
        <Drawer placement="bottom" closable={false} onClose={closeDrawer} open={isDrawerVisible}>
            <div className="drawer--content__container">
                <div className="drawer--content__detail">
                    <h3>{description}</h3>
                    <p>Loại tài sản: Đất bán</p>
                    <p>Giá/m²: {formatToVND(priceOnM2)}</p>
                    <p>Ngày đăng: {calculateDate(addAt)}</p>
                    <p>Diện tích: 1000m2</p>
                </div>
                <div className="drawer__image">
                    <div className="slider" style={{ transform: `translateX(-${currentSlide * 100}%)` }}>
                        {images.map((image) => (
                            <div key={image.id} className="slide">
                                <Image
                                    src={`data:image/png;base64,${image.imageLink}`}
                                    alt={`Image ${image.id}`}
                                    className="drawer--content__image"
                                    preview={false}
                                />
                            </div>
                        ))}
                    </div>
                    <button className="nav-button prev" onClick={prevSlide}>
                        &#10094;
                    </button>
                    <button className="nav-button next" onClick={nextSlide}>
                        &#10095;
                    </button>
                </div>
            </div>
        </Drawer>
    );
};

export default DrawerView;
