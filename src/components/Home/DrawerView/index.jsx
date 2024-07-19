import { Carousel, Drawer, Image } from 'antd';
import React, { memo, useState } from 'react';
import './DrawerView.scss';
import { calculateDate } from '../../../function/calculateDate';
import { formatToVND } from '../../../function/formatToVND';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import Slider from 'react-slick';

const DrawerView = ({ isDrawerVisible, closeDrawer, images, description, priceOnM2, addAt }) => {
    const settings = {
        dots: images.length > 1,
        infinite: images.length > 1,
        speed: 500,
        slidesToShow: images.length > 4 ? 3 : images.length === 1 ? 1 : 2,
        slidesToScroll: images.length > 4 ? 3 : images.length === 1 ? 1 : 2,
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
                    <Slider {...settings}>
                        {images.map((image) => (
                            <Image
                                key={image.id}
                                src={`data:image/png;base64,${image.imageLink}`}
                                alt={`Image ${image.id}`}
                                className="drawer--content__image"
                            />
                        ))}
                    </Slider>
                </div>
            </div>
        </Drawer>
    );
};

export default DrawerView;
