import { Carousel, Drawer, Image } from 'antd';
import React, { memo } from 'react';
import './DrawerView.scss';

const DrawerView = ({ isDrawerVisible, closeDrawer, images, description, priceOnM2 }) => {
    return (
        <Drawer title={description} placement="left" closable={false} onClose={closeDrawer} open={isDrawerVisible}>
            <div className="drawer--content__container">
                <div className="">
                    <h3>{description}</h3>
                    <span>Giá/m²: {priceOnM2}</span>
                </div>
                <div className="drawer__image">
                    <Image.PreviewGroup
                        preview={{
                            onChange: (current, prev) => console.log(`current index: ${current}, prev index: ${prev}`),
                        }}
                    >
                        {images.map((image) => (
                            <Image
                                key={image.id}
                                src={`data:image/png;base64,${image.imageLink}`}
                                alt={`Image ${image.id}`}
                                className="drawer--content__image"
                            />
                        ))}
                    </Image.PreviewGroup>
                </div>
            </div>
        </Drawer>
    );
};

export default DrawerView;
