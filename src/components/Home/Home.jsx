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
import React, { useState, useRef, useEffect, useCallback, memo } from 'react';
import {
    MapContainer,
    TileLayer,
    ImageOverlay,
    Marker,
    Popup,
    useMapEvents,
    Polygon,
    LayersControl,
} from 'react-leaflet';
import { useDropzone } from 'react-dropzone';
import 'rc-slider/assets/index.css';
import 'leaflet/dist/leaflet.css';
// import { calc } from 'antd/es/theme/internal';
import L from 'leaflet';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
import { Drawer, message, notification } from 'antd';
import ModalDownMenu from './ModalDown/ModalDownMenu';
import ModalPriceFilter from './ModalDown/ModalPriceFilter';
import { useSelector } from 'react-redux';
import ResetCenterView from '../../function/resetCenterView';
import { DollarIcon, FileUploadIcon, SaveIcon } from '../Icons';
import ModalUploadImage from './ModalUploadImage';
import axios from 'axios';
import DrawerView from './DrawerView';
import 'leaflet/dist/leaflet.css';
import fetchProvinceName, { getProvince } from '../../function/findProvince';
import { findClosestDistrict } from '../../function/findClosestDistrict';
const mapContainerStyle = {
    width: '100%',
    height: 'calc(100vh - 56px)',
};
const center = [21.136663, 105.7473446];

const customIcon = new L.Icon({
    iconUrl: require('../../assets/icon.png'),
    iconSize: [38, 38], // size of the icon
    iconAnchor: [22, 38], // point of the icon which will correspond to marker's location
    popupAnchor: [-3, -38], // point from which the popup should open relative to the iconAnchor
});

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
});

L.Marker.prototype.options.icon = DefaultIcon;

