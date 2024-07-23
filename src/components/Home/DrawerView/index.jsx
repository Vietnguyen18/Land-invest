import { Avatar, Carousel, Drawer, Image, Space } from 'antd';
import React, { memo, useState } from 'react';
import './DrawerView.scss';
import { calculateDate } from '../../../function/calculateDate';
import { formatToVND } from '../../../function/formatToVND';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import Slider from 'react-slick';
import { useSelector } from 'react-redux';

const DrawerView = ({ isDrawerVisible, closeDrawer, images, description, priceOnM2, addAt, typeArea, area }) => {
    const user = useSelector((state) => state.account.Users);

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
                    <h3 style={{ fontWeight: 700 }}>{description}</h3>
                    <Space.Compact style={{alignItems: 'center'}}>
                        <Avatar size={40} src={user?.avatarLink} style={{ backgroundColor: '#10b700', color: '#fff' }}>
                            {user?.avatarLink || user?.FullName?.charAt(0) || 'T'}
                        </Avatar>
                        <p style={{ marginLeft: '1rem', fontWeight: 600 }}>{user?.FullName || ""}</p>
                    </Space.Compact>
                    <p>Loại tài sản: {typeArea}</p>
                    <p>Giá/m²: {formatToVND(priceOnM2)}</p>
                    <p>Ngày đăng: {calculateDate(addAt)}</p>
                    <p>Diện tích: {area} m²</p>
                </div>
                <div className="drawer__image">
                    <Slider {...settings}>
                        {images.map((image) => (
                            <Image
                                key={image.id}
                                src={image.imageLink}
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

export default memo(DrawerView);