function Home() {
    const [image, setImage] = useState([]);
    const [opacity, setOpacity] = useState(1);
    const [scale, setScale] = useState(1);
    const [imageSize, setImageSize] = useState({ width: 0, height: 0 });
    const [currentSize, setCurrentSize] = useState({ width: 0, height: 0 });
    const [selectedPosition, setSelectedPosition] = useState(null); // State để lưu trữ vị trí được chọn trên bản đồ
    const [activeItem, setActiveItem] = useState(0);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [isModalUpLoadVisible, setIsModalUploadVisible] = useState(false);
    const [isDrawerVisible, setIsDrawerVisible] = useState(false);
    const [isShowModalPrice, setIsShowModalPrice] = useState(false);
    const [modalPosition, setModalPosition] = useState({ top: 0, left: 0 });
    // const [imageUrl, setImageUrl] = useState('');
    // const [location, setLocation] = useState([]);
    const [polygon, setPolygon] = useState(null);
    const [listMarker, setListMarker] = useState([]);
    const [provinceName, setProvinceName] = useState('');
    const [idProvince, setIdProvince] = useState();
    const [selectedMarker, setSelectedMarker] = useState(null);
    const [selectedDistrict, setSelectedDistrict] = useState(null);

    // const [coordinates, setCoordinates] = useState([])
    const { lat, lon, coordinates, boundingbox, displayName } = useSelector((state) => state.searchQuery.searchResult);
    console.log(lat, lon);
    const { BaseLayer } = LayersControl;
    const handleSliderChange = (event) => {
        setOpacity(event.target.value);
    };

    const handleLocationArrowClick = () => {
        if (!selectedPosition) {
            message.success('Vui lòng chọn vị trí bạn muốn tìm');
        } else {
            const [lat, lng] = selectedPosition;
            window.open(`https://www.google.com/maps/search/?api=1&query=${lat},${lng}`, '_blank');
        }
    };

    const handleSelectedDistrict = (id) => {
        // console.log(id + 1)
        setSelectedDistrict(id);
    };

    const handleCloseModal = () => {
        setIsModalUploadVisible(false);
    };

    const closeDrawer = () => {
        setIsDrawerVisible(false);
    };

    const onDrop = useCallback((acceptedFiles) => {
        const file = acceptedFiles[0];
        console.log('File', file);

        if (file && file.type.startsWith('image/')) {
            const img = new Image();
            img.onload = () => {
                URL.revokeObjectURL(img.src);
                setImage((prev) => [...prev, img]);
                setImageSize({
                    width: img.width,
                    height: img.height,
                });
                setCurrentSize({ width: img.width, height: img.height });
                // setIsLoading(false);
            };

            img.onerror = (error) => {
                console.error('Error loading image:', error);
                // setIsLoading(false);
            };

            img.src = URL.createObjectURL(file);
        } else {
            console.error('Accepted file is not an image');
        }
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop, accept: 'image/*' });

    useEffect(() => {
        if (imageSize.width && imageSize.height) {
            const newWidth = imageSize.width * scale;
            const newHeight = imageSize.height * scale;
            setCurrentSize({ width: newWidth, height: newHeight });
        }
    }, [scale, imageSize]);

    // useEffect(() => {
    //     const handleZoomEnd = () => {
    //         const zoom = mapRef.current.getZoom();
    //         setMapZoom(zoom);
    //     };

    //     if (mapRef.current) {
    //         mapRef.current.on('zoomend', handleZoomEnd);
    //     }

    //     return () => {
    //         if (mapRef.current) {
    //             mapRef.current.off('zoomend', handleZoomEnd);
    //         }
    //     };
    // }, []);

    // const calculateImageBounds = useCallback((center, size) => {
    //     const halfWidth = size.width / 2;
    //     const halfHeight = size.height / 2;
    //     return [
    //         [center[0] - halfHeight / 111320, center[1] - halfWidth / 111320],
    //         [center[0] + halfHeight / 111320, center[1] + halfWidth / 111320],
    //     ];
    // }, []);

    const mapRef = useRef();

    const MapEvents = () => {
        const mapInstance = useMapEvents({
            click: async (e) => {
                const { lat, lng } = e.latlng;
                setSelectedPosition({ lat, lng });
                const districtName = await fetchProvinceName(lat, lng);
                console.log(districtName);
                setProvinceName(districtName.provinceName);
            },
            zoomend: () => {
                if (mapInstance.getZoom() >= 8) {
                    const center = mapInstance.getCenter();
                    handleZoomEnd(center.lat, center.lng);
                }
            },
        });

        return null;
    };

    const handleZoomEnd = async (lat, lng) => {
        try {
            const locationInfo = await fetchProvinceName(lat, lng);
            console.log('Zoom end location info:', locationInfo);
            const res = await getProvince(locationInfo.provinceName);
            console.log(res);
            const data = await findClosestDistrict(res.TinhThanhPhoID, locationInfo.districtName)

            data.found ? setIdProvince(data.districtId) : console.log(data.message)
        } catch (error) {
            console.error(error);
        }
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

    // useEffect(() => {
    //     const fetchData = async () => {
    //         try {
    //             const response = await fetch(
    //                 'https://apilandinvest.gachmen.org/api/landauctions/search/1?fbclid=IwZXh0bgNhZW0CMTAAAR1oHBpYlbHJfOuEWlCwGbcdC1csdl9wM2F0ZEWSrIcZK3_QAj3Weewb6pY_aem_sNNcYgwRijyY_JiZ2dUsww',
    //             );
    //             const data = await response.json();
    //             if (data.status === 200 && data.message.length > 0) {
    //                 const imageUrl = data.message[0].imageHttp;
    //                 const location = JSON.parse(data.message[0].location);
    //                 const coordinates = data.message[0].coordinates;
    //                 setImageUrl(imageUrl);
    //                 setLocation(location);
    //                 // setCoordinates(coordinates);
    //                 console.log(imageUrl, [location]);
    //             }
    //         } catch (error) {
    //             console.error('Error fetching the data', error);
    //         }
    //     };

    //     fetchData();
    // }, []);

    useEffect(() => {

        const fetchData = async () => {
            try {
                const { data } = await axios.get(
                    `https://apilandinvest.gachmen.org/api/location/list_info_by_district/${idProvince}`,
                );
                setListMarker(data.data);
                console.log('listMarker', data.data);
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };

        fetchData();
    }, [idProvince]);

    useEffect(() => {
        if (coordinates && coordinates.length > 0 && Array.isArray(coordinates[0])) {
            const leafletCoordinates = coordinates[0].map((coord) => [coord[1], coord[0]]);
            setPolygon(leafletCoordinates);
        } else {
            setPolygon(null);
        }
    }, [coordinates]);

    return (
        <div className="home-container">
            {/* <div {...getRootProps()} className="drop--container">
                <input {...getInputProps()} />
                {isDragActive ? (
                    <p>Drop the files here ...</p>
                ) : (
                    <p>Drag and drop some files here, or click to select files</p>
                )}
            </div> */}
            {/* Slider Container */}
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
            <MapContainer
                style={mapContainerStyle}
                center={center}
                zoom={13}
                maxZoom={30}
                whenReady={(map) => {
                    mapRef.current = map.target;
                }}
            >
                <MapEvents />
                <LayersControl>
                    <BaseLayer checked name="Map vệ tinh">
                        <TileLayer
                            url="http://{s}.google.com/vt/lyrs=s,h&x={x}&y={y}&z={z}"
                            subdomains={['mt0', 'mt1', 'mt2', 'mt3']}
                            maxZoom={30}
                            attribution="&copy; <a href='https://www.google.com/maps'>Google Maps</a> contributors"
                        />
                    </BaseLayer>
                    <BaseLayer name="Map mặc định">
                        <TileLayer
                            maxZoom={22}
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />
                    </BaseLayer>
                </LayersControl>
                {/* {imageUrl && location && <ImageOverlay url={imageUrl} bounds={location} opacity={opacity} />} */}
                {image &&
                    boundingbox?.length > 0 &&
                    image.map((item, index) => (
                        <div key={index}>
                            <ImageOverlay
                                url={item}
                                bounds={[
                                    [boundingbox[0], boundingbox[2]],
                                    [boundingbox[1], boundingbox[3]],
                                ]}
                                opacity={opacity}
                            />
                        </div>
                    ))}
                {selectedPosition && (
                    <Marker position={selectedPosition}>
                        <Popup>Vị trí đã chọn</Popup>
                    </Marker>
                )}
                {lat && lon && (
                    <>
                        <Marker position={[lat, lon]} eventHandlers={{ click: () => console.log('hello') }}>
                            <Popup>Vị trí trung tâm</Popup>
                        </Marker>
                        <ResetCenterView lat={lat} lon={lon} />
                    </>
                )}

                {listMarker &&
                    listMarker.map((marker) => (
                        <Marker key={marker.id} position={[marker.latitude, marker.longitude]} icon={customIcon}>
                            <Popup>
                                <div>
                                    <h3>{marker.description}</h3>
                                    <p>Price/m²: {marker.priceOnM2}</p>
                                    <button
                                        onClick={() => {
                                            setIsDrawerVisible(true);
                                            setSelectedMarker(marker);
                                        }}
                                    >
                                        Xem chi tiết
                                    </button>
                                </div>
                            </Popup>
                        </Marker>
                    ))}

                {polygon && <Polygon pathOptions={{ fillColor: 'transparent' }} positions={polygon} />}
                {selectedMarker && (
                    <DrawerView
                        isDrawerVisible={isDrawerVisible}
                        closeDrawer={closeDrawer}
                        images={selectedMarker.imageLink}
                        description={selectedMarker.description}
                        priceOnM2={selectedMarker.priceOnM2}
                    />
                )}
            </MapContainer>

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
                provinceName={provinceName}
                handleSelectedDistrict={handleSelectedDistrict}
            />
        </div>
    );
}

export default memo(Home);
